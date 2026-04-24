import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Button from "../../../components/ui/Button/Button.jsx";
import ScrollBar from "../../../components/ui/ScrollBar.jsx";
import { PROJECT_RENDER_GALLERY } from "../projectRenderGalleryData.js";
import { PROJECT_VIDEO_GALLERY } from "../projectVideoGalleryData.js";

const RENDER_LOADING_MS = 1600;

function RenderLoadingState({ image, progress }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-3)]">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 rounded-[var(--radius-3)] bg-[rgba(0,0,0,0.6)] backdrop-blur-[10px]" />

      <div className="absolute left-1/2 top-1/2 flex w-[280px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[4px]">
        <div className="flex w-full items-start justify-center">
          <p className="text-heading-8 text-[var(--color-neutral-100-uniform)]">
            Cargando modelo 3D
          </p>
        </div>

        <div className="relative h-[8px] w-full overflow-hidden rounded-full bg-[var(--color-neutral-200)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent-300)] transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RenderStage({ activeRender, isLoading, progress }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
      <div className="relative h-[398px] w-full overflow-hidden rounded-[var(--radius-3)] bg-[var(--color-neutral-200)]">
        {isLoading ? (
          <RenderLoadingState image={activeRender.image} progress={progress} />
        ) : (
          <img
            src={activeRender.image}
            alt={activeRender.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <h2 className="text-heading-4 text-[var(--color-text-300)]">
        {activeRender.title}
      </h2>
    </div>
  );
}

function RenderThumbnail({ item, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "group relative h-[124px] w-full cursor-pointer overflow-hidden rounded-[var(--radius-2)] text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-bg)]",
        selected
          ? "ring-1 ring-[var(--color-neutral-300)]"
          : "hover:opacity-90",
      )}
      aria-pressed={selected}
    >
      <img
        src={item.image}
        alt={item.title}
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.12)_35%,rgba(0,0,0,0.52)_100%)]" />
      <span className="absolute inset-x-[8px] bottom-[8px] text-heading-8 text-[var(--color-neutral-100-uniform)]">
        {item.title}
      </span>
    </button>
  );
}

function RenderThumbnailRail({ items, activeRenderId, onSelect }) {
  return (
    <aside className="flex h-[438px] w-[168px] shrink-0 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-col gap-[12px] pr-[4px]">
        {items.map((item) => (
          <RenderThumbnail
            key={item.id}
            item={item}
            selected={item.id === activeRenderId}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>
    </aside>
  );
}

function GalleryImageCard({ item, className }) {
  return (
    <article
      className={clsx(
        "group relative h-[212px] overflow-hidden rounded-[var(--radius-2)] text-left",
        className,
      )}
    >
      <img
        src={item.image}
        alt={item.title}
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.14)_40%,rgba(0,0,0,0.56)_100%)]" />
      <span className="absolute inset-x-[10px] bottom-[10px] text-heading-8 text-[var(--color-neutral-100-uniform)]">
        {item.title}
      </span>
    </article>
  );
}

