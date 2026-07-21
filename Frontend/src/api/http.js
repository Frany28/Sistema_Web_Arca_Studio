const viteEnv = import.meta.env || {};
const API_BASE_URL = (
  viteEnv.VITE_API_URL ||
  (viteEnv.DEV ? "http://localhost:3000/api" : "/api")
).replace(/\/$/, "");
const AUTH_TOKEN_STORAGE_KEY = "arca_auth_token";
let authTokenMemory = null;

export function getAuthToken() {
  if (authTokenMemory) {
    return authTokenMemory;
  }

  try {
    return (
      window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
      window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

export function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function setAuthToken(token) {
  authTokenMemory = token || null;

  try {
    if (token) {
      window.sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      return;
    }

    window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors in restricted browser contexts.
  }
}

async function apiRequest(path, options = {}) {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const error = new Error(
      data?.message || "La API no está disponible para esta acción.",
    );
    error.status = response.status;
    error.code = data?.code || "API_ROUTE_UNAVAILABLE";
    error.fields = data?.fields || null;
    throw error;
  }

  return data;
}

async function collectCursorPages(fetchPage, collectionKey, limit = 100) {
  const items = [];
  const ids = new Set();
  let cursor = null;
  do {
    const page = await fetchPage({ cursor, limit });
    for (const item of page?.[collectionKey] || []) {
      const key = String(item?.id ?? `${items.length}`);
      if (!ids.has(key)) { ids.add(key); items.push(item); }
    }
    cursor = page?.nextCursor || null;
  } while (cursor);
  return { [collectionKey]: items, nextCursor: null };
}

export const authApi = {
  startRegistration(payload) {
    return apiRequest("/auth/registration/start", {
      body: JSON.stringify(payload),
      method: "POST",
    });
  },

  resendRegistration({ email }) {
    return apiRequest("/auth/registration/resend", {
      body: JSON.stringify({ email }),
      method: "POST",
    });
  },

  verifyRegistration({ token }) {
    return apiRequest("/auth/registration/verify", {
      body: JSON.stringify({ token }),
      method: "POST",
    });
  },

  async completeRegistration(payload) {
    const data = await apiRequest("/auth/registration/complete", {
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (data?.token) setAuthToken(data.token);
    return data;
  },

  login({ email, password }) {
    return apiRequest("/auth/login", {
      body: JSON.stringify({ email, password }),
      method: "POST",
    });
  },

  requestPasswordReset({ email }) {
    return apiRequest("/auth/forgot-password", {
      body: JSON.stringify({ email }),
      method: "POST",
    });
  },

  verifyResetToken({ token }) {
    return apiRequest("/auth/verify-reset-token", {
      body: JSON.stringify({ token }),
      method: "POST",
    });
  },

  resetPassword({ token, password }) {
    return apiRequest("/auth/reset-password", {
      body: JSON.stringify({ token, password }),
      method: "POST",
    });
  },

  async changePassword({ currentPassword, newPassword }) {
    const data = await apiRequest("/auth/change-password", {
      body: JSON.stringify({ currentPassword, newPassword }),
      method: "POST",
    });

    if (data?.token) {
      setAuthToken(data.token);
    }

    return data;
  },

  uploadProfilePhoto({ file, onUploadProgress, signal }) {
    const token = getAuthToken();
    const fileName = encodeURIComponent(file?.name || "avatar");

    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        const error = new Error("La subida del avatar fue cancelada.");
        error.code = "UPLOAD_ABORTED";
        reject(error);
        return;
      }

      const request = new XMLHttpRequest();
      const abortUpload = () => {
        request.abort();
      };

      request.open("POST", `${API_BASE_URL}/auth/profile-photo`);
      request.withCredentials = true;
      request.setRequestHeader(
        "Content-Type",
        file?.type || "application/octet-stream",
      );
      request.setRequestHeader("X-File-Name", fileName);

      if (token) {
        request.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      request.upload.onprogress = (event) => {
        if (!event.lengthComputable || !event.total) {
          return;
        }

        const progress = Math.min(
          Math.round((event.loaded / event.total) * 100),
          99,
        );

        onUploadProgress?.({
          loaded: event.loaded,
          progress,
          total: event.total,
        });
      };

      request.onload = () => {
        signal?.removeEventListener("abort", abortUpload);
        let data = null;

        try {
          data = request.responseText ? JSON.parse(request.responseText) : null;
        } catch {
          data = null;
        }

        if (request.status < 200 || request.status >= 300) {
          const error = new Error(
            data?.message || "No se pudo actualizar el avatar.",
          );
          error.status = request.status;
          error.code = data?.code || "PROFILE_PHOTO_UPLOAD_FAILED";
          reject(error);
          return;
        }

        if (data?.token) {
          setAuthToken(data.token);
        }

        onUploadProgress?.({
          loaded: file?.size || 0,
          progress: 100,
          total: file?.size || 0,
        });
        resolve(data);
      };

      request.onerror = () => {
        signal?.removeEventListener("abort", abortUpload);
        reject(new Error("No se pudo actualizar el avatar."));
      };

      request.onabort = () => {
        signal?.removeEventListener("abort", abortUpload);
        const error = new Error("La subida del avatar fue cancelada.");
        error.code = "UPLOAD_ABORTED";
        reject(error);
      };

      signal?.addEventListener("abort", abortUpload, { once: true });
      request.send(file);
    });
  },

  logout() {
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },

  me() {
    return apiRequest("/auth/me");
  },
};

export const projectsApi = {
  list({ cursor, limit } = {}) {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (limit) params.set("limit", String(limit));
    const query = params.toString();
    return apiRequest(`/projects${query ? `?${query}` : ""}`);
  },

  listAll() {
    return collectCursorPages((page) => projectsApi.list(page), "projects");
  },

  getById({ filesCursor, filesLimit, projectId }) {
    const params = new URLSearchParams();
    if (filesCursor) params.set("filesCursor", filesCursor);
    if (filesLimit) params.set("filesLimit", String(filesLimit));
    const query = params.toString();
    return apiRequest(`/projects/${encodeURIComponent(projectId)}${query ? `?${query}` : ""}`);
  },

  async getByIdAllFiles({ projectId }) {
    let cursor = null;
    let project = null;
    const files = [];
    const ids = new Set();
    do {
      const data = await projectsApi.getById({ filesCursor: cursor, filesLimit: 100, projectId });
      project ||= data.project;
      for (const file of data.project?.files || []) {
        const key = String(file.id);
        if (!ids.has(key)) { ids.add(key); files.push(file); }
      }
      cursor = data.project?.filesNextCursor || null;
    } while (cursor);
    return { project: { ...project, files, filesNextCursor: null } };
  },

  listComments({ cursor, limit, projectId }) {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (limit) params.set("limit", String(limit));
    const query = params.toString();
    return apiRequest(`/projects/${projectId}/comments${query ? `?${query}` : ""}`);
  },

  listAllComments({ projectId }) {
    return collectCursorPages((page) => projectsApi.listComments({ ...page, projectId }), "comments");
  },

  subscribeToEvents({ projectId, onCommentCreated, onError }) {
    const token = getAuthToken();
    const params = new URLSearchParams();

    if (token) {
      params.set("access_token", token);
    }

    const query = params.toString();
    const eventSource = new EventSource(
      getApiUrl(`/projects/${projectId}/events${query ? `?${query}` : ""}`),
      { withCredentials: true },
    );

    eventSource.addEventListener("project.comment.created", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.comment) {
          onCommentCreated?.(data.comment);
        }
      } catch {
        // Ignore malformed realtime events and keep the stream open.
      }
    });

    eventSource.onerror = (event) => {
      onError?.(event);
    };

    return () => {
      eventSource.close();
    };
  },

  createComment({
    commentType,
    content,
    image,
    parentCommentId = null,
    projectId,
    selection,
    targetId,
  }) {
    return apiRequest(`/projects/${projectId}/comments`, {
      body: JSON.stringify({
        commentType,
        content,
        image,
        parentCommentId,
        selection,
        targetId,
      }),
      method: "POST",
    });
  },

  getFileContentUrl({ accessToken, fileId, projectId }) {
    const token = accessToken || getAuthToken();
    const params = new URLSearchParams();

    if (token) {
      params.set("access_token", token);
    }

    const query = params.toString();

    return getApiUrl(
      `/projects/${projectId}/files/${fileId}/content${query ? `?${query}` : ""}`,
    );
  },

  updatePublication({ projectId, isPublic }) {
    return apiRequest(`/projects/${projectId}/publication`, {
      body: JSON.stringify({ isPublic }),
      method: "PATCH",
    });
  },

  deleteFile({ fileId, projectId }) {
    return apiRequest(`/projects/${projectId}/files/${fileId}`, {
      method: "DELETE",
    });
  },

  uploadFile({ file, onUploadProgress, projectId, signal }) {
    return uploadRawFile({
      file,
      onUploadProgress,
      path: `/projects/${projectId}/files`,
      signal,
    });
  },
};

