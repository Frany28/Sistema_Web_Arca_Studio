import { useEffect, useState } from "react";
import clsx from "clsx";

import { orderCommentsByThread } from "../../utils/commentDisplay.js";
import { getVideoObservationTiming } from "../../utils/videoObservation.js";

import Avatar from "./Avatar/Avatar.jsx";
import Badge from "./Badge/Badge.jsx";
import Button from "./Button/Button.jsx";
import FileAttachmentIcons from "./FileAttachmentIcons/FileAttachmentIcons.jsx";
import Loader from "./Loader/Loader.jsx";
import SideOverlayDrawer from "./SideOverlayDrawer.jsx";
import TextArea from "./TextArea/TextArea.jsx";
import Tooltip from "./Tooltip/Tooltip.jsx";

const GENERAL_COMMENTS = [
  {
    id: "comment-1",
    name: "John Doe",
    timestamp: "Hace 2 horas",
    message: "¿Podemos ajustar la iluminación en esta área?",
    type: "comment",
  },
  {
    id: "reply-1",
    name: "John Doe",
    timestamp: "Hace 2 horas",
    message: "Sí, claro.",
    type: "reply",
  },
  {
    id: "comment-2",
    name: "John Doe",
    timestamp: "Hace 2 horas",
    message: "¿Podemos ajustar la iluminación en esta área?",
    type: "comment",
  },
  {
    id: "reply-2",
    name: "Arq. Armando",
    timestamp: "Hace 2 horas",
    message: "Sí, claro.",
    type: "reply",
  },
  {
    id: "reply-3",
    name: "Arq. Wilmer",
    timestamp: "Hace 2 horas",
    message: "Sí, claro.",
    type: "reply",
  },
];

