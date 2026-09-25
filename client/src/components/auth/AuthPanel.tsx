"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import NarrativeNetwork from "@/components/ui/NarrativeNetwork";
import { AUTH_CALLBACK_URL } from "@/lib/config";

const content = {
  signin: {
    eyebrow: "WELCOME BACK",
    title: "A fresh perspective\nawaits.",
    description: "Sign in to continue your NarrativeX journey.",
    submit: "Sign in",
    pending: "Signing you in…",
    switchText: "New to NarrativeX?",
    switchLabel: "Create an account",
    switchHref: "/auth/signup",
    error:
      "We couldn't sign you in. Check your details or try another sign-in method.",
  },
  signup: {
    eyebrow: "FOR THE CURIOUS",
    title: "See the story\ndifferently.",
    description: "Create your account. Start with a little curiosity.",
    submit: "Create account",
    pending: "Creating your account…",
    switchText: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/auth/signin",
    error:
      "We couldn't create your account. Try signing in if you already have one, or try again later.",
  },
  shared: {
    back: "Back to home",
    google: "Continue with Google",
    divider: "or continue with email",
    show: "Show password",
    hide: "Hide password",
    passwordHint: "Use at least 8 characters.",
    note: "Your perspective matters. Keep your account details private.",
    visualLabel: "CONTEXT CHANGES EVERYTHING",
    visualTitle: "One claim.\nMany perspectives.",
    visualDescription:
      "Connect the dots between what is said and what is supported.",
    visualCaption: "AN ILLUSTRATION OF CONNECTED IDEAS",
  },
  fields: [
    {
      name: "name",
      label: "Full name",
      placeholder: "Your name",
      type: "text",
      autocomplete: "name",
    },
    {
      name: "email",
      label: "Email address",
      placeholder: "you@example.com",
      type: "email",
      autocomplete: "email",
    },
    {
      name: "password",
      label: "Password",
      placeholder: "Enter your password",
      type: "password",
      autocomplete: "current-password",
    },
  ],
};

