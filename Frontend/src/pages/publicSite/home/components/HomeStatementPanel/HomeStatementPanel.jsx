import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion as Motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { getHomeStatementVisualState } from "../../utils/homeScrollNavigation.js";

const STATEMENT_MASK_ID = "home-statement-video-mask";
const STATEMENT_FOCUS_LETTER = "c";
const STATEMENT_FOCUS_GLYPH_HORIZONTAL_RATIO = 0.2;

function playMutedVideo(video) {
  video.defaultMuted = true;
  video.muted = true;
  const playPromise = video.play();
  playPromise?.catch(() => undefined);
}

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
  const focusGlyphRef = useRef(null);
  const maskTextRef = useRef(null);
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const focusOffsetX = useMotionValue(0);
  const smoothedProgress = useSpring(progress, {
    damping: 28,
    mass: 0.55,
    stiffness: 180,
  });
  const visualProgress = reduceMotion ? progress : smoothedProgress;
  const maskScale = useTransform(
    visualProgress,
    (value) => getHomeStatementVisualState(value).maskScale,
  );
  const maskTranslateX = useTransform(() => {
    const { progress: currentProgress } = getHomeStatementVisualState(
      visualProgress.get(),
    );
    return -focusOffsetX.get() * (1 - currentProgress);
  });
  const focusLetterIndex = phrase
    .toLocaleLowerCase("es")
    .indexOf(STATEMENT_FOCUS_LETTER);

  useLayoutEffect(() => {
    const focusGlyph = focusGlyphRef.current;
    const maskText = maskTextRef.current;
    const maskSvg = maskText?.ownerSVGElement;
    if (!focusGlyph || !maskText || !maskSvg) return undefined;

    let cancelled = false;
    const updateFocusGeometry = () => {
      if (cancelled) return;

      const focusBounds = focusGlyph.getBBox();
      const textBounds = maskText.getBBox();
      if (!textBounds.width || !textBounds.height || !maskSvg.clientWidth) return;

      const focusX =
        focusBounds.x +
        focusBounds.width * STATEMENT_FOCUS_GLYPH_HORIZONTAL_RATIO;
      const focusY = focusBounds.y + focusBounds.height / 2;
      const originX = ((focusX - textBounds.x) / textBounds.width) * 100;
      const originY = ((focusY - textBounds.y) / textBounds.height) * 100;

      maskText.style.transformOrigin = `${originX}% ${originY}%`;
      focusOffsetX.set(focusX - maskSvg.clientWidth / 2);
    };

    updateFocusGeometry();
    document.fonts?.ready.then(updateFocusGeometry).catch(() => undefined);
    window.addEventListener("resize", updateFocusGeometry);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", updateFocusGeometry);
    };
  }, [focusOffsetX, phrase]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (!mediaEnabled) {
      video.pause();
      return undefined;
    }

    video.load();
    return undefined;
  }, [mediaEnabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaEnabled) return undefined;

    if (!active) {
      video.pause();
      return undefined;
    }

    // Scroll progress never seeks or pauses the media. Only a new panel entry
    // restarts playback; readiness and browser interruptions simply resume it.
    const handleCanPlay = () => {
      if (!document.hidden && video.paused) playMutedVideo(video);
    };
    video.currentTime = 0;
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("pause", handleCanPlay);
    video.addEventListener("ended", handleCanPlay);
    document.addEventListener("visibilitychange", handleCanPlay);
    playMutedVideo(video);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("pause", handleCanPlay);
      video.removeEventListener("ended", handleCanPlay);
      document.removeEventListener("visibilitychange", handleCanPlay);
      video.pause();
    };
  }, [active, mediaEnabled]);

  return (
    <section
      className="relative h-dvh w-full shrink-0 overflow-hidden bg-[var(--color-neutral-950-uniform)]"
      aria-hidden={!active}
      data-home-panel
      data-home-statement-panel
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
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        preload={mediaEnabled ? "auto" : "none"}
        onError={() => setVideoFailed(true)}
        aria-hidden="true"
      >
        {mediaEnabled ? (
          <>
            <source src={mp4Source} type="video/mp4" />
            <source src={webmSource} type="video/webm" />
          </>
        ) : null}
      </video>

      <div
        className="pointer-events-none absolute inset-0 bg-[var(--color-neutral-950-uniform)] opacity-20 mix-blend-multiply"
        aria-hidden="true"
      />

      <svg
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
            <Motion.g style={{ x: maskTranslateX }}>
              <Motion.text
                ref={maskTextRef}
                x="50%"
                y="50%"
                dy="0.35em"
                textAnchor="middle"
                fill="black"
                className="origin-center [transform-box:fill-box] font-[var(--font-sans)] text-[clamp(24px,3.2vw,46px)] font-bold tracking-[-1px]"
                style={{ scale: maskScale }}
              >
                {focusLetterIndex < 0 ? (
                  phrase
                ) : (
                  <>
                    {phrase.slice(0, focusLetterIndex)}
                    <tspan ref={focusGlyphRef}>
                      {phrase[focusLetterIndex]}
                    </tspan>
                    {phrase.slice(focusLetterIndex + 1)}
                  </>
                )}
              </Motion.text>
            </Motion.g>
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
