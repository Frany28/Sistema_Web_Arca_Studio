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
      const ssao = composer.querySelector("ssao-effect");
      const smaa = composer.querySelector("smaa-effect");
      if (!bloom) return;
      const sceneSelection = [...(composer.selection || [])];
      bloom.selection = sceneSelection.filter((object) => {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material].filter(Boolean);
        return materials.some((material) => {
          const emissive = material?.emissive;
          const hasVisibleEmission =
            Number(material?.emissiveIntensity || 0) > 0 &&
            Number(emissive?.r || 0) +
              Number(emissive?.g || 0) +
              Number(emissive?.b || 0) >
              0.03;
          return (
            classifyArchitecturalMaterial(material?.name) === "emissive" ||
            hasVisibleEmission
          );
        });
      });
      const isLargeArchitecturalModel = sceneSelection.length > 900;
      if (ssao) {
        ssao.blendMode =
          quality === "low" || isLargeArchitecturalModel ? "skip" : "default";
      }
      if (smaa) {
        smaa.blendMode = isLargeArchitecturalModel ? "skip" : "default";
      }
      bloom.blendMode =
        bloom.selection.length === 0 || quality === "low" ? "skip" : "default";
      bloom.strength = isLargeArchitecturalModel
        ? Math.min(profile.bloom, 0.22)
        : profile.bloom;
      composer.queueRender?.();
    };
    composer.addEventListener("updated-selection", updateSelection);
    composer.addEventListener("update-selection", updateSelection);
    return () => {
      composer.removeEventListener("updated-selection", updateSelection);
      composer.removeEventListener("update-selection", updateSelection);
    };
  }, [profile.bloom, quality]);

  return (
    <effect-composer
      ref={composerRef}
      render-mode={quality === "ultra" ? "quality" : "performance"}
      msaa="0"
    >
      <ssao-effect
        blend-mode={quality === "low" ? "skip" : "default"}
        strength={quality === "ultra" ? profile.ssao * 0.7 : profile.ssao * 0.45}
      />
      <selective-bloom-effect
        blend-mode={quality === "low" ? "skip" : "default"}
        strength={profile.bloom}
        radius="0.55"
        threshold="1.05"
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