export default function AuthPanel({
  mode,
  googleEnabled = false,
}: {
  mode: "signin" | "signup";
  googleEnabled?: boolean;
}) {
  const copy = content[mode];
  const shared = content.shared;
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const fields = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        name: String(fields.get("name") ?? "").trim(),
        email: String(fields.get("email") ?? "").trim(),
        password: fields.get("password"),
        register: String(mode === "signup"),
        redirect: false,
        callbackUrl: AUTH_CALLBACK_URL,
      });
      if (!result?.ok || result.error) setError(copy.error);
      else {
        router.replace(AUTH_CALLBACK_URL);
        router.refresh();
      }
    } catch {
      setError(copy.error);
    } finally {
      setPending(false);
    }
  }

  async function googleSignIn() {
    setPending(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: AUTH_CALLBACK_URL });
    } catch {
      setError(copy.error);
      setPending(false);
    }
  }

  return (
    <main
      className="auth-layout grid min-h-svh md:h-svh md:grid-cols-2 md:overflow-hidden"
      id="main-content"
    >
      <section className="auth-main flex min-h-svh flex-col px-6 py-6 md:h-svh md:px-[5vw] md:py-7">
        <Logo />
        <div className="auth-form-wrap m-auto w-full max-w-97.5 py-5 motion-safe:animate-enter md:py-4 [@media(max-height:850px)]:scale-[.88] [@media(max-height:850px)]:py-0 [&>h1]:whitespace-pre-line [&>h1]:text-[clamp(2.5rem,3.5vw,3.8rem)] [&>h1]:leading-[1.08] [&>h1]:tracking-[-.06em] [&>.eyebrow]:mb-4">
          <Link
            className="text-link inline-flex items-center gap-3.5 text-xs hover:underline underline-offset-4 back-link mb-8 text-muted md:mb-10"
            href="/"
          >
            <ArrowLeft size={15} />
            {shared.back}
          </Link>
          <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
            {copy.eyebrow}
          </p>
          <h1>{copy.title}</h1>
          <p className="auth-description mt-5 mb-8 text-sm leading-6 text-muted">
            {copy.description}
          </p>
          {googleEnabled && (
            <>
              <button
                className="button inline-flex min-h-13.5 items-center justify-center gap-7 rounded-sm border border-transparent px-6 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 button-outline border-border bg-surface-raised hover:bg-surface google-button w-full"
                disabled={pending}
                onClick={googleSignIn}
              >
                <span
                  className="google-mark text-lg font-bold"
                  aria-hidden="true"
                >
                  G
                </span>
                {shared.google}
              </button>
              <div className="form-divider my-6 flex items-center gap-3.5 text-[.68rem] text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                <span>{shared.divider}</span>
              </div>
            </>
          )}
          <form onSubmit={submit} aria-busy={pending}>
            {content.fields
              .filter((field) => field.name !== "name" || mode === "signup")
              .map((field) => (
                <div
                  className="form-field mb-5 [&>label]:mb-2 [&>label]:block [&>label]:text-xs [&>label]:font-semibold [&_input]:min-h-12.5 [&_input]:w-full [&_input]:rounded-sm [&_input]:border [&_input]:border-border [&_input]:bg-surface-raised [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-foreground [&_input::placeholder]:text-muted [&_input[name=password]]:pr-12"
                  key={field.name}
                >
                  <label htmlFor={field.name}>{field.label}</label>
                  <div className="input-wrap relative">
                    <input
                      id={field.name}
                      name={field.name}
                      type={
                        field.name === "password" && showPassword
                          ? "text"
                          : field.type
                      }
                      placeholder={field.placeholder}
                      autoComplete={
                        field.name === "password" && mode === "signup"
                          ? "new-password"
                          : field.autocomplete
                      }
                      required
                      disabled={pending}
                      minLength={
                        field.name === "password" && mode === "signup"
                          ? 8
                          : undefined
                      }
                      maxLength={field.name === "name" ? 100 : undefined}
                      aria-describedby={
                        field.name === "password" && mode === "signup"
                          ? "password-hint"
                          : undefined
                      }
                    />
                    {field.name === "password" && (
                      <button
                        type="button"
                        className="password-toggle absolute top-0.5 right-0.5 flex size-11 items-center justify-center text-muted"
                        aria-label={showPassword ? shared.hide : shared.show}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    )}
                  </div>
                  {field.name === "password" && mode === "signup" && (
                    <p
                      className="field-hint mt-2 text-[.68rem] text-muted"
                      id="password-hint"
                    >
                      {shared.passwordHint}
                    </p>
                  )}
                </div>
              ))}
            {error && (
              <p
                className="form-error mb-3.5 rounded-sm bg-error-surface p-3.5 text-xs leading-6 text-error"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              className="button inline-flex min-h-13.5 items-center justify-center gap-7 rounded-sm border border-transparent px-6 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 button-primary bg-accent text-accent-ink hover:bg-accent-hover auth-submit mt-2 w-full"
              type="submit"
              disabled={pending}
            >
              {pending ? copy.pending : copy.submit}
              {pending ? (
                <LoaderCircle
                  className="spinner motion-safe:animate-spin"
                  size={18}
                />
              ) : (
                <ArrowUpRight size={18} />
              )}
            </button>
          </form>
          <p className="auth-switch mt-7 text-center text-xs text-muted [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
            {copy.switchText}{" "}
            <Link href={copy.switchHref}>{copy.switchLabel}</Link>
          </p>
        </div>
        <p className="auth-note text-center text-[.62rem] leading-6 text-muted">
          {shared.note}
        </p>
      </section>
      <aside className="auth-visual my-3.5 mr-3.5 hidden h-[calc(100svh-1.75rem)] flex-col justify-center overflow-hidden rounded-md bg-dark-surface px-[5vw] pt-12 pb-6 text-inverse md:flex [@media(max-height:850px)]:scale-[.94] [@media(max-height:850px)]:origin-center [&>h2]:my-6 [&>p:not(.eyebrow)]:max-w-80 [&>p:not(.eyebrow)]:text-sm [&>p:not(.eyebrow)]:leading-7 [&>p:not(.eyebrow)]:text-dark-muted [&_.narrative-network]:mt-1 [&_.narrative-network]:max-h-105 bg-[linear-gradient(var(--dark-border)_1px,transparent_1px),linear-gradient(90deg,var(--dark-border)_1px,transparent_1px)] bg-size-[65px_65px]">
        <p className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase">
          {shared.visualLabel}
        </p>
        <h2>{shared.visualTitle}</h2>
        <p>{shared.visualDescription}</p>
        <NarrativeNetwork />
        <span className="eyebrow text-[.66rem] font-semibold leading-relaxed tracking-[.14em] uppercase auth-visual-caption text-center text-[.56rem] text-dark-muted">
          {shared.visualCaption}
        </span>
      </aside>
    </main>
  );
}
