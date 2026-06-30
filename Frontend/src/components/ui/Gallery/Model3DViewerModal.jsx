import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import "@google/model-viewer";
import MainLogo from "../../../assets/logos/MainLogo.jsx";
import AvatarLabel from "../../ui/AvatarLabel/AvatarLabel.jsx";
import Button from "../../ui/Button/Button.jsx";
import { ButtonGroup } from "../../ui/ButtonGroupItem/ButtonGroupItem.jsx";
import TextArea from "../../ui/TextArea/TextArea.jsx";
import ImageHighlighter from "./ImageHighlighter.jsx";
import { useImageComments } from "./useImageComments.js";

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

function MoreIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4.167 10H4.176M10 10H10.009M15.833 10H15.842"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.92473 3.52462L15.0581 7.09129C18.2581 8.69129 18.2581 11.308 15.0581 12.908L7.92473 16.4746C3.12473 18.8746 1.1664 16.908 3.5664 12.1163L4.2914 10.6746C4.47473 10.308 4.47473 9.69962 4.2914 9.33296L3.5664 7.88296C1.1664 3.09129 3.13306 1.12462 7.92473 3.52462Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.53345 10H9.03345"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="white"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12.8804V11.1204C2 10.0804 2.85 9.22043 3.9 9.22043C5.71 9.22043 6.45 7.94042 5.54 6.37042C5.02 5.47042 5.33 4.30042 6.24 3.78042L7.97 2.79042C8.76 2.32042 9.78 2.60042 10.25 3.39042L10.36 3.58042C11.26 5.15042 12.74 5.15042 13.65 3.58042L13.76 3.39042C14.23 2.60042 15.25 2.32042 16.04 2.79042L17.77 3.78042C18.68 4.30042 18.99 5.47042 18.47 6.37042C17.56 7.94042 18.3 9.22043 20.11 9.22043C21.15 9.22043 22.01 10.0704 22.01 11.1204V12.8804C22.01 13.9204 21.16 14.7804 20.11 14.7804C18.3 14.7804 17.56 16.0604 18.47 17.6304C18.99 18.5404 18.68 19.7004 17.77 20.2204L16.04 21.2104C15.25 21.6804 14.23 21.4004 13.76 20.6104L13.65 20.4204C12.75 18.8504 11.27 18.8504 10.36 20.4204L10.25 20.6104C9.78 21.4004 8.76 21.6804 7.97 21.2104L6.24 20.2204C5.33 19.7004 5.02 18.5304 5.54 17.6304C6.45 16.0604 5.71 14.7804 3.9 14.7804C2.85 14.7804 2 13.9204 2 12.8804Z"
        stroke="white"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ViewIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 10C2 9.46957 2.21071 8.96086 2.58579 8.58579C2.96086 8.21071 3.46957 8 4 8H20C20.5304 8 21.0391 8.21071 21.4142 8.58579C21.7893 8.96086 22 9.46957 22 10V17C22 17.5304 21.7893 18.0391 21.4142 18.4142C21.0391 18.7893 20.5304 19 20 19H16.132C15.7866 19 15.4471 18.9106 15.1466 18.7404C14.8461 18.5702 14.5947 18.3252 14.417 18.029L12.857 15.429C12.7681 15.2811 12.6425 15.1588 12.4923 15.0739C12.3421 14.989 12.1725 14.9443 12 14.9443C11.8275 14.9443 11.6579 14.989 11.5077 15.0739C11.3575 15.1588 11.2319 15.2811 11.143 15.429L9.583 18.029C9.40531 18.3252 9.15395 18.5702 8.8534 18.7404C8.55286 18.9106 8.21337 19 7.868 19H4C3.46957 19 2.96086 18.7893 2.58579 18.4142C2.21071 18.0391 2 17.5304 2 17V10ZM3.813 6.781C4.17819 6.23329 4.67291 5.78418 5.25327 5.4735C5.83364 5.16282 6.48171 5.00018 7.14 5H16.858C17.5165 5.00001 18.1647 5.16257 18.7453 5.47326C19.3258 5.78395 19.8207 6.23315 20.186 6.781L21 8H3L3.813 6.781Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 9V3H15"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 15V21H9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 3L13.5 10.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 13.5L3 21"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Model3DViewerControls({
  className,
  onSettings,
  onView,
  onExpand,
  persistSelection = true,
  selectedIndex = null,
}) {
  const buttonGroupItems = useMemo(
    () => [
      {
        label: "Ajustes",
        showText: false,
        icon: <SettingsIcon />,
        disabled: !onSettings,
        "aria-label": "Ajustes del modelo 3D",
      },
      {
        label: "Vista",
        showText: false,
        icon: <ViewIcon />,
        disabled: !onView,
        "aria-label": "Cambiar vista del modelo 3D",
      },
      {
        label: "Expandir",
        showText: false,
        icon: <ExpandIcon />,
        disabled: !onExpand,
        "aria-label": "Expandir modelo 3D",
      },
    ],
    [onExpand, onSettings, onView],
  );

  return (
    <ButtonGroup
      items={buttonGroupItems}
      className={className}
      persistSelection={persistSelection}
      selectedIndex={selectedIndex}
      onChange={(index) => {
        if (index === 0) {
          onSettings?.();
        }

        if (index === 1) {
          onView?.();
        }

        if (index === 2) {
          onExpand?.();
        }
      }}
    />
  );
}

