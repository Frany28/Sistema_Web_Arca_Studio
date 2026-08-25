import { useCallback, useEffect, useState } from "react";

import { loadAdminDashboardOverview } from "../api/adminDashboardOverview.js";
import { toAdminDrawerActivity } from "../utils/adminActivity.js";

export function useAdminRecentActivity({ enabled = false, user } = {}) {
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const scopeKey = user?.id || user?.email;

  const loadActivity = useCallback(async ({ force = false } = {}) => {
    setLoading(true);
    setError("");

    try {
      const overview = await loadAdminDashboardOverview({ force, scopeKey });
      const nextActivity = (overview?.recentActivity || []).map(
        toAdminDrawerActivity,
      );
      setActivity(nextActivity);
      return nextActivity;
    } catch (requestError) {
      setError(
        requestError?.message
          || "No se pudo cargar la actividad administrativa.",
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [scopeKey]);

  useEffect(() => {
    if (!enabled) return undefined;

    let active = true;

    loadAdminDashboardOverview({ scopeKey })
      .then((overview) => {
        if (active) {
          setActivity(
            (overview?.recentActivity || []).map(toAdminDrawerActivity),
          );
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.message
              || "No se pudo cargar la actividad administrativa.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    setLoading(true);

    return () => {
      active = false;
    };
  }, [enabled, scopeKey]);

  return {
    activity,
    error,
    loading,
    refresh: () => loadActivity({ force: true }),
  };
}