function uploadRawFile({ file, onUploadProgress, path, signal }) {
  const token = getAuthToken();
  const fileName = encodeURIComponent(file?.name || "archivo");

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const abortUpload = () => {
      request.abort();
    };

    request.open("POST", `${API_BASE_URL}${path}`);
    request.withCredentials = true;
    request.setRequestHeader(
      "Content-Type",
      file?.type || "application/octet-stream",
    );
    request.setRequestHeader("X-File-Name", fileName);

    if (token) {
      request.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || !event.total) {
        return;
      }

      const progress = Math.min(
        Math.round((event.loaded / event.total) * 100),
        99,
      );

      onUploadProgress?.({
        loaded: event.loaded,
        progress,
        total: event.total,
      });
    };

    request.onload = () => {
      signal?.removeEventListener("abort", abortUpload);
      let data = null;

      try {
        data = request.responseText ? JSON.parse(request.responseText) : null;
      } catch {
        data = null;
      }

      if (request.status < 200 || request.status >= 300) {
        const error = new Error(
          data?.message || "No se pudo subir el archivo.",
        );
        error.status = request.status;
        error.code = data?.code || "FILE_UPLOAD_FAILED";
        reject(error);
        return;
      }

      onUploadProgress?.({
        loaded: file?.size || 0,
        progress: 100,
        total: file?.size || 0,
      });
      resolve(data);
    };

    request.onerror = () => {
      signal?.removeEventListener("abort", abortUpload);
      reject(new Error("No se pudo subir el archivo."));
    };

    request.onabort = () => {
      signal?.removeEventListener("abort", abortUpload);
      const error = new Error("La subida del archivo fue cancelada.");
      error.code = "UPLOAD_ABORTED";
      reject(error);
    };

    signal?.addEventListener("abort", abortUpload, { once: true });
    request.send(file);
  });
}

