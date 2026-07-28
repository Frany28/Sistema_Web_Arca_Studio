import { useCallback, useEffect, useState } from "react";

import { api } from "../api/http.js";
import { DEFAULT_ARCHITECTURAL_SETTINGS } from "../utils/architecturalRendering.js";

export default function useModelRenderSettings({ fileId, projectId }) {
  const [settings, setSettings] = useState(DEFAULT_ARCHITECTURAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(Boolean(fileId && projectId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!fileId || !projectId) {
      setSettings(DEFAULT_ARCHITECTURAL_SETTINGS);
      setIsLoading(false);
      return undefined;
    }
    let active = true;
    setIsLoading(true);
    setError("");
    api.projects
      .getModelRenderSettings({ fileId, projectId })
      .then((data) => active && setSettings(data.settings))
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => active && setIsLoading(false));

    const unsubscribe = api.projects.subscribeToEvents({
      projectId,
      onRenderSettingsUpdated: (event) => {
        if (active && Number(event.fileId) === Number(fileId)) {
          setSettings((current) => ({ ...current, ...event.settings }));
        }
      },
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [fileId, projectId]);

  const save = useCallback(
    async (nextSettings) => {
      if (!fileId || !projectId || !settings.canEdit) return settings;
      setIsSaving(true);
      setError("");
      try {
        const data = await api.projects.updateModelRenderSettings({
          fileId,
          projectId,
          settings: {
            environment: nextSettings.environment,
            exposure: Number(nextSettings.exposure),
            materialOverrides: nextSettings.materialOverrides || {},
            profile: nextSettings.profile,
            shadowIntensity: Number(nextSettings.shadowIntensity),
          },
        });
        setSettings(data.settings);
        return data.settings;
      } catch (requestError) {
        setError(requestError.message);
        throw requestError;
      } finally {
        setIsSaving(false);
      }
    },
    [fileId, projectId, settings],
  );

  return { error, isLoading, isSaving, save, settings, setSettings };
}
