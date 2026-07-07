const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000/api" : "/api")
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
    throw error;
  }

  return data;
}

export const authApi = {
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

  uploadProfilePhoto({ file, signal }) {
    const token = getAuthToken();
    const fileName = encodeURIComponent(file?.name || "avatar");

    return new Promise((resolve, reject) => {
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
  list() {
    return apiRequest("/projects");
  },

  getById({ projectId }) {
    return apiRequest(`/projects/${encodeURIComponent(projectId)}`);
  },

  listComments({ projectId }) {
    return apiRequest(`/projects/${projectId}/comments`);
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
};

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
    const token = getAuthToken();
    const fileName = encodeURIComponent(file?.name || "archivo");

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      const abortUpload = () => {
        request.abort();
      };

      request.open(
        "POST",
        `${API_BASE_URL}/project-requests/${projectRequestId}/files`,
      );
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
  },
};

export const api = {
  auth: authApi,
  projectRequests: projectRequestsApi,
  projects: projectsApi,
};
