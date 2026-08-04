import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

import Avatar from "../Avatar/Avatar.jsx";
import { getObservationAuthorInitials } from "./observationTooltip.js";

export default function ObservationTooltip({
  authorName,
  avatarSrc = "",
  className,
  message,
  onOpenChange,
  onReply,
  open = true,
  position,
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
        "flex w-[256px] max-w-[min(256px,calc(100vw-24px))] flex-col gap-[8px] rounded-[var(--radius-3)] border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] p-[10px] text-left shadow-[var(--shadow-e2)]",
        position && "fixed",
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
      <p className="line-clamp-4 break-words text-[14px] leading-[17px] tracking-[-0.5px] text-[var(--color-text-200)]">{safeMessage}</p>
      {onReply ? (
        <button type="button" className="w-fit cursor-pointer text-[12px] leading-[14px] text-[var(--color-text-200)] transition-colors hover:text-[var(--color-text-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-300)]" onClick={onReply}>
          Responder
        </button>
      ) : null}
    </section>
  );

  return position ? createPortal(card, document.body) : card;
}
