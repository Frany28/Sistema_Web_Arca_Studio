import {
  motion as Motion,
  useReducedMotion,
  useTransform,
} from "motion/react";

function AboutStory({
  image,
  progress,
}) {
  const reduceMotion = useReducedMotion();

  /*
   * 0.00 - 0.12  imagen limpia
   * 0.12 - 0.20  entra oscuridad / blur
   * 0.18 - 0.68  créditos
   * 0.68 - 0.78  salen créditos + vuelve nitidez
   * 0.78 - 0.94  imagen se reduce
   * 0.94 - 1.00  estado final
   */

  const imageFilter = useTransform(
    progress,
    [0, 0.1, 0.2, 0.68, 0.78, 1],
    [
      "blur(0px) brightness(1)",
      "blur(0px) brightness(1)",
      "blur(6px) brightness(0.62)",
      "blur(6px) brightness(0.62)",
      "blur(0px) brightness(1)",
      "blur(0px) brightness(1)",
    ],
  );

  const imageInnerScale = useTransform(
    progress,
    [0, 0.18, 0.68, 0.78],
    [1, 1.025, 1.025, 1],
  );

  const darkness = useTransform(
    progress,
    [0.08, 0.18, 0.68, 0.78],
    [0, 0.3, 0.3, 0],
  );

  /*
   * El texto empieza completamente debajo del viewport
   * y termina completamente fuera por arriba.
   */
  const textY = useTransform(
    progress,
    [0.16, 0.68],
    ["0vh", "-160vh"],
  );

  const textOpacity = useTransform(
    progress,
    [0.14, 0.18, 0.66, 0.71],
    [0, 1, 1, 0],
  );

  /*
   * Figma/video:
   * 1440 → 1104
   * 1104 / 1440 = 0.766666...
   */
  const imageScale = useTransform(
    progress,
    [0.76, 0.94],
    [1, 0.7667],
  );

  const imageRadius = useTransform(
    progress,
    [0.76, 0.94],
    ["0px", "16px"],
  );

  return (
    <div
      data-about-story
      className="
        relative
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
          aspect-[4096/2731]
          w-full
          max-w-[1440px]
          overflow-hidden
          will-change-transform
        "
        style={{
          scale: reduceMotion ? 1 : imageScale,
          borderRadius: imageRadius,
        }}
      >
        <Motion.img
          src={image}
          alt=""
          aria-hidden="true"
          className="
            absolute
            inset-0
            size-full
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
              top-full
              m-0
              w-[min(823px,calc(100%-32px))]
              -translate-x-1/2
              text-center
              font-[var(--font-sans)]
              text-[48px]
              font-bold
              leading-[58px]
              tracking-[-1px]
              text-[var(--color-neutral-100-uniform)]
              max-[767px]:text-[30px]
              max-[767px]:leading-[38px]
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
  );
}

export default AboutStory;