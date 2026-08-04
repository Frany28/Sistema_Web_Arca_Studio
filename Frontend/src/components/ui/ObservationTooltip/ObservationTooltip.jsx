import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

import Avatar from "../Avatar/Avatar.jsx";
import {
  formatObservationReplyCount,
  getObservationAuthorInitials,
} from "./observationTooltip.js";

export default function ObservationTooltip({
  authorName,
  avatarSrc = "",
  className,
  message,
  onOpenChange,
  onReply,
  open = true,
  position,
  replyCount = 0,
}) {
  const closeTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);
  if (!open || typeof document === "undefined") return null;

  const safeAuthorName = String(authorName || "Usuario");
  const safeMessage = String(message || "Sin contenido");
  const scheduleClose = () => {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => onOpenChange?.(false), 120);
  };
  const keepOpen = () => {
    window.clearTimeout(closeTimerRef.current);
    onOpenChange?.(true);
  };
  const card = (
    <section
      role="tooltip"
      aria-label={`Observación de ${safeAuthorName}`}
      className={clsx(
        "flex w-[210px] max-w-[min(210px,calc(100vw-24px))] flex-col items-start justify-center gap-[8px] rounded-br-[var(--radius-3)] rounded-tl-[var(--radius-3)] rounded-tr-[var(--radius-3)] border border-[var(--color-neutral-400)] bg-[var(--color-neutral-bg)] p-[12px] text-left",
        position && "fixed z-[1000]",
        className,
      )}
      style={position ? {
        left: `${position.left}px`, top: `${position.top}px`,
        transform: position.transform || "translateY(-50%)",
      } : undefined}
      onMouseEnter={keepOpen}
      onMouseLeave={scheduleClose}
      onFocusCapture={keepOpen}
      onBlurCapture={scheduleClose}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex min-w-0 items-center gap-[8px]">
        <Avatar size="S" theme="Neutral" content={avatarSrc ? "Image" : "Text"}
          initials={getObservationAuthorInitials(safeAuthorName)} name={safeAuthorName}
          src={avatarSrc} alt={safeAuthorName} decorative={false} />
        <p className="min-w-0 truncate text-[12px] leading-[14px] tracking-[-0.5px] text-[var(--color-text-300)]">{safeAuthorName}</p>
      </div>
      <p className="w-full break-words text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-300)]">{safeMessage}</p>
      <div className="flex items-center gap-[8px]">
        {replyCount > 0 ? (
          <p className="whitespace-nowrap text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-300)]">
            {formatObservationReplyCount(replyCount)}
          </p>
        ) : null}
        {onReply ? (
          <button type="button" className="cursor-pointer rounded-[var(--radius-2)] p-[8px] text-[14px] font-medium leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-text-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-300)]" onClick={onReply}>
            Responder
          </button>
        ) : null}
      </div>
    </section>
  );

  return position ? createPortal(card, document.body) : card;
}
