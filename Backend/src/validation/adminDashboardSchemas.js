import { z } from "zod";

const positiveId = z.coerce.number().int().positive();
const projectIds = z
  .array(positiveId)
  .min(1, "Selecciona al menos un proyecto.")
  .max(100, "Solo se pueden actualizar hasta 100 proyectos a la vez.")
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "No se permiten proyectos duplicados.",
  );
const assigneeIds = z
  .array(positiveId)
  .max(20, "Solo se pueden asignar hasta 20 responsables.")
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "No se permiten responsables duplicados.",
  );

export const projectAssigneesSchema = z.object({
  params: z.object({ projectId: positiveId }),
  body: z.object({ assigneeIds }),
});

export const projectRequestAssigneesSchema = z.object({
  params: z.object({ projectRequestId: positiveId }),
  body: z.object({ assigneeIds }),
});

export const adminProjectBulkActionSchema = z.object({
  body: z.discriminatedUnion("action", [
    z.object({
      action: z.literal("change_visibility"),
      isPublic: z.boolean(),
      projectIds,
    }).strict(),
    z.object({ action: z.literal("archive"), projectIds }).strict(),
    z.object({ action: z.literal("unarchive"), projectIds }).strict(),
  ]),
});

export const adminAssigneePhotoSchema = z.object({
  params: z.object({ userId: positiveId }),
});
