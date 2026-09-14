import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

const WHEEL_GESTURE_THRESHOLD_PX = 32;
const WHEEL_GESTURE_IDLE_MS = 180;
const TOUCH_SWIPE_THRESHOLD_PX = 48;
const TOUCH_VERTICAL_DOMINANCE = 1.2;
const SECTION_EDGE_TOLERANCE_PX = 2;

/**
 * Obtiene la geometría de la sección respecto al contenedor desplazable.
 * Permite decidir si el proyecto activo ya se recorrió por completo antes
 * de iniciar el cambio de panel.
 */
function getSectionScrollContext(stage) {
  const scrollContainer = stage.closest?.("[data-home-scroll-container]");
  const stageRect = stage.getBoundingClientRect();
  const viewportRect = scrollContainer?.getBoundingClientRect?.() ?? {
    top: 0,
    bottom: window.innerHeight,
    height: window.innerHeight,
  };
  const viewportHeight = scrollContainer?.clientHeight ?? viewportRect.height;
  const scrollTop = scrollContainer?.scrollTop ?? window.scrollY ?? 0;
  const sectionTop = scrollTop + stageRect.top - viewportRect.top;

  return {
    maxSectionScroll: Math.max(0, stageRect.height - viewportHeight),
    scrollContainer,
    sectionTop,
    stageRect,
    viewportHeight,
    viewportRect,
  };
}

/**
 * Comprueba que el gesto intenta salir por un borde ya visible de la sección.
 * El desplazamiento nativo sigue disponible mientras quede contenido del
 * proyecto activo por mostrar.
 */
function isAtSectionEdge(context, direction) {
  if (direction > 0) {
    return context.stageRect.bottom <=
      context.viewportRect.bottom + SECTION_EDGE_TOLERANCE_PX;
  }

  return context.stageRect.top >=
    context.viewportRect.top - SECTION_EDGE_TOLERANCE_PX;
}

/**
 * Alinea el contenedor con el inicio o el final del proyecto entrante.
 * El ajuste se realiza junto con la limpieza de transforms para conservar
 * continuidad visual al completar la animación.
 */
function alignIncomingProject(context, direction) {
  const targetScrollTop = context.sectionTop +
    (direction > 0 ? 0 : context.maxSectionScroll);

  if (context.scrollContainer) {
    context.scrollContainer.scrollTop = targetScrollTop;
    return;
  }

  window.scrollTo?.({ top: targetScrollTop, behavior: "auto" });
}

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
          y: 0,
          yPercent: 0,
          zIndex: index === activeIndexRef.current ? 2 : 1,
        });
      });
    };

    const transitionTo = (direction, scrollContext) => {
      if (!enabled || activeTween || !direction) return;

      const currentIndex = activeIndexRef.current;
      const nextIndex = gsap.utils.wrap(0, panels.length, currentIndex + direction);
      const currentPanel = panels[currentIndex];
      const nextPanel = panels[nextIndex];
      const incomingEndY = direction > 0 ? scrollContext.maxSectionScroll :
        -scrollContext.maxSectionScroll;
      const incomingStartY = incomingEndY +
        (direction * scrollContext.viewportHeight);
      const outgoingEndY = direction * -scrollContext.viewportHeight;

      const completeTransition = () => {
        alignIncomingProject(scrollContext, direction);
        gsap.set(currentPanel, {
          autoAlpha: 0,
          y: 0,
          yPercent: 0,
          zIndex: 1,
        });
        gsap.set(nextPanel, {
          autoAlpha: 1,
          y: 0,
          yPercent: 0,
          zIndex: 2,
        });
        activeTween = undefined;
      };

      gsap.set(nextPanel, {
        autoAlpha: 1,
        y: incomingStartY,
        yPercent: 0,
        zIndex: 3,
      });
      gsap.set(currentPanel, { y: 0, yPercent: 0, zIndex: 2 });
      setActivePanel(nextIndex);

      if (reduceMotion) {
        completeTransition();
        return;
      }

      activeTween = gsap.timeline({
        defaults: { duration: 1.25, ease: "power2.inOut" },
        onComplete: completeTransition,
      });
      activeTween.to(currentPanel, { autoAlpha: 0, y: outgoingEndY }, 0);
      activeTween.to(nextPanel, { autoAlpha: 1, y: incomingEndY }, 0);
    };

    const resetWheelGesture = () => {
      wheelDelta = 0;
      wheelGestureLocked = false;
    };

    const handleWheel = (event) => {
      if (!enabled || event.ctrlKey) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      if (!activeTween) {
        const direction = Math.sign(event.deltaY);
        const scrollContext = getSectionScrollContext(stage);
        if (!isAtSectionEdge(scrollContext, direction)) {
          resetWheelGesture();
          window.clearTimeout(wheelIdleTimer);
          return;
        }
      }

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
      transitionTo(direction, getSectionScrollContext(stage));
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

      const direction = Math.sign(verticalDistance);
      const scrollContext = getSectionScrollContext(stage);
      if (!isAtSectionEdge(scrollContext, direction)) return;

      event.preventDefault();
      event.stopPropagation();
      transitionTo(direction, scrollContext);
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
