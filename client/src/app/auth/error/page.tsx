import { redirect } from "next/navigation";
import StatusScreen from "@/components/ui/StatusScreen";
import { getAuthSession } from "@/lib/session";

const errorMessages: Record<string, string> = {
  AccessDenied:
    "NarrativeX could not verify that request. Try signing in again.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
  OAuthAccountNotLinked:
    "That Google account is already linked to a different sign-in method.",
  CredentialsSignin: "The email or password was rejected by the server.",
  Default:
    "Authentication failed. Try again or use a different sign-in method.",
};

const content = {
  code: "SIGN-IN INTERRUPTED",
  title: "One more connection.",
  action: { label: "Back to sign in", href: "/auth/signin" },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getAuthSession();

  if (session) {
    redirect("/");
  }

  const code = (await searchParams)?.error ?? "Default";
  const message = errorMessages[code] ?? errorMessages.Default;

  return <StatusScreen {...content} description={message} />;
}
