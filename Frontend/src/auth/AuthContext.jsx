/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api, getApiUrl } from "../api/http.js";
import {
  AUTH_SESSION_STATUS,
  createAuthSessionRestorer,
} from "./authSession.js";

const AuthContext = createContext(null);

function buildProfilePhotoImageUrl(profilePhotoUrl, version) {
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
    v: String(version || Date.now()),
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
      ? buildProfilePhotoImageUrl("stored", user.updatedAt)
      : "",
    role: typeof user.role === "string" ? user.role : user.role?.code,
    roleDetails: typeof user.role === "object" ? user.role : null,
  };
}

export function AuthProvider({ children }) {
  const [sessionStatus, setSessionStatus] = useState(
    AUTH_SESSION_STATUS.LOADING,
  );
  const [user, setUser] = useState(null);
  const [loginEventId, setLoginEventId] = useState(0);
  const [sessionRestorer] = useState(() =>
    createAuthSessionRestorer({ fetchSession: api.auth.me }),
  );

  const restoreSession = useCallback(() => {
    setSessionStatus(AUTH_SESSION_STATUS.LOADING);

    return sessionRestorer
      .restore()
      .then((result) => {
        setUser(normalizeUser(result.user));
        setSessionStatus(result.status);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setUser(null);
          setSessionStatus(AUTH_SESSION_STATUS.TEMPORARILY_UNAVAILABLE);
        }
      });
  }, [sessionRestorer]);

  useEffect(() => {
    const timeoutId = window.setTimeout(restoreSession, 0);

    return () => {
      window.clearTimeout(timeoutId);
      sessionRestorer?.cancel();
    };
  }, [restoreSession, sessionRestorer]);

  useEffect(() => {
    const handleOnline = () => {
      if (sessionStatus === AUTH_SESSION_STATUS.TEMPORARILY_UNAVAILABLE) {
        restoreSession();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [restoreSession, sessionStatus]);

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
    setSessionStatus(AUTH_SESSION_STATUS.AUTHENTICATED);
    setLoginEventId((current) => current + 1);
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
    setSessionStatus(AUTH_SESSION_STATUS.AUTHENTICATED);
    return nextUser;
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(normalizeUser(nextUser));
  }, []);

  useEffect(() => {
    const handleStorageEvent = (event) => {
      if (event.key === "arca_auth_logout") {
        setUser(null);
        setSessionStatus(AUTH_SESSION_STATUS.UNAUTHENTICATED);
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
    sessionRestorer?.cancel();
    setUser(null);
    setSessionStatus(AUTH_SESSION_STATUS.UNAUTHENTICATED);

    try {
      await api.auth.logout();
    } catch {
      // The local session is already cleared; the server cookie may be expired.
    }

    broadcastLogout();
  }, [broadcastLogout, sessionRestorer]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading: sessionStatus === AUTH_SESSION_STATUS.LOADING,
      isSessionUnavailable:
        sessionStatus === AUTH_SESSION_STATUS.TEMPORARILY_UNAVAILABLE,
      loginEventId,
      completeRegistration,
      login,
      logout,
      restoreSession,
      sessionStatus,
      updateUser,
      user,
    }),
    [
      completeRegistration,
      login,
      loginEventId,
      logout,
      restoreSession,
      sessionStatus,
      updateUser,
      user,
    ],
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
