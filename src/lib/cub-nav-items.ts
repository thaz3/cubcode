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
  {
    type: "group",
    id: "practice",
    label: "Quests",
    children: [
      { type: "link", suffix: "/challenges", label: "Assignments" },
      { type: "link", suffix: "/training", label: "Training Path" },
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
  const pathSuffix = suffix.split("#")[0];
  if (pathSuffix === "") {
    return pathname === base;
  }
  return pathname.startsWith(`${base}${pathSuffix}`);
}

export function isCubNavChildActive(
  pathname: string,
  base: string,
  suffix: string,
  hash = "",
): boolean {
  const [pathSuffix, hashSuffix] = suffix.split("#");
  const onPath =
    pathname === `${base}${pathSuffix}` ||
    pathname.startsWith(`${base}${pathSuffix}/`);

  if (hashSuffix) {
    return onPath && hash === `#${hashSuffix}`;
  }

  return isCubNavActive(pathname, base, suffix);
}

export function getCubPracticeGroup(): CubNavGroup | undefined {
  const item = CUB_NAV_ITEMS.find(
    (entry) => entry.type === "group" && entry.id === "practice",
  );
  return item?.type === "group" ? item : undefined;
}

export function isCubQuestsNavActive(
  pathname: string,
  base: string,
  group: CubNavGroup,
  hash = "",
): boolean {
  return group.children.some((child) =>
    isCubNavChildActive(pathname, base, child.suffix, hash),
  );
}

/** @deprecated Use isCubQuestsNavActive */
export function isCubNavGroupActive(
  pathname: string,
  base: string,
  group: CubNavGroup,
  hash = "",
): boolean {
  return isCubQuestsNavActive(pathname, base, group, hash);
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
