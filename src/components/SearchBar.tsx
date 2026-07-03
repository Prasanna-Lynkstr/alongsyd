"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** First-class search box. Submits to /ask?q=… (server does the FTS). */
export default function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/ask?q=${encodeURIComponent(query)}` : "/ask");
  }

  return (
    <form onSubmit={submit} className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
        🔎
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        enterKeyHint="search"
        placeholder="Search by meaning or keyword…"
        aria-label="Search questions and answers"
        className="w-full rounded-full border border-line bg-surface py-3 pl-10 pr-4 text-ink outline-none focus:border-teal"
      />
      {initial && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.push("/ask");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-faint"
        >
          Clear
        </button>
      )}
    </form>
  );
}
