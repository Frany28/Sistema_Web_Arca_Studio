import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";
import { advanceWheelGesture, createWheelGestureState, normalizeWheelDelta, getSwipeDirection } from "../../home/utils/homeScrollNavigation.js";
import { visitServiceCategory } from "../utils/servicesProgress.js";

const CATEGORY_CROSSFADE_DURATION = 0.2;

function useServicesCategoryScroll(sectionRef, layoutRef, categories, enabled = true, onCategoriesComplete, onNextSection) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const selectRef = useRef(null);
  const visitedRef = useRef(new Set());

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const layout = layoutRef.current;
    if (!section || !layout || !categories.length || !enabled) return undefined;
    const tabs = [...section.querySelectorAll('[role="tab"]')];
    const slides = [...section.querySelectorAll("[data-category-slide]")];
    const indicator = section.querySelector("[data-category-indicator]");
    let gesture = createWheelGestureState();
    let idleTimer;
    let touch;
    let disposed = false;
    let visited = visitedRef.current;
    const indicatorHeight = (index) => {
      if (index === 0) return parseFloat(getComputedStyle(tabs[0]).lineHeight) * 1.6;
      const nextTab = tabs[index + 1];
      return (nextTab?.offsetTop ?? tabs[index].offsetTop + tabs[index].offsetHeight / 2) - tabs[0].offsetTop;
    };
    const select = (index, immediate = false) => {
      const next = Math.max(0, Math.min(categories.length - 1, index));
      selectedIndexRef.current = next;
      setActiveIndex(next);
      const progress = visitServiceCategory(visited, next, categories.length);
      visited = progress.visited;
      visitedRef.current = visited;
      onCategoriesComplete?.(progress.complete);
      const duration = reduceMotion || immediate ? 0 : CATEGORY_CROSSFADE_DURATION;
      slides.forEach((slide, slideIndex) => {
        gsap.to(slide, { autoAlpha: slideIndex === next ? 1 : 0, duration, overwrite: true });
      });
      gsap.to(indicator, { height: indicatorHeight(next), duration, overwrite: true });
    };
    const context = gsap.context(() => select(selectedIndexRef.current, true), section);
    selectRef.current = select;
    const advance = (direction) => {
      if (direction > 0 && selectedIndexRef.current === categories.length - 1 && visited.size === categories.length) {
        onNextSection?.();
        return;
      }
      select(selectedIndexRef.current + direction);
    };
    const wheel = (event) => {
      if (event.ctrlKey) return;
      const delta = normalizeWheelDelta(event, layout.clientHeight);
      if (Math.abs(delta.y) <= Math.abs(delta.x)) return;
      // El selector consume el gesto y delega la salida al controlador de Home.
      event.preventDefault();
      event.stopPropagation();
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { gesture = createWheelGestureState(); }, 180);
      gesture = advanceWheelGesture(gesture, delta.y, 32, event.timeStamp);
      if (gesture.triggeredDirection !== null) advance(gesture.triggeredDirection);
    };
    const pointerDown = (event) => {
      if (event.pointerType !== "touch" || !event.isPrimary) return;
      touch = { id: event.pointerId, startX: event.clientX, startY: event.clientY };
    };
    const pointerMove = (event) => {
      if (!touch || touch.id !== event.pointerId) return;
      const direction = getSwipeDirection({ ...touch, endX: event.clientX, endY: event.clientY });
      if (direction === null) return;
      event.preventDefault();
      event.stopPropagation();
      advance(direction);
      touch = null;
    };
    const clearTouch = () => { touch = null; };
    const resize = () => {
      if (!disposed) gsap.set(indicator, { height: indicatorHeight(selectedIndexRef.current) });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(layout);
    document.fonts.ready.then(resize);
    section.addEventListener("wheel", wheel, { passive: false });
    section.addEventListener("pointerdown", pointerDown);
    section.addEventListener("pointermove", pointerMove, { passive: false });
    section.addEventListener("pointerup", clearTouch);
    section.addEventListener("pointercancel", clearTouch);
    return () => {
      disposed = true;
      clearTimeout(idleTimer);
      observer.disconnect();
      section.removeEventListener("wheel", wheel);
      section.removeEventListener("pointerdown", pointerDown);
      section.removeEventListener("pointermove", pointerMove);
      section.removeEventListener("pointerup", clearTouch);
      section.removeEventListener("pointercancel", clearTouch);
      gsap.killTweensOf([...slides, indicator]);
      selectRef.current = null;
      context.revert();
    };
  }, [categories, enabled, layoutRef, onCategoriesComplete, onNextSection, reduceMotion, sectionRef]);

  const selectCategory = (index) => {
    if (index >= 0 && index < categories.length) selectRef.current?.(index);
  };
  return { activeIndex, selectCategory };
}

export default useServicesCategoryScroll;
