import { CubHeader } from "@/components/cub-header";
import { CubNav } from "@/components/cub-nav";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { redirect } from "next/navigation";

type CubScopedLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ cubId: string }>;
};

export default async function CubScopedLayout({
  children,
  params,
}: CubScopedLayoutProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { cub } = await requireCubForUser(cubId, session.user.id);

  return (
    <>
      <CubHeader displayName={cub.displayName} />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-nav-safe lg:py-8">
        {children}
      </main>
      <CubNav cubId={cubId} />
    </>
  );
}
