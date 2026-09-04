import { useEffect, useRef, useState } from "react";
import {
  motion as Motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { getHomeStatementVisualState } from "../../../utils/homeScrollNavigation.js";

const STATEMENT_MASK_ID = "home-statement-video-mask";

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
  const overlayOpacity = useTransform(
    visualProgress,
    (value) => getHomeStatementVisualState(value).overlayOpacity,
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaEnabled) return;

    video.load();
  }, [mediaEnabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaEnabled || videoFailed) return undefined;

    if (!active) {
      video.pause();
      return undefined;
    }

    const playPromise = video.play();
    playPromise?.catch(() => undefined);

    return () => video.pause();
  }, [active, mediaEnabled, videoFailed]);

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
            <source src={webmSource} type="video/webm" />
            <source src={mp4Source} type="video/mp4" />
          </>
        ) : null}
      </video>

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
        <Motion.rect
          width="100%"
          height="100%"
          fill="var(--color-neutral-950-uniform)"
          mask={`url(#${STATEMENT_MASK_ID})`}
          style={{ opacity: overlayOpacity }}
        />
      </svg>

      <h2 className="sr-only" aria-hidden={!statementVisible}>
        {phrase}
      </h2>
    </section>
  );
}

export default HomeStatementPanel;
