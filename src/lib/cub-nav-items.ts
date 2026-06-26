export type CubNavLink = {
  type: "link";
  suffix: string;
  label: string;
};

export type CubNavGroup = {
  type: "group";
  id: string;
  label: string;
  children: CubNavLink[];
};

export type CubNavItem = CubNavLink | CubNavGroup;

export const CUB_NAV_ITEMS: CubNavItem[] = [
  { type: "link", suffix: "", label: "Today" },
  { type: "link", suffix: "/tasks", label: "Overview" },
  {
    type: "group",
    id: "practice",
    label: "Quests",
    children: [
      { type: "link", suffix: "/training", label: "Training Path" },
      { type: "link", suffix: "/challenges", label: "Routines" },
      { type: "link", suffix: "/focus-deck", label: "Growth Picks" },
      { type: "link", suffix: "/ways-to-earn", label: "Ways to Earn" },
    ],
  },
  { type: "link", suffix: "/progress", label: "Progress" },
  { type: "link", suffix: "/rewards", label: "Rewards" },
];

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

export function isCubNavGroupActive(
  pathname: string,
  base: string,
  group: CubNavGroup,
): boolean {
  return group.children.some((child) =>
    isCubNavActive(pathname, base, child.suffix),
  );
}

export function getCubSwitchHref(
  targetCubId: string,
  currentCubId: string,
  pathname: string,
): string {
  const prefix = `/cub/${currentCubId}`;
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    return pathname.replace(prefix, `/cub/${targetCubId}`);
  }
  return `/cub/${targetCubId}`;
}
