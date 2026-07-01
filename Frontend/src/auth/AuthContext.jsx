import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api, setAuthToken } from "../api/http.js";
import { ROUTE_AUTH_DISABLED_FOR_TESTS, TEST_AUTH_USER } from "./testAccess.js";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: typeof user.role === "string" ? user.role : user.role?.code,
    roleDetails: typeof user.role === "object" ? user.role : null,
  };
}

export function getDefaultAuthenticatedPath(user) {
  if (user?.role === "architect" || user?.role === "admin") {
    return "/dashboard-arquitecto";
  }

  return "/dashboard-clientes";
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
          if (data.token) {
            setAuthToken(data.token);
          }

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

    if (!data.token) {
      throw Object.assign(
        new Error("El backend de autenticación no está actualizado."),
        { code: "AUTH_TOKEN_MISSING" },
      );
    }

    setAuthToken(data.token);
    const nextUser = normalizeUser(data.user);
    setUser(nextUser);
    return nextUser;
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
      login,
      logout,
      user,
    }),
    [isLoading, login, logout, user],
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
