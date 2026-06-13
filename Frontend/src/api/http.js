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
      data?.message || "La API no esta disponible para esta accion.",
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

  updatePublication({ projectId, isPublic }) {
    return apiRequest(`/projects/${projectId}/publication`, {
      body: JSON.stringify({ isPublic }),
      method: "PATCH",
    });
  },
};

export const api = {
  auth: authApi,
  projects: projectsApi,
};
