import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { getFileDisplayName } from "../../../utils/fileDisplayName.js";
import AvatarLabel from "../AvatarLabel/AvatarLabel.jsx";
import Button from "../Button/Button.jsx";
import Modal from "../Modal/Modal.jsx";
import ScrollBar from "../ScrollBar/ScrollBar.jsx";
import VideoThumbnail from "./VideoThumbnail.jsx";

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
        d="M6 3.9V16.1C6 16.6 6.54 16.92 6.98 16.67L17.18 10.57C17.6 10.32 17.6 9.68 17.18 9.43L6.98 3.33C6.54 3.08 6 3.4 6 3.9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoThumb({ item }) {
  return (
    <div className="relative h-[60px] w-[99px] shrink-0 overflow-hidden rounded-[var(--radius-1)] shadow-[var(--shadow-e2)] max-[560px]:h-[72px] max-[560px]:w-[120px]">
      <VideoThumbnail item={item} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.00)_0%,rgba(0,0,0,0.16)_42%,rgba(0,0,0,0.60)_100%)]" />
      <span className="absolute left-1/2 top-1/2 flex size-[24px] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[var(--color-neutral-100-uniform)]">
        <PlayIcon className="size-5" />
      </span>
    </div>
  );
}

function VideoGalleryModalRow({ item, onWatchVideo }) {
  return (
    <article className="grid min-h-[100px] grid-cols-[minmax(260px,1fr)_auto_auto_auto] items-center gap-[24px] border-b border-[var(--color-neutral-200)] px-[20px] py-[20px] max-[900px]:grid-cols-[minmax(0,1fr)_auto] max-[900px]:gap-x-[16px] max-[760px]:grid-cols-1 max-[760px]:gap-y-[12px] max-[560px]:px-[12px] max-[560px]:py-[16px]">
      <div className="flex min-w-0 items-center gap-[12px]">
        <VideoThumb item={item} />

        <div className="flex min-w-0 flex-col">
          <h3 className="truncate text-heading-8 text-[var(--color-text-300)]">
            {getFileDisplayName(item.title)}
          </h3>
          <p className="text-body-3 text-[var(--color-text-100)]">
            {item.size}
          </p>
        </div>
      </div>

      <p className="whitespace-nowrap text-body-3 text-[var(--color-text-100)] max-[900px]:justify-self-end max-[760px]:justify-self-start">
        {item.uploadedAt}
      </p>

      <div className="flex min-w-0 items-center justify-end gap-[24px] max-[900px]:col-span-2 max-[900px]:justify-end max-[760px]:col-span-1 max-[760px]:justify-between max-[560px]:flex-wrap max-[560px]:gap-[12px]">
        <AvatarLabel
          size="S"
          label={item.author ?? "Armando Carroz"}
          showSubtitle={false}
          avatarTheme="Neutral"
          avatarContent="Icon"
          avatarDecorative
          className="min-w-0"
          textClassName="truncate text-[var(--color-text-300)]"
        />
        <Button
          theme="Primary"
          type="Outline"
          size="S"
          fitContent
          showLeftIcon={false}
          showRightIcon={false}
          onClick={() => onWatchVideo?.(item)}
          className="shrink-0"
        >
          Ver video
        </Button>
      </div>
    </article>
  );
}

export default function GalleryVideosModal({
  visible = false,
  items = [],
  title = "Galería de Videos",
  onClose,
  onWatchVideo,
  className,
}) {
  const viewportRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    length: 1,
    position: 0,
    height: 392,
  });

  const repeatedItems = useMemo(() => {
    return items.length > 0 ? [...items, ...items] : [];
  }, [items]);

  const syncScrollState = useCallback(() => {
    const element = viewportRef.current;

    if (!element) return;

    const maxScrollTop = Math.max(
      element.scrollHeight - element.clientHeight,
      0,
    );
    const nextLength =
      element.scrollHeight > 0
        ? Math.min(element.clientHeight / element.scrollHeight, 1)
        : 1;
    const nextPosition =
      maxScrollTop > 0 ? element.scrollTop / maxScrollTop : 0;

    setScrollState({
      length: nextLength,
      position: nextPosition,
      height: element.clientHeight,
    });
  }, []);

  const handleScrollBarPositionChange = useCallback((nextPosition) => {
    const element = viewportRef.current;

    if (!element) return;

    const maxScrollTop = Math.max(
      element.scrollHeight - element.clientHeight,
      0,
    );

    element.scrollTop = maxScrollTop * nextPosition;
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frameId = window.requestAnimationFrame(syncScrollState);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.cancelAnimationFrame(frameId);
    };
  }, [visible, repeatedItems, syncScrollState]);

  useEffect(() => {
    if (!visible) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  useEffect(() => {
    if (
      !visible ||
      !viewportRef.current ||
      typeof ResizeObserver === "undefined"
    ) {
      return undefined;
    }

    const observer = new ResizeObserver(syncScrollState);
    observer.observe(viewportRef.current);

    return () => {
      observer.disconnect();
    };
  }, [visible, syncScrollState]);

  return (
    <Modal
      visible={visible}
      mount="viewport"
      alignment="Centered"
      overlayVariant="blurred"
      transitionPreset="fade-scale"
      showDialog
      onClose={onClose}
      className="z-50"
    >
      <section
        className={clsx(
          "flex h-[656px] w-[956px] max-h-[calc(100dvh-48px)] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[var(--radius-3)] bg-[var(--color-neutral-100)]",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex h-[56px] w-full shrink-0 items-center justify-between px-[20px]">
          <h2 className="text-heading-8 text-[var(--color-text-300)]">
            {title}
          </h2>

          <Button
            theme="Primary"
            type="Ghost"
            size="S"
            showText={false}
            showLeftIcon
            showRightIcon={false}
            iconLeft={<CloseIcon className="size-3" />}
            aria-label="Cerrar galería de videos"
            onClick={onClose}
            className="size-9 shrink-0 text-[var(--color-text-200)]"
          />
        </header>

        <div className="relative min-h-0 w-full flex-1 overflow-hidden">
          <div
            ref={viewportRef}
            className="h-full overflow-y-auto pr-[16px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-[760px]:pr-0"
            onScroll={syncScrollState}
          >
            {repeatedItems.map((item, index) => (
              <VideoGalleryModalRow
                key={`${item.id}-${index}`}
                item={item}
                onWatchVideo={onWatchVideo}
              />
            ))}
          </div>

          <div className="pointer-events-auto absolute right-0 top-0 h-full max-[760px]:hidden">
            <ScrollBar
              length={scrollState.length}
              position={scrollState.position}
              height={scrollState.height}
              interactive
              onPositionChange={handleScrollBarPositionChange}
            />
          </div>
        </div>
      </section>
    </Modal>
  );
}
