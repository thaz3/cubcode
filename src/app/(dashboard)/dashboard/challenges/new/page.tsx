import { redirect } from "next/navigation";

type NewChallengeRedirectProps = {
  searchParams: Promise<{ cubId?: string }>;
};

export default async function NewChallengeRedirectPage({
  searchParams,
}: NewChallengeRedirectProps) {
  const params = await searchParams;
  const query = new URLSearchParams({ kind: "challenge" });
  if (params.cubId) {
    query.set("cubId", params.cubId);
  }
  redirect(`/dashboard/create?${query.toString()}`);
}
