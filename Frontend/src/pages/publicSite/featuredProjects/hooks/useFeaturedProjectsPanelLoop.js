import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

const WHEEL_GESTURE_THRESHOLD_PX = 32;
const WHEEL_GESTURE_IDLE_MS = 180;
const TOUCH_SWIPE_THRESHOLD_PX = 48;
const TOUCH_VERTICAL_DOMINANCE = 1.2;

/**
 * Convierte los proyectos destacados en un ciclo de paneles verticales.
 * Cada gesto completo saca el proyecto activo del viewport e introduce el
 * siguiente por el borde contrario, reproduciendo un loop continuo.
 */
function useFeaturedProjectsPanelLoop(stageRef, enabled = true) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const panels = gsap.utils.toArray("[data-featured-project-panel]", stage);
    if (panels.length < 2) return undefined;

    let activeTween;
    let wheelDelta = 0;
    let wheelGestureLocked = false;
    let wheelIdleTimer;
    let touchGesture;

    const setActivePanel = (index) => {
      const normalizedIndex = gsap.utils.wrap(0, panels.length, index);
      activeIndexRef.current = normalizedIndex;
      setActiveIndex(normalizedIndex);
      return normalizedIndex;
    };

    const applyInitialState = () => {
      panels.forEach((panel, index) => {
        gsap.set(panel, {
          autoAlpha: index === activeIndexRef.current ? 1 : 0,
          yPercent: index === activeIndexRef.current ? 0 : 100,
          zIndex: index === activeIndexRef.current ? 2 : 1,
        });
      });
    };

    const transitionTo = (direction) => {
      if (!enabled || activeTween || !direction) return;

      const currentIndex = activeIndexRef.current;
      const nextIndex = gsap.utils.wrap(0, panels.length, currentIndex + direction);
      const currentPanel = panels[currentIndex];
      const nextPanel = panels[nextIndex];
      const incomingOffset = direction > 0 ? 100 : -100;
      const outgoingOffset = direction > 0 ? -100 : 100;

      gsap.set(nextPanel, { autoAlpha: 1, yPercent: incomingOffset, zIndex: 3 });
      gsap.set(currentPanel, { zIndex: 2 });
      setActivePanel(nextIndex);

      if (reduceMotion) {
        gsap.set(currentPanel, { autoAlpha: 0, yPercent: -incomingOffset, zIndex: 1 });
        gsap.set(nextPanel, { autoAlpha: 1, yPercent: 0, zIndex: 2 });
        return;
      }

      activeTween = gsap.timeline({
        defaults: { duration: 1.25, ease: "power2.inOut" },
        onComplete: () => {
          gsap.set(currentPanel, {
            autoAlpha: 0,
            yPercent: -incomingOffset,
            zIndex: 1,
          });
          gsap.set(nextPanel, { autoAlpha: 1, yPercent: 0, zIndex: 2 });
          activeTween = undefined;
        },
      });
      activeTween.to(currentPanel, { autoAlpha: 0, yPercent: outgoingOffset }, 0);
      activeTween.to(nextPanel, { autoAlpha: 1, yPercent: 0 }, 0);
    };

    const resetWheelGesture = () => {
      wheelDelta = 0;
      wheelGestureLocked = false;
    };

    const handleWheel = (event) => {
      if (!enabled || event.ctrlKey) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();
      event.stopPropagation();
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(resetWheelGesture, WHEEL_GESTURE_IDLE_MS);
      if (activeTween || wheelGestureLocked) return;

      wheelDelta += event.deltaY;
      if (Math.abs(wheelDelta) < WHEEL_GESTURE_THRESHOLD_PX) return;

      const direction = Math.sign(wheelDelta);
      wheelDelta = 0;
      wheelGestureLocked = true;
      transitionTo(direction);
    };

    const handlePointerDown = (event) => {
      if (!enabled || event.pointerType !== "touch" || !event.isPrimary) return;
      touchGesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      };
    };

    const handlePointerMove = (event) => {
      if (!touchGesture || touchGesture.pointerId !== event.pointerId || activeTween) return;

      const horizontalDistance = event.clientX - touchGesture.startX;
      const verticalDistance = touchGesture.startY - event.clientY;
      if (
        Math.abs(verticalDistance) < TOUCH_SWIPE_THRESHOLD_PX ||
        Math.abs(verticalDistance) < Math.abs(horizontalDistance) * TOUCH_VERTICAL_DOMINANCE
      ) return;

      event.preventDefault();
      event.stopPropagation();
      transitionTo(Math.sign(verticalDistance));
      touchGesture = null;
    };

    const clearTouchGesture = (event) => {
      if (touchGesture?.pointerId === event.pointerId) touchGesture = null;
    };

    applyInitialState();
    stage.addEventListener("wheel", handleWheel, { passive: false });
    stage.addEventListener("pointerdown", handlePointerDown);
    stage.addEventListener("pointermove", handlePointerMove, { passive: false });
    stage.addEventListener("pointerup", clearTouchGesture);
    stage.addEventListener("pointercancel", clearTouchGesture);

    return () => {
      window.clearTimeout(wheelIdleTimer);
      activeTween?.kill();
      stage.removeEventListener("wheel", handleWheel);
      stage.removeEventListener("pointerdown", handlePointerDown);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerup", clearTouchGesture);
      stage.removeEventListener("pointercancel", clearTouchGesture);
      gsap.killTweensOf(panels);
      gsap.set(panels, { clearProps: "all" });
    };
  }, [enabled, reduceMotion, stageRef]);

  return activeIndex;
}

export default useFeaturedProjectsPanelLoop;
