import { useRef } from "react";
import {
  motion as Motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

function AboutStory({
  image,
  scrollContainerRef,
}) {
  const storyRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: storyRef,
    offset: ["start start", "end end"],
  });

  /*
   * Figma:
   * 1440 × 960  ->  1104 × 736
   *
   * 1104 / 1440 = 0.766666...
   */
  const imageScale = useTransform(
    scrollYProgress,
    reduceMotion
      ? [0, 1]
      : [0, 0.78, 0.88, 1],
    reduceMotion
      ? [1, 1]
      : [1, 1, 1, 0.7667],
  );

  const borderRadius = useTransform(
    scrollYProgress,
    [0, 0.88, 1],
    ["0px", "0px", "16px"],
  );

  /*
   * Primero la imagen está completamente limpia.
   * Después aparece el estado oscuro/desenfocado.
   * Al terminar vuelve a estar nítida.
   */
  const imageFilter = useTransform(
    scrollYProgress,
    [0, 0.1, 0.2, 0.74, 0.88, 1],
    [
      "blur(0px) brightness(1)",
      "blur(0px) brightness(1)",
      "blur(7px) brightness(0.58)",
      "blur(7px) brightness(0.58)",
      "blur(0px) brightness(0.8)",
      "blur(0px) brightness(1)",
    ],
  );

  const imageInnerScale = useTransform(
    scrollYProgress,
    [0, 0.18, 0.76, 0.9],
    [1, 1.025, 1.025, 1],
  );

  const darkness = useTransform(
    scrollYProgress,
    [0, 0.1, 0.2, 0.72, 0.88],
    [0, 0, 0.28, 0.28, 0],
  );

  /*
   * Movimiento tipo créditos.
   *
   * El párrafo comienza debajo del viewport,
   * cruza lentamente el centro y termina arriba.
   */
  const textY = useTransform(
    scrollYProgress,
    [0.16, 0.3, 0.58, 0.76],
    ["75vh", "38vh", "-18vh", "-95vh"],
  );

  const textOpacity = useTransform(
    scrollYProgress,
    [0.14, 0.21, 0.68, 0.77],
    [0, 1, 1, 0],
  );

  return (
    <div
      ref={storyRef}
      className="
        relative
        h-[500dvh]
        w-full
        bg-[var(--color-neutral-950-uniform)]
      "
      data-about-story
    >
      <div
        className="
          sticky
          top-0
          flex
          h-dvh
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-[var(--color-neutral-950-uniform)]
        "
      >
        <Motion.div
          className="
            relative
            h-dvh
            w-full
            overflow-hidden
            will-change-transform
          "
          style={{
            scale: imageScale,
            borderRadius,
          }}
        >
          <Motion.img
            src={image}
            alt=""
            aria-hidden="true"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-bottom
              will-change-transform
            "
            style={{
              filter: imageFilter,
              scale: imageInnerScale,
            }}
          />

          <Motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-black"
            style={{ opacity: darkness }}
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-10
              overflow-hidden
            "
          >
            <Motion.p
              className="
                absolute
                left-1/2
                top-0
                m-0
                w-[min(823px,calc(100%-32px))]
                -translate-x-1/2
                text-center
                font-[var(--font-sans)]
                text-[clamp(30px,3.34vw,48px)]
                font-bold
                leading-[clamp(38px,4.03vw,58px)]
                tracking-[-1px]
                text-[var(--color-neutral-100-uniform)]
                will-change-transform
              "
              style={{
                y: textY,
                opacity: textOpacity,
              }}
            >
              En ARCA Studio entendemos que cada proyecto representa una
              inversión importante y una decisión que impactará durante años.
              Por eso combinamos diseño, planificación y ejecución para
              desarrollar espacios funcionales, duraderos y cuidadosamente
              pensados para quienes los habitan.
            </Motion.p>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}

export default AboutStory;