import { useEffect, useRef, useState } from "react";

import "../../../config/modelViewer.js";
import { getModel3DSource } from "../../../utils/model3DThumbnail.js";

export default function Model3DThumbnail({ alt = "Modelo 3D", className, item }) {
  const modelSrc = getModel3DSource(item);
  const modelViewerRef = useRef(null);
  const [failedSource, setFailedSource] = useState("");

  useEffect(() => {
    const modelViewer = modelViewerRef.current;

    if (!modelViewer || !modelSrc) {
      return undefined;
    }

    function handleError() {
      setFailedSource(modelSrc);
    }

    modelViewer.addEventListener("error", handleError);

    return () => {
      modelViewer.removeEventListener("error", handleError);
    };
  }, [modelSrc]);

  if (item?.image) {
    return (
      <img
        src={item.image}
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
    <model-viewer
      ref={modelViewerRef}
      src={modelSrc}
      alt={alt}
      with-credentials
      class={className}
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
    />
  );
}
