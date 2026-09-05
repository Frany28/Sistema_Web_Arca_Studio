import { useEffect, useRef, useState } from "react";
import {
  motion as Motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { getHomeStatementVisualState } from "../../../utils/homeScrollNavigation.js";

const STATEMENT_MASK_ID = "home-statement-video-mask";

function playMutedVideo(video) {
  video.defaultMuted = true;
  video.muted = true;
  const playPromise = video.play();
  playPromise?.catch(() => undefined);
}

function HomeStatementPanel({
  active = false,
  mediaEnabled = false,
  mp4Source,
  phrase,
  poster,
  progress,
  statementVisible = false,
  webmSource,
}) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
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
        className="pointer-events-none absolute inset-0 h-full w-full"
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
            <Motion.text
              x="50%"
              y="50%"
              dy="0.35em"
              textAnchor="middle"
              fill="black"
              className="origin-center [transform-box:fill-box] font-[var(--font-sans)] text-[clamp(24px,3.2vw,46px)] font-bold tracking-[-1px]"
              style={{ scale: maskScale }}
            >
              {phrase}
            </Motion.text>
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
