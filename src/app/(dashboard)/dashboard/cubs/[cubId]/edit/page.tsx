import { CubForm } from "@/components/cub-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteCubAction, updateCubAction } from "@/lib/actions/cub";
import { auth } from "@/lib/auth";
import { getFamilyForUser } from "@/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type EditCubPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function EditCubPage({ params }: EditCubPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  const cub = family.cubs.find((item) => item.id === cubId);
  if (!cub) {
    notFound();
  }

  const boundUpdateAction = updateCubAction.bind(null, cubId);
  const boundDeleteAction = deleteCubAction.bind(null, cubId);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/cubs"
          className="text-sm font-medium text-amber-700"
        >
          ← Back to Cubs
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Edit {cub.displayName}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Set age band and task settings for this Cub. Use suggested settings
          if you are not sure where to start.
        </p>
      </div>

      <Card>
        <CubForm
          action={boundUpdateAction}
          initialValues={{
            displayName: cub.displayName,
            ageBand: cub.ageBand,
            focusMinutesEarned: cub.focusMinutesEarned,
            phoneMinutesEarned: cub.phoneMinutesEarned,
            xpEarned: cub.xpEarned,
            focusTokensEarned: cub.focusTokensEarned,
            dailyPhoneCapMinutes: cub.dailyPhoneCapMinutes,
            weekendBankCapMinutes: cub.weekendBankCapMinutes,
            supervisionLevel: cub.supervisionLevel,
          }}
          submitLabel="Save changes"
        />
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
          Remove Cub profile
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This removes the Cub profile from your household. Milestone 1 stores
          no task history yet.
        </p>
        <form action={boundDeleteAction} className="mt-4">
          <Button type="submit" variant="danger">
            Delete Cub
          </Button>
        </form>
      </Card>
    </div>
  );
}
