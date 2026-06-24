import Link from "next/link";
import { Button } from "@/components/ui/button";

type CubHeaderProps = {
  displayName: string;
};

export function CubHeader({ displayName }: CubHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-500">
            Cub view
          </p>
          <p className="truncate text-lg font-bold text-zinc-50">
            {displayName}
          </p>
        </div>
        <Link
          href="/parent/unlock?returnTo=%2Fdashboard"
          className="shrink-0"
        >
          <Button variant="secondary" size="sm">
            Parent area
          </Button>
        </Link>
      </div>
    </header>
  );
}
