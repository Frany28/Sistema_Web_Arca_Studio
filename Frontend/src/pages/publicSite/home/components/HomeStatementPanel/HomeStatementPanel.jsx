import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useReducedMotion } from "motion/react";

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
 * IMPORTANTE:
 *
 * El centro geométrico de una C no coincide con
 * su centro óptico.
 *
 * Queremos que la cámara esté dentro de la
 * abertura de la C.
 */
const STATEMENT_FOCUS_X_RATIO = 0.68;
const STATEMENT_FOCUS_Y_RATIO = 0.5;

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

  const svgRef = useRef(null);
  const transformGroupRef = useRef(null);
  const focusGlyphRef = useRef(null);

  const geometryRef = useRef({
    ready: false,

    focusX: 0,
    focusY: 0,

    viewportCenterX: 0,
    viewportCenterY: 0,
  });

  const [videoFailed, setVideoFailed] =
    useState(false);

  const focusLetterIndex = phrase
    .toLocaleLowerCase("es")
    .indexOf(STATEMENT_FOCUS_LETTER);

  const applyTransform = (value) => {
    const group =
      transformGroupRef.current;

    const geometry =
      geometryRef.current;

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
        value,
      );

    const {
      focusX,
      focusY,
      viewportCenterX,
      viewportCenterY,
    } = geometry;

    /*
     * Transformación exacta alrededor del
     * punto óptico de la C.
     *
     * El punto:
     *
     *     focusX / focusY
     *
     * siempre termina exactamente en:
     *
     *     viewportCenterX / viewportCenterY
     *
     * independientemente del scale.
     */
    const translateX =
      viewportCenterX -
      focusX * maskScale;

    const translateY =
      viewportCenterY -
      focusY * maskScale;

    group.setAttribute(
      "transform",
      `matrix(${maskScale} 0 0 ${maskScale} ${translateX} ${translateY})`,
    );
  };

  useLayoutEffect(() => {
    const svg =
      svgRef.current;

    const focusGlyph =
      focusGlyphRef.current;

    if (
      !svg ||
      !focusGlyph
    ) {
      return undefined;
    }

    let cancelled = false;

    const measure = () => {
      if (cancelled) {
        return;
      }

      const glyphBounds =
        focusGlyph.getBBox();

      const width =
        svg.clientWidth;

      const height =
        svg.clientHeight;

      if (
        !glyphBounds.width ||
        !glyphBounds.height ||
        !width ||
        !height
      ) {
        return;
      }

      /*
       * No usamos el centro del bbox.
       *
       * Movemos el foco hacia la abertura
       * interna de la C.
       */
      const focusX =
        glyphBounds.x +
        glyphBounds.width *
          STATEMENT_FOCUS_X_RATIO;

      const focusY =
        glyphBounds.y +
        glyphBounds.height *
          STATEMENT_FOCUS_Y_RATIO;

      geometryRef.current = {
        ready: true,

        focusX,
        focusY,

        viewportCenterX:
          width / 2,

        viewportCenterY:
          height / 2,
      };

      applyTransform(
        progress.get(),
      );
    };

    measure();

    document.fonts?.ready
      .then(measure)
      .catch(() => undefined);

    const resizeObserver =
      new ResizeObserver(
        measure,
      );

    resizeObserver.observe(svg);

    return () => {
      cancelled = true;

      resizeObserver.disconnect();
    };
  }, [
    phrase,
    progress,
  ]);

  useEffect(() => {
    applyTransform(
      progress.get(),
    );

    const unsubscribe =
      progress.on(
        "change",
        applyTransform,
      );

    return unsubscribe;
  }, [progress]);

  useEffect(() => {
    const video =
      videoRef.current;

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
        ref={svgRef}
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        preserveAspectRatio="none"
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
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="white"
            />

            <g
              ref={
                transformGroupRef
              }
            >
              <text
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
                {focusLetterIndex <
                0 ? (
                  phrase
                ) : (
                  <>
                    {phrase.slice(
                      0,
                      focusLetterIndex,
                    )}

                    <tspan
                      ref={
                        focusGlyphRef
                      }
                    >
                      {
                        phrase[
                          focusLetterIndex
                        ]
                      }
                    </tspan>

                    {phrase.slice(
                      focusLetterIndex +
                        1,
                    )}
                  </>
                )}
              </text>
            </g>
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
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