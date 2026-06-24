import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FamilySettingsForm } from "@/components/family-settings-form";
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
      <div>
        <h1 className="text-3xl font-bold">Family settings</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Household caps and exchange rules apply to the whole family. Age band
          defaults on a Cub profile can suggest these values with{" "}
          <strong>Use suggested caps</strong>.
        </p>
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

      <Card className="bg-zinc-50 dark:bg-zinc-900/40">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          C.U.B. Code calculates earned digital freedom. Parents control access.
          This MVP does not lock phones or block apps automatically.
        </p>
        <Link href="/dashboard/cubs/new" className="mt-4 inline-block">
          <Button variant="secondary">Add or edit Cubs</Button>
        </Link>
      </Card>
    </div>
  );
}
