import Link from "next/link";
import { CreateTaskTemplateForm } from "@/components/task-template-form";
import { Card } from "@/components/ui/card";
import { LEGACY_WEEKLY_LABEL, getLegacyStarterDefaults } from "@/lib/legacy-task-templates";

type NewTaskTemplatePageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function NewTaskTemplatePage({
  searchParams,
}: NewTaskTemplatePageProps) {
  const { type } = await searchParams;
  const isLegacy = type === "legacy";
  const legacyDefaults = isLegacy ? getLegacyStarterDefaults() : undefined;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/tasks/templates"
          className="text-sm font-medium text-amber-700"
        >
          ← Templates
        </Link>
        <h1 className="mt-2 text-3xl font-bold">
          {isLegacy ? `New ${LEGACY_WEEKLY_LABEL} template` : "New task template"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isLegacy
            ? "Weekly Legacy tasks build cultural memory and family identity. Parent approval is always required."
            : "Templates are reusable titles and descriptions. Earned amounts come from each Cub's profile when assigned."}
        </p>
      </div>
      <Card>
        <CreateTaskTemplateForm
          initialValues={
            legacyDefaults
              ? {
                  category: legacyDefaults.category,
                  subcategory: legacyDefaults.subcategory,
                  title: legacyDefaults.title,
                  description: legacyDefaults.description,
                  proofType: legacyDefaults.proofType,
                  proofPrompt: legacyDefaults.proofPrompt,
                  proofChecklistItems: legacyDefaults.proofChecklistItems,
                }
              : undefined
          }
        />
      </Card>
    </div>
  );
}
