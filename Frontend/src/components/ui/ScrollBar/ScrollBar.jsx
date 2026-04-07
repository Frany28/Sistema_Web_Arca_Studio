import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { SCROLL_BAR_DEFAULT_PROPS } from "./scrollBarConfig.js";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function ScrollBar({
  className,
  length = SCROLL_BAR_DEFAULT_PROPS.length,
  position = SCROLL_BAR_DEFAULT_PROPS.position,
  height = SCROLL_BAR_DEFAULT_PROPS.height,
  interactive = SCROLL_BAR_DEFAULT_PROPS.interactive,
  minThumbSize = SCROLL_BAR_DEFAULT_PROPS.minThumbSize,
  onPositionChange,
  ...props
}) {
  const trackRef = useRef(null);
  const [dragOffset, setDragOffset] = useState(null);
  const resolvedLength = clamp(length);
  const resolvedPosition = clamp(position);
  const innerHeight = Math.max(height - 8, 0);
  const thumbHeight = Math.max(innerHeight * resolvedLength, minThumbSize);
  const thumbTravel = Math.max(innerHeight - thumbHeight, 0);
  const thumbTop = thumbTravel * resolvedPosition;

  const getNextPosition = useCallback(
    (clientY, offset = thumbHeight / 2) => {
      const rect = trackRef.current?.getBoundingClientRect();

      if (!rect) {
        return resolvedPosition;
      }

      const next = (clientY - rect.top - offset) / Math.max(thumbTravel, 1);
      return clamp(next);
    },
    [resolvedPosition, thumbHeight, thumbTravel],
  );

  function beginDrag(event) {
    if (!interactive) {
      return;
    }

    event.preventDefault();
    const rect = trackRef.current?.getBoundingClientRect();
    const currentThumbTop = rect ? rect.top + thumbTop : 0;
    const nextOffset = clamp(
      event.clientY - currentThumbTop,
      0,
      Math.max(thumbHeight, 0),
    );

    setDragOffset(nextOffset);
    onPositionChange?.(getNextPosition(event.clientY, nextOffset));
  }

  useEffect(() => {
    if (dragOffset == null) {
      return undefined;
    }

    function handlePointerMove(event) {
      onPositionChange?.(getNextPosition(event.clientY, dragOffset));
    }

    function handlePointerUp() {
      setDragOffset(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragOffset, getNextPosition, onPositionChange]);

  return (
    <div
      className={clsx("inline-flex items-start", className)}
      {...props}
    >
      <div
        className="flex items-start p-[4px]"
        style={{ height: `${height}px`, width: "16px" }}
      >
        <div
          ref={trackRef}
          className={clsx(
            "relative h-full min-h-px flex-1 rounded-[var(--radius-2)]",
            interactive && "cursor-pointer",
          )}
          onPointerDown={beginDrag}
        >
          <div
            className={clsx(
              "absolute inset-x-0 rounded-[var(--radius-2)] bg-[var(--color-neutral-200)] transition-[top,height] duration-150",
              interactive && "cursor-grab active:cursor-grabbing",
            )}
            style={{
              top: `${thumbTop}px`,
              height: `${thumbHeight}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ScrollBar;
