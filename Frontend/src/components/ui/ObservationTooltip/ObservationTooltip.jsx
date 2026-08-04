import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

import Avatar from "../Avatar/Avatar.jsx";
import {
  formatObservationReplyCount,
  getAdaptiveObservationTooltipPlacement,
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
  const cardRef = useRef(null);
  const tailRef = useRef(null);
  const isBrowser = typeof document !== "undefined";

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

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
  const estimatedPlacement = position && isBrowser ? getAdaptiveObservationTooltipPlacement({
    ...position,
    tooltipHeight: 128,
    tooltipWidth: 210,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  }) : null;

  useLayoutEffect(() => {
    if (!open || !position || !cardRef.current || !isBrowser) return undefined;
    const updatePlacement = () => {
      const card = cardRef.current;
      const tail = tailRef.current;
      if (!card || !tail) return;
      const placement = getAdaptiveObservationTooltipPlacement({
        ...position,
        tooltipHeight: card.offsetHeight,
        tooltipWidth: card.offsetWidth,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      });
      card.style.left = `${placement.left}px`;
      card.style.top = `${placement.top}px`;
      card.dataset.placement = placement.placement;
      tail.style.left = `${placement.tailLeft}px`;
      tail.className = clsx(
        "pointer-events-none absolute size-[12px] -translate-x-1/2 rotate-45 bg-[var(--color-neutral-bg)]",
        placement.placement === "top"
          ? "bottom-[-7px] border-b border-r border-[var(--color-neutral-400)]"
          : "top-[-7px] border-l border-t border-[var(--color-neutral-400)]",
      );
    };
    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    return () => window.removeEventListener("resize", updatePlacement);
  }, [isBrowser, open, position]);

  if (!open || !isBrowser) return null;

  const card = (
    <section
      ref={cardRef}
      role="tooltip"
      aria-label={`Observación de ${safeAuthorName}`}
      className={clsx(
        "flex w-[210px] max-w-[min(210px,calc(100vw-24px))] flex-col items-start justify-center gap-[8px] rounded-br-[var(--radius-3)] rounded-tl-[var(--radius-3)] rounded-tr-[var(--radius-3)] border border-[var(--color-neutral-400)] bg-[var(--color-neutral-bg)] p-[12px] text-left",
        position && "fixed z-[1000]",
        className,
      )}
      style={estimatedPlacement ? {
        left: `${estimatedPlacement.left}px`,
        top: `${estimatedPlacement.top}px`,
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
      {position ? (
        <span
          ref={tailRef}
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute size-[12px] -translate-x-1/2 rotate-45 bg-[var(--color-neutral-bg)]",
            estimatedPlacement?.placement === "top"
              ? "bottom-[-7px] border-b border-r border-[var(--color-neutral-400)]"
              : "top-[-7px] border-l border-t border-[var(--color-neutral-400)]",
          )}
          style={{ left: `${estimatedPlacement?.tailLeft || 105}px` }}
        />
      ) : null}
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
