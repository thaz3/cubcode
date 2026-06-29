import { redirect } from "next/navigation";

export default function TaskReviewQueueRedirectPage() {
  redirect("/dashboard/tasks#in-review");
}
