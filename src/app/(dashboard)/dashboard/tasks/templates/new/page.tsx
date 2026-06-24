import Link from "next/link";
import { CreateTaskTemplateForm } from "@/components/task-template-form";
import { Card } from "@/components/ui/card";

export default function NewTaskTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/tasks/templates"
          className="text-sm font-medium text-amber-700"
        >
          ← Templates
        </Link>
        <h1 className="mt-2 text-3xl font-bold">New task template</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Templates are reusable titles and descriptions. Each Cub&apos;s Focus
          Block and proof settings live on their profile.
        </p>
      </div>
      <Card>
        <CreateTaskTemplateForm />
      </Card>
    </div>
  );
}
