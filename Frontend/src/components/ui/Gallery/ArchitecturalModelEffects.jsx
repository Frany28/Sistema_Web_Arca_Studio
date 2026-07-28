import { useEffect, useRef } from "react";

import {
  ARCHITECTURAL_PROFILES,
  classifyArchitecturalMaterial,
  detectAdaptiveRenderQuality,
} from "../../../utils/architecturalRendering.js";

export default function ArchitecturalModelEffects({ settings }) {
  const composerRef = useRef(null);
  const quality = detectAdaptiveRenderQuality();
  const profile =
    ARCHITECTURAL_PROFILES[settings?.profile] ||
    ARCHITECTURAL_PROFILES.exterior;

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return undefined;
    const updateSelection = () => {
      const bloom = composer.querySelector("selective-bloom-effect");
      if (!bloom) return;
      bloom.selection = [...(composer.selection || [])].filter((object) => {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material].filter(Boolean);
        return materials.some(
          (material) =>
            classifyArchitecturalMaterial(material?.name) === "emissive" ||
            Number(material?.emissiveIntensity || 0) > 0,
        );
      });
    };
    composer.addEventListener("updated-selection", updateSelection);
    composer.addEventListener("update-selection", updateSelection);
    return () => {
      composer.removeEventListener("updated-selection", updateSelection);
      composer.removeEventListener("update-selection", updateSelection);
    };
  }, []);

  return (
    <effect-composer
      ref={composerRef}
      render-mode={quality === "ultra" ? "quality" : "performance"}
      msaa="0"
    >
      <ssao-effect
        blend-mode={quality === "low" ? "skip" : "default"}
        strength={quality === "ultra" ? profile.ssao : profile.ssao * 0.65}
      />
      <selective-bloom-effect
        blend-mode={quality === "low" ? "skip" : "default"}
        strength={profile.bloom}
        radius="0.55"
        threshold="0.72"
        smoothing="0.08"
      />
      <smaa-effect quality={quality === "ultra" ? "high" : "medium"} />
      <color-grade-effect
        tonemapping="aces_filmic"
        contrast={settings?.profile === "night" ? "0.12" : "0.08"}
        saturation="0.06"
      />
    </effect-composer>
  );
}
