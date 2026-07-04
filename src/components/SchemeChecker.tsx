"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONDITIONS, STATES } from "@/config/taxonomy";
import { COUNTRY } from "@/config/country";

/** The no-login checker inputs: condition + age + state → results via URL query. */
export default function SchemeChecker({
  condition = "",
  age = "",
  state = "",
}: {
  condition?: string;
  age?: string;
  state?: string;
}) {
  const router = useRouter();
  const [c, setC] = useState(condition);
  const [a, setA] = useState(age);
  const [s, setS] = useState(state);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (c) params.set("condition", c);
    if (a) params.set("age", a);
    if (s) params.set("state", s);
    router.push(`/schemes?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl border border-line bg-surface p-4"
    >
      <div className="grid gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Condition</span>
          <select
            value={c}
            onChange={(e) => setC(e.target.value)}
            className="w-full rounded-xl border border-line bg-cream px-3 py-3 outline-none focus:border-teal"
          >
            <option value="">Any condition</option>
            {CONDITIONS.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              Child&apos;s age
            </span>
            <input
              type="number"
              min={0}
              max={60}
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="e.g. 6"
              className="w-full rounded-xl border border-line bg-cream px-3 py-3 outline-none focus:border-teal"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              {COUNTRY.regionNoun}
            </span>
            <select
              value={s}
              onChange={(e) => setS(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3 py-3 outline-none focus:border-teal"
            >
              <option value="">Any {COUNTRY.regionNoun.toLowerCase()}</option>
              {STATES.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-teal py-3 font-semibold text-surface"
      >
        See what we qualify for
      </button>
    </form>
  );
}
