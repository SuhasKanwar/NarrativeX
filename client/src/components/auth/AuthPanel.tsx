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
import { Brand } from "@/components/ui/SiteChrome";
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
    <main className="auth-layout" id="main-content">
      <section className="auth-main">
        <Brand />
        <div className="auth-form-wrap">
          <Link className="text-link back-link" href="/">
            <ArrowLeft size={15} />
            {shared.back}
          </Link>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="auth-description">{copy.description}</p>
          {googleEnabled && (
            <>
              <button
                className="button button-outline google-button"
                disabled={pending}
                onClick={googleSignIn}
              >
                <span className="google-mark" aria-hidden="true">
                  G
                </span>
                {shared.google}
              </button>
              <div className="form-divider">
                <span>{shared.divider}</span>
              </div>
            </>
          )}
          <form onSubmit={submit} aria-busy={pending}>
            {content.fields
              .filter((field) => field.name !== "name" || mode === "signup")
              .map((field) => (
                <div className="form-field" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <div className="input-wrap">
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
                        className="password-toggle"
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
                    <p className="field-hint" id="password-hint">
                      {shared.passwordHint}
                    </p>
                  )}
                </div>
              ))}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button button-primary auth-submit"
              type="submit"
              disabled={pending}
            >
              {pending ? copy.pending : copy.submit}
              {pending ? (
                <LoaderCircle className="spinner" size={18} />
              ) : (
                <ArrowUpRight size={18} />
              )}
            </button>
          </form>
          <p className="auth-switch">
            {copy.switchText}{" "}
            <Link href={copy.switchHref}>{copy.switchLabel}</Link>
          </p>
        </div>
        <p className="auth-note">{shared.note}</p>
      </section>
      <aside className="auth-visual">
        <p className="eyebrow">{shared.visualLabel}</p>
        <h2>{shared.visualTitle}</h2>
        <p>{shared.visualDescription}</p>
        <NarrativeNetwork />
        <span className="eyebrow auth-visual-caption">
          {shared.visualCaption}
        </span>
      </aside>
    </main>
  );
}
