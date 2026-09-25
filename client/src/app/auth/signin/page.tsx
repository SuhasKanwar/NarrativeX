import { redirect } from "next/navigation";
import AuthPanel from "@/components/auth/AuthPanel";
import { getAuthSession } from "@/lib/session";
import {
  AUTH_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "@/lib/config";

export default async function SignInPage() {
  const session = await getAuthSession();

  if (session) {
    redirect(AUTH_CALLBACK_URL);
  }

  return (
    <AuthPanel
      mode="signin"
      googleEnabled={Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)}
    />
  );
}
