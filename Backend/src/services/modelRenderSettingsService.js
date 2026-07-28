import { AppError, NotFoundError } from "../errors/appError.js";
import {
  findRenderSettingsAccess,
  getRenderSettings,
  upsertRenderSettings,
} from "../repositories/modelRenderSettingsRepository.js";
import { publishProjectEvent } from "./projectEvents.js";

export const DEFAULT_RENDER_SETTINGS = Object.freeze({
  environment: "studio",
  exposure: 1.05,
  materialOverrides: {},
  profile: "exterior",
  schemaVersion: 1,
  shadowIntensity: 1.5,
});

function isModelFile(fileType) {
  return String(fileType || "").toLowerCase() === "model/gltf-binary";
}

async function requireModelAccess({ fileId, projectId, user, write = false }) {
  const access = await findRenderSettingsAccess({ fileId, projectId, user });
  if (!access || !isModelFile(access.fileType)) {
    throw new NotFoundError("MODEL_FILE_NOT_FOUND", "No se encontró el modelo 3D.");
  }
  if (write && !access.canEdit) {
    throw new AppError({
      code: "MODEL_RENDER_SETTINGS_FORBIDDEN",
      message: "No tienes permiso para editar la presentación del modelo.",
      status: 403,
    });
  }
}

export async function readModelRenderSettings({ fileId, projectId, user }) {
  await requireModelAccess({ fileId, projectId, user });
  const stored = await getRenderSettings({ fileId, projectId });
  return {
    canEdit: ["admin", "architect"].includes(user?.role?.code),
    fileId,
    ...(stored || DEFAULT_RENDER_SETTINGS),
  };
}

export async function saveModelRenderSettings({
  fileId,
  projectId,
  settings,
  user,
}) {
  await requireModelAccess({ fileId, projectId, user, write: true });
  const saved = await upsertRenderSettings({
    fileId,
    projectId,
    settings,
    userId: user.id,
  });
  publishProjectEvent({
    eventName: "model.render-settings.updated",
    payload: { fileId, projectId, settings: saved },
    projectId,
  });
  return { canEdit: true, ...saved };
}
