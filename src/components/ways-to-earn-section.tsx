import Link from "next/link";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import { Button } from "@/components/ui/button";
import {
  EARN_TYPES,
  getEarnTypeMeta,
  type EarnType as EarnTypeId,
} from "@/lib/earn-types";
import { EARN_TYPE_EMOJI } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type WaysToEarnSectionProps = {
  audience: "parent" | "cub";
  cubId?: string;
  variant?: "grid" | "compact";
  filter?: EarnTypeId[];
};

export function WaysToEarnSection({
  audience,
  cubId,
  variant = "grid",
  filter,
}: WaysToEarnSectionProps) {
  const earnTypes = filter ?? EARN_TYPES;
  const isCompact = variant === "compact";
  const isCub = audience === "cub";

  if (isCub) {
    return (
      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {earnTypes.map((earnType) => {
            const meta = getEarnTypeMeta(earnType);
            const href = cubId ? meta.cubCtaHref(cubId) : meta.parentCtaHref;
            const ctaLabel = meta.cubCtaLabel;

            return (
              <div
                key={earnType}
                className={cn(
                  "flex h-full flex-col gap-3 rounded-2xl border-2 bg-gradient-to-br p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  meta.cardBorderClass,
                  meta.cardAccentClass,
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-2xl">
                    {EARN_TYPE_EMOJI[earnType]}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <EarnTypeBadge earnType={earnType} size="md" />
                    <h3 className="text-lg font-black text-cub-off-white">{meta.label}</h3>
                  </div>
                </div>

                <p className="text-sm text-cub-off-white/90">{meta.purpose}</p>

                {!isCompact ? (
                  <ul className="space-y-0.5 text-sm text-cub-muted">
                    {meta.examples.slice(0, 2).map((example) => (
                      <li key={example}>· {example}</li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-auto pt-1">
                  {earnType === "bonus" ? (
                    <p className="mb-2 text-center text-xs text-cub-muted">
                      Only your parent can award bonus points.
                    </p>
                  ) : null}
                  <Link href={href}>
                    <Button
                      variant="secondary"
                      fullWidth
                      size={isCompact ? "sm" : "md"}
                      className="font-bold uppercase tracking-wide"
                    >
                      {earnType === "bonus" ? "See your bonuses" : `${ctaLabel} ▶`}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-cub-off-white sm:text-2xl">
          Ways to Earn
        </h2>
        <p className="mt-1 text-sm text-cub-muted">
          Five clear paths to earn points in C.U.B. Code — pick what fits today.
        </p>
      </div>

      <div
        className={cn(
          "grid gap-3",
          isCompact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {earnTypes.map((earnType) => {
          const meta = getEarnTypeMeta(earnType);
          const href =
            audience === "parent" && earnType === "bonus" && cubId
              ? `/dashboard/cubs/${cubId}/tasks#bonus`
              : meta.parentCtaHref;
          const ctaLabel = meta.ctaLabel;

          return (
            <div
              key={earnType}
              className={cn(
                "flex h-full flex-col gap-3 rounded-xl border bg-gradient-to-br p-4",
                meta.cardBorderClass,
                meta.cardAccentClass,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <EarnTypeBadge earnType={earnType} size="md" />
                  <h3 className="text-lg font-semibold text-cub-off-white">
                    {meta.label}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-cub-off-white/90">{meta.purpose}</p>

              {!isCompact ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-cub-muted">
                    Examples
                  </p>
                  <ul className="space-y-0.5 text-sm text-cub-muted">
                    {meta.examples.slice(0, 3).map((example) => (
                      <li key={example}>· {example}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-auto pt-1">
                <Link href={href}>
                  <Button
                    variant={earnType === "bonus" ? "reward" : "secondary"}
                    fullWidth
                    size={isCompact ? "sm" : "md"}
                  >
                    {ctaLabel}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
