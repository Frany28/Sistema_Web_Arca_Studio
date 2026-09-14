import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";
import {
  SECTION_NAVIGATION_DURATION_SECONDS,
  SECTION_NAVIGATION_EASE,
} from "../../utils/sectionNavigationMotion.js";

const WHEEL_GESTURE_THRESHOLD_PX = 32;
const WHEEL_GESTURE_IDLE_MS = 180;
const TOUCH_SWIPE_THRESHOLD_PX = 48;
const TOUCH_VERTICAL_DOMINANCE = 1.2;
const PANEL_EDGE_TOLERANCE_PX = 2;

/**
 * Obtiene la geometría de un proyecto respecto al contenedor desplazable.
 * Mantiene cada panel en su posición real para que el recorrido vertical no
 * recicle contenido ni altere el orden visible de los proyectos.
 */
function getPanelScrollContext(stage, panel) {
  const scrollContainer = stage.closest?.("[data-home-scroll-container]");
  const panelRect = panel.getBoundingClientRect();
  const viewportRect = scrollContainer?.getBoundingClientRect?.() ?? {
    top: 0,
    bottom: window.innerHeight,
    height: window.innerHeight,
  };
  const viewportHeight = scrollContainer?.clientHeight ?? viewportRect.height;
  const scrollTop = scrollContainer?.scrollTop ?? window.scrollY ?? 0;

  return {
    panelRect,
    panelTop: scrollTop + panelRect.top - viewportRect.top,
    scrollContainer,
    viewportHeight,
    viewportRect,
  };
}

/**
 * Comprueba si el proyecto activo alcanzó el borde correspondiente.
 * Mientras quede contenido visible, el gesto permanece bajo control nativo
 * para permitir recorrer íntegramente el encabezado y la galería.
 */
function isAtPanelEdge(context, direction) {
  if (direction > 0) {
    return context.panelRect.bottom <=
      context.viewportRect.bottom + PANEL_EDGE_TOLERANCE_PX;
  }

  return context.panelRect.top >=
    context.viewportRect.top - PANEL_EDGE_TOLERANCE_PX;
}

/**
 * Calcula la posición de llegada del proyecto adyacente.
 * Al bajar muestra su inicio y al subir recupera su final, preservando la
 * continuidad natural del recorrido en ambas direcciones.
 */
function getIncomingScrollTop(context, nextPanel, direction) {
  const nextRect = nextPanel.getBoundingClientRect();
  const nextPanelTop = context.scrollContainer.scrollTop + nextRect.top -
    context.viewportRect.top;

  return direction > 0
    ? nextPanelTop
    : nextPanelTop + Math.max(0, nextRect.height - context.viewportHeight);
}

/**
 * Coordina los proyectos destacados como una secuencia vertical ordenada.
 * Anima únicamente el salto entre proyectos con el movimiento compartido del
 * home y libera los extremos para navegar hacia las secciones adyacentes.
 */
function useFeaturedProjectsPanelLoop(stageRef, enabled = true) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousEnabled, setPreviousEnabled] = useState(enabled);
  const activeIndexRef = useRef(0);

  if (previousEnabled !== enabled) {
    setPreviousEnabled(enabled);
    setActiveIndex(0);
  }

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const panels = gsap.utils.toArray("[data-featured-project-panel]", stage);
    if (panels.length < 2) return undefined;

    if (!enabled) {
      activeIndexRef.current = 0;
      return undefined;
    }

    const scrollContainer = stage.closest?.("[data-home-scroll-container]");
    if (!scrollContainer) return undefined;

    let activeTween;
    let wheelDelta = 0;
    let wheelGestureLocked = false;
    let wheelIdleTimer;
    let touchGesture;

    const setActivePanel = (index) => {
      if (activeIndexRef.current === index) return;
      activeIndexRef.current = index;
      setActiveIndex(index);
    };

    const canTransition = (direction) => {
      const nextIndex = activeIndexRef.current + direction;
      return nextIndex >= 0 && nextIndex < panels.length;
    };

    const transitionTo = (direction, scrollContext) => {
      if (activeTween || !direction || !canTransition(direction)) return;

      const nextIndex = activeIndexRef.current + direction;
      const nextPanel = panels[nextIndex];
      const targetScrollTop = getIncomingScrollTop(
        scrollContext,
        nextPanel,
        direction,
      );

      setActivePanel(nextIndex);
      if (reduceMotion) {
        scrollContainer.scrollTop = targetScrollTop;
        return;
      }

      activeTween = gsap.timeline({
        defaults: {
          duration: SECTION_NAVIGATION_DURATION_SECONDS,
          ease: SECTION_NAVIGATION_EASE,
        },
        onComplete: () => {
          scrollContainer.scrollTop = targetScrollTop;
          activeTween = undefined;
        },
      });
      activeTween.to(scrollContainer, { scrollTop: targetScrollTop }, 0);
    };

    const resetWheelGesture = () => {
      wheelDelta = 0;
      wheelGestureLocked = false;
    };

    const handleWheel = (event) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      if (activeTween) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const direction = Math.sign(event.deltaY);
      const currentPanel = panels[activeIndexRef.current];
      const scrollContext = getPanelScrollContext(stage, currentPanel);
      if (!isAtPanelEdge(scrollContext, direction) || !canTransition(direction)) {
        resetWheelGesture();
        window.clearTimeout(wheelIdleTimer);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(resetWheelGesture, WHEEL_GESTURE_IDLE_MS);
      if (wheelGestureLocked) return;

      wheelDelta += event.deltaY;
      if (Math.abs(wheelDelta) < WHEEL_GESTURE_THRESHOLD_PX) return;

      wheelDelta = 0;
      wheelGestureLocked = true;
      transitionTo(direction, scrollContext);
    };

    const handlePointerDown = (event) => {
      if (event.pointerType !== "touch" || !event.isPrimary) return;
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
      const currentPanel = panels[activeIndexRef.current];
      const scrollContext = getPanelScrollContext(stage, currentPanel);
      if (!isAtPanelEdge(scrollContext, direction) || !canTransition(direction)) return;

      event.preventDefault();
      event.stopPropagation();
      transitionTo(direction, scrollContext);
      touchGesture = null;
    };

    const clearTouchGesture = (event) => {
      if (touchGesture?.pointerId === event.pointerId) touchGesture = null;
    };

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
      gsap.killTweensOf(scrollContainer);
    };
  }, [enabled, reduceMotion, stageRef]);

  return enabled ? activeIndex : 0;
}

export default useFeaturedProjectsPanelLoop;
