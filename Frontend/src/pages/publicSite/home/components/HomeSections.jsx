import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  useReducedMotion,
} from "motion/react";

import {
  connectStatementPlayback,
} from "../../utils/statementVideoPlayback.js";

import {
  getHomeStatementVisualState,
} from "../../utils/homeScrollNavigation.js";

const STATEMENT_MASK_ID =
  "home-statement-video-mask";

const STATEMENT_FOCUS_LETTER = "c";

/*
 * Usamos exactamente el centro geométrico de la C.
 *
 * Antes estaba en 0.2, por lo que el zoom nacía
 * desde el costado izquierdo del glifo.
 */
const STATEMENT_FOCUS_HORIZONTAL_RATIO = 0.5;
const STATEMENT_FOCUS_VERTICAL_RATIO = 0.5;

function HomeStatementPanel({
  active = false,
  effectStarted = false,
  mediaEnabled = false,
  mp4Source,
  phrase,
  poster,
  progress,
  statementVisible = false,
  webmSource,
}) {
  const reduceMotion = useReducedMotion();

  const videoPlaying = !reduceMotion;

  const videoRef = useRef(null);

  const maskSvgRef = useRef(null);
  const maskGroupRef = useRef(null);
  const maskTextRef = useRef(null);
  const focusGlyphRef = useRef(null);

  /*
   * Toda la geometría permanece fuera de React.
   *
   * No necesitamos renderizar nuevamente el
   * componente mientras hacemos scroll.
   */
  const geometryRef = useRef({
    ready: false,

    focusX: 0,
    focusY: 0,

    centerX: 0,
    centerY: 0,
  });

  const [videoFailed, setVideoFailed] =
    useState(false);

  const focusLetterIndex = phrase
    .toLocaleLowerCase("es")
    .indexOf(STATEMENT_FOCUS_LETTER);

  /*
   * Aplica directamente una transformación SVG:
   *
   * 1. lleva la C al centro
   * 2. escala
   * 3. vuelve al sistema de coordenadas original
   *
   * Esto garantiza matemáticamente que la C
   * permanezca fija durante todo el zoom.
   */
  const renderMaskTransform = (
    currentProgress,
  ) => {
    const group = maskGroupRef.current;
    const geometry = geometryRef.current;

    if (
      !group ||
      !geometry.ready
    ) {
      return;
    }

    const {
      maskScale,
    } =
      getHomeStatementVisualState(
        currentProgress,
      );

    const {
      centerX,
      centerY,
      focusX,
      focusY,
    } = geometry;

    /*
     * La transformación se hace completamente
     * en coordenadas SVG.
     *
     * Nada de transform-origin CSS.
     */
    group.setAttribute(
      "transform",
      [
        `translate(${centerX} ${centerY})`,
        `scale(${maskScale})`,
        `translate(${-focusX} ${-focusY})`,
      ].join(" "),
    );
  };

  /*
   * Medición de la C.
   */
  useLayoutEffect(() => {
    const svg = maskSvgRef.current;
    const focusGlyph = focusGlyphRef.current;

    if (
      !svg ||
      !focusGlyph
    ) {
      return undefined;
    }

    let cancelled = false;

    const measureGeometry = () => {
      if (cancelled) {
        return;
      }

      const focusBounds =
        focusGlyph.getBBox();

      const svgBounds =
        svg.getBoundingClientRect();

      if (
        !focusBounds.width ||
        !focusBounds.height ||
        !svgBounds.width ||
        !svgBounds.height
      ) {
        return;
      }

      /*
       * Punto exacto dentro de la letra C.
       */
      const focusX =
        focusBounds.x +
        focusBounds.width *
          STATEMENT_FOCUS_HORIZONTAL_RATIO;

      const focusY =
        focusBounds.y +
        focusBounds.height *
          STATEMENT_FOCUS_VERTICAL_RATIO;

      /*
       * Centro real del viewport SVG.
       */
      const centerX =
        svg.clientWidth / 2;

      const centerY =
        svg.clientHeight / 2;

      geometryRef.current = {
        ready: true,

        focusX,
        focusY,

        centerX,
        centerY,
      };

      renderMaskTransform(
        progress.get(),
      );
    };

    measureGeometry();

    /*
     * La tipografía puede terminar de cargar
     * después del primer layout.
     */
    document.fonts?.ready
      .then(() => {
        if (!cancelled) {
          measureGeometry();
        }
      })
      .catch(() => undefined);

    const resizeObserver =
      new ResizeObserver(() => {
        measureGeometry();
      });

    resizeObserver.observe(svg);

    window.addEventListener(
      "resize",
      measureGeometry,
    );

    return () => {
      cancelled = true;

      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        measureGeometry,
      );
    };
  }, [
    phrase,
    progress,
  ]);

  /*
   * Actualizamos únicamente el atributo transform
   * del grupo SVG.
   *
   * No hacemos setState.
   * No provocamos renders React.
   * No usamos CSS scale.
   */
  useEffect(() => {
    renderMaskTransform(
      progress.get(),
    );

    const unsubscribe =
      progress.on(
        "change",
        (value) => {
          renderMaskTransform(value);
        },
      );

    return unsubscribe;
  }, [progress]);

  /*
   * Playback del video.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    return connectStatementPlayback(
      video,
      {
        active,
        enabled: mediaEnabled,
        playing: videoPlaying,
      },
    );
  }, [
    active,
    mediaEnabled,
    videoPlaying,
  ]);

  return (
    <section
      className="
        relative
        h-dvh
        w-full
        shrink-0
        overflow-hidden
        bg-[var(--color-neutral-950-uniform)]
      "
      aria-hidden={!active}
      data-home-panel
      data-home-statement-panel
      data-navbar-background="dark"
    >
      <img
        src={poster}
        alt=""
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          object-center
        "
        aria-hidden="true"
      />

      <video
        ref={videoRef}
        className={`
          absolute
          inset-0
          h-full
          w-full
          object-cover
          object-center

          ${
            videoFailed
              ? "hidden"
              : "block"
          }
        `}
        autoPlay={
          mediaEnabled &&
          videoPlaying
        }
        muted
        loop
        playsInline
        poster={poster}
        preload={
          mediaEnabled
            ? "auto"
            : "none"
        }
        onError={() =>
          setVideoFailed(true)
        }
        aria-hidden="true"
      >
        <source
          src={mp4Source}
          type="video/mp4"
        />

        <source
          src={webmSource}
          type="video/webm"
        />
      </video>

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[var(--color-neutral-950-uniform)]
          opacity-20
          mix-blend-multiply
        "
        aria-hidden="true"
      />

      <svg
        ref={maskSvgRef}
        className={`
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full

          ${
            effectStarted
              ? "visible"
              : "invisible"
          }
        `}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <mask
            id={STATEMENT_MASK_ID}
            x="0"
            y="0"
            width="100%"
            height="100%"
            maskUnits="userSpaceOnUse"
            className="[mask-type:luminance]"
          >
            <rect
              width="100%"
              height="100%"
              fill="white"
            />

            {/*
             * IMPORTANTE:
             *
             * Ahora TODO el movimiento ocurre
             * sobre este grupo SVG.
             *
             * La C se mantiene fijada al centro.
             */}
            <g ref={maskGroupRef}>
              <text
                ref={maskTextRef}
                x="50%"
                y="50%"
                dy="0.35em"
                textAnchor="middle"
                fill="black"
                className="
                  font-[var(--font-sans)]
                  text-[clamp(24px,3.2vw,46px)]
                  font-bold
                  tracking-[-1px]
                "
              >
                {focusLetterIndex < 0
                  ? phrase
                  : (
                    <>
                      {phrase.slice(
                        0,
                        focusLetterIndex,
                      )}

                      <tspan
                        ref={focusGlyphRef}
                      >
                        {
                          phrase[
                            focusLetterIndex
                          ]
                        }
                      </tspan>

                      {phrase.slice(
                        focusLetterIndex + 1,
                      )}
                    </>
                  )}
              </text>
            </g>
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="var(--color-neutral-950-uniform)"
          mask={`url(#${STATEMENT_MASK_ID})`}
        />
      </svg>

      <h2
        className="sr-only"
        aria-hidden={
          !statementVisible
        }
      >
        {phrase}
      </h2>
    </section>
  );
}

export default HomeStatementPanel;