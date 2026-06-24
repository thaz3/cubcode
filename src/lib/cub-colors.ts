import { cn } from "@/lib/utils";

export type CubColorScheme = {
  slug: string;
  dot: string;
  link: string;
  badge: string;
  borderLeft: string;
  rowHover: string;
  cardTint: string;
};

const CUB_COLOR_PALETTE: CubColorScheme[] = [
  {
    slug: "sky",
    dot: "bg-sky-500",
    link: "text-sky-800 hover:text-sky-950 dark:text-sky-300 dark:hover:text-sky-200",
    badge:
      "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
    borderLeft: "border-l-sky-500",
    rowHover:
      "hover:border-sky-300 hover:bg-sky-50/50 dark:hover:border-sky-800 dark:hover:bg-sky-950/30",
    cardTint: "bg-sky-50/40 dark:bg-sky-950/20",
  },
  {
    slug: "violet",
    dot: "bg-violet-500",
    link: "text-violet-800 hover:text-violet-950 dark:text-violet-300 dark:hover:text-violet-200",
    badge:
      "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
    borderLeft: "border-l-violet-500",
    rowHover:
      "hover:border-violet-300 hover:bg-violet-50/50 dark:hover:border-violet-800 dark:hover:bg-violet-950/30",
    cardTint: "bg-violet-50/40 dark:bg-violet-950/20",
  },
  {
    slug: "emerald",
    dot: "bg-emerald-500",
    link: "text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-200",
    badge:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    borderLeft: "border-l-emerald-500",
    rowHover:
      "hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30",
    cardTint: "bg-emerald-50/40 dark:bg-emerald-950/20",
  },
  {
    slug: "rose",
    dot: "bg-rose-500",
    link: "text-rose-800 hover:text-rose-950 dark:text-rose-300 dark:hover:text-rose-200",
    badge:
      "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
    borderLeft: "border-l-rose-500",
    rowHover:
      "hover:border-rose-300 hover:bg-rose-50/50 dark:hover:border-rose-800 dark:hover:bg-rose-950/30",
    cardTint: "bg-rose-50/40 dark:bg-rose-950/20",
  },
  {
    slug: "amber",
    dot: "bg-amber-500",
    link: "text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-200",
    badge:
      "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
    borderLeft: "border-l-amber-500",
    rowHover:
      "hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-800 dark:hover:bg-amber-950/30",
    cardTint: "bg-amber-50/40 dark:bg-amber-950/20",
  },
  {
    slug: "cyan",
    dot: "bg-cyan-500",
    link: "text-cyan-800 hover:text-cyan-950 dark:text-cyan-300 dark:hover:text-cyan-200",
    badge:
      "bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200",
    borderLeft: "border-l-cyan-500",
    rowHover:
      "hover:border-cyan-300 hover:bg-cyan-50/50 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/30",
    cardTint: "bg-cyan-50/40 dark:bg-cyan-950/20",
  },
  {
    slug: "fuchsia",
    dot: "bg-fuchsia-500",
    link: "text-fuchsia-800 hover:text-fuchsia-950 dark:text-fuchsia-300 dark:hover:text-fuchsia-200",
    badge:
      "bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-950 dark:text-fuchsia-200",
    borderLeft: "border-l-fuchsia-500",
    rowHover:
      "hover:border-fuchsia-300 hover:bg-fuchsia-50/50 dark:hover:border-fuchsia-800 dark:hover:bg-fuchsia-950/30",
    cardTint: "bg-fuchsia-50/40 dark:bg-fuchsia-950/20",
  },
  {
    slug: "lime",
    dot: "bg-lime-500",
    link: "text-lime-800 hover:text-lime-950 dark:text-lime-300 dark:hover:text-lime-200",
    badge:
      "bg-lime-100 text-lime-900 dark:bg-lime-950 dark:text-lime-200",
    borderLeft: "border-l-lime-500",
    rowHover:
      "hover:border-lime-300 hover:bg-lime-50/50 dark:hover:border-lime-800 dark:hover:bg-lime-950/30",
    cardTint: "bg-lime-50/40 dark:bg-lime-950/20",
  },
];

function hashCubId(cubId: string): number {
  let hash = 0;
  for (let i = 0; i < cubId.length; i += 1) {
    hash = (hash + cubId.charCodeAt(i) * (i + 1)) | 0;
  }
  return Math.abs(hash) % CUB_COLOR_PALETTE.length;
}

export function getCubColor(cubId: string): CubColorScheme {
  return CUB_COLOR_PALETTE[hashCubId(cubId)]!;
}

export function cubAccentClassNames(
  cubId: string | null | undefined,
  options?: {
    border?: boolean;
    rowHover?: boolean;
    cardTint?: boolean;
  },
): string {
  if (!cubId) {
    return "";
  }

  const colors = getCubColor(cubId);
  return cn(
    options?.border && `border-l-4 ${colors.borderLeft}`,
    options?.rowHover && colors.rowHover,
    options?.cardTint && colors.cardTint,
  );
}
