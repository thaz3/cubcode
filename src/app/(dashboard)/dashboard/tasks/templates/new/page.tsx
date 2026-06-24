import Link from "next/link";
import { CreateTaskTemplateForm } from "@/components/task-template-form";
import { Card } from "@/components/ui/card";
import {
  LEGACY_WEEKLY_LABEL,
  getLegacyStarterDefaults,
} from "@/lib/legacy-task-templates";
import {
  SUMMER_LITE_LABEL,
  getSummerStarterDefaults,
} from "@/lib/summer-task-templates";

type NewTaskTemplatePageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function NewTaskTemplatePage({
  searchParams,
}: NewTaskTemplatePageProps) {
  const { type } = await searchParams;
  const isLegacy = type === "legacy";
  const isSummer = type === "summer";
  const legacyDefaults = isLegacy ? getLegacyStarterDefaults() : undefined;
  const summerDefaults = isSummer ? getSummerStarterDefaults() : undefined;
  const categoryDefaults = summerDefaults ?? legacyDefaults;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={
            isSummer
              ? "/dashboard/tasks/summer"
              : "/dashboard/tasks/templates"
          }
          className="text-sm font-medium text-amber-700"
        >
          ← {isSummer ? "Summer task board" : "Templates"}
        </Link>
        <h1 className="mt-2 text-3xl font-bold">
          {isLegacy
            ? `New ${LEGACY_WEEKLY_LABEL} template`
            : isSummer
              ? `New ${SUMMER_LITE_LABEL} template`
              : "New task template"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isLegacy
            ? "Weekly Legacy tasks build cultural memory and family identity. Parent approval is always required."
            : isSummer
              ? "Summer Lite outdoor tasks include location and supervision in the description. Parent approval is always required."
              : "Templates are reusable titles and descriptions. Earned amounts come from each Cub's profile when assigned."}
        </p>
      </div>
      <Card>
        <CreateTaskTemplateForm
          initialValues={
            categoryDefaults
              ? {
                  category: categoryDefaults.category,
                  subcategory: categoryDefaults.subcategory,
                  title: categoryDefaults.title,
                  description: categoryDefaults.description,
                  proofType: categoryDefaults.proofType,
                  proofPrompt: categoryDefaults.proofPrompt,
                  proofChecklistItems: categoryDefaults.proofChecklistItems,
                }
              : undefined
          }
        />
      </Card>
    </div>
  );
}
