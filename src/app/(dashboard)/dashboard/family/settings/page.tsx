import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { FamilySettingsForm } from "@/components/family-settings-form";
import { ParentPinSettingsForm } from "@/components/parent-pin-settings-form";
import { auth } from "@/lib/auth";
import { getFamilyForUser } from "@/lib/session";
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Household rules, caps, and exchange rates for your family."
        backHref="/dashboard"
        backLabel="Today"
      />

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

      <ParentPinSettingsForm hasPin={Boolean(family.parentPinHash)} />

      <FamilySettingsForm
        initialValues={{
          name: family.name ?? "",
          dailyPhoneCapMinutes: family.dailyPhoneCapMinutes,
          weekendBankCapMinutes: family.weekendBankCapMinutes,
          exchangeFocusMinutes: family.exchangeFocusMinutes,
          exchangePhoneMinutes: family.exchangePhoneMinutes,
        }}
      />

      <Card className="bg-zinc-900/60">
        <p className="text-sm text-zinc-400">
          C.U.B. Code calculates earned digital freedom. Parents control access.
          This MVP does not lock phones or block apps automatically.
        </p>
        <Link href="/dashboard/cubs" className="mt-4 inline-block">
          <span className="text-sm font-medium text-amber-500 hover:text-amber-400">
            Manage Cubs →
          </span>
        </Link>
      </Card>
    </div>
  );
}
