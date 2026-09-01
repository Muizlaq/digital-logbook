import { SessionUser } from "../auth/session";

export type Role = "ADMIN" | "SUPERVISOR" | "USER";

export const PERMISSIONS = {
  // Dashboard
  VIEW_ADMIN_DASHBOARD: ["ADMIN"],
  VIEW_SUPERVISOR_DASHBOARD: ["ADMIN", "SUPERVISOR"],
  VIEW_USER_DASHBOARD: ["ADMIN", "SUPERVISOR", "USER"],

  // User Management
  MANAGE_USERS: ["ADMIN"],
  VIEW_USERS: ["ADMIN", "SUPERVISOR"],

  // Master Data
  MANAGE_MASTER_DATA: ["ADMIN"],
  VIEW_MASTER_DATA: ["ADMIN", "SUPERVISOR", "USER"],

  // Logbook
  CREATE_LOGBOOK: ["ADMIN", "SUPERVISOR", "USER"],
  EDIT_OWN_LOGBOOK: ["ADMIN", "SUPERVISOR", "USER"],
  DELETE_OWN_LOGBOOK: ["ADMIN", "SUPERVISOR", "USER"],
  SUBMIT_LOGBOOK: ["ADMIN", "SUPERVISOR", "USER"],
  VIEW_ALL_LOGBOOKS: ["ADMIN"],
  VIEW_TEAM_LOGBOOKS: ["ADMIN", "SUPERVISOR"],

  // Approval
  REVIEW_LOGBOOK: ["ADMIN", "SUPERVISOR"],
  APPROVE_LOGBOOK: ["ADMIN", "SUPERVISOR"],
  REJECT_LOGBOOK: ["ADMIN", "SUPERVISOR"],

  // Reports
  VIEW_GLOBAL_REPORTS: ["ADMIN"],
  VIEW_TEAM_REPORTS: ["ADMIN", "SUPERVISOR"],
  EXPORT_REPORTS: ["ADMIN", "SUPERVISOR"],

  // Audit Log & System
  VIEW_AUDIT_LOGS: ["ADMIN"],
  MANAGE_SETTINGS: ["ADMIN"],
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export function hasPermission(user: SessionUser | null, permission: PermissionKey): boolean {
  if (!user) return false;
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(user.role);
}

export function isRouteAllowed(role: Role | undefined, pathname: string): boolean {
  if (!role) return false;
  if (role === "ADMIN") return true;

  if (role === "SUPERVISOR") {
    if (pathname.startsWith("/users") || pathname.startsWith("/master-data") || pathname.startsWith("/audit-log") || pathname.startsWith("/settings")) {
      return false;
    }
    return true;
  }

  if (role === "USER") {
    if (
      pathname.startsWith("/approval") ||
      pathname.startsWith("/users") ||
      pathname.startsWith("/master-data") ||
      pathname.startsWith("/audit-log") ||
      pathname.startsWith("/settings")
    ) {
      return false;
    }
    return true;
  }

  return false;
}
