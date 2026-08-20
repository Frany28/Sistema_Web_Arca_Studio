import { z } from "zod";

import { decodeCursor } from "../utils/pagination.js";

const userCursor = z.string().optional().refine((value) => {
  if (!value) return true;
  const decoded = decodeCursor(value);
  return Boolean(decoded && !Number.isNaN(Date.parse(decoded[0])) && /^\d+$/.test(String(decoded[1])));
}, "Cursor inválido.");

export const adminUserListSchema = z.object({
  query: z.object({
    cursor: userCursor,
    limit: z.coerce.number().int().min(1).max(50).optional(),
    role: z.string().trim().min(1).max(64).regex(/^[a-z0-9_-]+$/i).optional(),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["active", "blocked", "inactive"]).optional(),
  }).passthrough(),
});
