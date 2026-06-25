import { CubProgressTabs } from "@/components/cub-progress-tabs";

type CubProgressLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ cubId: string }>;
};

export default async function CubProgressLayout({
  children,
  params,
}: CubProgressLayoutProps) {
  const { cubId } = await params;

  return (
    <div className="space-y-6">
      <CubProgressTabs cubId={cubId} />
      {children}
    </div>
  );
}
