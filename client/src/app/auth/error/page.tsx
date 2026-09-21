import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import StatusScreen from "@/components/ui/StatusScreen";
import { getAuthSession } from "@/lib/session";

const errorMessages: Record<string, string> = {
    AccessDenied: "NarrativeX could not verify that request. Try signing in again.",
    Configuration: "Auth is misconfigured. Check the provider and environment values.",
    OAuthAccountNotLinked: "That Google account is already linked to a different sign-in method.",
    CredentialsSignin: "The email or password was rejected by the server.",
    Default: "Authentication failed. Try again or use a different sign-in method.",
};

export default async function AuthErrorPage({
    searchParams,
}: {
    searchParams?: Promise<{ error?: string }>;
}) {
    const session = await getAuthSession();

    if (session) {
        redirect("/dashboard");
    }

    const code = (await searchParams)?.error ?? "Default";
    const message = errorMessages[code] ?? errorMessages.Default;

    return (
        <StatusScreen></StatusScreen>
    );
}
