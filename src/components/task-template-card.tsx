import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createTaskFromTemplateAction } from "@/lib/actions/task-templates";
import { formatProofType } from "@/lib/task-labels";
import { formatTaskCategory } from "@/lib/task-categories";
import type { TaskTemplate } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type TaskTemplateCardProps = {
  template: TaskTemplate;
  highlight?: boolean;
};

export function TaskTemplateCard({ template, highlight = false }: TaskTemplateCardProps) {
  return (
    <Card
      className={cn(
        highlight &&
          "border-violet-200 bg-violet-50/40 dark:border-violet-900 dark:bg-violet-950/20",
      )}
    >
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
  );
}
