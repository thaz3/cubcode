import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateTaskTemplateForm } from "@/components/task-template-form";
import { Card } from "@/components/ui/card";
import {
  GET_SOME_SUN_LABEL,
  KNOW_YOUR_ROOTS_LABEL,
} from "@/lib/themed-training-packs";
import {
  getLegacyStarterDefaults,
} from "@/lib/legacy-task-templates";
import {
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

  if (!isLegacy && !isSummer) {
    redirect("/dashboard/tasks/templates");
  }

  const legacyDefaults = isLegacy ? getLegacyStarterDefaults() : undefined;
  const summerDefaults = isSummer ? getSummerStarterDefaults() : undefined;
  const categoryDefaults = summerDefaults ?? legacyDefaults;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={
            isSummer
              ? "/dashboard/tasks/templates#get-some-sun"
              : "/dashboard/tasks/templates#know-your-roots"
          }
          className="text-sm font-medium text-amber-700"
        >
          ← {isSummer ? GET_SOME_SUN_LABEL : "Themed task packs"}
        </Link>
        <h1 className="mt-2 text-3xl font-bold">
          {isLegacy
            ? `New ${KNOW_YOUR_ROOTS_LABEL} pack`
            : `New ${GET_SOME_SUN_LABEL} pack`}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isLegacy
            ? "Black history awareness, family identity, and community pride. Parent approval is always required."
            : `${GET_SOME_SUN_LABEL} outdoor summer learning includes location and supervision in the description. Parent approval is always required.`}
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
