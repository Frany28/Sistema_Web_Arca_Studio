import { useId, useState } from "react";
import clsx from "clsx";
import {
  HORIZONTAL_TAB_MENU_DEFAULT_ITEMS,
  HORIZONTAL_TAB_MENU_DEFAULT_PROPS,
} from "./horizontalTabMenuConfig.js";

const HORIZONTAL_TAB_MENU_NODE_IDS = {
  light: {
    wrapper: "2061:23099",
    activeItem: "2061:23100",
    inactiveItem: "2061:23101",
  },
};

function getItemNodeId(isActive) {
  return isActive
    ? HORIZONTAL_TAB_MENU_NODE_IDS.light.activeItem
    : HORIZONTAL_TAB_MENU_NODE_IDS.light.inactiveItem;
}

function getNextIndex(currentIndex, itemCount, direction) {
  if (itemCount <= 0) {
    return currentIndex;
  }

  if (currentIndex < 0) {
    return direction > 0 ? 0 : itemCount - 1;
  }

  return (currentIndex + direction + itemCount) % itemCount;
}

function HorizontalTabMenu({
  className,
  items = HORIZONTAL_TAB_MENU_DEFAULT_PROPS.items,
  activeIndex,
  defaultActiveIndex = HORIZONTAL_TAB_MENU_DEFAULT_PROPS.activeIndex,
  interactive = HORIZONTAL_TAB_MENU_DEFAULT_PROPS.interactive,
  onChange,
  ...props
}) {
  const generatedId = useId();
  const [internalActiveIndex, setInternalActiveIndex] = useState(defaultActiveIndex);
  const normalizedItems =
    Array.isArray(items) && items.length > 0
      ? items
      : HORIZONTAL_TAB_MENU_DEFAULT_ITEMS;
  const isControlled = Number.isInteger(activeIndex);
  const resolvedActiveIndex = isControlled ? activeIndex : internalActiveIndex;
  const hasActiveItem =
    Number.isInteger(resolvedActiveIndex) &&
    resolvedActiveIndex >= 0 &&
    resolvedActiveIndex < normalizedItems.length;
  const isInteractive = interactive || typeof onChange === "function";

  function handleSelect(index) {
    if (!isInteractive || index === resolvedActiveIndex) {
      return;
    }

    if (!isControlled) {
      setInternalActiveIndex(index);
    }

    onChange?.(index);
  }

  function handleKeyDown(event, index) {
    if (!isInteractive) {
      return;
    }

    let nextIndex = null;

    if (event.key === "ArrowRight") {
      nextIndex = getNextIndex(index, normalizedItems.length, 1);
    } else if (event.key === "ArrowLeft") {
      nextIndex = getNextIndex(index, normalizedItems.length, -1);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = normalizedItems.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    handleSelect(nextIndex);

    const tabs = event.currentTarget.parentElement?.querySelectorAll('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  }

  return (
    <div
      className={clsx(
        "inline-flex max-w-full items-center gap-[8px] overflow-x-auto pb-[2px]",
        className,
      )}
      data-node-id={HORIZONTAL_TAB_MENU_NODE_IDS.light.wrapper}
      role="tablist"
      {...props}
    >
      {normalizedItems.map((item, index) => {
        const isActive = hasActiveItem && index === resolvedActiveIndex;
        const tabId = `${generatedId}-tab-${index}`;

        return (
          <button
            key={`${item}-${index}`}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive || !hasActiveItem ? 0 : -1}
            data-node-id={getItemNodeId(isActive)}
            className={clsx(
              "inline-flex h-[36px] shrink-0 items-center justify-center rounded-[var(--radius-2)] px-[12px] py-[8px] text-heading-8 whitespace-nowrap transition-colors duration-150",
              "outline-none focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)]",
              isInteractive && "cursor-pointer",
              isActive
                ? "bg-[var(--color-neutral-200)] text-[var(--color-text-300)]"
                : clsx(
                    "bg-transparent text-[var(--color-text-100)]",
                    isInteractive &&
                      "hover:bg-[var(--color-neutral-10)] hover:text-[var(--color-text-200)]",
                  ),
            )}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onClick={() => handleSelect(index)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export default HorizontalTabMenu;
