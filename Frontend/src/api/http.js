const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

export const api = {
  auth: authApi,
};
