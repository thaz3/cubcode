import { ClearParentUnlockOnCubView } from "@/components/clear-parent-unlock-on-cub-view";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CubShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh cub-app-shell">
      <ClearParentUnlockOnCubView />
      {children}
    </div>
  );
}
