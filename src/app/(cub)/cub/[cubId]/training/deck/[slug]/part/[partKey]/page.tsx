import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CubKidHero, CubKidPanel, CubKidTipCard } from "@/components/cub-kid";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { CUB_PAGE_EMOJI, cubKidSectionEyebrow, cubKidSectionTitle, cubKidTextMuted } from "@/lib/cub-kid-theme";
import { db } from "@/lib/db";
import { getDouglassProfileLabPath } from "@/lib/liberation-lab/douglass-profile-storage";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
import { getTrainingPartDefinition } from "@/lib/training-deck-definitions";
import { ensureTrainingBoardSeeded } from "@/lib/training-deck-seed";
import {
  getPartMissionSteps,
  PART_STEP_TYPE_STYLES,
} from "@/lib/training-part-steps";
import { cn } from "@/lib/utils";

type CubTrainingPartPageProps = {
  params: Promise<{ cubId: string; slug: string; partKey: string }>;
};

export default async function CubTrainingPartPage({ params }: CubTrainingPartPageProps) {
  const { cubId, slug, partKey } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const part = getTrainingPartDefinition(slug, partKey);
  if (!part) notFound();

  const { deck, card } = part;
  const missionSteps = getPartMissionSteps(card);

  await ensureTrainingBoardSeeded(familyId);

  const starterKey = `${slug}:${partKey}`;
  const focusCard = await db.focusActivityCard.findFirst({
    where: { familyId, starterKey, status: "ACTIVE" },
    select: { id: true },
  });

  const activeTask = focusCard
    ? await db.task.findFirst({
        where: {
          familyId,
          cubId: cub.id,
          focusActivityCardId: focusCard.id,
          status: { in: ACTIVE_CUB_STATUSES },
        },
        select: { id: true },
        orderBy: { updatedAt: "desc" },
      })
    : null;

  const assignmentHref = activeTask
    ? `/cub/${cubId}/tasks/${activeTask.id}`
    : `/cub/${cubId}/training/deck/${slug}`;

  const isPart1Douglass = partKey === "part-1-frederick-douglass";
  const profileLabHref = isPart1Douglass
    ? getDouglassProfileLabPath(cubId, slug, partKey)
    : null;

  return (
    <div className="space-y-5">
      <CubKidHero
        title={card.title}
        subtitle={card.description}
        emoji={CUB_PAGE_EMOJI.level}
        backHref={`/cub/${cubId}/training/deck/${slug}`}
        backLabel={deck.title}
      />

      <CubKidTipCard title="Mission Briefing">
        In this part, you will study the source material, complete the reflection work, and
        enter the Liberation Lab. When you finish, return to your Cub Code assignment and
        submit your reflection for parent review.
      </CubKidTipCard>

      <CubKidPanel variant="violet" contentClassName="space-y-2">
        <p className={cubKidSectionEyebrow}>
          Liberation Lab · Milestone {deck.milestoneNumber}
        </p>
        <h2 className={cn(cubKidSectionTitle, "text-xl")}>{deck.title}</h2>
        <p className={cn("text-sm font-medium", cubKidTextMuted)}>{deck.description}</p>
      </CubKidPanel>

      <CubKidPanel variant="gold" contentClassName="space-y-4">
        <div>
          <p className={cubKidSectionEyebrow}>Mission Steps</p>
          <p className={cn("mt-1 text-sm", cubKidTextMuted)}>
            Work through each step in order. You can come back here anytime.
          </p>
        </div>

        <ol className="space-y-3">
          {missionSteps.map((step, index) => {
            const styles = PART_STEP_TYPE_STYLES[step.type];
            const stepHref =
              step.href ??
              (step.stepKind === "WORKSHEET"
                ? `/cub/${cubId}/training/deck/${slug}/part/${partKey}/worksheet`
                : step.stepKind === "LAB" && profileLabHref
                  ? profileLabHref
                  : undefined);

            return (
              <li
                key={`${step.type}-${step.title}`}
                className={cn(
                  "overflow-hidden rounded-2xl border-2 p-4 shadow-md",
                  styles.card,
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
                    Step {index + 1}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      styles.badge,
                    )}
                  >
                    {step.type}
                  </span>
                </div>

                <h3 className="mt-2 text-base font-black text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-200">{step.helperText}</p>

                <div className="mt-4 space-y-2">
                  {stepHref && step.external ? (
                    <a
                      href={stepHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cub-gold-warm/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                        styles.button,
                      )}
                    >
                      {step.buttonLabel}
                    </a>
                  ) : stepHref ? (
                    <Link href={stepHref} className="block">
                      <Button
                        type="button"
                        size="md"
                        fullWidth
                        className={cn("font-bold text-white", styles.button)}
                      >
                        {step.buttonLabel}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      type="button"
                      size="md"
                      fullWidth
                      className={cn("font-bold text-white", styles.button)}
                    >
                      {step.buttonLabel}
                    </Button>
                  )}

                  {step.stepKind === "PBS" && step.fallbackUrl && step.teacherCode ? (
                    <p className="text-xs leading-relaxed text-zinc-400">
                      Having trouble? Go to{" "}
                      <a
                        href={step.fallbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sky-300 underline underline-offset-2 hover:text-sky-200"
                      >
                        PBS LearningMedia Student
                      </a>{" "}
                      and enter teacher code:{" "}
                      <span className="font-mono font-semibold text-zinc-200">
                        {step.teacherCode}
                      </span>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CubKidPanel>

      <CubKidPanel variant="violet" contentClassName="space-y-3">
        <h2 className={cn(cubKidSectionTitle, "text-lg")}>Return to assignment</h2>
        <p className={cn("text-sm leading-relaxed", cubKidTextMuted)}>
          When you finish these steps, go back to your assignment and submit your reflection
          for parent review.
        </p>
        <Link href={assignmentHref}>
          <Button size="lg" fullWidth className="font-bold">
            Back to assignment ▶
          </Button>
        </Link>
      </CubKidPanel>
    </div>
  );
}
