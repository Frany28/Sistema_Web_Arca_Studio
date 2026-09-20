import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";

import { connectStatementPlayback } from "../../utils/statementVideoPlayback.js";
import { getHomeStatementVisualState } from "../../utils/homeScrollNavigation.js";

const STATEMENT_MASK_ID = "home-statement-video-mask";
const STATEMENT_FOCUS_LETTER = "c";

// El foco se sitúa dentro de la abertura óptica de la C, no en su centro geométrico.
const STATEMENT_FOCUS_X_RATIO = 0.68;
const STATEMENT_FOCUS_Y_RATIO = 0.5;

function HomeStatementPanel({
  active = false,
  effectStarted = false,
  mediaEnabled = false,
  mp4Source,
  phrase,
  poster,
  progress,
  statementVisible = false,
  webmSource,
}) {
  const reduceMotion = useReducedMotion();
  const videoPlaying = !reduceMotion;
  const videoRef = useRef(null);
  const svgRef = useRef(null);
  const maskTextRef = useRef(null);
  const focusGlyphRef = useRef(null);
  const cameraViewportRef = useRef(null);
  const geometryRef = useRef({
    ready: false,
    focusX: 0,
    focusY: 0,
    initialRadius: 0,
  });
  const [videoFailed, setVideoFailed] = useState(false);

  const focusLetterIndex = phrase
    .toLocaleLowerCase("es")
    .indexOf(STATEMENT_FOCUS_LETTER);

  const renderCameraViewport = useCallback((value) => {
    const cameraViewport = cameraViewportRef.current;
    const geometry = geometryRef.current;

    if (!cameraViewport || !geometry.ready) return;

    const { viewportRadiusRatio } = getHomeStatementVisualState(value);
    cameraViewport.setAttribute(
      "r",
      String(geometry.initialRadius * viewportRadiusRatio),
    );
  }, []);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const maskText = maskTextRef.current;
    const focusGlyph = focusGlyphRef.current;
    const cameraViewport = cameraViewportRef.current;

    if (!svg || !maskText || !cameraViewport) return undefined;

    let cancelled = false;

    const measureGeometry = () => {
      if (cancelled) return;

      const focusBounds = (focusGlyph ?? maskText).getBBox();
      const width = svg.clientWidth;
      const height = svg.clientHeight;

      if (!focusBounds.width || !focusBounds.height || !width || !height) return;

      const focusX = focusGlyph
        ? focusBounds.x + focusBounds.width * STATEMENT_FOCUS_X_RATIO
        : focusBounds.x + focusBounds.width / 2;
      const focusY = focusGlyph
        ? focusBounds.y + focusBounds.height * STATEMENT_FOCUS_Y_RATIO
        : focusBounds.y + focusBounds.height / 2;
      const farthestHorizontalEdge = Math.max(focusX, width - focusX);
      const farthestVerticalEdge = Math.max(focusY, height - focusY);

      geometryRef.current = {
        ready: true,
        focusX,
        focusY,
        initialRadius: Math.hypot(
          farthestHorizontalEdge,
          farthestVerticalEdge,
        ) + 1,
      };

      cameraViewport.setAttribute("cx", String(focusX));
      cameraViewport.setAttribute("cy", String(focusY));
      renderCameraViewport(progress.get());
    };

    measureGeometry();
    document.fonts?.ready.then(measureGeometry).catch(() => undefined);

    const resizeObserver = new ResizeObserver(measureGeometry);
    resizeObserver.observe(svg);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [phrase, progress, renderCameraViewport]);

  useEffect(() => {
    renderCameraViewport(progress.get());
    return progress.on("change", renderCameraViewport);
  }, [progress, renderCameraViewport]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    return connectStatementPlayback(video, {
      active,
      enabled: mediaEnabled,
      playing: videoPlaying,
    });
  }, [active, mediaEnabled, videoPlaying]);

  return (
    <section
      className="relative h-dvh w-full shrink-0 overflow-hidden bg-[var(--color-neutral-950-uniform)]"
      aria-hidden={!active}
      data-home-panel
      data-home-statement-panel
      data-navbar-background="dark"
    >
      <img
        src={poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden="true"
      />

      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover object-center ${
          videoFailed ? "hidden" : "block"
        }`}
        autoPlay={mediaEnabled && videoPlaying}
        muted
        loop
        playsInline
        poster={poster}
        preload={mediaEnabled ? "auto" : "none"}
        onError={() => setVideoFailed(true)}
        aria-hidden="true"
      >
        <source src={mp4Source} type="video/mp4" />
        <source src={webmSource} type="video/webm" />
      </video>

      <div
        className="pointer-events-none absolute inset-0 bg-[var(--color-neutral-950-uniform)] opacity-20 mix-blend-multiply"
        aria-hidden="true"
      />

      <svg
        ref={svgRef}
        className={`pointer-events-none absolute inset-0 h-full w-full ${
          effectStarted ? "visible" : "invisible"
        }`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <mask
            id={STATEMENT_MASK_ID}
            x="0"
            y="0"
            width="100%"
            height="100%"
            maskUnits="userSpaceOnUse"
            className="[mask-type:luminance]"
          >
            <rect width="100%" height="100%" fill="white" />
            <text
              ref={maskTextRef}
              x="50%"
              y="50%"
              dy="0.35em"
              textAnchor="middle"
              fill="black"
              className="font-[var(--font-sans)] text-[clamp(24px,3.2vw,46px)] font-bold tracking-[-1px]"
            >
              {focusLetterIndex < 0 ? (
                phrase
              ) : (
                <>
                  {phrase.slice(0, focusLetterIndex)}
                  <tspan ref={focusGlyphRef}>{phrase[focusLetterIndex]}</tspan>
                  {phrase.slice(focusLetterIndex + 1)}
                </>
              )}
            </text>
            <circle ref={cameraViewportRef} cx="0" cy="0" r="0" fill="black" />
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="var(--color-neutral-950-uniform)"
          mask={`url(#${STATEMENT_MASK_ID})`}
        />
      </svg>

      <h2 className="sr-only" aria-hidden={!statementVisible}>
        {phrase}
      </h2>
    </section>
  );
}

export default HomeStatementPanel;
