import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ParentGateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <div className="min-h-dvh bg-zinc-950">{children}</div>;
}
