import AuthPanel from "@/components/auth/AuthPanel";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "@/lib/config";

export default function SignUpPage() {
  return (
    <AuthPanel
      mode="signup"
      googleEnabled={Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)}
    />
  );
}
