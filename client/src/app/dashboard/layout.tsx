import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/session";
import WorkspaceShell from "@/components/dashboard/WorkspaceShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session?.accessToken) redirect("/auth/signin?callbackUrl=/dashboard");
  return (
    <WorkspaceShell
      name={session.user?.name || "Researcher"}
      imageUrl={session.user?.image}
    >
      {children}
    </WorkspaceShell>
  );
}
