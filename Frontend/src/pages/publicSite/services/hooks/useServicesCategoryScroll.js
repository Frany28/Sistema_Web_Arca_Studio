import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { getClosestScrollContainer } from "../../../../hooks/useScrollDirectionVisibility.js";

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_SCROLL_STEP = 0.5;
const CATEGORY_CROSSFADE_DURATION = 0.2;

function useServicesCategoryScroll(sectionRef, layoutRef, categories) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const selectRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const layout = layoutRef.current;
    if (!section || !layout || !categories.length) return undefined;

    const tabs = [...section.querySelectorAll('[role="tab"]')];
    const slides = [...section.querySelectorAll("[data-category-slide]")];
    const indicator = section.querySelector("[data-category-indicator]");
    const scroller = getClosestScrollContainer(section);
    let context;
    let resizeFrame;
    let disposed = false;
    let previousSize;

    const setSelection = (index) => {
      selectedIndexRef.current = index;
      setActiveIndex(index);
    };

    // Las alturas se miden para conservar la barra de Figma cuando el texto
    // cambia de línea: en escritorio son 48, 108, 162, 216, 270, 324 y 354 px.
    const indicatorHeight = (index) => {
      if (index === 0) return parseFloat(getComputedStyle(tabs[0]).lineHeight) * 1.6;
      const nextTab = tabs[index + 1];
      return (nextTab?.offsetTop ?? tabs[index].offsetTop + tabs[index].offsetHeight / 2)
        - tabs[0].offsetTop;
    };

    const rebuild = () => {
      if (disposed) return;
      const viewportHeight = scroller === window ? window.innerHeight : scroller.clientHeight;
      const size = `${layout.offsetWidth}:${layout.offsetHeight}:${viewportHeight}`;
      if (size === previousSize) return;
      previousSize = size;
      context?.revert();

      context = gsap.context(() => {
        const currentIndex = Math.min(selectedIndexRef.current, categories.length - 1);
        const showStaticSelection = (index) => {
          gsap.set(slides, { autoAlpha: 0 });
          gsap.set(slides[index], { autoAlpha: 1 });
          gsap.set(indicator, { height: indicatorHeight(index) });
          setSelection(index);
        };

        // En ventanas demasiado bajas y con movimiento reducido se conserva
        // el selector manual, sin fijar contenido que no quepa en pantalla.
        if (reduceMotion || layout.offsetHeight > viewportHeight - 64 || categories.length < 2) {
          showStaticSelection(currentIndex);
          selectRef.current = showStaticSelection;
          return;
        }

        gsap.set(slides, { autoAlpha: 0 });
        gsap.set(slides[0], { autoAlpha: 1 });
        gsap.set(indicator, { height: indicatorHeight(0) });

        // Referencia: https://codepen.io/GreenSock/pen/pomvabo
        // El tiempo de la secuencia depende del scroll, también al retroceder.
        const timeline = gsap.timeline({
          paused: true,
          onUpdate: () => setSelection(Math.min(
            categories.length - 1,
            Math.floor((timeline.time() + 0.00001) / CATEGORY_SCROLL_STEP),
          )),
        });

        slides.slice(1).forEach((slide, offset) => {
          const index = offset + 1;
          const position = index * CATEGORY_SCROLL_STEP;
          timeline
            .fromTo(slide, { autoAlpha: 0 }, {
              autoAlpha: 1, duration: CATEGORY_CROSSFADE_DURATION, immediateRender: false,
            }, position)
            .fromTo(slides[index - 1], { autoAlpha: 1 }, {
              autoAlpha: 0, duration: CATEGORY_CROSSFADE_DURATION, immediateRender: false,
            }, position)
            .fromTo(indicator, { height: () => indicatorHeight(index - 1) }, {
              height: () => indicatorHeight(index),
              duration: CATEGORY_CROSSFADE_DURATION,
              ease: "none",
              immediateRender: false,
            }, position);
        });
        timeline.to({}, { duration: CATEGORY_SCROLL_STEP });

        const trigger = ScrollTrigger.create({
          trigger: section,
          scroller: scroller === window ? undefined : scroller,
          animation: timeline,
          start: "clamp(center center)",
          end: () => `clamp(+=${categories.length * viewportHeight * 0.5})`,
          pin: true,
          pinSpacing: true,
          scrub: true,
          invalidateOnRefresh: true,
        });

        selectRef.current = (index) => {
          const time = index === 0 ? 0 : index * CATEGORY_SCROLL_STEP + CATEGORY_CROSSFADE_DURATION;
          trigger.scroll(trigger.start + (time / timeline.duration()) * (trigger.end - trigger.start));
          ScrollTrigger.update();
        };
      }, section);
    };

    const scheduleRebuild = () => {
      if (disposed) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(rebuild);
    };
    rebuild();
    const observer = new ResizeObserver(scheduleRebuild);
    observer.observe(layout);
    if (scroller !== window) observer.observe(scroller);
    window.addEventListener("resize", scheduleRebuild);
    document.fonts.ready.then(scheduleRebuild);

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", scheduleRebuild);
      cancelAnimationFrame(resizeFrame);
      selectRef.current = null;
      context?.revert();
    };
  }, [categories, layoutRef, reduceMotion, sectionRef]);

  const selectCategory = (index) => {
    if (index >= 0 && index < categories.length) selectRef.current?.(index);
  };

  return { activeIndex, selectCategory };
}

export default useServicesCategoryScroll;
