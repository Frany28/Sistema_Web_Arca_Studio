/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api, getApiUrl, setAuthToken } from "../api/http.js";
import { ROUTE_AUTH_DISABLED_FOR_TESTS, TEST_AUTH_USER } from "./testAccess.js";

const AuthContext = createContext(null);

function buildProfilePhotoImageUrl(profilePhotoUrl) {
  if (!profilePhotoUrl) {
    return "";
  }

  if (
    profilePhotoUrl.startsWith("blob:") ||
    profilePhotoUrl.startsWith("data:")
  ) {
    return profilePhotoUrl;
  }

  const params = new URLSearchParams({
    v: Date.now().toString(),
  });
  return getApiUrl(`/auth/profile-photo/image?${params.toString()}`);
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    profilePhotoUrl: user.hasProfilePhoto
      ? buildProfilePhotoImageUrl("stored")
      : "",
    role: typeof user.role === "string" ? user.role : user.role?.code,
    roleDetails: typeof user.role === "object" ? user.role : null,
  };
}

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(!ROUTE_AUTH_DISABLED_FOR_TESTS);
  const [user, setUser] = useState(
    ROUTE_AUTH_DISABLED_FOR_TESTS ? TEST_AUTH_USER : null,
  );

  useEffect(() => {
    if (ROUTE_AUTH_DISABLED_FOR_TESTS) {
      setAuthToken(null);
      return undefined;
    }

    let isMounted = true;

    api.auth
      .me()
      .then((data) => {
        if (isMounted) {
          setUser(normalizeUser(data.user));
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await api.auth.login({ email, password });

    if (!data.user) {
      throw Object.assign(
        new Error("El backend de autenticación no está actualizado."),
        { code: "AUTH_SESSION_MISSING" },
      );
    }

    const nextUser = normalizeUser(data.user);
    setUser(nextUser);
    return nextUser;
  }, []);

  const completeRegistration = useCallback(async (payload) => {
    const data = await api.auth.completeRegistration(payload);
    if (!data?.user) {
      throw Object.assign(new Error("No se pudo crear la sesión."), {
        code: "AUTH_SESSION_MISSING",
      });
    }
    const nextUser = normalizeUser(data.user);
    try {
      window.sessionStorage.setItem("arca_registration_complete", "true");
    } catch {
      // The authenticated redirect still succeeds in restricted contexts.
    }
    setUser(nextUser);
    return nextUser;
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(normalizeUser(nextUser));
  }, []);

  useEffect(() => {
    const handleStorageEvent = (event) => {
      if (event.key === "arca_auth_logout") {
        setAuthToken(null);
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const broadcastLogout = useCallback(() => {
    try {
      window.localStorage.setItem("arca_auth_logout", Date.now().toString());
    } catch {
      // Ignore storage errors in restricted browser contexts.
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthToken(null);
    setUser(null);

    try {
      await api.auth.logout();
    } catch {
      // The local session is already cleared; the server cookie may be expired.
    }

    broadcastLogout();
  }, [broadcastLogout]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      completeRegistration,
      login,
      logout,
      updateUser,
      user,
    }),
    [completeRegistration, isLoading, login, logout, updateUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return auth;
}
