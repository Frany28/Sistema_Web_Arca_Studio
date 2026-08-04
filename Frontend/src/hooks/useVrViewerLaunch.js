import { useCallback, useEffect, useRef, useState } from "react";

const CLOSED_VIEWER = {
  initialSession: null,
  mode: "fallback",
  notice: "",
  visible: false,
};

export async function getVrSupportStatus(xr) {
  if (!xr?.isSessionSupported) return "unsupported";
  try {
    return await xr.isSessionSupported("immersive-vr") ? "supported" : "unsupported";
  } catch {
    return "unsupported";
  }
}

export function requestVrSession(xr) {
  if (!xr?.requestSession) return Promise.reject(new Error("VR_UNAVAILABLE"));
  return xr.requestSession("immersive-vr", {
    optionalFeatures: ["local-floor", "bounded-floor"],
  });
}

export default function useVrViewerLaunch() {
  const [supportStatus, setSupportStatus] = useState("checking");
  const [viewer, setViewer] = useState(CLOSED_VIEWER);
  const closingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getVrSupportStatus(navigator.xr).then((status) => {
      if (!cancelled) setSupportStatus(status);
    });
    return () => { cancelled = true; };
  }, []);

  const open = useCallback(async () => {
    closingRef.current = false;
    if (supportStatus !== "supported" || !navigator.xr?.requestSession) {
      setViewer({ ...CLOSED_VIEWER, visible: true });
      return;
    }
    try {
      const session = await requestVrSession(navigator.xr);
      setViewer({ initialSession: session, mode: "immersive", notice: "", visible: true });
    } catch {
      setViewer({
        initialSession: null,
        mode: "fallback",
        notice: "No se pudo iniciar el modo VR. Puedes continuar con el visor disponible.",
        visible: true,
      });
    }
  }, [supportStatus]);

  const close = useCallback(() => {
    closingRef.current = true;
    viewer.initialSession?.end?.().catch(() => {});
    setViewer(CLOSED_VIEWER);
  }, [viewer.initialSession]);

  const handleImmersiveEnd = useCallback(() => {
    if (closingRef.current) return;
    setViewer({ ...CLOSED_VIEWER, visible: true });
  }, []);

  return {
    close,
    handleImmersiveEnd,
    isChecking: supportStatus === "checking",
    open,
    supportStatus,
    viewer,
  };
}
