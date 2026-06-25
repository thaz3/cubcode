import Link from "next/link";
import { CubColorDot } from "@/components/cub-color-dot";
import { getCubColor } from "@/lib/cub-colors";
import { cn } from "@/lib/utils";

type CubLinkProps = {
  cubId: string;
  displayName: string;
  className?: string;
  showDot?: boolean;
  /** When false, renders label only (use inside another link). */
  linked?: boolean;
};

export function CubLink({
  cubId,
  displayName,
  className,
  showDot = true,
  linked = true,
}: CubLinkProps) {
  const colors = getCubColor(cubId);
  const labelClassName = cn(
    "inline-flex items-center gap-1.5 font-medium",
    linked ? "hover:underline" : null,
    colors.link,
    className,
  );
  const content = (
    <>
      {showDot ? <CubColorDot cubId={cubId} /> : null}
      {displayName}
    </>
  );

  if (!linked) {
    return <span className={labelClassName}>{content}</span>;
  }

  return (
    <Link href={`/dashboard/cubs/${cubId}/tasks`} className={labelClassName}>
      {content}
    </Link>
  );
}
