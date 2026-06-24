export type CubRank = {
  name: string;
  minXp: number;
};

export const CUB_RANKS: CubRank[] = [
  { name: "New Cub", minXp: 0 },
  { name: "Focused Cub", minXp: 25 },
  { name: "Rising Cub", minXp: 75 },
  { name: "Trail Cub", minXp: 150 },
  { name: "Legacy Builder", minXp: 300 },
];

export type RankProgress = {
  current: CubRank;
  next: CubRank | null;
  totalXp: number;
  xpIntoRank: number;
  xpToNext: number | null;
  progressPercent: number;
};

export function getRankProgress(totalXp: number): RankProgress {
  let current = CUB_RANKS[0]!;
  let next: CubRank | null = CUB_RANKS[1] ?? null;

  for (const rank of CUB_RANKS) {
    if (totalXp >= rank.minXp) {
      current = rank;
    }
  }

  const currentIndex = CUB_RANKS.findIndex((rank) => rank.name === current.name);
  next = CUB_RANKS[currentIndex + 1] ?? null;

  const xpIntoRank = totalXp - current.minXp;
  const xpToNext = next ? next.minXp - totalXp : null;
  const span = next ? next.minXp - current.minXp : 1;
  const progressPercent = next
    ? Math.min(100, Math.round((xpIntoRank / span) * 100))
    : 100;

  return {
    current,
    next,
    totalXp,
    xpIntoRank,
    xpToNext,
    progressPercent,
  };
}
