import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CubColorDot } from "@/components/cub-color-dot";
import { EmptyState } from "@/components/ui/empty-state";
import {
  cubKidGameCard,
  cubKidSectionEyebrow,
  cubKidSectionTitle,
  cubKidTextMuted,
} from "@/lib/cub-kid-theme";
import { auth } from "@/lib/auth";
import { getFamilyForUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function CubPickerPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  if (family.cubs.length === 0) {
    return (
      <main className="cub-kid-atmosphere mx-auto max-w-md px-4 py-16">
        <EmptyState
          title="No Cubs yet"
          description="Add a Cub profile in the parent area first."
          actionLabel="Parent area (PIN required)"
          actionHref="/parent/unlock?returnTo=%2Fdashboard%2Fcubs%2Fnew"
        />
      </main>
    );
  }

  if (family.cubs.length === 1) {
    redirect(`/cub/${family.cubs[0]!.id}`);
  }

  return (
    <main className="cub-kid-atmosphere mx-auto max-w-md space-y-6 px-4 py-16 pb-nav-safe">
      <div className="text-center">
        <p className={cubKidSectionEyebrow}>🎮 Cub Quest</p>
        <h1 className={cn("mt-2 text-2xl", cubKidSectionTitle)}>
          Who&apos;s playing today?
        </h1>
        <p className={cn("mt-2 text-sm", cubKidTextMuted)}>
          Pick your profile to jump into missions, training, and rewards. Switch
          here anytime if a sibling needs a turn.
        </p>
      </div>
      <ul className="space-y-3">
        {family.cubs.map((cub) => (
          <li key={cub.id}>
            <Link href={`/cub/${cub.id}`}>
              <div
                className={cn(
                  cubKidGameCard,
                  "flex items-center justify-center gap-3 border-kid-purple/25 bg-white py-5 text-center hover:border-kid-purple/45",
                )}
              >
                <CubColorDot cubId={cub.id} className="h-5 w-5" />
                <p className="text-lg font-black text-kid-ink">{cub.displayName}</p>
                <span className="text-lg" aria-hidden>
                  →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/parent/unlock?returnTo=%2Fdashboard" className="block">
        <Button variant="neutral" fullWidth size="lg">
          Parent area
        </Button>
      </Link>
    </main>
  );
}
