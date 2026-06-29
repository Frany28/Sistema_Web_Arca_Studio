import {
  createProjectRequestForUser,
  findExistingProjectNameForClient,
  findProjectRequestEditableByUser,
  normalizeProjectType,
  updateProjectRequestForUser,
} from "../repositories/projectRequestRepository.js";

const PROJECT_NAME_MAX_LENGTH = 150;
const PROJECT_LOCATION_MAX_LENGTH = 255;
const PROJECT_DESCRIPTION_MIN_LENGTH = 10;
const PROJECT_DESCRIPTION_MAX_LENGTH = 5000;
const PROJECT_REFERENCE_LINK_MAX_LENGTH = 500;

const ADDRESS_KEYWORDS = [
  "apartamento",
  "apto",
  "avenida",
  "av",
  "calle",
  "carrera",
  "casa",
  "centro",
  "ciudad",
  "conjunto",
  "edificio",
  "estado",
  "local",
  "municipio",
  "parcelamiento",
  "sector",
  "torre",
  "urbanizacion",
  "urb",
  "zona",
];

function isValidCoordinatePair(latitude, longitude) {
  if (
    (latitude === null || latitude === undefined || latitude === "") &&
    (longitude === null || longitude === undefined || longitude === "")
  ) {
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

function hasOnlyOneCoordinate(latitude, longitude) {
  const hasLatitude = latitude !== null && latitude !== undefined && latitude !== "";
  const hasLongitude =
    longitude !== null && longitude !== undefined && longitude !== "";

  return hasLatitude !== hasLongitude;
}

function isValidReferenceLink(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return true;
  }

  try {
    const url = new URL(normalized);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function normalizeForAddressValidation(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasUsableCoordinates(latitude, longitude) {
  return (
    latitude !== null &&
    latitude !== undefined &&
    latitude !== "" &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== "" &&
    isValidCoordinatePair(latitude, longitude)
  );
}

function isValidProjectLocationFormat(value, latitude, longitude) {
  const normalized = normalizeForAddressValidation(value);

  if (hasUsableCoordinates(latitude, longitude)) {
    return normalized.length >= 5;
  }

  if (normalized.length < 10 || normalized.length > PROJECT_LOCATION_MAX_LENGTH) {
    return false;
  }

  if (!/[a-z]/.test(normalized)) {
    return false;
  }

  if (/^(.)\1{5,}$/.test(normalized.replace(/\s/g, ""))) {
    return false;
  }

  const words = normalized.match(/[a-z0-9]+/g) || [];
  const meaningfulWords = words.filter((word) => word.length >= 3);
  const hasAddressKeyword = ADDRESS_KEYWORDS.some((keyword) =>
    new RegExp(`\\b${keyword}\\b`).test(normalized),
  );
  const hasStructure = /[,#-]/.test(normalized) || /\d/.test(normalized);

  return meaningfulWords.length >= 2 && (hasStructure || hasAddressKeyword);
}

async function validateProjectRequestPayload(req, res, options = {}) {
  const payload = req.body || {};
    const projectName = String(payload.projectName || "").trim();
    const projectLocation = String(payload.projectLocation || "").trim();
    const projectType = normalizeProjectType(payload.selectedProjectTypeId);
    const description = String(payload.description || "").trim();
    const referenceLink = String(payload.referenceLink || "").trim();

    if (!projectName) {
      res.status(400).json({
        code: "PROJECT_NAME_REQUIRED",
        message: "Ingresa el nombre del proyecto.",
      });
      return;
    }

    if (projectName.length > PROJECT_NAME_MAX_LENGTH) {
      res.status(400).json({
        code: "PROJECT_NAME_TOO_LONG",
        message: `El nombre del proyecto no puede superar ${PROJECT_NAME_MAX_LENGTH} caracteres.`,
      });
      return;
    }

    if (!projectType) {
      res.status(400).json({
        code: "PROJECT_TYPE_REQUIRED",
        message: "Selecciona un tipo de proyecto válido.",
      });
      return;
    }

    if (!projectLocation) {
      res.status(400).json({
        code: "PROJECT_LOCATION_REQUIRED",
        message: "Ingresa la ubicación del proyecto.",
      });
      return;
    }

    if (projectLocation.length > PROJECT_LOCATION_MAX_LENGTH) {
      res.status(400).json({
        code: "PROJECT_LOCATION_TOO_LONG",
        message: `La ubicación no puede superar ${PROJECT_LOCATION_MAX_LENGTH} caracteres.`,
      });
      return;
    }

    if (
      !isValidProjectLocationFormat(
        projectLocation,
        payload.projectLocationLatitude,
        payload.projectLocationLongitude,
      )
    ) {
      res.status(400).json({
        code: "INVALID_PROJECT_LOCATION_FORMAT",
        message:
          "Ingresa una dirección válida o selecciona una ubicación sugerida.",
      });
      return;
    }

    if (!["Yes", "No"].includes(payload.hasBlueprints)) {
      res.status(400).json({
        code: "HAS_PLANS_REQUIRED",
        message: "Indica si dispones de planos del lugar.",
      });
      return;
    }

    if (description.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
      res.status(400).json({
        code: "PROJECT_DESCRIPTION_TOO_LONG",
        message: `La descripción no puede superar ${PROJECT_DESCRIPTION_MAX_LENGTH} caracteres.`,
      });
      return;
    }

    if (!description) {
      res.status(400).json({
        code: "PROJECT_DESCRIPTION_REQUIRED",
        message: "Ingresa una descripción del proyecto.",
      });
      return;
    }

    if (description.length < PROJECT_DESCRIPTION_MIN_LENGTH) {
      res.status(400).json({
        code: "PROJECT_DESCRIPTION_TOO_SHORT",
        message: `La descripción debe tener al menos ${PROJECT_DESCRIPTION_MIN_LENGTH} caracteres.`,
      });
      return;
    }

    if (referenceLink.length > PROJECT_REFERENCE_LINK_MAX_LENGTH) {
      res.status(400).json({
        code: "REFERENCE_LINK_TOO_LONG",
        message: `El link de referencia no puede superar ${PROJECT_REFERENCE_LINK_MAX_LENGTH} caracteres.`,
      });
      return;
    }

    if (!isValidReferenceLink(referenceLink)) {
      res.status(400).json({
        code: "INVALID_REFERENCE_LINK",
        message: "Ingresa un link de referencia válido.",
      });
      return;
    }

    if (
      hasOnlyOneCoordinate(
        payload.projectLocationLatitude,
        payload.projectLocationLongitude,
      )
    ) {
      res.status(400).json({
        code: "INCOMPLETE_PROJECT_COORDINATES",
        message: "La latitud y longitud deben enviarse juntas.",
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
        message: "Las coordenadas de la ubicación no son válidas.",
      });
      return;
    }

    const existingProjectName = await findExistingProjectNameForClient(
      req.user.clientId,
      projectName,
      {
        excludeProjectRequestId: options.excludeProjectRequestId,
      },
    );

    if (existingProjectName) {
      res.status(409).json({
        code: "PROJECT_NAME_ALREADY_EXISTS",
        message: "Ya existe un proyecto o solicitud activa con ese nombre.",
      });
      return;
    }

  return true;
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
    const isValid = await validateProjectRequestPayload(req, res);

    if (!isValid) {
      return;
    }

    let projectRequest;

    try {
      projectRequest = await createProjectRequestForUser(req.user, payload);
    } catch (error) {
      if (error.code === "23505") {
        res.status(409).json({
          code: "PROJECT_NAME_ALREADY_EXISTS",
          message: "Ya existe un proyecto o solicitud activa con ese nombre.",
        });
        return;
      }

      throw error;
    }

    res.status(201).json({
      projectRequest,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectRequest(req, res, next) {
  try {
    if (!req.user?.clientId) {
      res.status(403).json({
        code: "CLIENT_REQUIRED",
        message: "Solo los clientes pueden actualizar solicitudes de proyecto.",
      });
      return;
    }

    const projectRequestId = Number(req.params.projectRequestId);

    if (!Number.isInteger(projectRequestId) || projectRequestId <= 0) {
      res.status(400).json({
        code: "INVALID_PROJECT_REQUEST_ID",
        message: "La solicitud de proyecto no es válida.",
      });
      return;
    }

    const projectRequest = await findProjectRequestEditableByUser(
      projectRequestId,
      req.user,
    );

    if (!projectRequest) {
      res.status(404).json({
        code: "PROJECT_REQUEST_NOT_FOUND",
        message: "No se encontró la solicitud de proyecto.",
      });
      return;
    }

    const isValid = await validateProjectRequestPayload(req, res, {
      excludeProjectRequestId: projectRequestId,
    });

    if (!isValid) {
      return;
    }

    let updatedProjectRequest;

    try {
      updatedProjectRequest = await updateProjectRequestForUser(
        projectRequestId,
        req.user,
        req.body || {},
      );
    } catch (error) {
      if (error.code === "23505") {
        res.status(409).json({
          code: "PROJECT_NAME_ALREADY_EXISTS",
          message: "Ya existe un proyecto o solicitud activa con ese nombre.",
        });
        return;
      }

      throw error;
    }

    if (!updatedProjectRequest) {
      res.status(404).json({
        code: "PROJECT_REQUEST_NOT_FOUND",
        message: "No se encontró la solicitud de proyecto.",
      });
      return;
    }

    res.json({
      projectRequest: updatedProjectRequest,
    });
  } catch (error) {
    next(error);
  }
}
