import { redirect } from "next/navigation";

type CubTasksRedirectProps = {
  params: Promise<{ cubId: string }>;
};

/** Legacy Overview URL — merged into the Today home page. */
export default async function CubTasksRedirectPage({
  params,
}: CubTasksRedirectProps) {
  const { cubId } = await params;
  redirect(`/cub/${cubId}#den`);
}
