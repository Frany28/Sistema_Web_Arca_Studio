import { useEffect, useRef, useState } from "react";

const MIN_SELECTION_SIZE = 8;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getNaturalSelection(box, imageElement, containerRect) {
  const naturalWidth = imageElement?.naturalWidth || containerRect.width;
  const naturalHeight = imageElement?.naturalHeight || containerRect.height;
  const scale = Math.max(
    containerRect.width / naturalWidth,
    containerRect.height / naturalHeight,
  );
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;
  const offsetX = (containerRect.width - renderedWidth) / 2;
  const offsetY = (containerRect.height - renderedHeight) / 2;

  const x = clamp((box.x1 - offsetX) / scale, 0, naturalWidth);
  const y = clamp((box.y1 - offsetY) / scale, 0, naturalHeight);
  const x2 = clamp((box.x2 - offsetX) / scale, 0, naturalWidth);
  const y2 = clamp((box.y2 - offsetY) / scale, 0, naturalHeight);

  return {
    height: Math.round(Math.max(y2 - y, 0)),
    width: Math.round(Math.max(x2 - x, 0)),
    x: Math.round(x),
    y: Math.round(y),
  };
}

function getRenderedBoxFromNatural(selection, layout) {
  const natural = selection?.imagePixels;

  if (!natural || !layout?.width || !layout?.height) {
    return null;
  }

  const naturalWidth = selection.naturalSize?.width || layout.naturalWidth;
  const naturalHeight = selection.naturalSize?.height || layout.naturalHeight;

  if (!naturalWidth || !naturalHeight) {
    return null;
  }

  const scale = Math.max(
    layout.width / naturalWidth,
    layout.height / naturalHeight,
  );
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;
  const offsetX = (layout.width - renderedWidth) / 2;
  const offsetY = (layout.height - renderedHeight) / 2;

  return {
    height: natural.height * scale,
    width: natural.width * scale,
    x1: natural.x * scale + offsetX,
    y1: natural.y * scale + offsetY,
  };
}

function SelectionBox({ box, subtle = false }) {
  if (!box) {
    return null;
  }

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: box.y1,
        left: box.x1,
        width: box.width,
        height: box.height,
        borderRadius: "var(--radius-radius-2, 8px)",
        background: "transparent",
        border: subtle
          ? "2px solid rgba(255,68,49,0.78)"
          : "var(--stroke-stroke-2, 4px) solid var(--Color-accent-300, #FF4431)",
        boxSizing: "border-box",
        boxShadow: "0 0 5px 0 rgba(0,0,0,0.10)",
      }}
    />
  );
}

export default function ImageHighlighter({
  annotations = [],
  imageSrc,
  onSelectionChange,
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [layout, setLayout] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [highlight, setHighlight] = useState(null);

  const updateLayout = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const imageElement = imageRef.current;

    if (!containerRect || !imageElement) {
      return;
    }

    setLayout({
      height: containerRect.height,
      naturalHeight: imageElement.naturalHeight || containerRect.height,
      naturalWidth: imageElement.naturalWidth || containerRect.width,
      width: containerRect.width,
    });
  };

  const getPointerPosition = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    return {
      x: Math.min(Math.max(mouseX, 0), rect.width),
      y: Math.min(Math.max(mouseY, 0), rect.height),
    };
  };

  const handlePointerDown = (event) => {
    const { x, y } = getPointerPosition(event);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsActive(true);
    setHighlight({
      startX: x,
      startY: y,
      x,
      y,
    });
  };

  const handlePointerMove = (event) => {
    if (!isActive || !highlight) return;
    const { x, y } = getPointerPosition(event);

    setHighlight((prev) => ({
      ...prev,
      x,
      y,
    }));
  };

  const handlePointerUp = (event) => {
    const box = getBox();
    const containerRect = containerRef.current?.getBoundingClientRect();
    const imageElement = imageRef.current;

    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (
      box &&
      containerRect &&
      imageElement &&
      box.width >= MIN_SELECTION_SIZE &&
      box.height >= MIN_SELECTION_SIZE
    ) {
      onSelectionChange?.({
        displayPixels: {
          height: Math.round(box.height),
          width: Math.round(box.width),
          x: Math.round(box.x1),
          y: Math.round(box.y1),
        },
        imagePixels: getNaturalSelection(box, imageElement, containerRect),
        naturalSize: {
          height: imageElement.naturalHeight || Math.round(containerRect.height),
          width: imageElement.naturalWidth || Math.round(containerRect.width),
        },
      });
    }

    setIsActive(false);
    setHighlight(null);
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!container || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      updateLayout();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const getBox = () => {
    if (!highlight) return null;
    const x1 = Math.min(highlight.startX, highlight.x);
    const y1 = Math.min(highlight.startY, highlight.y);
    const x2 = Math.max(highlight.startX, highlight.x);
    const y2 = Math.max(highlight.startY, highlight.y);
    return { x1, y1, x2, y2, width: x2 - x1, height: y2 - y1 };
  };

  const box = getBox();
  const borderWidth = 4;
  const innerBox = box
    ? {
        x1: Math.min(box.x1 + borderWidth, box.x2),
        y1: Math.min(box.y1 + borderWidth, box.y2),
        x2: Math.max(box.x2 - borderWidth, box.x1),
        y2: Math.max(box.y2 - borderWidth, box.y1),
        width: Math.max(box.width - borderWidth * 2, 0),
        height: Math.max(box.height - borderWidth * 2, 0),
      }
    : null;
  const renderedAnnotations =
    annotations.length > 0 && layout
      ? annotations
          .map((annotation) =>
            getRenderedBoxFromNatural(annotation.selection, layout),
          )
          .filter(Boolean)
      : [];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        setIsActive(false);
        setHighlight(null);
      }}
    >
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Render"
        className="w-full h-full object-cover"
        draggable={false}
        onLoad={updateLayout}
      />

      {renderedAnnotations.map((annotationBox, index) => (
        <SelectionBox
          key={`annotation-${index}-${annotationBox.x1}-${annotationBox.y1}`}
          box={annotationBox}
          subtle
        />
      ))}

      {isActive && box && innerBox && (
        <>
          {/* Overlay gris dividido en 4 para que no invada el cuadro */}
          <div
            className="absolute left-0 right-0 bg-[rgba(0,0,0,0.3)] pointer-events-none"
            style={{ top: 0, height: innerBox.y1 }}
          />
          <div
            className="absolute left-0 right-0 bg-[rgba(0,0,0,0.3)] pointer-events-none"
            style={{
              top: innerBox.y2,
              height: `calc(100% - ${innerBox.y2}px)`,
            }}
          />
          <div
            className="absolute bg-[rgba(0,0,0,0.3)] pointer-events-none"
            style={{
              top: innerBox.y1,
              left: 0,
              width: innerBox.x1,
              height: innerBox.height,
            }}
          />
          <div
            className="absolute bg-[rgba(0,0,0,0.3)] pointer-events-none"
            style={{
              top: innerBox.y1,
              left: innerBox.x2,
              width: `calc(100% - ${innerBox.x2}px)`,
              height: innerBox.height,
            }}
          />

          {/* El hueco transparente empieza dentro del borde rojo. */}
          <SelectionBox box={box} />
        </>
      )}
    </div>
  );
}