export function Model3DLoadingState({
  image,
  onRetry,
  progress,
  state = "loading",
}) {
  const isError = state === "error";
  const isSlow = state === "slow";
  const title = isError
    ? "No se pudo cargar el modelo 3D"
    : isSlow
      ? "El modelo sigue cargando"
      : "Cargando modelo 3D";
  const description = isError
    ? "Revisa la conexión o intenta cargar el visor nuevamente."
    : isSlow
      ? "El archivo puede ser pesado o tener muchas texturas."
      : "";

  return (
    <div className="pointer-events-auto absolute inset-0 z-10 h-full w-full overflow-hidden">
      {image ? (
        <img
          src={image}
          alt=""
          className="absolute inset-[-18px] h-[calc(100%+36px)] w-[calc(100%+36px)] object-cover blur-[14px] scale-105"
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,#3a3a3a_0%,#262626_44%,#121212_100%)]" />
      )}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.58)] backdrop-blur-[12px]" />

      <div className="absolute left-1/2 top-1/2 flex w-[320px] max-w-[calc(100%-48px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[8px] text-center">
        <div className="flex w-full items-start justify-center">
          <p className="text-heading-8 text-[var(--color-neutral-100-uniform)]">
            {title}
          </p>
        </div>

        {description ? (
          <p className="text-body-3 text-[rgba(255,255,255,0.78)]">
            {description}
          </p>
        ) : null}

        {!isError ? (
          <div className="relative h-[8px] w-full overflow-hidden rounded-full bg-[var(--color-neutral-200)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent-300)] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : (
          <button
            type="button"
            className="mt-[4px] h-[36px] cursor-pointer rounded-[var(--radius-2)] bg-[var(--color-neutral-100)] px-[14px] text-heading-8 text-[var(--color-text-300)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-300)]"
            onClick={onRetry}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

const GENERAL_COMMENTS = [
  {
    id: "comment-1",
    type: "comment",
    author: "John Doe",
    time: "Hace 2 horas",
    body: "¿Podemos ajustar la iluminación en esta área?",
  },
  {
    id: "reply-1",
    type: "reply",
    author: "Arq. Armando",
    time: "Hace 2 horas",
    body: "Sí, claro.",
  },
  {
    id: "comment-2",
    type: "comment",
    author: "John Doe",
    time: "Hace 2 horas",
    body: "¿Podemos ajustar la iluminación en esta área?",
  },
  {
    id: "reply-2",
    type: "reply",
    author: "Arq. Armando",
    time: "Hace 2 horas",
    body: "Sí, claro.",
  },
  {
    id: "reply-3",
    type: "reply",
    author: "Arq. Wilmer",
    time: "Hace 2 horas",
    body: "Sí, claro.",
  },
];

const MODAL_TRANSITION_MS = 320;
const MODAL_EASING = "ease-in-out";
const MODEL_SLOW_LOADING_MS = 15000;
const MODEL_LOAD_TIMEOUT_MS = 45000;

function getCommentTime(comment) {
  const time = new Date(comment.createdAt || 0).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function orderCommentsByThread(comments) {
  const repliesByParent = new Map();
  const rootComments = [];
  const rootIds = new Set();

  comments.forEach((comment) => {
    if (comment.parentCommentId) {
      const key = String(comment.parentCommentId);
      repliesByParent.set(key, [...(repliesByParent.get(key) ?? []), comment]);
      return;
    }

    rootIds.add(String(comment.id));
    rootComments.push(comment);
  });

  const orderedThreads = rootComments.flatMap((comment) => [
    comment,
    ...(repliesByParent.get(String(comment.id)) ?? []).sort(
      (left, right) => getCommentTime(left) - getCommentTime(right),
    ),
  ]);
  const orphanReplies = comments.filter(
    (comment) =>
      comment.parentCommentId && !rootIds.has(String(comment.parentCommentId)),
  );

  return [
    ...orderedThreads,
    ...orphanReplies.sort(
      (left, right) => getCommentTime(left) - getCommentTime(right),
    ),
  ];
}

function ReplyArrowIcon({ className }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("h-[16.5px] w-[16.5px] shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M6.75 13.5H4.5C3.25736 13.5 2.25 12.4926 2.25 11.25V4.5"
        stroke="var(--color-neutral-300)"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 11.25L9 13.5L6.75 15.75"
        stroke="var(--color-neutral-300)"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReplyButton() {
  return (
    <div className="flex items-center gap-[4px]">
      <ReplyArrowIcon />
      <Button
        theme="Primary"
        type="Ghost"
        size="S"
        fitContent
        showLeftIcon={false}
        showRightIcon={false}
        className="!h-auto !px-0 !py-0 text-[var(--color-text-300)] hover:!bg-transparent hover:opacity-75"
      >
        Responder
      </Button>
    </div>
  );
}

function CommentCard({
  id,
  author,
  time,
  body,
  image,
  message,
  name,
  selection,
  timestamp,
  type = "comment",
  selectionActive = false,
  showReplyAction = false,
  onMoreClick,
  onReplyClick,
  onSelectionClick,
}) {
  const isReply = type === "reply";
  const displayAuthor = name ?? author;
  const displayTime = time ?? timestamp;
  const displayBody = body ?? message;
  const resolveString = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    if (typeof value === "object") {
      return value.name ?? value.email ?? JSON.stringify(value);
    }
    return String(value);
  };

  const safeDisplayAuthor = resolveString(displayAuthor);
  const safeDisplayTime = resolveString(displayTime);
  const safeDisplayBody = resolveString(displayBody);

  return (
    <div
      className={clsx(
        "flex w-full items-start",
        isReply ? "gap-[4px]" : "gap-0",
      )}
    >
      {isReply ? (
        <span className="mt-0 inline-flex size-[16.5px] shrink-0 items-start justify-center">
          <ReplyArrowIcon />
        </span>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <article className="relative flex min-w-0 flex-1 flex-col gap-[2px] rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-10)] p-[8px]">
          <div className="flex w-full items-start pr-[28px]">
            <div className="flex min-w-0 items-center gap-[8px]">
              <AvatarLabel
                size="S"
                label={safeDisplayAuthor}
                showSubtitle={false}
                avatarTheme="Neutral"
                avatarContent="Icon"
                avatarDecorative
              />
              <span className="shrink-0 text-[10px] leading-[12px] tracking-[-0.5px] text-[var(--color-text-100)]">
                {safeDisplayTime}
              </span>
            </div>

            <button
              type="button"
              aria-label={`Mostrar acciones de ${displayAuthor}`}
              aria-expanded={showReplyAction}
              aria-controls={`image-reply-action-${id}`}
              className="absolute right-[-1px] top-[-1px] flex cursor-pointer shrink-0 items-center justify-center rounded-[var(--radius-2)] p-[8px] text-[var(--color-text-200)] transition-colors hover:bg-[var(--color-neutral-10)] hover:text-[var(--color-text-300)]"
              data-reply-interaction="true"
              onClick={onMoreClick}
            >
              <MoreIcon className="size-5" />
            </button>
          </div>

          <p className="text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-100)]">
            {displayBody}
          </p>

          {selection && !isReply ? (
            <SelectionPreview
              active={selectionActive}
              image={image}
              selection={selection}
              compact
              onSelect={onSelectionClick}
            />
          ) : null}
        </article>

        {showReplyAction ? (
          <button
            id={`image-reply-action-${id}`}
            type="button"
            className="w-fit cursor-pointer"
            data-reply-interaction="true"
            onClick={onReplyClick}
          >
            <ReplyButton />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SelectionPreview({
  active = false,
  compact = false,
  image,
  onClear,
  onSelect,
  selection,
}) {
  if (!selection) {
    return null;
  }

  const pixels = selection.imagePixels ?? selection.displayPixels;
  const naturalSize = selection.naturalSize ?? {
    height: pixels?.height || 1,
    width: pixels?.width || 1,
  };
  const imageSrc = image?.src ?? selection.imageSrc;
  const safeWidth = Math.max(pixels?.width || 1, 1);
  const safeHeight = Math.max(pixels?.height || 1, 1);
  const bgSize = imageSrc
    ? `${(naturalSize.width / safeWidth) * 100}% ${(naturalSize.height / safeHeight) * 100}%`
    : undefined;
  const bgPosition = imageSrc
    ? `${naturalSize.width === safeWidth ? 0 : (pixels.x / (naturalSize.width - safeWidth)) * 100}% ${
        naturalSize.height === safeHeight
          ? 0
          : (pixels.y / (naturalSize.height - safeHeight)) * 100
      }%`
    : undefined;

  const Container = onSelect ? "button" : "div";

  return (
    <Container
      type={onSelect ? "button" : undefined}
      className={clsx(
        "flex w-full items-center gap-[8px] rounded-[var(--radius-2)] border bg-[var(--color-neutral-100)] p-[6px] text-left transition-colors",
        active
          ? "border-[var(--color-accent-300)]"
          : "border-[var(--color-neutral-200)]",
        onSelect &&
          "cursor-pointer hover:border-[var(--color-neutral-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-300)]",
      )}
      onClick={onSelect}
    >
      <div
        className={clsx(
          "shrink-0 overflow-hidden rounded-[6px] bg-[var(--color-neutral-200)]",
          compact ? "size-[44px]" : "size-[56px]",
        )}
        style={
          imageSrc
            ? {
                backgroundImage: `url(${imageSrc})`,
                backgroundPosition: bgPosition,
                backgroundRepeat: "no-repeat",
                backgroundSize: bgSize,
              }
            : undefined
        }
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] leading-[14px] tracking-[-0.5px] text-[var(--color-text-300)]">
          Area seleccionada
        </p>
        <p className="truncate text-[10px] leading-[12px] tracking-[-0.5px] text-[var(--color-text-100)]">
          x:{pixels?.x ?? 0}px y:{pixels?.y ?? 0}px w:{pixels?.width ?? 0}px h:
          {pixels?.height ?? 0}px
        </p>
      </div>
      {onClear ? (
        <button
          type="button"
          className="shrink-0 cursor-pointer rounded-[6px] px-[6px] py-[4px] text-[10px] leading-[12px] text-[var(--color-text-200)] hover:bg-[var(--color-neutral-200)]"
          onClick={onClear}
        >
          Quitar
        </button>
      ) : null}
    </Container>
  );
}

function MessageInput({
  onClearSelection,
  onSubmit,
  pendingSelection,
  placeholder,
  multiline = false,
}) {
  const [textAreaValue, setTextAreaValue] = useState("");
  const trimmedValue = textAreaValue.trim();

  function handleSubmit() {
    if (!trimmedValue) {
      return;
    }

    onSubmit?.(trimmedValue);
    setTextAreaValue("");
  }

  return multiline ? (
    <div className="flex flex-col gap-[8px]">
      {pendingSelection ? (
        <SelectionPreview
          image={pendingSelection.image}
          selection={pendingSelection}
          onClear={onClearSelection}
        />
      ) : null}
      <TextArea
        label="Comentarios Generales"
        placeholder={placeholder}
        value={textAreaValue}
        showHint={false}
        showLabelInfo={false}
        minHeight={104}
        rows={4}
        className="!max-w-none"
        onChange={(event) => setTextAreaValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex justify-end">
        <button
          type="button"
          aria-label="Enviar comentario"
          disabled={!trimmedValue}
          className="flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-2)] text-[var(--color-neutral-300)] transition-colors hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-text-300)] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={handleSubmit}
        >
          <SendIcon className="size-5" />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex w-full items-start gap-[4px]">
      <ReplyArrowIcon />

      <div className="flex min-w-0 flex-1 items-center rounded-[var(--radius-2)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-[12px] py-[8px]">
        <input
          type="text"
          placeholder={placeholder}
          value={textAreaValue}
          className="min-w-0 flex-1 border-0 bg-transparent text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-300)] outline-none placeholder:text-[var(--color-text-100)]"
          onChange={(event) => setTextAreaValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />

        <button
          type="button"
          aria-label="Enviar mensaje"
          disabled={!trimmedValue}
          className="flex size-5 cursor-pointer shrink-0 items-center justify-center text-[var(--color-neutral-300)] hover:text-[var(--color-text-300)] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={handleSubmit}
        >
          <SendIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}

function ReplyComposer({ onSubmit, placeholder = "Escribe tu mensaje..." }) {
  return (
    <div data-reply-interaction="true">
      <MessageInput placeholder={placeholder} onSubmit={onSubmit} />
    </div>
  );
}

export function GeneralCommentsDrawer({
  comments = [],
  focusedSelectionCommentId = null,
  onClearSelection,
  onSelectionPreviewClick,
  onSubmitComment,
  pendingSelection,
}) {
  const [visibleReplyAction, setVisibleReplyAction] = useState(null);
  const [activeReplyComposer, setActiveReplyComposer] = useState(null);
  const orderedComments = orderCommentsByThread(comments);

  useEffect(() => {
    if (!visibleReplyAction && !activeReplyComposer) {
      return undefined;
    }

    function handlePointerDown(event) {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest("[data-reply-interaction='true']")
      ) {
        return;
      }

      setVisibleReplyAction(null);
      setActiveReplyComposer(null);
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [visibleReplyAction, activeReplyComposer]);

  function handleMoreClick(commentId) {
    setActiveReplyComposer(null);
    setVisibleReplyAction((currentId) =>
      currentId === commentId ? null : commentId,
    );
  }

  function handleReplyClick(commentId) {
    setVisibleReplyAction(null);
    setActiveReplyComposer(commentId);
  }

  async function handleCommentSubmit(message, parentComment = null) {
    const parentCommentId =
      parentComment && typeof parentComment === "object"
        ? parentComment.parentCommentId || parentComment.id
        : parentComment;

    try {
      await onSubmitComment?.({
        message,
        parentCommentId,
        selection: parentCommentId ? null : pendingSelection,
      });

      if (parentCommentId) {
        setActiveReplyComposer(null);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Comment submit failed:", error);
    }
  }

  return (
    <aside className="flex h-full w-full shrink-0 flex-col rounded-[var(--radius-3)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[16px]">
      <div className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto pr-[2px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <MessageInput
          multiline
          pendingSelection={pendingSelection}
          placeholder="Escribe algo..."
          onClearSelection={onClearSelection}
          onSubmit={(message) => handleCommentSubmit(message)}
        />

        <div className="flex flex-col gap-[8px]">
          {orderedComments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-[8px]">
              <CommentCard
                {...comment}
                selectionActive={
                  String(focusedSelectionCommentId) === String(comment.id)
                }
                showReplyAction={visibleReplyAction === comment.id}
                onMoreClick={() => handleMoreClick(comment.id)}
                onReplyClick={() => handleReplyClick(comment.id)}
                onSelectionClick={
                  comment.selection
                    ? () => onSelectionPreviewClick?.(comment.id)
                    : undefined
                }
              />

              {activeReplyComposer === comment.id ? (
                <ReplyComposer
                  onSubmit={(message) =>
                    handleCommentSubmit(message, comment)
                  }
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function Model3DViewerModal({
  visible = false,
  item,
  projectId,
  onClose,
}) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isActive, setIsActive] = useState(false);
  const [displayItem, setDisplayItem] = useState(item);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadState, setModelLoadState] = useState("loading");
  const [modelProgress, setModelProgress] = useState(8);
  const [modelReloadKey, setModelReloadKey] = useState(0);
  const [isAutoRotateEnabled, setIsAutoRotateEnabled] = useState(true);
  const closeTimeoutRef = useRef(null);
  const frameRef = useRef(null);
  const modelStageRef = useRef(null);
  const modelViewerRef = useRef(null);
  const slowLoadingTimeoutRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const { addComment, comments } = useImageComments(displayItem, {
    commentType: "viewer3d",
    projectId,
  });
  const [pendingSelection, setPendingSelection] = useState(null);
  const [focusedSelectionCommentId, setFocusedSelectionCommentId] =
    useState(null);

  const clearModelLoadingTimers = useCallback(() => {
    window.clearTimeout(slowLoadingTimeoutRef.current);
    window.clearTimeout(loadTimeoutRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;

    window.clearTimeout(closeTimeoutRef.current);
    window.cancelAnimationFrame(frameRef.current);

    if (visible && item) {
      queueMicrotask(() => {
        if (cancelled) {
          return;
        }

        setDisplayItem(item);
        setIsActive(false);
        setModelReloadKey(0);
        setIsAutoRotateEnabled(true);
        setFocusedSelectionCommentId(null);
        setShouldRender(true);
        frameRef.current = window.requestAnimationFrame(() => {
          frameRef.current = window.requestAnimationFrame(() => {
            setIsActive(true);
          });
        });
      });

      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setIsActive(false);
      closeTimeoutRef.current = window.setTimeout(() => {
        setShouldRender(false);
      }, MODAL_TRANSITION_MS);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(closeTimeoutRef.current);
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [visible, item]);

  useEffect(
    () => () => {
      window.clearTimeout(closeTimeoutRef.current);
      window.cancelAnimationFrame(frameRef.current);
      clearModelLoadingTimers();
    },
    [clearModelLoadingTimers],
  );

  const modelSrc = displayItem?.modelUrl || displayItem?.fileUrl || null;
  const hasInteractiveModel = Boolean(modelSrc);
  const hasPreviewImage = Boolean(displayItem?.image);

  useEffect(() => {
    if (modelViewerRef.current) {
      modelViewerRef.current.autoRotate = isAutoRotateEnabled;
    }
  }, [isAutoRotateEnabled, modelReloadKey]);

  useEffect(() => {
    if (!visible || !hasInteractiveModel) {
      setIsModelLoading(false);
      clearModelLoadingTimers();
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsModelLoading(true);
      setModelLoadState("loading");
      setModelProgress(8);
    });

    slowLoadingTimeoutRef.current = window.setTimeout(() => {
      setModelLoadState((current) =>
        current === "loading" ? "slow" : current,
      );
    }, MODEL_SLOW_LOADING_MS);

    loadTimeoutRef.current = window.setTimeout(() => {
      setIsModelLoading(true);
      setModelLoadState((current) =>
        current === "loading" || current === "slow" ? "error" : current,
      );
    }, MODEL_LOAD_TIMEOUT_MS);

    const intervalId = window.setInterval(() => {
      setModelProgress((current) => {
        if (current >= 92) {
          return current;
        }

        return Math.min(current + 8, 92);
      });
    }, 360);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearInterval(intervalId);
      clearModelLoadingTimers();
    };
  }, [
    clearModelLoadingTimers,
    displayItem?.id,
    hasInteractiveModel,
    modelReloadKey,
    modelSrc,
    visible,
  ]);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;

    if (!modelViewer || !hasInteractiveModel) {
      return undefined;
    }

    function handleLoad() {
      clearModelLoadingTimers();
      setModelProgress(100);
      setModelLoadState("loaded");
      setIsModelLoading(false);
    }

    function handleError() {
      clearModelLoadingTimers();
      setModelProgress(100);
      setModelLoadState("error");
      setIsModelLoading(true);
    }

    function handleProgress(event) {
      const totalProgress = Number(event.detail?.totalProgress);

      if (Number.isFinite(totalProgress)) {
        setModelLoadState((current) =>
          current === "error" ? current : "loading",
        );
        setModelProgress((current) =>
          Math.max(current, Math.min(Math.round(totalProgress * 100), 98)),
        );
      }
    }

    if (modelViewer.loaded) {
      handleLoad();
    }

    modelViewer.addEventListener("load", handleLoad);
    modelViewer.addEventListener("error", handleError);
    modelViewer.addEventListener("progress", handleProgress);
    const loadedCheckIntervalId = window.setInterval(() => {
      if (modelViewer.loaded) {
        handleLoad();
      }
    }, 250);

    return () => {
      window.clearInterval(loadedCheckIntervalId);
      modelViewer.removeEventListener("load", handleLoad);
      modelViewer.removeEventListener("error", handleError);
      modelViewer.removeEventListener("progress", handleProgress);
    };
  }, [
    clearModelLoadingTimers,
    hasInteractiveModel,
    modelReloadKey,
    modelSrc,
  ]);

  function handleModelRetry() {
    clearModelLoadingTimers();
    setIsModelLoading(true);
    setModelLoadState("loading");
    setModelProgress(8);
    setModelReloadKey((current) => current + 1);
  }

  function handleToggleAutoRotate() {
    if (!hasInteractiveModel) {
      return;
    }

    setIsAutoRotateEnabled((current) => !current);
  }

  function handleResetCameraView() {
    const modelViewer = modelViewerRef.current;

    if (!modelViewer || !hasInteractiveModel) {
      return;
    }

    modelViewer.cameraOrbit = "135deg 68deg 120%";
    modelViewer.fieldOfView = "32deg";
    modelViewer.jumpCameraToGoal?.();
  }

  async function handleToggleFullscreen() {
    const stage = modelStageRef.current;

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
      // Ignore fullscreen denials; browser may block them outside trusted gestures.
    }
  }

  if (!shouldRender || !displayItem || typeof document === "undefined") {
    return null;
  }

  const transitionStyle = {
    transitionDuration: `${MODAL_TRANSITION_MS}ms`,
    transitionTimingFunction: MODAL_EASING,
  };

  function handleSelectionChange(selection) {
    setFocusedSelectionCommentId(null);
    setPendingSelection({
      ...selection,
      image: {
        id: displayItem.id,
        src: displayItem.image,
        title: displayItem.title,
      },
      imageSrc: displayItem.image,
    });
  }

  async function handleSubmitComment({ message, parentCommentId, selection }) {
    const comment = await addComment({ message, parentCommentId, selection });
    if (comment && !parentCommentId) {
      setPendingSelection(null);
    }
  }

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-[60] overflow-hidden bg-[#777777] transition-opacity",
        isActive ? "opacity-100" : "opacity-0",
      )}
      style={transitionStyle}
    >
      <section
        className={clsx(
          "flex h-dvh w-dvw gap-[16px] p-[8px] transition-[opacity,transform] transform-gpu will-change-transform will-change-opacity max-[920px]:flex-col max-[920px]:overflow-y-auto",
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
          ref={modelStageRef}
          className={clsx(
            "relative min-w-0 flex-1 overflow-hidden",
            "rounded-[var(--radius-3)] bg-[var(--color-neutral-200)]",
            "h-[calc(100dvh-16px)]",
            "max-[920px]:h-[62dvh] max-[920px]:min-h-[360px] max-[920px]:flex-none",
            "max-[520px]:h-[58dvh] max-[520px]:min-h-[300px]",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {hasInteractiveModel ? (
            <>
              <model-viewer
                key={`${modelSrc}-${modelReloadKey}`}
                ref={modelViewerRef}
                src={modelSrc}
                poster={displayItem.image || undefined}
                alt={displayItem.title}
                camera-controls
                auto-rotate
                auto-rotate-delay="0"
                camera-orbit="135deg 68deg 120%"
                min-camera-orbit="auto 4deg 18%"
                max-camera-orbit="auto 88deg 620%"
                field-of-view="32deg"
                min-field-of-view="8deg"
                max-field-of-view="70deg"
                environment-image="neutral"
                shadow-intensity="0.9"
                shadow-softness="0.65"
                exposure="1"
                tone-mapping="aces"
                interpolation-decay="120"
                interaction-prompt="auto"
                loading="eager"
                reveal="auto"
                touch-action="pan-y"
                style={{
                  background:
                    "radial-gradient(circle at 50% 42%, #f1f1ee 0%, #d8d6d0 38%, #8e918c 100%)",
                  backgroundColor: "#d8d6d0",
                  display: "block",
                  height: "100%",
                  inset: 0,
                  position: "absolute",
                  "--poster-color": "transparent",
                  width: "100%",
                }}
              />
              {isModelLoading ? (
                <Model3DLoadingState
                  image={displayItem.image}
                  onRetry={handleModelRetry}
                  progress={modelProgress}
                  state={modelLoadState}
                />
              ) : null}
            </>
          ) : hasPreviewImage ? (
            <ImageHighlighter
              annotations={comments.filter((comment) => comment.selection)}
              focusedAnnotationId={focusedSelectionCommentId}
              imageSrc={displayItem.image}
              onSelectionChange={handleSelectionChange}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-[16px] bg-[var(--color-neutral-200)] px-[24px] text-center">
              <div className="flex max-w-[420px] flex-col gap-[6px]">
                <h3 className="text-heading-4 text-[var(--color-text-300)]">
                  {displayItem.title}
                </h3>
                <p className="text-body-3 text-[var(--color-text-100)]">
                  Archivo de modelo 3D cargado desde S3.
                </p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[156px] bg-[linear-gradient(0deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0)_100%)]" />

          <div className="absolute left-[12px] top-[12px] z-20">
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
            aria-label="Cerrar modelo 3D"
            onClick={onClose}
            className="absolute right-[8px] top-[8px] z-20 size-9 text-[var(--color-text-200)]"
          />

          {hasInteractiveModel || hasPreviewImage ? (
            <Model3DViewerControls
              onExpand={handleToggleFullscreen}
              onSettings={hasInteractiveModel ? handleToggleAutoRotate : null}
              onView={hasInteractiveModel ? handleResetCameraView : null}
              selectedIndex={2}
              className="absolute bottom-[12px] right-[12px] z-20 [&_button]:h-[40px] [&_button]:min-w-[52px] [&_button]:px-[12px]"
            />
          ) : null}
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
            focusedSelectionCommentId={focusedSelectionCommentId}
            pendingSelection={pendingSelection}
            onClearSelection={() => setPendingSelection(null)}
            onSelectionPreviewClick={(commentId) =>
              setFocusedSelectionCommentId((currentId) =>
                String(currentId) === String(commentId) ? null : commentId,
              )
            }
            onSubmitComment={handleSubmitComment}
          />
        </div>
      </section>
    </div>,
    document.body,
  );
}
