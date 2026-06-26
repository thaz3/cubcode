import { redirect } from "next/navigation";

type CubProgressLayoutProps = {
  children: React.ReactNode;
};

export default function CubProgressLayout({ children }: CubProgressLayoutProps) {
  return <div className="space-y-6">{children}</div>;
}
