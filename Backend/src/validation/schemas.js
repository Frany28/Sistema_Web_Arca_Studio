import { z } from "zod";
import { decodeCursor } from "../utils/pagination.js";

const positiveId = z.coerce.number().int().positive();
const cursor = z.string().optional().refine((value) => !value || Boolean(decodeCursor(value)), "Cursor inválido.");

export const loginSchema = z.object({
  body: z.object({ email: z.string().trim().pipe(z.email("Correo inválido.")).transform((value) => value.toLowerCase()), password: z.string().min(8).max(256) }),
});

export const paginationSchema = z.object({
  query: z.object({ cursor, limit: z.coerce.number().int().min(1).max(100).optional() }).passthrough(),
});

export const projectIdSchema = z.object({ params: z.object({ projectId: positiveId }) });

export const commentSchema = z.object({
  params: z.object({ projectId: positiveId }),
  body: z.object({
    commentType: z.enum(["general", "image", "video", "viewer3d"]).default("general"),
    content: z.string().trim().min(1, "Escribe un comentario.").max(2000),
    parentCommentId: positiveId.nullish(),
    targetId: z.union([z.string(), z.number()]).nullish(),
    image: z.record(z.string(), z.unknown()).nullish(),
    selection: z.record(z.string(), z.unknown()).nullish(),
  }).passthrough(),
});

export const fileRouteSchema = z.object({
  params: z.object({ projectId: positiveId.optional(), projectRequestId: positiveId.optional(), supportRequestId: positiveId.optional() }).passthrough(),
});
