import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createTaskFromTemplateAction } from "@/lib/actions/task-templates";
import { formatProofType } from "@/lib/task-labels";
import { formatTaskCategory } from "@/lib/task-categories";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TaskTemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const templates = await db.taskTemplate.findMany({
    where: { familyId: family.id },
    orderBy: [{ isActive: "desc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/tasks" className="text-sm font-medium text-amber-700">
            ← Assignment board
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Template board</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Reusable task definitions with proof style and instructions. Add a
            template to the assignment board, then assign it to a Cub.
          </p>
        </div>
        <Link href="/dashboard/tasks/templates/new">
          <Button>New template</Button>
        </Link>
      </div>

      {templates.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-500">No templates yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{template.title}</h2>
                    {!template.isActive ? (
                      <span className="text-xs text-zinc-500">(inactive)</span>
                    ) : null}
                  </div>
                  {template.description ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {template.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatTaskCategory(template.category, {
                      subcategory: template.subcategory,
                      growthCategory: template.growthCategory,
                    })}{" "}
                    · {formatProofType(template.proofType)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/tasks/templates/${template.id}/edit`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                  {template.isActive ? (
                    <form
                      action={async () => {
                        "use server";
                        await createTaskFromTemplateAction(template.id);
                      }}
                    >
                      <Button type="submit">Add to assignment board</Button>
                    </form>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
