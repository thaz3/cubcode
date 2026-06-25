import Link from "next/link";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { FamilySettingsForm } from "@/components/family-settings-form";
import { GuardianNudgePreferencesForm } from "@/components/guardian-nudge-preferences-form";
import { GuardianNudgeRulesForm } from "@/components/guardian-nudge-rules-form";
import { ParentPinSettingsForm } from "@/components/parent-pin-settings-form";
import { auth } from "@/lib/auth";
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
  const guardianNudgeSummary = [
    `${enabledTaskNudges} of ${taskNudgeRules.length} task reminders on`,
    guardianPrefs.dailySummaryEnabled ? "daily summary on" : null,
    guardianPrefs.quietHoursStart && guardianPrefs.quietHoursEnd
      ? "quiet hours set"
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Protected by your parent PIN. Household rules and Guardian Nudges live here."
        backHref="/dashboard"
        backLabel="Home"
      />

      {!hasPin ? (
        <Card>
          <p className="text-sm text-zinc-400">
            Set your parent PIN below first. Then you can edit caps, exchange
            rates, Guardian Nudge rules, quiet hours, and daily summary time.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-amber-500">
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
            title="Guardian Nudges"
            summary={guardianNudgeSummary}
            defaultOpen={false}
          >
            <p className="text-sm text-zinc-500">
              Parent-first reminders in the app only. C.U.B. Code informs the
              guardian. You decide the response.
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Each task shows one nudge at a time — the highest-priority rule
              that applies (review, then overdue, then due soon, then no action).
              Task rules save individually for now. Daily summary time and quiet
              hours save together below.
            </p>
            <div className="mt-4 space-y-6">
              <GuardianNudgeRulesForm rules={guardianRules} />
              <GuardianNudgePreferencesForm preferences={guardianPrefs} />
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
            ? "Your PIN unlocks the parent area from Cub view and protects changes to household rules and Guardian Nudges."
            : "Set a PIN first. Household rules and Guardian Nudge settings stay locked until you do."}
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
            <span className="text-sm font-medium text-amber-500 hover:text-amber-400">
              Manage Cubs →
            </span>
          </Link>
        ) : null}
      </Card>
    </div>
  );
}