function PlayIcon({ className }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M13.812 9.07404C13.6298 8.96602 13.4223 8.90815 13.2105 8.9063C12.9987 8.90445 12.7902 8.95869 12.6061 9.06351C12.4221 9.16833 12.269 9.32 12.1626 9.50311C12.0561 9.68621 12 9.89424 12 10.106V37.894C12 38.1058 12.0561 38.3139 12.1626 38.497C12.269 38.6801 12.4221 38.8317 12.6061 38.9366C12.7902 39.0414 12.9987 39.0956 13.2105 39.0938C13.4223 39.0919 13.6298 39.0341 13.812 38.926L37.258 25.032C37.4371 24.9258 37.5854 24.7748 37.6884 24.5938C37.7915 24.4129 37.8456 24.2083 37.8456 24C37.8456 23.7918 37.7915 23.5872 37.6884 23.4062C37.5854 23.2253 37.4371 23.0743 37.258 22.968L13.812 9.07404Z"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImageGallerySection({ items }) {
  const topRow = [items[1], items[2], items[4]].filter(Boolean);
  const bottomRow = [items[3], items[5], items[1]].filter(Boolean);

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <div className="flex w-full items-center justify-between">
        <span className="text-heading-8 text-[var(--color-text-200)]">
          Galeria de Imagenes
        </span>

        <Button
          theme="Primary"
          type="Outline"
          size="S"
          fitContent
          showLeftIcon={false}
          showRightIcon={false}
        >
          Ver mas
        </Button>
      </div>

      <div className="flex w-full flex-col gap-[16px] max-[1024px]:hidden">
        <div className="flex w-full items-center gap-[16px]">
          {topRow[0] ? (
            <GalleryImageCard item={topRow[0]} className="w-[204px] shrink-0" />
          ) : null}
          {topRow[1] ? (
            <GalleryImageCard item={topRow[1]} className="min-w-0 flex-1" />
          ) : null}
          {topRow[2] ? (
            <GalleryImageCard item={topRow[2]} className="min-w-0 flex-1" />
          ) : null}
        </div>

        <div className="flex w-full items-center gap-[16px]">
          {bottomRow[0] ? (
            <GalleryImageCard item={bottomRow[0]} className="min-w-0 flex-1" />
          ) : null}
          {bottomRow[1] ? (
            <GalleryImageCard item={bottomRow[1]} className="min-w-0 flex-1" />
          ) : null}
          {bottomRow[2] ? (
            <GalleryImageCard
              item={bottomRow[2]}
              className="w-[204px] shrink-0"
            />
          ) : null}
        </div>
      </div>

      <div className="hidden w-full grid-cols-2 gap-[16px] max-[1024px]:grid max-[640px]:grid-cols-1">
        {items.slice(1).map((item) => (
          <GalleryImageCard
            key={`gallery-mobile-${item.id}`}
            item={item}
            className="w-full"
          />
        ))}
      </div>
    </div>
  );
}

function VideoPreviewCard({ item }) {
  return (
    <div className="group relative h-[385px] overflow-hidden rounded-[var(--radius-2)] shadow-[var(--shadow-e2)]">
      <img
        src={item.image}
        alt={item.label}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.00)_0%,rgba(0,0,0,0.10)_44%,rgba(0,0,0,0.56)_100%)]" />

      <div className="absolute left-1/2 top-1/2 flex size-[48px] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[var(--color-neutral-100-uniform)]">
        <PlayIcon className="size-[48px]" />
      </div>

      <div className="absolute bottom-0 left-0 p-[10px]">
        <span className="text-heading-8 text-[var(--color-neutral-100-uniform)]">
          {item.label}
        </span>
      </div>
    </div>
  );
}

function VideoListItem({ item, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={clsx(
        "flex w-full cursor-pointer items-start gap-[12px] text-left transition-opacity duration-150",
        active ? "opacity-100" : "opacity-90 hover:opacity-100",
      )}
    >
      <div className="group relative h-[90px] w-[150px] shrink-0 overflow-hidden rounded-[var(--radius-1)] shadow-[var(--shadow-e2)]">
        <img
          src={item.image}
          alt={item.label}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.00)_0%,rgba(0,0,0,0.10)_44%,rgba(0,0,0,0.56)_100%)]" />
        <div className="absolute left-1/2 top-1/2 flex size-[20px] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[var(--color-neutral-100-uniform)]">
          <PlayIcon className="size-5" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <p className="truncate text-heading-8 text-[var(--color-text-300)]">
          {item.title}
        </p>
        <p className="text-body-3 text-[var(--color-text-100)]">
          {item.uploadedAt}
        </p>
        <p className="text-body-3 text-[var(--color-text-100)]">{item.size}</p>
      </div>
    </button>
  );
}

