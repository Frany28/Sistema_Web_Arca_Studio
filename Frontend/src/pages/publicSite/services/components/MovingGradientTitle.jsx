import { useRef } from "react";
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
  const textRef = useRef(null);

  return (
    <h2
      className={clsx("relative", className)}
      {...props}
    >
      <span ref={textRef} className="block text-[#FF4431]">
        {children}
      </span>
      <FigmaShaderFill
        className="pointer-events-none absolute inset-0"
        data-node-id="4462:2840"
        maskElementRef={textRef}
        params={MOVING_GRADIENT_PARAMS}
        render={renderMovingGradient}
        setup={setupMovingGradient}
      />
    </h2>
  );
}

export { MOVING_GRADIENT_PARAMS };
export default MovingGradientTitle;
