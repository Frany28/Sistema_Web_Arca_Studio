import { z } from "zod";

const positiveId = z.coerce.number().int().positive();
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

export const adminAssigneePhotoSchema = z.object({
  params: z.object({ userId: positiveId }),
});
