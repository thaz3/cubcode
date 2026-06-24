import { redirect } from "next/navigation";

type CouncilDayRedirectProps = {
  searchParams: Promise<{ week?: string }>;
};

/** @deprecated Use /dashboard/family-day */
export default async function CouncilDayRedirect({
  searchParams,
}: CouncilDayRedirectProps) {
  const { week } = await searchParams;
  const query = week ? `?week=${week}` : "";
  redirect(`/dashboard/family-day${query}`);
}