function VideoGallerySection({ items }) {
  const [activeVideoId, setActiveVideoId] = useState(items[0]?.id);
  const listViewportRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    length: 1,
    position: 0,
  });

  const activeVideo = useMemo(
    () => items.find((item) => item.id === activeVideoId) ?? items[0],
    [activeVideoId, items],
  );

  const syncScrollState = useCallback(() => {
    const element = listViewportRef.current;

    if (!element) {
      return;
    }

    const maxScrollTop = Math.max(element.scrollHeight - element.clientHeight, 0);
    const nextLength =
      element.scrollHeight > 0
        ? Math.min(element.clientHeight / element.scrollHeight, 1)
        : 1;
    const nextPosition =
      maxScrollTop > 0 ? element.scrollTop / maxScrollTop : 0;

    setScrollState({
      length: nextLength,
      position: nextPosition,
    });
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      syncScrollState();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [items, syncScrollState]);

  const handleScrollBarPositionChange = useCallback((nextPosition) => {
    const element = listViewportRef.current;

    if (!element) {
      return;
    }

    const maxScrollTop = Math.max(element.scrollHeight - element.clientHeight, 0);
    element.scrollTop = maxScrollTop * nextPosition;
  }, []);

  if (!activeVideo) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <div className="flex w-full items-center justify-between">
        <span className="text-heading-8 text-[var(--color-text-200)]">
          Galeria de Videos
        </span>

        <Button
          theme="Primary"
          type="Outline"
          size="S"
          fitContent
          showLeftIcon={false}
          showRightIcon={false}
        >
          Ver mas
        </Button>
      </div>

      <div className="flex h-[385px] w-full items-start gap-[16px] max-[1024px]:h-auto max-[1024px]:flex-col">
        <div className="w-[696px] max-w-full flex-1">
          <VideoPreviewCard item={activeVideo} />
        </div>

        <div className="flex h-full min-w-[0] flex-1 items-start max-[1024px]:w-full">
          <div
            ref={listViewportRef}
            className="flex h-full min-w-0 flex-1 flex-col gap-[16px] overflow-y-auto pr-[12px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-[1024px]:max-h-[385px]"
            onScroll={syncScrollState}
          >
            {items.map((item) => (
              <VideoListItem
                key={item.id}
                item={item}
                active={item.id === activeVideo.id}
                onSelect={setActiveVideoId}
              />
            ))}
          </div>

          <div className="flex shrink-0 self-stretch">
            <ScrollBar
              height={385}
              length={scrollState.length}
              position={scrollState.position}
              interactive
              onPositionChange={handleScrollBarPositionChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectRendersPanel() {
  const [activeRenderId, setActiveRenderId] = useState(
    PROJECT_RENDER_GALLERY[0]?.id,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(43);

  const activeRender = useMemo(
    () =>
      PROJECT_RENDER_GALLERY.find((item) => item.id === activeRenderId) ??
      PROJECT_RENDER_GALLERY[0],
    [activeRenderId],
  );

  useEffect(() => {
    setIsLoading(true);
    setProgress(43);

    const intervalId = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          return 100;
        }

        return Math.min(current + 19, 100);
      });
    }, 240);

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      setProgress(100);
      setIsLoading(false);
    }, RENDER_LOADING_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [activeRenderId]);

  if (!activeRender) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-[48px]">
      <div className="flex w-full items-start gap-[12px] max-[1024px]:flex-col">
        <RenderStage
          activeRender={activeRender}
          isLoading={isLoading}
          progress={progress}
        />
        <RenderThumbnailRail
          items={PROJECT_RENDER_GALLERY}
          activeRenderId={activeRenderId}
          onSelect={setActiveRenderId}
        />
      </div>

      <ImageGallerySection items={PROJECT_RENDER_GALLERY} />
      <VideoGallerySection items={PROJECT_VIDEO_GALLERY} />
    </section>
  );
}
