import { useEffect, useRef, useState } from "react";
import "@google/model-viewer";

import { getModel3DSource } from "../../../utils/model3DThumbnail.js";

const modelThumbnailCache = new Map();

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("error", () => reject(reader.error), { once: true });
    reader.addEventListener("load", () => resolve(String(reader.result || "")), {
      once: true,
    });
    reader.readAsDataURL(blob);
  });
}

export default function Model3DThumbnail({ alt = "Modelo 3D", className, item }) {
  const modelSrc = getModel3DSource(item);
  const modelViewerRef = useRef(null);
  const [capture, setCapture] = useState({ source: "", thumbnail: "" });
  const [failedSource, setFailedSource] = useState("");
  const generatedThumbnail =
    modelThumbnailCache.get(modelSrc) ||
    (capture.source === modelSrc ? capture.thumbnail : "");

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    let cancelled = false;

    if (!modelViewer || !modelSrc) {
      return undefined;
    }

    function handleError() {
      setFailedSource(modelSrc);
    }

    async function handleLoad() {
      try {
        const thumbnailBlob = await modelViewer.toBlob?.({
          mimeType: "image/webp",
          qualityArgument: 0.82,
        });
        const thumbnail = thumbnailBlob
          ? await blobToDataUrl(thumbnailBlob)
          : "";

        if (!cancelled && thumbnail) {
          modelThumbnailCache.set(modelSrc, thumbnail);
          setCapture({ source: modelSrc, thumbnail });
        }
      } catch {
        // Keep the loaded static model as the visual fallback.
      }
    }

    modelViewer.addEventListener("error", handleError);
    modelViewer.addEventListener("load", handleLoad);

    if (modelViewer.loaded) {
      handleLoad();
    }

    return () => {
      cancelled = true;
      modelViewer.removeEventListener("error", handleError);
      modelViewer.removeEventListener("load", handleLoad);
    };
  }, [modelSrc]);

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
      <model-viewer
        ref={modelViewerRef}
        src={modelSrc}
        alt={alt}
        with-credentials
        class="absolute inset-0 size-full"
        camera-orbit="35deg 72deg 105%"
        field-of-view="30deg"
        interaction-prompt="none"
        loading="eager"
        reveal="auto"
        shadow-intensity="1"
        shadow-softness="0.8"
        exposure="1"
        tone-mapping="neutral"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, #3b3b3b 0%, #232323 48%, #101010 100%)",
          display: "block",
          height: "100%",
          width: "100%",
        }}
      />
    </span>
  );
}
