import Link from "next/link";
import { AssignTemplateForm } from "@/components/assign-template-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createTaskFromTemplateAction } from "@/lib/actions/task-templates";
import { formatProofType } from "@/lib/task-labels";
import { formatTaskCategory } from "@/lib/task-categories";
import type { TaskTemplate } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type TaskTemplateCardProps = {
  template: TaskTemplate;
  highlight?: "legacy" | "summer";
  cubs?: Array<{ id: string; displayName: string }>;
};

export function TaskTemplateCard({
  template,
  highlight,
  cubs = [],
}: TaskTemplateCardProps) {
  return (
    <Card
      className={cn(
        highlight === "legacy" &&
          "border-violet-200 bg-violet-50/40 dark:border-violet-900 dark:bg-violet-950/20",
        highlight === "summer" &&
          "border-sky-200 bg-sky-50/40 dark:border-sky-900 dark:bg-sky-950/20",
      )}
    >
      <div className="space-y-4">
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
          <Link href={`/dashboard/tasks/templates/${template.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
        </div>

        {template.isActive ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <p className="text-sm font-medium text-zinc-200">Assign to Cub</p>
            <p className="mt-1 text-xs text-zinc-500">
              Creates the task and assigns it in one step.
            </p>
            <div className="mt-3">
              <AssignTemplateForm templateId={template.id} cubs={cubs} />
            </div>
          </div>
        ) : null}

        {template.isActive ? (
          <form
            action={async () => {
              "use server";
              await createTaskFromTemplateAction(template.id);
            }}
          >
            <Button type="submit" variant="secondary" fullWidth>
              Save to task library (assign later)
            </Button>
          </form>
        ) : null}
      </div>
    </Card>
  );
}
