import Link from "next/link";
import { redirect } from "next/navigation";

export default function TaskLibraryPage() {
  redirect("/dashboard/tasks#ready-to-assign");
}
