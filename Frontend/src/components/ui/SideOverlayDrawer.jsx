import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import Modal from "./Modal/Modal.jsx";

const UNMOUNT_DELAY_MS = 360;
const DRAWER_TRANSITION_MS = 360;
const DRAWER_EASING = "ease-in-out";

function SideOverlayDrawer({
  open = false,
  onClose,
  className,
  panelClassName,
  children,
  widthClassName = "w-[312px]",
  ...props
}) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isActive, setIsActive] = useState(false);
  const closeTimeoutRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      window.clearTimeout(closeTimeoutRef.current);
      window.cancelAnimationFrame(frameRef.current);
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
    }, UNMOUNT_DELAY_MS);

    return () => {
      window.clearTimeout(closeTimeoutRef.current);
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Modal
      visible={shouldRender}
      mount="viewport"
      showDialog={false}
      className={clsx("z-50", className)}
      style={{
        background: "transparent",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
      onClick={onClose}
      {...props}
    >
      <div
        className={clsx(
          "absolute inset-0 bg-[rgba(42,41,41,0.10)] transition-opacity",
          isActive ? "opacity-100" : "opacity-0",
        )}
        style={{
          transitionDuration: `${DRAWER_TRANSITION_MS}ms`,
          transitionTimingFunction: DRAWER_EASING,
          backdropFilter: "var(--effect-blur-b1)",
          WebkitBackdropFilter: "var(--effect-blur-b1)",
        }}
      />

      <aside
        className={clsx(
          "absolute bottom-0 right-0 top-0 max-w-full overflow-hidden rounded-bl-[12px] rounded-tl-[12px] bg-[var(--color-neutral-100)] shadow-[0_0_5px_0_rgba(0,0,0,0.1)] transition-[transform,opacity] transform-gpu will-change-transform will-change-opacity",
          widthClassName,
          isActive
            ? "translate-x-0 opacity-100"
            : "translate-x-[18px] opacity-0",
          panelClassName,
        )}
        style={{
          transitionDuration: `${DRAWER_TRANSITION_MS}ms`,
          transitionTimingFunction: DRAWER_EASING,
        }}
        onClick={(event) => event.stopPropagation()}
        aria-hidden={!isActive}
      >
        {children}
      </aside>
    </Modal>
  );
}

export default SideOverlayDrawer;
