import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import * as IconsaxIcons from "iconsax-react";
import Button from "../Button/Button.jsx";
import FileAttachmentIcons from "../FileAttachmentIcons.jsx";
import ScrollBar from "../ScrollBar.jsx";
import {
  FILE_UPLOAD_SECTION_DEFAULT_FILES,
  FILE_UPLOAD_SECTION_DEFAULT_PROPS,
} from "./fileUploadSectionConfig.js";

const FILE_LIST_VIEWPORT_HEIGHT = 456;

function CloudUploadIcon() {
  const CloudPlus = IconsaxIcons.CloudPlus;

  if (!CloudPlus) {
    return null;
  }

  return (
    <CloudPlus
      size="20"
      variant="Linear"
      color="currentColor"
      className="size-5"
    />
  );
}

function TrashIcon() {
  const Trash = IconsaxIcons.Trash;

  if (!Trash) {
    return null;
  }

  return (
    <Trash
      size="20"
      variant="Linear"
      color="currentColor"
      className="size-5"
    />
  );
}

function FileUploadProgress({ progress, showValue = true }) {
  const resolvedProgress = Math.min(Math.max(progress ?? 0, 0), 100);

  return (
    <div className="flex w-full items-center gap-[8px]">
      <div className="relative h-[8px] min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-200)] dark:bg-[var(--color-text-100)]">
        <div
          className="h-full rounded-full bg-[var(--color-text-300)]"
          style={{ width: `${resolvedProgress}%` }}
        />
      </div>

      {showValue ? (
        <span className="shrink-0 text-[14px] leading-[17px] font-medium tracking-[-0.5px] text-[var(--color-text-100)] dark:text-[var(--color-text-100)]">
          {`${Math.round(resolvedProgress)}%`}
        </span>
      ) : null}
    </div>
  );
}

function FileUploadCard({ file }) {
  const isCompleted = file.status === "completed";
  const isUploading = file.status === "uploading";
  const isFailed = file.status === "failed";

  return (
    <div
      className={clsx(
        "flex w-full items-start gap-[12px] rounded-[12px] border bg-[var(--color-neutral-100)] p-[16px] transition-colors duration-200",
        isFailed
          ? "border-[var(--color-danger-100)]"
          : "border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-300)]",
      )}
    >
      <FileAttachmentIcons type={file.type} />

      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <div className="flex w-full flex-col items-start leading-none tracking-[-0.5px]">
          <span className="w-full text-[14px] leading-[17px] font-medium text-[var(--color-text-300)]">
            {file.name}
          </span>

          {isFailed ? (
            <div className="flex w-full items-center gap-[4px] text-[14px] leading-[17px] font-normal text-[var(--color-text-100)]">
              <span className="truncate">{file.errorMessage}</span>
              <span aria-hidden="true">&bull;</span>
              <span className="shrink-0 text-[12px] leading-[14px] text-[var(--color-danger-100)]">
                Fallido
              </span>
            </div>
          ) : (
            <div className="flex w-full items-center gap-[4px] text-[14px] leading-[17px] font-normal text-[var(--color-text-100)]">
              <span className="shrink-0">
                {`${file.currentSizeLabel} de ${file.totalSizeLabel}`}
              </span>
              <span aria-hidden="true">&bull;</span>
              <span
                className={clsx(
                  "truncate text-[12px] leading-[14px]",
                  isCompleted
                    ? "text-[var(--color-success-200)]"
                    : "text-[var(--color-text-300)]",
                )}
              >
                {isCompleted ? "Completado" : "Subiendo..."}
              </span>
            </div>
          )}
        </div>

        {isFailed ? (
          <Button
            theme="Danger"
            type="Outline"
            size="S"
            fitContent
            showLeftIcon={false}
            showRightIcon={false}
          >
            Intenta de nuevo
          </Button>
        ) : (
          <FileUploadProgress
            progress={file.progress}
            showValue={isCompleted}
          />
        )}
      </div>

      {isUploading ? (
        <Button
          theme="Primary"
          type="Ghost"
          size="S"
          showText={false}
          showLeftIcon
          showRightIcon={false}
          iconLeft={<TrashIcon />}
          className="shrink-0"
          aria-label="Eliminar archivo"
        />
      ) : null}
    </div>
  );
}

