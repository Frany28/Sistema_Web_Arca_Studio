import {
  createProjectRequestForUser,
  normalizeProjectType,
} from "../repositories/projectRequestRepository.js";

function isValidCoordinatePair(latitude, longitude) {
  if (latitude === null && longitude === null) {
    return true;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export async function createProjectRequest(req, res, next) {
  try {
    if (!req.user?.clientId) {
      res.status(403).json({
        code: "CLIENT_REQUIRED",
        message: "Solo los clientes pueden crear solicitudes de proyecto.",
      });
      return;
    }

    const payload = req.body || {};
    const projectName = String(payload.projectName || "").trim();
    const projectLocation = String(payload.projectLocation || "").trim();
    const projectType = normalizeProjectType(payload.selectedProjectTypeId);

    if (!projectName) {
      res.status(400).json({
        code: "PROJECT_NAME_REQUIRED",
        message: "Ingresa el nombre del proyecto.",
      });
      return;
    }

    if (!projectType) {
      res.status(400).json({
        code: "PROJECT_TYPE_REQUIRED",
        message: "Selecciona un tipo de proyecto valido.",
      });
      return;
    }

    if (!projectLocation) {
      res.status(400).json({
        code: "PROJECT_LOCATION_REQUIRED",
        message: "Ingresa la ubicacion del proyecto.",
      });
      return;
    }

    if (
      !isValidCoordinatePair(
        payload.projectLocationLatitude,
        payload.projectLocationLongitude,
      )
    ) {
      res.status(400).json({
        code: "INVALID_PROJECT_COORDINATES",
        message: "Las coordenadas de la ubicacion no son validas.",
      });
      return;
    }

    const projectRequest = await createProjectRequestForUser(req.user, payload);

    res.status(201).json({
      projectRequest,
    });
  } catch (error) {
    next(error);
  }
}
