"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markNotificationsRead } from "@/app/(app)/personal/actions";
import type { AppNotification } from "@/engine/types";

/** The in-app inbox: a returning parent's record of what happened while away. */
export default function NotificationsInbox({
  initial,
}: {
  initial: AppNotification[];
}) {
  const [items, setItems] = useState(initial);
  const [pending, start] = useTransition();

  if (items.length === 0) return null;
  const hasUnread = items.some((n) => !n.isRead);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-faint">
          Notifications
        </p>
        {hasUnread && (
          <button
            onClick={() =>
              start(async () => {
                setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
                await markNotificationsRead();
              })
            }
            disabled={pending}
            className="text-xs font-medium text-teal-strong"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.map((n) => {
          const card = (
            <div
              className={`rounded-2xl border p-3 ${
                n.isRead
                  ? "border-line bg-surface"
                  : "border-teal/30 bg-teal-soft/30"
              }`}
            >
              <p className="text-sm font-medium text-ink">{n.title}</p>
              {n.body && <p className="mt-0.5 text-xs text-muted">{n.body}</p>}
            </div>
          );
          return n.url ? (
            <Link key={n.id} href={n.url} className="block">
              {card}
            </Link>
          ) : (
            <div key={n.id}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}
