import { getSession } from "./auth/session";
import { hasPermission, type PermissionKey } from "./permissions";
import { jsonError } from "./api-response";

export async function requireStaffApi(permission?: PermissionKey) {
  const session = await getSession();
  if (!session || session.type !== "STAFF") {
    return { error: jsonError("Unauthorized", 401), session: null as never };
  }
  if (permission && !hasPermission(session.permissions, permission)) {
    return { error: jsonError("Forbidden", 403), session: null as never };
  }
  return { error: null, session };
}
