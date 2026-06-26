import Link from "next/link";
import { TaskTemplateForm } from "@/components/task-template-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  deactivateTaskTemplateAction,
  updateTaskTemplateAction,
} from "@/lib/actions/task-templates";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { parseRecurrenceConfigValue } from "@/lib/task-recurrence-config";

type EditTemplatePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const template = await db.taskTemplate.findFirst({
    where: { id, familyId: family.id },
  });

  if (!template) notFound();

  const boundUpdate = updateTaskTemplateAction.bind(null, id);
  const boundDeactivate = deactivateTaskTemplateAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/tasks/templates"
          className="text-sm font-medium text-amber-700"
        >
          ← Themed task packs
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Edit training pack</h1>
      </div>

      <Card>
        <TaskTemplateForm
          action={boundUpdate}
          submitLabel="Save training pack"
          initialRecurrence={template.recurrence}
          initialRecurrenceConfig={parseRecurrenceConfigValue(template.recurrenceConfig)}
          initialValues={{
            title: template.title,
            description: template.description ?? "",
            category: template.category,
            subcategory: template.subcategory ?? undefined,
            growthCategory: template.growthCategory ?? undefined,
            proofType: template.proofType,
            proofPrompt: template.proofPrompt ?? "",
            proofChecklistItems: Array.isArray(template.proofChecklistItems)
              ? (template.proofChecklistItems as string[])
              : [],
          }}
        />
      </Card>

      {template.isActive ? (
        <Card className="border-red-200 dark:border-red-900">
          <h2 className="font-semibold text-red-700">Deactivate training pack</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Hides this pack from themed task packs. Assigned tasks are not deleted.
          </p>
          <form action={boundDeactivate} className="mt-4">
            <Button type="submit" variant="danger">
              Deactivate
            </Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
