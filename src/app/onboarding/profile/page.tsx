"use client";

import { useState } from "react";
import Brand from "@/components/Brand";
import { AVATARS, CONDITIONS, STATES } from "@/config/taxonomy";
import { COUNTRY } from "@/config/country";
import { saveProfile } from "../actions";

export default function ProfileSetupPage() {
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);

  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-10">
      <Brand size="md" href={null} />
      <h1 className="mt-8 text-2xl font-semibold text-ink">
        Choose a safe second identity
      </h1>
      <p className="mt-2 text-sm text-muted">
        No real names — yours or your child&apos;s. Pick a friendly avatar and an
        alias other parents will see.
      </p>

      <form action={saveProfile} className="mt-8 space-y-6">
        {/* Avatar picker */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Avatar</label>
          <input type="hidden" name="avatar" value={avatar} />
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setAvatar(a)}
                className={`grid aspect-square place-items-center rounded-xl text-xl transition ${
                  avatar === a
                    ? "bg-teal-soft ring-2 ring-teal"
                    : "bg-surface ring-1 ring-line"
                }`}
                aria-pressed={avatar === a}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <Field label="Display alias" hint="e.g. QuietDawn, ChaiAndCalm">
          <input
            name="alias"
            required
            maxLength={24}
            placeholder="Pick an alias"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal"
          />
        </Field>

        <div className="rounded-xl bg-cream p-4">
          <p className="text-sm font-medium text-ink">About your child</p>
          <p className="mt-0.5 text-xs text-muted">
            We only ever store age + condition — never a name.
          </p>

          <div className="mt-4 space-y-4">
            <Field label="Condition">
              <select
                name="condition"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal"
                defaultValue=""
              >
                <option value="" disabled>
                  Select…
                </option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Child's age">
                <input
                  name="childAge"
                  type="number"
                  min={0}
                  max={60}
                  placeholder="e.g. 6"
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal"
                />
              </Field>
              <Field label="City">
                <input
                  name="city"
                  placeholder="e.g. Pune"
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal"
                />
              </Field>
            </div>

            <Field label={COUNTRY.regionNoun}>
              <select
                name="state"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal"
                defaultValue=""
              >
                <option value="">Select…</option>
                {STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-teal py-3 font-semibold text-surface"
        >
          Continue
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </label>
  );
}
