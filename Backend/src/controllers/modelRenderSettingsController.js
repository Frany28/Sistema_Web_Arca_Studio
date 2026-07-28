import {
  readModelRenderSettings,
  saveModelRenderSettings,
} from "../services/modelRenderSettingsService.js";

export async function getModelRenderSettings(req, res, next) {
  try {
    const settings = await readModelRenderSettings({
      fileId: Number(req.params.fileId),
      projectId: Number(req.params.projectId),
      user: req.user,
    });
    res.status(200).json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateModelRenderSettings(req, res, next) {
  try {
    const settings = await saveModelRenderSettings({
      fileId: Number(req.params.fileId),
      projectId: Number(req.params.projectId),
      settings: req.body,
      user: req.user,
    });
    res.status(200).json({ settings });
  } catch (error) {
    next(error);
  }
}
