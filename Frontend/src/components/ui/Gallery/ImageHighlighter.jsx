import { useState } from "react";

export default function ImageHighlighter({ imageSrc }) {
  const [isActive, setIsActive] = useState(false);
  const [highlight, setHighlight] = useState(null);

  const getPointerPosition = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    return {
      x: Math.min(Math.max(mouseX, 0), rect.width),
      y: Math.min(Math.max(mouseY, 0), rect.height),
    };
  };

  const handleClick = (e) => {
    const { x, y } = getPointerPosition(e);

    if (isActive) {
      setIsActive(false);
      setHighlight(null);
    } else {
      setIsActive(true);
      setHighlight({
        startX: x,
        startY: y,
        x,
        y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isActive || !highlight) return;
    const { x, y } = getPointerPosition(e);

    setHighlight((prev) => ({
      ...prev,
      x,
      y,
    }));
  };

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

  return (
    <div
      className="relative w-full h-full select-none"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      <img src={imageSrc} alt="Render" className="w-full h-full object-cover" />

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
          <div
            className="absolute pointer-events-none"
            style={{
              top: box.y1,
              left: box.x1,
              width: box.width,
              height: box.height,
              borderRadius: "var(--radius-radius-2, 8px)",
              background: "transparent",
              border:
                "var(--stroke-stroke-2, 4px) solid var(--Color-accent-300, #FF4431)",
              boxSizing: "border-box",
              boxShadow:
                "0 0 5px 0 rgba(0,0,0,0.10)",
            }}
          />
        </>
      )}
    </div>
  );
}
