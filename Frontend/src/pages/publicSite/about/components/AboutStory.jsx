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

const IMAGE_ASPECT_RATIO = 4096 / 2731;

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
  /*
   * Cada línea entra progresivamente.
   * La siguiente comienza después de la anterior.
   */
  const lineEnterStart =
    0.22 + index * 0.035;

  const lineEnterEnd =
    lineEnterStart + 0.055;

  const opacity = useTransform(
    progress,
    [
      lineEnterStart,
      lineEnterEnd,
    ],
    [
      0,
      1,
    ],
  );

  const y = useTransform(
    progress,
    [
      lineEnterStart,
      lineEnterEnd,
    ],
    [
      18,
      0,
    ],
  );

  const blur = useTransform(
    progress,
    [
      lineEnterStart,
      lineEnterEnd,
    ],
    [
      "blur(4px)",
      "blur(0px)",
    ],
  );

  return (
    <Motion.p
      className="
        m-0
        w-full
        shrink-0
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
  const reduceMotion =
    useReducedMotion();

  const stageRef =
    useRef(null);

  const [stageSize, setStageSize] =
    useState(() => ({
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
   * Medimos el viewport real del
   * contenedor de Home.
   */
  useLayoutEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return undefined;
    }

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
   * =====================================================
   * TAMAÑO INICIAL
   * =====================================================
   *
   * La imagen ocupa toda la altura disponible,
   * pero mantiene su proporción 3:2.
   *
   * De esta manera NO queda estirada a todo el ancho.
   */

  const initialHeight = stageSize.height;

  const initialWidth =
  initialHeight * IMAGE_ASPECT_RATIO;

  /*
   * =====================================================
   * TAMAÑO FINAL
   * =====================================================
   *
   * Figma:
   * 1104 × 736
   */

  const finalWidth =
    stageSize.width >=
    FINAL_DESKTOP_WIDTH + 32
      ? FINAL_DESKTOP_WIDTH
      : Math.max(
          stageSize.width - 32,
          0,
        );

  const finalHeight =
    finalWidth *
    (
      FINAL_DESKTOP_HEIGHT /
      FINAL_DESKTOP_WIDTH
    );

  /*
   * =====================================================
   * TRANSFORMACIÓN DEL FRAME
   * =====================================================
   *
   * Hasta 0.76:
   * mantiene tamaño inicial.
   *
   * 0.76 → 0.94:
   * se reduce.
   *
   * 0.94 → 1:
   * tamaño final.
   */

  const frameWidth =
    useTransform(
      progress,
      [
        0,
        0.76,
        0.94,
        1,
      ],
      [
        initialWidth,
        initialWidth,
        finalWidth,
        finalWidth,
      ],
    );

  const frameHeight =
    useTransform(
      progress,
      [
        0,
        0.76,
        0.94,
        1,
      ],
      [
        initialHeight,
        initialHeight,
        finalHeight,
        finalHeight,
      ],
    );

  const imageRadius =
    useTransform(
      progress,
      [
        0,
        0.76,
        0.94,
        1,
      ],
      [
        "0px",
        "0px",
        "16px",
        "16px",
      ],
    );

  /*
   * =====================================================
   * BLUR
   * =====================================================
   */

const imageFilter = useTransform(
  progress,
  [
    0,
    0.08,
    0.16,
    0.26,
    0.60,
    0.70,
    0.80,
    1,
  ],
  [
    "blur(0px) brightness(1)",
    "blur(0px) brightness(1)",
    "blur(1.5px) brightness(0.94)",
    "blur(4px) brightness(0.72)",
    "blur(4px) brightness(0.72)",
    "blur(2px) brightness(0.86)",
    "blur(0px) brightness(1)",
    "blur(0px) brightness(1)",
  ],
);

const imageInnerScale = useTransform(
  progress,
  [
    0,
    0.12,
    0.28,
    0.62,
    0.8,
    1,
  ],
  [
    1,
    1,
    1.015,
    1.015,
    1,
    1,
  ],
);

const darkness = useTransform(
  progress,
  [
    0,
    0.08,
    0.18,
    0.28,
    0.60,
    0.70,
    0.82,
    1,
  ],
  [
    0,
    0,
    0.08,
    0.22,
    0.22,
    0.12,
    0,
    0,
  ],
);

  /*
   * =====================================================
   * CRÉDITOS
   * =====================================================
   *
   * El track COMPLETO comienza por debajo
   * del viewport.
   *
   * Conforme se hace scroll atraviesa la
   * pantalla y termina fuera por arriba.
   */

  const creditsTrackY =
    useTransform(
      progress,
      [
        0.18,
        0.76,
      ],
      [
        "115vh",
        "-125vh",
      ],
    );

  const creditsOpacity =
    useTransform(
      progress,
      [
        0.16,
        0.2,
        0.72,
        0.77,
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
      {/*
       * FRAME REAL DE LA IMAGEN.
       *
       * ESTE era el elemento que faltaba
       * actualmente en el repositorio.
       */}
      <Motion.div
      className="
        relative
        flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        will-change-[width,height,border-radius]
      "
        style={{
          width: reduceMotion
            ? finalWidth
            : frameWidth,

          height: reduceMotion
            ? finalHeight
            : frameHeight,

          borderRadius: reduceMotion
            ? "16px"
            : imageRadius,
        }}
      >
        {/*
         * FOTO
         */}
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
            object-center
            will-change-transform
          "
          style={{
            filter: imageFilter,
            scale: imageInnerScale,
          }}
        />

        {/*
         * CAPA OSCURA
         */}
        <Motion.div
          aria-hidden="true"
          className="
            absolute
            inset-0
            z-[1]
            bg-black
          "
          style={{
            opacity: darkness,
          }}
        />

        {/*
         * CRÉDITOS
         */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-10
            overflow-hidden
          "
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",

            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          <Motion.div
            className="
              absolute
              left-1/2
              top-0
              flex
              w-[min(900px,calc(100%-32px))]
              -translate-x-1/2
              flex-col
              items-center
              gap-[24px]
              py-[48px]
              will-change-transform
            "
            style={{
              y: creditsTrackY,
              opacity:
                creditsOpacity,
            }}
          >
            {ABOUT_CREDIT_LINES.map(
              (line, index) => (
                <CreditLine
                  key={`${index}-${line}`}
                  line={line}
                  index={index}
                  progress={progress}
                />
              ),
            )}
          </Motion.div>
        </div>
      </Motion.div>
    </div>
  );
}

export default AboutStory;