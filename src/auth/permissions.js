import { ROLES } from "./roles.js";

export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

export function isStaff(role) {
  return [ROLES.ADMIN, ROLES.TEACHER].includes(role);
}

export function isParent(role) {
  return [ROLES.PARENT, ROLES.GUARDIAN].includes(role);
}

export function canManageAccounts(role) {
  return isAdmin(role);
}

export function canAccessStaffPortal(role) {
  return isStaff(role);
}

export function canAccessParentPortal(role) {
  return isParent(role);
}