/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "../api/http.js";
import {
  RECENT_PROJECTS_LIMIT,
  toRecentProjectCacheEntries,
} from "../utils/recentProjects.js";
import { useAuth } from "./AuthContext.jsx";

const RECENT_PROJECTS_CACHE_PREFIX = "arca_recent_projects_v1";
const pendingRequests = new Map();
const RecentProjectsContext = createContext({
  loading: false,
  projects: [],
});

function getUserCacheKey(user) {
  const userId = user?.id;

  return userId === undefined || userId === null
    ? null
    : `${RECENT_PROJECTS_CACHE_PREFIX}:${userId}`;
}

function readCachedProjects(cacheKey) {
  if (!cacheKey || typeof window === "undefined") {
    return null;
  }

  try {
    const cachedValue = JSON.parse(window.sessionStorage.getItem(cacheKey));

    if (!Array.isArray(cachedValue?.projects)) {
      return null;
    }

    return {
      projects: toRecentProjectCacheEntries(cachedValue.projects),
    };
  } catch {
    return null;
  }
}

function writeCachedProjects(cacheKey, projects) {
  if (!cacheKey || typeof window === "undefined") {
    return;
  }

  try {
    const safeProjects = toRecentProjectCacheEntries(projects);

    window.sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ projects: safeProjects, savedAt: Date.now() }),
    );
  } catch {
    // The in-memory provider remains available in restricted browsers.
  }
}

function requestRecentProjects(cacheKey) {
  if (!pendingRequests.has(cacheKey)) {
    const request = api.projects
      .list({ limit: RECENT_PROJECTS_LIMIT })
      .then((data) => toRecentProjectCacheEntries(data.projects))
      .finally(() => pendingRequests.delete(cacheKey));

    pendingRequests.set(cacheKey, request);
  }

  return pendingRequests.get(cacheKey);
}

function RecentProjectsSession({ cacheKey, children }) {
  const [cachedValue] = useState(() => readCachedProjects(cacheKey));
  const [projects, setProjects] = useState(cachedValue?.projects || []);
  const [loading, setLoading] = useState(!cachedValue);

  useEffect(() => {
    let isMounted = true;

    if (cachedValue) {
      writeCachedProjects(cacheKey, cachedValue.projects);
    }

    requestRecentProjects(cacheKey)
      .then((nextProjects) => {
        if (!isMounted) {
          return;
        }

        setProjects(nextProjects);
        writeCachedProjects(cacheKey, nextProjects);
      })
      .catch(() => {
        // Keep the last valid cached navigation when revalidation fails.
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cacheKey, cachedValue]);

  const value = useMemo(
    () => ({ loading, projects }),
    [loading, projects],
  );

  return (
    <RecentProjectsContext.Provider value={value}>
      {children}
    </RecentProjectsContext.Provider>
  );
}

export function RecentProjectsProvider({ children }) {
  const { user } = useAuth();
  const cacheKey = getUserCacheKey(user);

  if (!cacheKey) {
    return (
      <RecentProjectsContext.Provider value={{ loading: false, projects: [] }}>
        {children}
      </RecentProjectsContext.Provider>
    );
  }

  return (
    <RecentProjectsSession key={cacheKey} cacheKey={cacheKey}>
      {children}
    </RecentProjectsSession>
  );
}

export function useRecentProjects() {
  return useContext(RecentProjectsContext);
}
