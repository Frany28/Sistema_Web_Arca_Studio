import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import MainLogo from "../../../assets/logos/MainLogo.jsx";
import Button from "../../ui/Button/Button.jsx";
import { GeneralCommentsDrawer } from "./Model3DViewerModal.jsx";
import { useImageComments } from "./useImageComments.js";

const MODAL_TRANSITION_MS = 320;
const MODAL_EASING = "ease-in-out";

function CloseIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.195262 0.195262C0.455612 -0.0650874 0.877722 -0.0650874 1.13807 0.195262L6 5.05719L10.8619 0.195263C11.1223 -0.0650867 11.5444 -0.0650866 11.8047 0.195263C12.0651 0.455612 12.0651 0.877722 11.8047 1.13807L6.94281 6L11.8047 10.8619C12.0651 11.1223 12.0651 11.5444 11.8047 11.8047C11.5444 12.0651 11.1223 12.0651 10.8619 11.8047L6 6.94281L1.13807 11.8047C0.877722 12.0651 0.455612 12.0651 0.195262 11.8047C-0.0650873 11.5444 -0.0650873 11.1223 0.195262 10.8619L5.05719 6L0.195262 1.13807C-0.0650874 0.877722 -0.0650874 0.455612 0.195262 0.195262Z"
        fill="currentColor"
      />
    </svg>
  );
}

function VolumeIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.5 7.358V12.642C2.5 13.45 3.158 14.108 3.967 14.108H6.342L10.292 17.217C10.95 17.733 11.917 17.267 11.917 16.425V3.575C11.917 2.733 10.95 2.267 10.292 2.783L6.342 5.892H3.967C3.158 5.892 2.5 6.55 2.5 7.358Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.417 6.875C15.458 8.75 15.458 11.25 14.417 13.125"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.792 5.208C18.458 8.125 18.458 11.875 16.792 14.792"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VolumeMutedIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.5 7.358V12.642C2.5 13.45 3.158 14.108 3.967 14.108H6.342L10.292 17.217C10.95 17.733 11.917 17.267 11.917 16.425V3.575C11.917 2.733 10.95 2.267 10.292 2.783L6.342 5.892H3.967C3.158 5.892 2.5 6.55 2.5 7.358Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.167 8.333L17.5 11.667M17.5 8.333L14.167 11.667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.158 4.47C6.603 4.14 5.9 4.54 5.9 5.186v9.628c0 .646.703 1.046 1.258.717l8.12-4.814a.833.833 0 0 0 0-1.434L7.158 4.47Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PauseIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.667 4.167h1.666c.46 0 .834.373.834.833v10c0 .46-.373.833-.834.833H6.667A.833.833 0 0 1 5.833 15V5c0-.46.373-.833.834-.833ZM11.667 4.167h1.666c.46 0 .834.373.834.833v10c0 .46-.373.833-.834.833h-1.666a.833.833 0 0 1-.834-.833V5c0-.46.373-.833.834-.833Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SettingsIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 12.5C11.381 12.5 12.5 11.381 12.5 10C12.5 8.619 11.381 7.5 10 7.5C8.619 7.5 7.5 8.619 7.5 10C7.5 11.381 8.619 12.5 10 12.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.667 10.733V9.267C1.667 8.4 2.375 7.683 3.25 7.683C4.758 7.683 5.375 6.617 4.617 5.308C4.183 4.558 4.442 3.583 5.2 3.15L6.642 2.325C7.3 1.933 8.15 2.167 8.542 2.825L8.633 2.983C9.383 4.292 10.617 4.292 11.375 2.983L11.467 2.825C11.858 2.167 12.708 1.933 13.367 2.325L14.808 3.15C15.567 3.583 15.825 4.558 15.392 5.308C14.633 6.617 15.25 7.683 16.758 7.683C17.625 7.683 18.342 8.392 18.342 9.267V10.733C18.342 11.6 17.633 12.317 16.758 12.317C15.25 12.317 14.633 13.383 15.392 14.692C15.825 15.45 15.567 16.417 14.808 16.85L13.367 17.675C12.708 18.067 11.858 17.833 11.467 17.175L11.375 17.017C10.625 15.708 9.392 15.708 8.633 17.017L8.542 17.175C8.15 17.833 7.3 18.067 6.642 17.675L5.2 16.85C4.442 16.417 4.183 15.442 4.617 14.692C5.375 13.383 4.758 12.317 3.25 12.317C2.375 12.317 1.667 11.6 1.667 10.733Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPlaybackTime(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function PlaybackBar({
  currentTime,
  duration,
  isMuted,
  isPlaying,
  onFullscreen,
  onSeek,
  onToggleMute,
  onTogglePlay,
}) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const progress = safeDuration
    ? Math.min(Math.max((currentTime / safeDuration) * 100, 0), 100)
    : 0;

  return (
    <div className="absolute inset-x-[16px] bottom-[12px] z-20">
      <div className="rounded-[var(--radius-3)] border border-white/10 bg-black/58 p-[12px] shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <div className="flex items-center gap-[12px]">
          <button
            type="button"
            aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
            className="flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-neutral-100-uniform)] text-[var(--color-text-300)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-300)]"
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <PauseIcon className="size-5" />
            ) : (
              <PlayIcon className="size-5" />
            )}
          </button>

          <span className="w-[42px] shrink-0 text-right text-[12px] font-medium leading-[16px] text-white/78">
            {formatPlaybackTime(currentTime)}
          </span>

          <div className="relative h-[20px] min-w-0 flex-1">
            <div className="pointer-events-none absolute left-0 top-1/2 h-[8px] w-full -translate-y-1/2 overflow-hidden rounded-full bg-white/24">
              <div
                className="h-full rounded-full bg-[var(--color-neutral-100-uniform)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={safeDuration || 0}
              step="0.1"
              value={Math.min(currentTime, safeDuration || currentTime)}
              aria-label="Progreso del video"
              className="absolute inset-0 h-[20px] w-full cursor-pointer opacity-0"
              disabled={!safeDuration}
              onChange={(event) => onSeek(Number(event.target.value))}
            />
          </div>

          <span className="w-[42px] shrink-0 text-[12px] font-medium leading-[16px] text-white/78">
            {formatPlaybackTime(safeDuration)}
          </span>
        </div>

        <div className="mt-[10px] flex items-center justify-between">
          <button
            type="button"
            aria-label={isMuted ? "Activar sonido" : "Silenciar video"}
            className="flex size-[40px] cursor-pointer items-center justify-center rounded-[var(--radius-2)] bg-white/12 text-white transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-300)]"
            onClick={onToggleMute}
          >
            {isMuted ? (
              <VolumeMutedIcon className="size-5" />
            ) : (
              <VolumeIcon className="size-5" />
            )}
          </button>

          <button
            type="button"
            aria-label="Pantalla completa"
            className="flex size-[40px] cursor-pointer items-center justify-center rounded-[var(--radius-2)] bg-white/12 text-white transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-300)]"
            onClick={onFullscreen}
          >
            <SettingsIcon className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoLoadingOverlay({ visible }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/18">
      <div className="flex flex-col items-center gap-[10px] rounded-[var(--radius-3)] border border-white/10 bg-black/58 px-[18px] py-[14px] text-white shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <span className="size-[28px] animate-spin rounded-full border-2 border-white/28 border-t-white" />
        <span className="text-[12px] font-medium leading-[16px]">
          Cargando video
        </span>
      </div>
    </div>
  );
}

