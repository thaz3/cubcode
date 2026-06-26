export const CUB_NAV_ITEMS = [
  { suffix: "", label: "Today" },
  { suffix: "/tasks", label: "Assignments" },
  { suffix: "/challenges", label: "Routines" },
  { suffix: "/focus-deck", label: "Focus" },
  { suffix: "/progress", label: "Progress" },
  { suffix: "/rewards", label: "Rewards" },
] as const;

export function isCubNavActive(
  pathname: string,
  base: string,
  suffix: string,
): boolean {
  if (suffix === "") {
    return pathname === base;
  }
  return pathname.startsWith(`${base}${suffix}`);
}
