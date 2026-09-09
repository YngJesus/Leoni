export function canEditRole(userSession, role) {
  return userSession?.role === "ADMIN" || userSession?.role === role;
}
