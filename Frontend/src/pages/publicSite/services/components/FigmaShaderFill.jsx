import { useEffect, useRef } from "react";
import clsx from "clsx";
import { useReducedMotion } from "motion/react";

function FigmaShaderFill({ className, params, render, setup, ...props }) {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.gpu) {
      return undefined;
    }

    let animationFrame;
    let cancelled = false;
    let device;
    let frame;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    resizeCanvas();

    const start = async () => {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter || cancelled) {
        return;
      }

      device = await adapter.requestDevice();
      if (cancelled) return;

      const context = canvas.getContext("webgpu");
      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({
        device,
        format,
        alphaMode: "premultiplied",
      });

      frame = {
        output: context.getCurrentTexture(),
        params,
        state: {},
        time: 0,
      };
      setup(device, frame);

      const draw = (time) => {
        if (cancelled) return;

        frame.output = context.getCurrentTexture();
        frame.params = params;
        frame.time = time;
        render(device, frame);
        if (!reduceMotion) {
          animationFrame = window.requestAnimationFrame(draw);
        }
      };

      animationFrame = window.requestAnimationFrame(draw);
    };

    start().catch(() => {});

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      frame?.state?.depthTexture?.destroy?.();
      frame?.state?.msaaTexture?.destroy?.();
      frame?.state?.vertexBuffer?.destroy?.();
      frame?.state?.indexBuffer?.destroy?.();
      frame?.state?.uniformBuf?.destroy?.();
      device?.destroy?.();
    };
  }, [params, reduceMotion, render, setup]);

  return (
    <canvas
      ref={canvasRef}
      className={clsx("block size-full", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export default FigmaShaderFill;
