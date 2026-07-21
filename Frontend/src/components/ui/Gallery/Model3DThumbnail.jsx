import { useState } from "react";
import "@google/model-viewer";

import { getModel3DSource } from "../../../utils/model3DThumbnail.js";
import Loader from "../Loader/Loader.jsx";

const modelThumbnailCache = new Map();

export default function Model3DThumbnail({ alt = "Modelo 3D", className, item }) {
  const modelSrc = getModel3DSource(item);
  const [capture, setCapture] = useState({ source: "", thumbnail: "" });
  const [failedSource, setFailedSource] = useState("");
  const [loadedSource, setLoadedSource] = useState("");
  const generatedThumbnail =
    modelThumbnailCache.get(modelSrc) ||
    (capture.source === modelSrc ? capture.thumbnail : "");

  if (item?.image || generatedThumbnail) {
    return (
      <img
        src={item?.image || generatedThumbnail}
        alt={alt}
        className={className}
      />
    );
  }

  if (!modelSrc || failedSource === modelSrc) {
    return (
      <span
        className={`${className || ""} flex items-center justify-center bg-[radial-gradient(circle_at_50%_38%,#3a3a3a_0%,#171717_68%)] text-heading-8 text-[var(--color-neutral-100-uniform)]`}
        aria-label={alt}
      >
        Modelo 3D
      </span>
    );
  }

  return (
    <span className={`${className || ""} relative block overflow-hidden`}>
      {loadedSource !== modelSrc ? (
        <Loader
          preset="modelThumbnail"
          label={`Cargando ${alt}`}
          className="absolute inset-0 z-[1] bg-[var(--color-neutral-10)]"
        />
      ) : null}
      <model-viewer
      src={modelSrc}
      alt={alt}
      class="size-full"
      camera-orbit="35deg 72deg 105%"
      field-of-view="30deg"
      interaction-prompt="none"
      loading="lazy"
      reveal="auto"
      shadow-intensity="1"
      shadow-softness="0.8"
      exposure="1"
      tone-mapping="neutral"
      style={{
        background:
          "radial-gradient(circle at 50% 38%, #3b3b3b 0%, #232323 48%, #101010 100%)",
        display: "block",
      }}
      onError={() => setFailedSource(modelSrc)}
      onLoad={(event) => {
        const modelViewer = event.currentTarget;
        setLoadedSource(modelSrc);

        try {
          const thumbnail = modelViewer.toDataURL?.("image/webp", 0.82);

          if (thumbnail) {
            modelThumbnailCache.set(modelSrc, thumbnail);
            setCapture({ source: modelSrc, thumbnail });
          }
        } catch {
          // Keep the loaded static model as the visual fallback.
        }
      }}
      />
    </span>
  );
}
