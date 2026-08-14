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
      if (!card) return;
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
      card.style.borderTopLeftRadius = "var(--radius-3)";
      card.style.borderTopRightRadius = "var(--radius-3)";
      card.style.borderBottomLeftRadius = "var(--radius-3)";
      card.style.borderBottomRightRadius = "var(--radius-3)";
      card.style.setProperty(`border-${placement.corner}-radius`, "0px");
      card.style.transformOrigin = placement.corner.replace("-", " ");
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
        "observation-tooltip-enter flex w-[210px] max-w-[min(210px,calc(100vw-24px))] flex-col items-start justify-center gap-[8px] rounded-[var(--radius-3)] border border-[var(--color-neutral-400)] bg-[var(--color-neutral-bg)] p-[12px] text-left shadow-[var(--shadow-e2)]",
        position && "fixed z-[var(--z-tooltip)]",
        className,
      )}
      style={estimatedPlacement ? {
        left: `${estimatedPlacement.left}px`,
        top: `${estimatedPlacement.top}px`,
        transformOrigin: estimatedPlacement.corner.replace("-", " "),
        [`border${estimatedPlacement.corner.split("-").map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join("")}Radius`]: "0px",
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
