import { CubColorBadge } from "@/components/cub-color-dot";

type CubColorLegendProps = {
  cubs: Array<{ id: string; displayName: string }>;
};

export function CubColorLegend({ cubs }: CubColorLegendProps) {
  if (cubs.length < 2) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Cubs
      </span>
      {cubs.map((cub) => (
        <CubColorBadge
          key={cub.id}
          cubId={cub.id}
          displayName={cub.displayName}
        />
      ))}
    </div>
  );
}
