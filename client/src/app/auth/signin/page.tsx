import AuthPanel from "@/components/auth/AuthPanel";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "@/lib/config";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ reason?: string }>;
}) {
  const reason = (await searchParams)?.reason;
  return (
    <AuthPanel
      mode="signin"
      googleEnabled={Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)}
      sessionExpired={reason === "session-expired"}
    />
  );
}
