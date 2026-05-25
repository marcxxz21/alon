"use client";

import { useState } from "react";
import { getBrowserSupabase, hasBrowserSupabaseConfig } from "@/lib/supabase-browser";

export function AuthCard() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable live auth.");
      return;
    }

    setIsSubmitting(true);
    const response = mode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);
    if (response.error) {
      setError(response.error.message);
      return;
    }

    setMessage(mode === "signup" ? "Check your email if confirmation is enabled." : "Signed in. Opening your dashboard.");
    if (mode === "login") window.location.href = "/dashboard";
  }

  return (
    <section className="auth-card glass-tile" aria-label="Supabase authentication">
      <div>
        <p className="micro-label">Supabase Auth</p>
        <h1>{mode === "login" ? "Welcome back to Alon" : "Create your Alon account"}</h1>
        <p className="muted-copy">
          Your tracker, holdings, notes, and portfolio snapshots are tied to this account and load on every device.
        </p>
      </div>

      {!hasBrowserSupabaseConfig() ? (
        <div className="inline-warning">
          Live auth is waiting for Supabase environment variables. The UI still runs in portfolio demo mode.
        </div>
      ) : null}

      <form className="stack-form" onSubmit={submit}>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
            required
            type="password"
            value={password}
          />
        </label>
        {error ? <p className="form-message error">{error}</p> : null}
        {message ? <p className="form-message success">{message}</p> : null}
        <button className="deck-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <button
        className="ghost-action"
        type="button"
        onClick={() => {
          setMode((current) => current === "login" ? "signup" : "login");
          setError(null);
          setMessage(null);
        }}
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
      </button>
    </section>
  );
}
