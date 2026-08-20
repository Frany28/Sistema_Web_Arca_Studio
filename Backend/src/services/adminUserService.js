import {
  getAdminUserMetrics,
  listAdminUsers,
} from "../repositories/adminUserRepository.js";
import { mapAdminUser } from "../utils/adminUsers.js";
import {
  decodeCursor,
  pageResult,
  parsePageLimit,
} from "../utils/pagination.js";

export async function getAdminUsersPage(query = {}) {
  const limit = Math.min(parsePageLimit(query.limit || 10), 50);
  const cursor = decodeCursor(query.cursor);
  const [rows, metrics] = await Promise.all([
    listAdminUsers({
      cursor,
      limit,
      role: query.role,
      search: query.search,
      status: query.status,
    }),
    getAdminUserMetrics(),
  ]);
  const page = pageResult(rows, limit, mapAdminUser, (row) => [
    new Date(row.created_at).toISOString(),
    String(row.id),
  ]);

  return {
    metrics,
    nextCursor: page.nextCursor,
    users: page.items,
  };
}
