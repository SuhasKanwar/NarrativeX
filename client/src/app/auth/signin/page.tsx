import AuthPanel from "@/components/auth/AuthPanel";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "@/lib/config";

export default function SignInPage() {
  return (
    <AuthPanel
      mode="signin"
      googleEnabled={Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)}
    />
  );
}
