import Link from "next/link";
import { CubColorDot } from "@/components/cub-color-dot";
import { getCubColor } from "@/lib/cub-colors";
import { cn } from "@/lib/utils";

type CubLinkProps = {
  cubId: string;
  displayName: string;
  className?: string;
  showDot?: boolean;
};

export function CubLink({
  cubId,
  displayName,
  className,
  showDot = true,
}: CubLinkProps) {
  const colors = getCubColor(cubId);

  return (
    <Link
      href={`/dashboard/cubs/${cubId}/tasks`}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium hover:underline",
        colors.link,
        className,
      )}
    >
      {showDot ? <CubColorDot cubId={cubId} /> : null}
      {displayName}
    </Link>
  );
}
