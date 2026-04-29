import { useState } from "react";

export default function ImageHighlighter({ imageSrc }) {
  const [isActive, setIsActive] = useState(false);
  const [highlight, setHighlight] = useState(null);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isActive) {
      setIsActive(false);
      setHighlight(null);
    } else {
      setIsActive(true);
      setHighlight({
        startX: mouseX,
        startY: mouseY,
        x: mouseX,
        y: mouseY,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isActive || !highlight) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setHighlight((prev) => ({
      ...prev,
      x: mouseX,
      y: mouseY,
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

  return (
    <div
      className="relative w-full h-full select-none"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      <img src={imageSrc} alt="Render" className="w-full h-full object-cover" />

      {isActive && box && (
        <>
          {/* Overlay gris dividido en 4 para que no invada el cuadro */}
          <div
            className="absolute left-0 right-0 bg-[rgba(0,0,0,0.3)] pointer-events-none"
            style={{ top: 0, height: box.y1 }}
          />
          <div
            className="absolute left-0 right-0 bg-[rgba(0,0,0,0.3)] pointer-events-none"
            style={{ top: box.y2, height: `calc(100% - ${box.y2}px)` }}
          />
          <div
            className="absolute bg-[rgba(0,0,0,0.3)] pointer-events-none"
            style={{ top: box.y1, left: 0, width: box.x1, height: box.height }}
          />
          <div
            className="absolute bg-[rgba(0,0,0,0.3)] pointer-events-none"
            style={{
              top: box.y1,
              left: box.x2,
              width: `calc(100% - ${box.x2}px)`,
              height: box.height,
            }}
          />

          {/* Borde rojo estrictamente dentro del cuadro */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: box.y1,
              left: box.x1,
              width: box.width,
              height: box.height,
              borderRadius: "var(--radius-radius-2, 8px)",
              border:
                "var(--stroke-stroke-2, 4px) solid var(--Color-accent-300, #FF4431)",
              boxSizing: "border-box",
              background: "transparent",
              boxShadow: "0 0 5px 0 rgba(0,0,0,0.10)",
            }}
          />
        </>
      )}
    </div>
  );
}