export const projectRequestsApi = {
  create(payload) {
    return apiRequest("/project-requests", {
      body: JSON.stringify(payload),
      method: "POST",
    });
  },

  update({ payload, projectRequestId }) {
    return apiRequest(`/project-requests/${projectRequestId}`, {
      body: JSON.stringify(payload),
      method: "PATCH",
    });
  },

  deleteFile({ fileId, projectRequestId }) {
    return apiRequest(`/project-requests/${projectRequestId}/files/${fileId}`, {
      method: "DELETE",
    });
  },

  uploadFile({ file, onUploadProgress, projectRequestId, signal }) {
    return uploadRawFile({
      file,
      onUploadProgress,
      path: `/project-requests/${projectRequestId}/files`,
      signal,
    });
  },
};

export const supportApi = {
  createRequest({ description, issueType, subject }) {
    return apiRequest("/support/requests", {
      body: JSON.stringify({ description, issueType, subject }),
      method: "POST",
    });
  },

  uploadFile({ file, onUploadProgress, signal, supportRequestId }) {
    return uploadRawFile({
      file,
      onUploadProgress,
      path: `/support/requests/${supportRequestId}/files`,
      signal,
    });
  },
};

export const api = {
  auth: authApi,
  projectRequests: projectRequestsApi,
  projects: projectsApi,
  support: supportApi,
};
