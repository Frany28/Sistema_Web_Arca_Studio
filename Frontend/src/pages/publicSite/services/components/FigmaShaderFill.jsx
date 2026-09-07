import { useEffect, useRef } from "react";
import clsx from "clsx";
import { useReducedMotion } from "motion/react";

function readTextLines(element, containerBounds) {
  const textNode = element?.firstChild;
  const text = textNode?.textContent ?? "";
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE || !text.trim()) return [];

  const lines = [];
  for (const match of text.matchAll(/\S+/g)) {
    const range = document.createRange();
    const start = match.index;
    const end = start + match[0].length;
    range.setStart(textNode, start);
    range.setEnd(textNode, end);
    const bounds = range.getBoundingClientRect();
    const previousLine = lines.at(-1);

    if (!previousLine || Math.abs(previousLine.top - bounds.top) > 2) {
      lines.push({
        bottom: bounds.bottom - containerBounds.top,
        left: bounds.left - containerBounds.left,
        right: bounds.right - containerBounds.left,
        start,
        end,
        top: bounds.top,
      });
    } else {
      previousLine.right = bounds.right - containerBounds.left;
      previousLine.bottom = Math.max(
        previousLine.bottom,
        bounds.bottom - containerBounds.top,
      );
      previousLine.end = end;
    }
  }

  return lines.map((line) => ({
    ...line,
    text: text.slice(line.start, line.end),
  }));
}

function paintTextMask(context, canvas, maskElement, pixelRatio) {
  const canvasBounds = canvas.getBoundingClientRect();
  const computed = window.getComputedStyle(maskElement);
  const lines = readTextLines(maskElement, canvasBounds);

  context.globalCompositeOperation = "destination-in";
  context.fillStyle = "#fff";
  context.font = [
    computed.fontStyle,
    computed.fontVariant,
    computed.fontWeight,
    computed.fontSize,
    computed.fontFamily,
  ].join(" ");
  context.fontKerning = computed.fontKerning;
  if ("letterSpacing" in context) context.letterSpacing = computed.letterSpacing;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  lines.forEach((line) => {
    const metrics = context.measureText(line.text);
    const ascent = metrics.actualBoundingBoxAscent;
    const descent = metrics.actualBoundingBoxDescent;
    const lineHeight = line.bottom - (line.top - canvasBounds.top);
    const baseline =
      line.top - canvasBounds.top + (lineHeight + ascent - descent) / 2;

    context.fillText(line.text, (line.left + line.right) / 2, baseline);
  });
}

function FigmaShaderFill({
  className,
  maskElementRef,
  params,
  render,
  setup,
  ...props
}) {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const maskElement = maskElementRef.current;
    if (!canvas || !maskElement || !navigator.gpu) return undefined;

    const shaderCanvas = document.createElement("canvas");
    const outputContext = canvas.getContext("2d");
    const gpuContext = shaderCanvas.getContext("webgpu");
    if (!outputContext || !gpuContext) return undefined;

    let animationFrame;
    let cancelled = false;
    let device;
    let frame;
    let pixelRatio = 1;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));
      canvas.width = width;
      canvas.height = height;
      shaderCanvas.width = width;
      shaderCanvas.height = height;
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    resizeObserver.observe(maskElement);
    resizeCanvas();

    const start = async () => {
      await document.fonts.ready;
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter || cancelled) return;

      device = await adapter.requestDevice();
      if (cancelled) return;

      const format = navigator.gpu.getPreferredCanvasFormat();
      gpuContext.configure({ device, format, alphaMode: "premultiplied" });
      frame = {
        output: gpuContext.getCurrentTexture(),
        params,
        state: {},
        time: 0,
      };
      setup(device, frame);

      const draw = (time) => {
        if (cancelled) return;

        frame.output = gpuContext.getCurrentTexture();
        frame.time = time;
        render(device, frame);

        outputContext.setTransform(1, 0, 0, 1, 0, 0);
        outputContext.globalCompositeOperation = "source-over";
        outputContext.clearRect(0, 0, canvas.width, canvas.height);
        outputContext.drawImage(shaderCanvas, 0, 0);
        paintTextMask(outputContext, canvas, maskElement, pixelRatio);

        if (!reduceMotion) animationFrame = window.requestAnimationFrame(draw);
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
  }, [maskElementRef, params, reduceMotion, render, setup]);

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
