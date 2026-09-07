import { useId } from "react";
import clsx from "clsx";

import FigmaShaderFill from "./FigmaShaderFill.jsx";
import {
  render as renderMovingGradient,
  setup as setupMovingGradient,
} from "./movingGradientShader.js";

const MOVING_GRADIENT_PARAMS = Object.freeze({
  intensity: 2.009999990463257,
  gradient: {
    stops: [
      {
        position: 0,
        color: { r: 1, g: 0.2666666805744171, b: 0.1921568661928177, a: 1 },
      },
      {
        position: 0.5,
        color: { r: 1, g: 0.2666666805744171, b: 0.1921568661928177, a: 1 },
      },
      {
        position: 1,
        color: {
          r: 0.16470588743686676,
          g: 0.16078431904315948,
          b: 0.16078431904315948,
          a: 1,
        },
      },
    ],
  },
  gradientBalance: 0,
  material: 0,
  morphSpeed: 3.740000009536743,
  detail: 0,
  twist: 4.059999942779541,
  zoom: 73,
  gradientMethod: 1,
  warp: 0.25999999046325684,
  rotationSpeed: 12,
});

function MovingGradientTitle({ children, className, ...props }) {
  const maskId = `moving-gradient-title-${useId().replaceAll(":", "")}`;

  return (
    <h2 className={clsx("relative", className)} {...props}>
      <span className="block bg-[linear-gradient(90deg,var(--color-accent-300),var(--color-primary-300),var(--color-accent-300))] bg-clip-text text-transparent">
        {children}
      </span>

      <svg
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <foreignObject x="0" y="0" width="100%" height="100%">
              <div className="flex size-full items-center justify-center text-center text-white">
                {children}
              </div>
            </foreignObject>
          </mask>
        </defs>

        <foreignObject
          x="0"
          y="0"
          width="100%"
          height="100%"
          mask={`url(#${maskId})`}
          data-node-id="4462:2840"
        >
          <FigmaShaderFill
            className="size-full"
            params={MOVING_GRADIENT_PARAMS}
            render={renderMovingGradient}
            setup={setupMovingGradient}
          />
        </foreignObject>
      </svg>
    </h2>
  );
}

export { MOVING_GRADIENT_PARAMS };
export default MovingGradientTitle;