export default function VideoViewerModal({
  visible = false,
  item,
  projectId,
  onClose,
}) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isActive, setIsActive] = useState(false);
  const [displayItem, setDisplayItem] = useState(item);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const closeTimeoutRef = useRef(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const { addComment, comments } = useImageComments(displayItem, {
    commentType: "video",
    projectId,
  });

  useEffect(() => {
    window.clearTimeout(closeTimeoutRef.current);
    window.cancelAnimationFrame(frameRef.current);

    if (visible && item) {
      setDisplayItem(item);
      setCurrentTime(0);
      setDuration(0);
      setIsActive(false);
      setIsMuted(false);
      setIsPlaying(false);
      setIsVideoLoading(Boolean(item.video));
      setShouldRender(true);
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = window.requestAnimationFrame(() => {
          setIsActive(true);
        });
      });

      return undefined;
    }

    setIsActive(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      setShouldRender(false);
    }, MODAL_TRANSITION_MS);

    return () => {
      window.clearTimeout(closeTimeoutRef.current);
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [visible, item]);

  useEffect(
    () => () => {
      window.clearTimeout(closeTimeoutRef.current);
      window.cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  if (!shouldRender || !displayItem || typeof document === "undefined") {
    return null;
  }

  const transitionStyle = {
    transitionDuration: `${MODAL_TRANSITION_MS}ms`,
    transitionTimingFunction: MODAL_EASING,
  };

  async function handleSubmitComment({ message, parentCommentId }) {
    await addComment({ message, parentCommentId });
  }

  async function handleTogglePlay() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      setIsVideoLoading(video.readyState < 3);
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
  }

  function handleSeek(nextTime) {
    const video = videoRef.current;

    if (!video || !Number.isFinite(nextTime)) {
      return;
    }

    video.currentTime = Math.min(Math.max(nextTime, 0), duration || nextTime);
    setCurrentTime(video.currentTime);
  }

  function handleToggleMute() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  async function handleFullscreen() {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
        return;
      }

      await stage.requestFullscreen?.();
    } catch {
      // Fullscreen can be blocked by the browser if the gesture is not trusted.
    }
  }

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-[60] overflow-hidden bg-[rgba(0,0,0,0.42)] backdrop-blur-[10px] transition-opacity",
        isActive ? "opacity-100" : "opacity-0",
      )}
      style={transitionStyle}
    >
      <section
        className={clsx(
          "flex h-dvh w-dvw gap-[16px] p-[16px] transition-[opacity,transform] transform-gpu will-change-transform will-change-opacity max-[920px]:flex-col max-[920px]:overflow-y-auto",
          isActive
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-[12px] scale-[0.985] opacity-0",
        )}
        style={transitionStyle}
        role="dialog"
        aria-modal="true"
        aria-label={displayItem.title}
        onClick={onClose}
      >
        <div
          ref={stageRef}
          className={clsx(
            "relative min-w-0 flex-1 overflow-hidden",
            "rounded-[var(--radius-3)] bg-[var(--color-neutral-200)]",
            "h-[calc(100dvh-32px)]",
            "max-[920px]:h-[62dvh] max-[920px]:min-h-[360px] max-[920px]:flex-none",
            "max-[520px]:h-[58dvh] max-[520px]:min-h-[300px]",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {displayItem.video ? (
            <video
              ref={videoRef}
              src={displayItem.video}
              poster={displayItem.image}
              className="absolute inset-0 h-full w-full object-cover"
              muted={isMuted}
              playsInline
              preload="metadata"
              aria-label={displayItem.title}
              onClick={handleTogglePlay}
              onDurationChange={(event) => {
                setDuration(event.currentTarget.duration || 0);
              }}
              onLoadedData={(event) => {
                setDuration(event.currentTarget.duration || 0);
                setIsVideoLoading(false);
              }}
              onPause={() => setIsPlaying(false)}
              onPlay={() => {
                setIsPlaying(true);
                setIsVideoLoading(false);
              }}
              onPlaying={() => {
                setIsPlaying(true);
                setIsVideoLoading(false);
              }}
              onTimeUpdate={(event) => {
                setCurrentTime(event.currentTarget.currentTime || 0);
              }}
              onVolumeChange={(event) => {
                setIsMuted(event.currentTarget.muted);
              }}
              onWaiting={() => setIsVideoLoading(true)}
            />
          ) : (
            <img
              src={displayItem.image}
              alt={displayItem.label ?? displayItem.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-[rgba(42,41,41,0.18)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-[linear-gradient(180deg,rgba(0,0,0,0.26)_0%,rgba(0,0,0,0)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[170px] bg-[linear-gradient(0deg,rgba(0,0,0,0.50)_0%,rgba(0,0,0,0)_100%)]" />
          <VideoLoadingOverlay visible={displayItem.video && isVideoLoading} />

          <div className="absolute left-[12px] top-[12px]">
            <MainLogo size="32px" alt="ARCA Studio" />
          </div>

          <Button
            theme="Primary"
            type="Solid"
            size="S"
            showText={false}
            showLeftIcon
            showRightIcon={false}
            iconLeft={<CloseIcon className="size-3" />}
            aria-label="Cerrar video"
            onClick={onClose}
            className="absolute right-[8px] top-[8px] size-9 text-[var(--color-text-200)]"
          />

          <PlaybackBar
            currentTime={currentTime}
            duration={duration}
            isMuted={isMuted}
            isPlaying={isPlaying}
            onFullscreen={handleFullscreen}
            onSeek={handleSeek}
            onToggleMute={handleToggleMute}
            onTogglePlay={handleTogglePlay}
          />
        </div>

        <div
          className={clsx(
            "min-h-0 w-[296px] shrink-0",
            "max-[920px]:h-[360px] max-[920px]:w-full max-[920px]:shrink-0",
            "max-[520px]:h-[320px]",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <GeneralCommentsDrawer
            comments={comments}
            mediaItem={displayItem}
            mediaType="video"
            onSubmitComment={handleSubmitComment}
          />
        </div>
      </section>
    </div>,
    document.body,
  );
}
