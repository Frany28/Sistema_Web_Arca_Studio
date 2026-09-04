import { useEffect, useState } from "react";

import Login from "./Login.jsx";
import ArcaOpeningMark, {
  MOTION_DURATION_SECONDS,
} from "../components/ui/ArcaOpeningMark/ArcaOpeningMark.jsx";

const REDUCED_MOTION_DURATION_MS = 450;

function OpeningHome() {
  const [showOpening, setShowOpening] = useState(true);

  useEffect(() => {
    const reducesMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reducesMotion
      ? REDUCED_MOTION_DURATION_MS
      : MOTION_DURATION_SECONDS * 1000;
    const timeoutId = window.setTimeout(() => setShowOpening(false), duration);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!showOpening) {
    return <Login />;
  }

  return (
    <main
      className="flex min-h-dvh items-center justify-center overflow-hidden bg-[var(--color-primary-500-uniform)] px-[16px]"
      aria-label="Inicio de ARCA Studio"
    >
      <ArcaOpeningMark repeat={0} />
    </main>
  );
}

export default OpeningHome;
