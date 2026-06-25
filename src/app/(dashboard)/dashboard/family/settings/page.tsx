import Link from "next/link";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { FamilySettingsForm } from "@/components/family-settings-form";
import { GuardianNudgesSettingsForm } from "@/components/guardian-nudges-settings-form";
import { ParentPinSettingsForm } from "@/components/parent-pin-settings-form";
import { auth } from "@/lib/auth";
import { SMALL_REMINDERS_LABEL } from "@/lib/small-reminders-labels";
import {
  ensureDefaultGuardianNudgeRules,
  ensureGuardianNudgePreferences,
} from "@/lib/guardian-nudges/sync";
import { getFamilyForUser } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function FamilySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  const hasPin = Boolean(family.parentPinHash);

  await ensureDefaultGuardianNudgeRules(family.id, session.user.id);
  const [guardianPrefs, guardianRules] = await Promise.all([
    ensureGuardianNudgePreferences(family.id),
    db.guardianNudgeRule.findMany({
      where: { familyId: family.id },
      orderBy: { type: "asc" },
    }),
  ]);

  const taskNudgeRules = guardianRules.filter((rule) => rule.type !== "DAILY_SUMMARY");
  const enabledTaskNudges = taskNudgeRules.filter((rule) => rule.enabled).length;
  const guardianNudgeSummary =
    enabledTaskNudges === 0
      ? "Reminders off"
      : enabledTaskNudges === taskNudgeRules.length
        ? "All reminders on"
        : `${enabledTaskNudges} reminders on`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle={`Protected by your parent PIN. Household rules and ${SMALL_REMINDERS_LABEL} live here.`}
        backHref="/dashboard"
        backLabel="Home"
      />

      {!hasPin ? (
        <Card>
          <p className="text-sm text-zinc-400">
            Set your parent PIN below first. Then you can edit caps, exchange
            rates, {SMALL_REMINDERS_LABEL.toLowerCase()}, and quiet hours.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-cub-gold">
            Back to Dashboard →
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard
              label="Daily phone cap"
              value={`${family.dailyPhoneCapMinutes} min`}
              detail="Max recreational phone time per day"
            />
            <StatCard
              label="Weekend bank cap"
              value={`${family.weekendBankCapMinutes} min`}
              detail="Saved time for weekends"
            />
            <StatCard
              label="Focus exchange"
              value={`${family.exchangeFocusMinutes}→${family.exchangePhoneMinutes}`}
              detail="Focus minutes to phone minutes"
            />
            <StatCard
              label="Family"
              value={family.name ?? "Not set"}
              detail="Household display name"
            />
          </div>

          <FamilySettingsForm
            initialValues={{
              name: family.name ?? "",
              dailyPhoneCapMinutes: family.dailyPhoneCapMinutes,
              weekendBankCapMinutes: family.weekendBankCapMinutes,
              exchangeFocusMinutes: family.exchangeFocusMinutes,
              exchangePhoneMinutes: family.exchangePhoneMinutes,
            }}
          />

          <CollapsibleSection
            title={SMALL_REMINDERS_LABEL}
            summary={guardianNudgeSummary}
            defaultOpen={false}
          >
            <div className="mt-2">
              <GuardianNudgesSettingsForm
                rules={guardianRules}
                preferences={guardianPrefs}
              />
            </div>
          </CollapsibleSection>
        </>
      )}

      <CollapsibleSection
        title="Parent PIN"
        summary={hasPin ? "PIN configured" : "Set a PIN to unlock parent settings"}
        defaultOpen={!hasPin}
        className="border-amber-900/40 bg-amber-950/20"
      >
        <p className="mb-4 text-sm text-zinc-500">
          {hasPin
            ? `Your PIN unlocks the parent area from Cub view and protects changes to household rules and ${SMALL_REMINDERS_LABEL}.`
            : `Set a PIN first. Household rules and ${SMALL_REMINDERS_LABEL} stay locked until you do.`}
        </p>
        <ParentPinSettingsForm hasPin={hasPin} embedded hideHeader />
      </CollapsibleSection>

      <Card className="bg-zinc-900/60">
        <p className="text-sm text-zinc-400">
          C.U.B. Code calculates earned digital freedom. Parents control access.
          This MVP does not lock phones or block apps automatically.
        </p>
        {hasPin ? (
          <Link href="/dashboard/cubs" className="mt-4 inline-block">
            <span className="text-sm font-medium text-cub-gold hover:text-cub-gold-light">
              Manage Cubs →
            </span>
          </Link>
        ) : null}
      </Card>
    </div>
  );
}