function FileUploadSection({
  className,
  title = FILE_UPLOAD_SECTION_DEFAULT_PROPS.title,
  chooseFileLabel = FILE_UPLOAD_SECTION_DEFAULT_PROPS.chooseFileLabel,
  separatorLabel = FILE_UPLOAD_SECTION_DEFAULT_PROPS.separatorLabel,
  dropLabel = FILE_UPLOAD_SECTION_DEFAULT_PROPS.dropLabel,
  formatsLabel = FILE_UPLOAD_SECTION_DEFAULT_PROPS.formatsLabel,
  files = FILE_UPLOAD_SECTION_DEFAULT_PROPS.files,
  "aria-label": ariaLabel = FILE_UPLOAD_SECTION_DEFAULT_PROPS["aria-label"],
  ...props
}) {
  const filesViewportRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    length: 1,
    position: 0,
  });
  const resolvedFiles =
    Array.isArray(files) && files.length > 0
      ? files
      : FILE_UPLOAD_SECTION_DEFAULT_FILES;

  const syncScrollState = useCallback(() => {
    const element = filesViewportRef.current;

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
    if (typeof window === "undefined") {
      return undefined;
    }

    const element = filesViewportRef.current;
    const frameId = window.requestAnimationFrame(() => {
      syncScrollState();
    });
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            syncScrollState();
          })
        : null;

    if (element && resizeObserver) {
      resizeObserver.observe(element);
    }

    window.addEventListener("resize", syncScrollState);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncScrollState);
    };
  }, [resolvedFiles, syncScrollState]);

  const handleScrollBarPositionChange = useCallback((nextPosition) => {
    const element = filesViewportRef.current;

    if (!element) {
      return;
    }

    const maxScrollTop = Math.max(element.scrollHeight - element.clientHeight, 0);
    element.scrollTop = maxScrollTop * nextPosition;
  }, []);

  return (
    <section
      className={clsx(
        "flex w-[512px] max-w-full items-stretch justify-center",
        className,
      )}
      aria-label={ariaLabel}
      data-node-id="2061:23962"
      {...props}
    >
      <div
        ref={filesViewportRef}
        className="flex h-[456px] min-w-0 flex-1 flex-col gap-[16px] overflow-y-auto pr-[12px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onScroll={syncScrollState}
      >
        <div className="flex w-full flex-col items-center gap-[12px] rounded-[12px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-[24px] py-[32px] dark:border-[var(--color-neutral-300)]">
          <div className="rounded-[8px] border border-[var(--color-neutral-200)] shadow-[0px_0px_5px_0px_rgba(0,0,0,0.05)] dark:border-[var(--color-neutral-300)]">
            <div className="flex size-[40px] items-center justify-center rounded-[8px] bg-[var(--color-neutral-100)] p-[8px] text-[var(--color-text-300)]">
              <CloudUploadIcon />
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-[8px]">
            <div className="flex w-full flex-wrap items-center justify-center gap-[8px] text-center">
              <Button
                theme="Primary"
                type="Link"
                size="S"
                fitContent
                showLeftIcon={false}
                showRightIcon={false}
              >
                {chooseFileLabel}
              </Button>
              <span className="text-[14px] leading-[17px] font-normal tracking-[-0.5px] text-[var(--color-text-100)]">
                {separatorLabel}
              </span>
              <span className="text-[14px] leading-[17px] font-normal tracking-[-0.5px] text-[var(--color-text-100)]">
                {dropLabel}
              </span>
            </div>

            <p className="w-full text-center text-[14px] leading-[17px] font-normal tracking-[-0.5px] text-[var(--color-text-100)]">
              {formatsLabel}
            </p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-[12px]">
          {resolvedFiles.map((file) => (
            <FileUploadCard key={file.id} file={file} />
          ))}
        </div>
      </div>

      <div className="flex self-stretch items-start">
        <ScrollBar
          height={FILE_LIST_VIEWPORT_HEIGHT}
          length={scrollState.length}
          position={scrollState.position}
          interactive
          onPositionChange={handleScrollBarPositionChange}
        />
      </div>

      <span className="sr-only">{title}</span>
    </section>
  );
}

export default FileUploadSection;
