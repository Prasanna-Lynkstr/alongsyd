"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Brand from "@/components/Brand";
import { createClient } from "@/engine/supabase/client";
import { isSupabaseConfigured } from "@/engine/supabase/env";
import { COUNTRY } from "@/config/country";
import { PHONE_AUTH_ENABLED } from "@/config/auth";
import { TAGLINE } from "@/config/welcome";

type Mode = "email" | "phone";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("email");
  const [linkError, setLinkError] = useState(false);

  useEffect(() => {
    // Deferred (not a synchronous effect-body setState) to avoid cascading
    // renders on mount; the value only exists client-side anyway.
    queueMicrotask(() => {
      if (new URLSearchParams(window.location.search).get("error")) {
        setLinkError(true);
      }
    });
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Brand size="lg" href={null} />
        <p className="mt-2 text-sm text-muted">{TAGLINE}</p>
        <p className="mt-6 text-ink">
          Your email is only for sign-in — choose a nickname and avatar;
          that&apos;s your identity here. Share, ask, and lean on each other.
        </p>
      </div>

      {linkError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          That sign-in link didn&apos;t work — it may have expired or already
          been used. Enter your email below to get a fresh one.
        </p>
      )}

      {!isSupabaseConfigured && (
        <p className="mb-4 rounded-lg bg-amber-soft px-4 py-3 text-sm text-amber">
          Sign-in isn&apos;t connected yet. Add your Supabase keys to
          <code className="mx-1">.env.local</code> (see the README).
        </p>
      )}

      {/* Phone OTP is built but off by default (NEXT_PUBLIC_PHONE_AUTH=true to
          re-enable). When off, we show email magic-link only. */}
      {PHONE_AUTH_ENABLED && (
        <div className="mb-4 flex rounded-full bg-cream p-1 text-sm font-medium">
          {(["email", "phone"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full py-2 capitalize transition ${
                mode === m ? "bg-surface text-teal-strong shadow-sm" : "text-muted"
              }`}
            >
              {m === "email" ? "Email link" : "Phone (OTP)"}
            </button>
          ))}
        </div>
      )}

      {PHONE_AUTH_ENABLED && mode === "phone" ? <PhoneForm /> : <EmailForm />}

      <p className="mt-8 text-center text-sm text-muted">
        Just looking?{" "}
        <Link href="/schemes" className="font-medium text-teal-strong underline">
          Check benefits without signing in →
        </Link>
      </p>
    </main>
  );
}

function EmailForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-line bg-surface p-5 text-center">
        <p className="text-2xl">📩</p>
        <p className="mt-2 font-medium text-ink">Check your email</p>
        <p className="mt-1 text-sm text-muted">
          We sent a sign-in link to <b>{email}</b>. Open it on this device.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-teal"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-teal py-3 font-semibold text-surface disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send me a sign-in link"}
      </button>
    </form>
  );
}

function PhoneForm() {
  const [phone, setPhone] = useState(COUNTRY.dialCode);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enter" | "verify">("enter");
  const [status, setStatus] = useState<"idle" | "busy" | "error">("idle");
  const [error, setError] = useState("");

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStep("verify");
      setStatus("idle");
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      window.location.href = "/auth/continue";
    }
  }

  return (
    <form onSubmit={step === "enter" ? sendOtp : verify} className="space-y-3">
      <input
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={COUNTRY.phoneExample}
        disabled={step === "verify"}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-teal disabled:opacity-60"
      />
      {step === "verify" && (
        <input
          type="text"
          inputMode="numeric"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6-digit code"
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 tracking-widest text-ink outline-none focus:border-teal"
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "busy"}
        className="w-full rounded-xl bg-teal py-3 font-semibold text-surface disabled:opacity-60"
      >
        {status === "busy"
          ? "Please wait…"
          : step === "enter"
            ? "Send OTP"
            : "Verify & continue"}
      </button>
      <p className="text-center text-xs text-faint">
        Your number is used only to sign in. It&apos;s never shown to anyone.
      </p>
    </form>
  );
}
