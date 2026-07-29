export const DEFAULT_ARCHITECTURAL_SETTINGS = Object.freeze({
  canEdit: false,
  environment: "studio",
  exposure: 0.82,
  materialOverrides: {},
  profile: "exterior",
  schemaVersion: 1,
  shadowIntensity: 1.5,
});

export function getArchitecturalEnvironmentImage() {
  const baseUrl = String(import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
  return `${baseUrl}environments/studio-small-09-1k.hdr`;
}

export const ARCHITECTURAL_PROFILES = Object.freeze({
  exterior: {
    label: "Exterior",
    exposure: 0.82,
    shadowIntensity: 1.5,
    ssao: 1.35,
    bloom: 0.35,
    hemisphere: [0xfff0dc, 0x26374c, 0.78],
  },
  interior: {
    label: "Interior",
    exposure: 0.9,
    shadowIntensity: 1.15,
    ssao: 1.15,
    bloom: 0.45,
    hemisphere: [0xffead2, 0x394250, 1.05],
  },
  night: {
    label: "Noche",
    exposure: 0.72,
    shadowIntensity: 1.35,
    ssao: 1.5,
    bloom: 1.15,
    hemisphere: [0x5974a3, 0x100d16, 0.42],
  },
});

const CATEGORY_PATTERNS = {
  glass: /(glass|vidrio|cristal|window|ventana|mirror|espejo)/i,
  metal: /(metal|steel|acero|alumin|chrome|crom|iron|hierro)/i,
  emissive: /(light|lamp|luz|led|neon|sign|logo|screen|pantalla|luminar)/i,
  vegetation: /(leaf|leaves|plant|planta|grass|cesped|tree|arbol|foliage)/i,
};

export function classifyArchitecturalMaterial(name = "") {
  const normalized = String(name);
  return (
    Object.entries(CATEGORY_PATTERNS).find(([, pattern]) =>
      pattern.test(normalized),
    )?.[0] || "opaque"
  );
}

export function getStableMaterialKey(material, index) {
  const name = String(material?.name || "").trim();
  return name ? `${index}:${name.slice(0, 120)}` : `${index}:material`;
}

export function detectAdaptiveRenderQuality() {
  if (typeof window === "undefined") return "medium";
  const canvas = document.createElement("canvas");
  const hasWebGL2 = Boolean(canvas.getContext("webgl2"));
  if (!hasWebGL2) return "low";
  const mobile = window.matchMedia?.("(pointer: coarse)")?.matches;
  const memory = Number(navigator.deviceMemory || 4);
  const cores = Number(navigator.hardwareConcurrency || 4);
  return !mobile && memory >= 8 && cores >= 8 ? "ultra" : "medium";
}

function resolveMaterialValues(material, index, overrides) {
  const key = getStableMaterialKey(material, index);
  const override = overrides?.[key] || {};
  const category = override.category || classifyArchitecturalMaterial(material?.name);
  return { category, key, override };
}

export function enhanceThreeArchitecturalMaterials(root, {
  materialOverrides = {},
  profile = "exterior",
  maximumAnisotropy = 4,
} = {}) {
  const emissiveMeshes = [];
  const profileConfig = ARCHITECTURAL_PROFILES[profile] || ARCHITECTURAL_PROFILES.exterior;
  const seen = new Map();

  root?.traverse?.((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material].filter(Boolean);

    materials.forEach((material) => {
      if (!seen.has(material)) seen.set(material, seen.size);
      const index = seen.get(material);
      const { category, override } = resolveMaterialValues(
        material,
        index,
        materialOverrides,
      );
      if (override.excluded) return;

      if (material.isMeshStandardMaterial) {
        material.envMapIntensity = Math.max(material.envMapIntensity ?? 1, 1.15);
        if (!material.roughnessMap) {
          const fallback = category === "metal" ? 0.28 : category === "glass" ? 0.12 : 0.68;
          material.roughness = override.roughness ?? Math.min(material.roughness ?? 1, fallback);
        }
        if (!material.metalnessMap && category === "metal") {
          material.metalness = override.metalness ?? Math.max(material.metalness ?? 0, 0.72);
        }
        if (category === "glass") {
          material.transparent = true;
          material.opacity = override.opacity ?? Math.min(material.opacity ?? 1, 0.48);
          material.depthWrite = false;
        }
        if (category === "emissive") {
          material.emissive.copy(material.color).multiplyScalar(profile === "night" ? 0.9 : 0.35);
          material.emissiveIntensity =
            override.emissiveIntensity ?? (profileConfig.bloom > 1 ? 2.2 : 0.65);
          emissiveMeshes.push(object);
        }
        if (category === "vegetation") material.side = 2;
      }

      [material.map, material.normalMap, material.roughnessMap, material.metalnessMap, material.aoMap]
        .filter(Boolean)
        .forEach((texture) => {
          texture.anisotropy = maximumAnisotropy;
          texture.needsUpdate = true;
        });
      material.needsUpdate = true;
    });
  });
  return { emissiveMeshes };
}

export function enhanceModelViewerMaterials(modelViewer, settings) {
  const materials = modelViewer?.model?.materials || [];
  materials.forEach((material, index) => {
    const { category, override } = resolveMaterialValues(
      material,
      index,
      settings?.materialOverrides,
    );
    if (override.excluded) return;
    const pbr = material.pbrMetallicRoughness;
    try {
      if (category === "metal") {
        pbr?.setMetallicFactor?.(override.metalness ?? 0.72);
        pbr?.setRoughnessFactor?.(override.roughness ?? 0.28);
      } else if (category === "glass") {
        pbr?.setRoughnessFactor?.(override.roughness ?? 0.12);
        material.setAlphaMode?.("BLEND");
        material.setAlphaCutoff?.(override.opacity ?? 0.48);
      } else if (category === "emissive") {
        const base = pbr?.baseColorFactor || [1, 0.85, 0.65, 1];
        material.setEmissiveFactor?.(base.slice(0, 3));
        material.setEmissiveStrength?.(
          override.emissiveIntensity ?? (settings?.profile === "night" ? 2.2 : 0.65),
        );
      }
    } catch {
      // A material extension may be immutable; retain its authored values.
    }
  });
}
