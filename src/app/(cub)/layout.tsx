import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function CubShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-zinc-950">{children}</div>;
}
