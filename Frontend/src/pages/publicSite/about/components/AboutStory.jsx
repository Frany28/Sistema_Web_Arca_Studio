import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  motion as Motion,
  useReducedMotion,
  useTransform,
} from "motion/react";

const FINAL_DESKTOP_WIDTH = 1104;
const FINAL_DESKTOP_HEIGHT = 736;
const ABOUT_CREDIT_LINES = [
  "En ARCA Studio entendemos que",
  "cada proyecto representa una",
  "inversión importante y una decisión",
  "que impactará durante años. Por eso",
  "combinamos diseño, planificación y",
  "ejecución para desarrollar espacios",
  "funcionales, duraderos y",
  "cuidadosamente pensados para",
  "quienes los habitan.",
];
function CreditLine({
  line,
  index,
  progress,
}) {
  const lineEnterStart = 0.19 + index * 0.028;
  const lineEnterEnd = lineEnterStart + 0.07;

  const opacity = useTransform(
    progress,
    [lineEnterStart, lineEnterEnd, lineEnterEnd + 0.12],
    [0, 1, 1],
  );

  const y = useTransform(
    progress,
    [lineEnterStart, lineEnterEnd],
    [28, 0],
  );

  const blur = useTransform(
    progress,
    [lineEnterStart, lineEnterEnd],
    ["blur(8px)", "blur(0px)"],
  );

  return (
    <Motion.p
      className="
        m-0
        w-full
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
        opacity,
        y,
        filter: blur,
      }}
    >
      {line}
    </Motion.p>
  );
}

function AboutStory({
  image,
  progress,
}) {
  const reduceMotion = useReducedMotion();

  const stageRef = useRef(null);

  const [stageSize, setStageSize] = useState(() => ({
    width:
      typeof window !== "undefined"
        ? window.innerWidth
        : 1440,

    height:
      typeof window !== "undefined"
        ? window.innerHeight
        : 960,
  }));

  /*
   * Medimos el viewport REAL del scroller.
   *
   * No usamos window.innerWidth directamente para renderizar
   * porque el contenedor del Home puede descontar scrollbar,
   * gutter, etc.
   */
  useLayoutEffect(() => {
    const stage = stageRef.current;

    if (!stage) return undefined;

    const updateSize = () => {
      const rect =
        stage.getBoundingClientRect();

      setStageSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize();

    const observer =
      new ResizeObserver(updateSize);

    observer.observe(stage);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Desktop:
   * final = 1104 × 736.
   *
   * En pantallas menores no dejamos que
   * desborde horizontalmente.
   */
  const finalWidth =
    stageSize.width >= FINAL_DESKTOP_WIDTH + 32
      ? FINAL_DESKTOP_WIDTH
      : Math.max(stageSize.width - 32, 0);

  const finalHeight =
    finalWidth *
    (FINAL_DESKTOP_HEIGHT /
      FINAL_DESKTOP_WIDTH);

  /*
   * ======================================================
   * GEOMETRÍA DE LA IMAGEN
   * ======================================================
   *
   * 0.00 → 0.76
   * pantalla completa.
   *
   * 0.76 → 0.94
   * se transforma progresivamente al tamaño final.
   *
   * 0.94 → 1
   * permanece exactamente en 1104 × 736.
   */

  const frameWidth = useTransform(
    progress,
    [0, 0.76, 0.94, 1],
    [
      stageSize.width,
      stageSize.width,
      finalWidth,
      finalWidth,
    ],
  );

  const frameHeight = useTransform(
    progress,
    [0, 0.76, 0.94, 1],
    [
      stageSize.height,
      stageSize.height,
      finalHeight,
      finalHeight,
    ],
  );

  const imageRadius = useTransform(
    progress,
    [0, 0.76, 0.94, 1],
    [
      "0px",
      "0px",
      "16px",
      "16px",
    ],
  );

  /*
   * ======================================================
   * BLUR / OSCURECIMIENTO
   * ======================================================
   */

  const imageFilter = useTransform(
    progress,
    [
      0,
      0.1,
      0.2,
      0.68,
      0.78,
      1,
    ],
    [
      "blur(0px) brightness(1)",
      "blur(0px) brightness(1)",
      "blur(6px) brightness(0.62)",
      "blur(6px) brightness(0.62)",
      "blur(0px) brightness(1)",
      "blur(0px) brightness(1)",
    ],
  );

  /*
   * Este pequeño zoom evita que al aplicar blur
   * aparezcan bordes transparentes.
   */
  const imageInnerScale = useTransform(
    progress,
    [0, 0.18, 0.68, 0.78],
    [1, 1.025, 1.025, 1],
  );

  const darkness = useTransform(
    progress,
    [
      0.08,
      0.18,
      0.68,
      0.78,
    ],
    [
      0,
      0.3,
      0.3,
      0,
    ],
  );

  /*
   * ======================================================
   * CRÉDITOS
   * ======================================================
   *
   * El texto comienza completamente debajo
   * de la pantalla y termina fuera por arriba.
   */

  const creditsTrackY = useTransform(
  progress,
  [0.18, 0.72],
  ["35%", "-72%"],
  );

  const creditsOpacity = useTransform(
  progress,
  [0.14, 0.18, 0.72, 0.78],
  [0, 1, 1, 0],
  );

  const textOpacity = useTransform(
    progress,
    [
      0.14,
      0.18,
      0.66,
      0.71,
    ],
    [
      0,
      1,
      1,
      0,
    ],
  );

  return (
    <div
      ref={stageRef}
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
          flex
          w-[min(900px,calc(100%-32px))]
          flex-col
          items-center
          gap-[24px]
          py-[48px]
          will-change-transform
        "
        style={{
          y: creditsTrackY,
          opacity: creditsOpacity,
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
          className="
            absolute
            inset-0
            bg-black
          "
          style={{
            opacity: darkness,
          }}
        />

        <div
  className="
    pointer-events-none
    absolute
    inset-0
    z-10
    overflow-hidden
    flex
    items-center
    justify-center
  "
>
    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        flex
        items-center
        justify-center
      "
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
      }}
    >
      <Motion.div
        className="
          flex
          w-[min(900px,calc(100%-32px))]
          flex-col
          items-center
          gap-[24px]
          will-change-transform
        "
        style={{
          y: creditsTrackY,
          opacity: creditsOpacity,
        }}
      >
        {ABOUT_CREDIT_LINES.map((line, index) => (
          <CreditLine
            key={`${index}-${line}`}
            line={line}
            index={index}
            progress={progress}
          />
        ))}
      </Motion.div>
    </div>
  </div>
      </Motion.div>
    </div>
  );
}

export default AboutStory;