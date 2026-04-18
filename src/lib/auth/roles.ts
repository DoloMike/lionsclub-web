/** Profile roles: guest (signed in), member, admin (chapter + site admin). */

export function isChapterMember(role: string | undefined): boolean {
  return role === "member" || role === "admin";
}

export function isAdminRole(role: string | undefined): boolean {
  return role === "admin";
}

export function roleLabel(role: string | undefined): string {
  if (role === "admin") return "Admin";
  if (role === "member") return "Member";
  return "Guest";
}