const RECENT_ACTIVITY = [
  {
    id: "activity-1",
    name: "Arq. Armando",
    action: "subió un archivo",
    timestamp: "Hace 30 minutos",
    type: "file",
    fileType: "PDF",
    fileName: "Archivo.pdf",
    fileSize: "200KB",
  },
  {
    id: "activity-2",
    name: "Arq. Armando",
    action: "modificó el estado a",
    timestamp: "Hace 30 minutos",
    type: "status",
    status: "En proceso",
  },
  {
    id: "activity-3",
    name: "Arq. Wilmer",
    action: "subió un archivo",
    timestamp: "Hace 30 minutos",
    type: "file",
    fileType: "PDF",
    fileName: "Archivo.pdf",
    fileSize: "200KB",
  },
  {
    id: "activity-4",
    name: "Arq. Wilmer",
    action: "modificó el estado a",
    timestamp: "Hace 30 minutos",
    type: "status",
    status: "En proceso",
  },
];

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5"
      aria-hidden="true"
    >
      <path
        d="M4.16699 10H4.17533"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0003 10H10.0087"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8333 10H15.8416"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReplyArrowIcon() {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[16.5px] w-[16.5px]"
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

function SendIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-5"
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

function CommentCard({
  avatarSrc,
  commentType,
  fileType,
  id,
  image,
  imageComment = false,
  name,
  observationTypeLabel,
  onSelect,
  pointNumber,
  timestamp,
  message,
  selection,
  type = "comment",
  showReplyAction = false,
  onMoreClick,
  onReplyClick,
}) {
  const isReply = type === "reply";
  const displayName =
    name && typeof name === "object"
      ? (name.name ?? name.email ?? String(name))
      : name;
  const isViewer3dComment = commentType === "panorama";
  const displayPointNumber = isViewer3dComment
    ? Number(pointNumber) || null
    : null;

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

      <div className="flex flex-1 flex-col gap-[8px]">
        <article
          className={clsx(
            "relative flex min-w-0 flex-1 flex-col gap-[2px] rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-10)] p-[8px]",
            imageComment &&
              onSelect &&
              "cursor-pointer transition-colors hover:border-[var(--color-neutral-300)] focus-within:ring-2 focus-within:ring-[var(--color-primary-300)]",
          )}
          role={imageComment && onSelect ? "button" : undefined}
          tabIndex={imageComment && onSelect ? 0 : undefined}
          onClick={imageComment && onSelect ? onSelect : undefined}
          onKeyDown={
            imageComment && onSelect
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect();
                  }
                }
              : undefined
          }
        >
          <div className="flex w-full items-start pr-[28px]">
            <div className="flex min-w-0 items-center gap-[8px]">
              <Avatar
                size="S"
                content={avatarSrc ? "Image" : "Text"}
                theme="Brand 1"
                name={displayName}
                src={avatarSrc}
                alt={displayName}
                decorative={false}
              />
              <p className="text-[12px] font-normal leading-[14px] tracking-[-0.5px] text-[var(--color-text-300)]">
                {displayName}
              </p>
              <p className="text-[10px] font-normal leading-[12px] tracking-[-0.5px] text-[var(--color-text-100)]">
                {timestamp}
              </p>
            </div>

            <Tooltip
              asChild
              portal
              showTip
              text="Más opciones"
              tipPosition="Bottom right"
            >
              <button
                type="button"
                aria-label="Más opciones"
                aria-expanded={showReplyAction}
                aria-controls={`reply-action-${id}`}
                className="absolute right-[-1px] top-[-1px] flex cursor-pointer shrink-0 items-center justify-center rounded-[8px] p-[8px] text-[var(--color-text-200)] transition-colors duration-200 hover:bg-[var(--color-neutral-10)] hover:text-[var(--color-text-300)]"
                data-reply-interaction="true"
                onClick={(event) => {
                  event.stopPropagation();
                  onMoreClick?.();
                }}
              >
                <MoreIcon />
              </button>
            </Tooltip>
          </div>

          <p className="text-[14px] font-normal leading-[17px] tracking-[-0.5px] text-[var(--color-text-100)]">
            {message}
          </p>

          {imageComment && selection && !isReply ? (
            <ImageCommentPreview
              commentType={commentType}
              fileType={fileType}
              image={image}
              observationTypeLabel={observationTypeLabel}
              pointNumber={displayPointNumber}
              selection={selection}
            />
          ) : null}
        </article>

        {showReplyAction ? (
          <Tooltip
            asChild
            text="Presiona para responder"
            tipPosition="Top center"
            showTip
            portal
          >
            <button
              id={`reply-action-${id}`}
              type="button"
              onClick={onReplyClick}
              className="w-fit cursor-pointer"
              data-reply-interaction="true"
            >
              <ReplyButton />
            </button>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}

function ImageCommentPreview({
  commentType,
  fileType,
  image,
  observationTypeLabel,
  pointNumber,
  selection,
}) {
  const videoTiming = getVideoObservationTiming(selection);
  const pixels = selection.imagePixels ?? selection.displayPixels;
  const isViewer3dComment = commentType === "panorama";

  if (commentType === "document") {
    const reference = selection?.kind === "document-point"
      ? `Página ${selection.pageNumber}`
      : selection?.kind === "document-section-point"
        ? `Sección ${Number(selection.sectionIndex) + 1}`
        : selection?.kind === "document-cell-point"
          ? `Celda ${selection.cell}`
          : "Ubicación guardada";

    return (
      <div className="mt-[6px] flex items-center gap-[8px] rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[6px]">
        <div className="flex size-[44px] shrink-0 items-center justify-center">
          <FileAttachmentIcons type={fileType} className="scale-[0.8]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] leading-[14px] tracking-[-0.5px] text-[var(--color-text-300)]">
            {observationTypeLabel || "Observación sobre documento"}
          </p>
          <p className="truncate text-[10px] leading-[12px] tracking-[-0.5px] text-[var(--color-text-100)]">
            {reference}
          </p>
        </div>
      </div>
    );
  }

  if (videoTiming) {
    return (
      <div className="mt-[6px] flex items-center gap-[8px] rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[6px]">
        <div className="flex size-[44px] shrink-0 items-center justify-center rounded-[6px] bg-[var(--color-neutral-200)] text-[12px] font-semibold text-[var(--color-text-300)]">
          {videoTiming.videoTimeLabel}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] leading-[14px] tracking-[-0.5px] text-[var(--color-text-300)]">
            {observationTypeLabel || "Observación sobre video"}
          </p>
          <p className="truncate text-[10px] leading-[12px] tracking-[-0.5px] text-[var(--color-text-100)]">
            Momento {videoTiming.videoTimeLabel}
          </p>
        </div>
      </div>
    );
  }

  if (!pixels) {
    return null;
  }

  return (
    <div className="mt-[6px] flex items-center gap-[8px] rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-[6px]">
      <div className="relative size-[44px] shrink-0 overflow-hidden rounded-[6px] bg-[var(--color-neutral-200)]">
        {image?.src ? (
          <img
            src={image.src}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : null}
        {isViewer3dComment && Number(pointNumber) ? (
          <span className="absolute left-1/2 top-1/2 flex size-[24px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--color-neutral-100-uniform)] bg-[var(--color-accent-300)] text-[11px] font-semibold leading-none text-[var(--color-neutral-100-uniform)] shadow-[0_0_0_4px_rgba(255,68,49,0.22),0_2px_8px_rgba(0,0,0,0.28)]">
            {Number(pointNumber)}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] leading-[14px] tracking-[-0.5px] text-[var(--color-text-300)]">
          {observationTypeLabel ||
            (isViewer3dComment
              ? "Observación en modelo 3D"
              : "Observación sobre imagen")}
        </p>
        <p className="truncate text-[10px] leading-[12px] tracking-[-0.5px] text-[var(--color-text-100)]">
          x:{pixels.x}px y:{pixels.y}px w:{pixels.width}px h:{pixels.height}px
        </p>
      </div>
    </div>
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

function ReplyComposer({
  disabled = false,
  onSubmit,
  placeholder = "Escribe tu mensaje...",
}) {
  return (
    <div data-reply-interaction="true">
      <MessageInput
        disabled={disabled}
        placeholder={placeholder}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function MessageInput({
  disabled = false,
  multiline = false,
  onFocus,
  onSubmit,
  placeholder,
}) {
  const [textAreaValue, setTextAreaValue] = useState("");
  const trimmedValue = textAreaValue.trim();

  function handleSubmit() {
    if (!trimmedValue || disabled) {
      return;
    }

    onSubmit?.(trimmedValue);
    setTextAreaValue("");
  }

  return multiline ? (
    <div className="flex flex-col gap-[8px]">
      <TextArea
        label="Observación general"
        placeholder={placeholder}
        value={textAreaValue}
        disabled={disabled}
        showHint={false}
        showLabelInfo={false}
        minHeight={104}
        rows={4}
        className="!max-w-none"
        onFocus={onFocus}
        onChange={(event) => setTextAreaValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex justify-end">
        <Tooltip asChild portal showTip text="Enviar observación" tipPosition="Top right">
          <button
            type="button"
            aria-label="Enviar observación"
            disabled={!trimmedValue || disabled}
            className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] text-[var(--color-neutral-300)] transition-colors duration-200 hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-text-300)] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleSubmit}
          >
            <SendIcon />
          </button>
        </Tooltip>
      </div>
    </div>
  ) : (
    <div className="flex w-full items-start gap-[4px]">
      <ReplyArrowIcon />
      <div className="flex flex-1 flex-col gap-[8px]">
        <div className="flex w-full items-center rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-[12px] py-[8px]">
          <input
            type="text"
            placeholder={placeholder}
            value={textAreaValue}
            disabled={disabled}
            className="min-w-0 flex-1 border-0 bg-transparent text-[14px] font-normal leading-[17px] tracking-[-0.5px] text-[var(--color-text-300)] outline-none placeholder:text-[var(--color-text-100)]"
            onFocus={onFocus}
            onChange={(event) => setTextAreaValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Tooltip asChild portal showTip text="Enviar mensaje" tipPosition="Top right">
            <button
              type="button"
              aria-label="Enviar mensaje"
              disabled={!trimmedValue || disabled}
              className="flex cursor-pointer shrink-0 items-center justify-center text-[var(--color-neutral-300)] transition-colors duration-200 hover:text-[var(--color-text-300)] disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleSubmit}
            >
              <SendIcon />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  id,
  name,
  action,
  timestamp,
  type,
  status,
  fileType,
  fileName,
  fileSize,
  onSelect,
}) {
  const isInteractive = typeof onSelect === "function";
  const Container = isInteractive ? "button" : "div";
  const displayName =
    name && typeof name === "object"
      ? (name.name ?? name.email ?? String(name))
      : name;

  return (
    <Container
      type={isInteractive ? "button" : undefined}
      className={clsx(
        "flex w-full flex-col gap-[2px] text-left",
        isInteractive && "cursor-pointer rounded-[8px] focus:outline-none",
      )}
      onClick={isInteractive ? () => onSelect({ id, type }) : undefined}
    >
      <article className="flex w-full items-start gap-[8px] overflow-hidden rounded-[8px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-10)] p-[8px]">
        <Avatar size="M" style="Icon" theme="Brand 1" decorative />

        <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <p className="text-[14px] leading-[17px] tracking-[-0.5px]">
            <span className="font-medium text-[var(--color-text-300)]">
              {displayName}
            </span>{" "}
            <span className="font-normal text-[var(--color-text-200)]">
              {action}
            </span>
          </p>

          {type === "file" ? (
            <div className="flex items-center gap-[8px]">
              <FileAttachmentIcons
                type={fileType}
                size="compact"
                aria-label={`Archivo ${fileType}`}
              />
              <span className="text-[10px] font-normal leading-[12px] tracking-[-0.5px] text-[var(--color-text-200)]">
                {fileName}
              </span>
              <span className="text-[10px] font-normal leading-[12px] tracking-[-0.5px] text-[var(--color-text-100)]">
                {fileSize}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-[2px]">
              <Badge theme="Info" variation="Simple" size="S" label={status} />
            </div>
          )}
        </div>
      </article>

      <p className="w-full text-right text-[10px] font-normal leading-[12px] tracking-[-0.5px] text-[var(--color-text-100)]">
        {timestamp}
      </p>
    </Container>
  );
}

function NotificationsDrawer({
  open = false,
  onClose,
  className,
  comments = [],
  commentsError = "",
  commentsLoading = false,
  recentActivity = RECENT_ACTIVITY,
  recentActivityLoading = true,
  onActivitySelect,
  onCommentSelect,
  onSubmitComment,
  onSubmitEnvironmentComment,
  ...props
}) {
  const [visibleReplyAction, setVisibleReplyAction] = useState(null);
  const [activeReplyComposer, setActiveReplyComposer] = useState(null);
  const canSubmitComments = typeof onSubmitComment === "function";
  const canSubmitEnvironmentComments =
    typeof onSubmitEnvironmentComment === "function";
  const orderedComments = orderCommentsByThread(comments, {
    limitRootThreads: 3,
  });

  useEffect(() => {
    if (!open) {
      const resetTimeout = window.setTimeout(() => {
        setVisibleReplyAction(null);
        setActiveReplyComposer(null);
      }, 0);

      return () => {
        window.clearTimeout(resetTimeout);
      };
    }
  }, [open]);

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
    const projectId =
      parentComment && typeof parentComment === "object"
        ? parentComment.projectId
        : null;
    const parentCommentPayload =
      parentComment && typeof parentComment === "object"
        ? {
            commentType: parentComment.commentType,
            image: parentComment.image,
            selection: parentComment.selection,
            targetId: parentComment.targetId || parentComment.imageId,
          }
        : {};

    try {
      const submitComment = parentComment
        ? parentComment.scope === "environment"
          ? onSubmitEnvironmentComment
          : onSubmitComment
        : onSubmitEnvironmentComment || onSubmitComment;

      await submitComment?.({
        ...parentCommentPayload,
        message,
        parentCommentId,
        projectId,
      });
    } catch {
      // Error will be reflected via props `commentsError` from the caller;
      // prevent unhandled rejection from breaking the UI.
    } finally {
      if (parentCommentId) {
        setActiveReplyComposer(null);
      }
    }
  }

  return (
    <SideOverlayDrawer
      open={open}
      onClose={onClose}
      className={clsx("z-50", className)}
      panelClassName="flex flex-col bg-[var(--color-neutral-100)] p-[16px]"
      {...props}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-y-auto pr-[2px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <section className="flex w-[280px] max-w-full flex-col gap-[16px] border-b border-[var(--color-neutral-200)] pb-[24px]">
          {commentsLoading ? (
            <Loader
              preset="commentCard"
              count={3}
              label="Cargando observaciones"
            />
          ) : (
            <div className="content-reveal flex flex-col gap-[16px]">
              <MessageInput
                multiline
                disabled={
                  !canSubmitEnvironmentComments && !canSubmitComments
                }
                placeholder="Escribe algo..."
                onSubmit={(message) => handleCommentSubmit(message)}
              />

              {commentsError ? (
                <p className="text-[12px] leading-[14px] tracking-[-0.5px] text-[var(--color-danger-100)]">
                  {commentsError}
                </p>
              ) : null}

              <div className="flex flex-col gap-[8px]">
                {orderedComments.map((item) => (
                  <div key={item.id} className="flex flex-col gap-[8px]">
                    <CommentCard
                      {...item}
                      showReplyAction={visibleReplyAction === item.id}
                      onMoreClick={() => handleMoreClick(item.id)}
                      onSelect={
                        item.imageComment && onCommentSelect
                          ? () => onCommentSelect(item)
                          : undefined
                      }
                      onReplyClick={() => handleReplyClick(item.id)}
                    />

                    {activeReplyComposer === item.id ? (
                      <ReplyComposer
                        disabled={
                          item.scope === "environment"
                            ? !canSubmitEnvironmentComments
                            : !canSubmitComments
                        }
                        onSubmit={(message) =>
                          handleCommentSubmit(message, item)
                        }
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="flex w-[280px] max-w-full flex-col gap-[8px]">
          <h3 className="text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-300)]">
            Actividad Reciente
          </h3>

          <div className="flex flex-col gap-[8px]">
            {recentActivityLoading ? (
              <Loader
                preset="activityItem"
                count={3}
                label="Cargando actividad reciente"
              />
            ) : (
              <div className="content-reveal flex flex-col gap-[8px]">
                {recentActivity.map((item) => (
                  <ActivityItem
                    key={item.id}
                    {...item}
                    onSelect={
                      onActivitySelect ? () => onActivitySelect(item) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </SideOverlayDrawer>
  );
}

export default NotificationsDrawer;
