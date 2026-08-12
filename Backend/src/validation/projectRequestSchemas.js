import { z } from "zod";

import { PROJECT_REQUEST_VALUES } from "../domain/projectRequest.js";

const positiveId = z.coerce.number().int().positive();
const nullableText = (maximum) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) return null;
      const normalized = String(value).trim();
      return normalized || null;
    },
    z.string().max(maximum).nullable(),
  );
const optionalChoice = (values) => z.enum(values).nullable().optional().default(null);
const optionalCoordinate = z.number().finite().nullable().optional().default(null);

function normalizeAddress(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function validManualAddress(value) {
  const normalized = normalizeAddress(value);
  if (normalized.length < 5 || !/[a-z]/.test(normalized)) return false;
  if (/^(.)\1{5,}$/.test(normalized.replace(/\s/g, ""))) return false;
  return (normalized.match(/[a-z0-9]+/g) || []).some((word) => word.length >= 5);
}

const projectRequestBody = z
  .object({
    capitalAvailability: z.enum(PROJECT_REQUEST_VALUES.capitalAvailability),
    decisionMaker: optionalChoice(PROJECT_REQUEST_VALUES.decisionMaker),
    description: nullableText(5000).refine(
      (value) => value === null || value.length >= 10,
      "La descripción debe tener al menos 10 caracteres.",
    ),
    developmentMode: z.enum(PROJECT_REQUEST_VALUES.developmentMode),
    experience: optionalChoice(PROJECT_REQUEST_VALUES.experience),
    hasBlueprints: z.boolean().nullable().optional().default(null),
    investmentRange: z.enum(PROJECT_REQUEST_VALUES.investmentRange),
    landStatus: optionalChoice(PROJECT_REQUEST_VALUES.landStatus),
    projectLocation: z.string().trim().min(5).max(255).refine(validManualAddress, "Ingresa una ubicación válida."),
    projectLocationFormattedAddress: nullableText(500),
    projectLocationLatitude: optionalCoordinate,
    projectLocationLongitude: optionalCoordinate,
    projectLocationProviderPlaceId: nullableText(255),
    projectName: z.string().trim().min(3).max(150),
    projectSize: optionalChoice(PROJECT_REQUEST_VALUES.projectSize),
    projectType: z.enum(PROJECT_REQUEST_VALUES.projectType),
    quality: optionalChoice(PROJECT_REQUEST_VALUES.quality),
    referenceLink: nullableText(500).refine((value) => {
      if (value === null) return true;
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "Ingresa un enlace http o https válido."),
    startTime: z.enum(PROJECT_REQUEST_VALUES.startTime),
  })
  .strict()
  .superRefine((body, context) => {
    const hasLatitude = body.projectLocationLatitude !== null;
    const hasLongitude = body.projectLocationLongitude !== null;
    if (hasLatitude !== hasLongitude) {
      context.addIssue({
        code: "custom",
        message: "La latitud y longitud deben enviarse juntas.",
        path: hasLatitude ? ["projectLocationLongitude"] : ["projectLocationLatitude"],
      });
      return;
    }
    if (hasLatitude && (body.projectLocationLatitude < -90 || body.projectLocationLatitude > 90)) {
      context.addIssue({ code: "custom", message: "Latitud inválida.", path: ["projectLocationLatitude"] });
    }
    if (hasLongitude && (body.projectLocationLongitude < -180 || body.projectLocationLongitude > 180)) {
      context.addIssue({ code: "custom", message: "Longitud inválida.", path: ["projectLocationLongitude"] });
    }
  });

export const createProjectRequestSchema = z.object({
  body: projectRequestBody.extend({ submissionId: z.uuid() }).strict(),
});

export const updateProjectRequestSchema = z.object({
  body: projectRequestBody,
  params: z.object({ projectRequestId: positiveId }),
});

export const projectRequestIdSchema = z.object({
  params: z.object({ projectRequestId: positiveId }),
});

export const projectRequestFileIdSchema = z.object({
  params: z.object({ fileId: positiveId, projectRequestId: positiveId }),
});
