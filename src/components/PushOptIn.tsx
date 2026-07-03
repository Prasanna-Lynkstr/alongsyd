"use client";

import { useEffect, useState } from "react";
import {
  removePushSubscription,
  savePushSubscription,
} from "@/app/(app)/push/actions";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** VAPID public key (base64url) → bytes for pushManager.subscribe. */
function urlBase64ToUint8Array(base64: string): BufferSource {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type State = "loading" | "unsupported" | "off" | "on" | "denied";

/**
 * Opt-in to Web Push. Two placements:
 *  - feed (default): a gentle card, shown ONLY when the parent could turn push
 *    on (hidden if already on, denied, or unsupported).
 *  - `persistent` (profile): always shows the current on/off state + control.
 */
export default function PushOptIn({ persistent = false }: { persistent?: boolean }) {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Boolean(VAPID_PUBLIC);

  useEffect(() => {
    if (!supported) {
      setState("unsupported");
      return;
    }
    (async () => {
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      const err = await savePushSubscription(sub.toJSON() as never);
      setState(err ? "off" : "on");
    } catch {
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  // ---- Persistent control (profile page) ----------------------------------
  if (persistent) {
    if (state === "loading") return null;
    return (
      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4">
        <div>
          <p className="text-sm font-medium text-ink">Answer notifications</p>
          <p className="mt-0.5 text-xs text-muted">
            {state === "unsupported"
              ? "Not supported on this browser. On iPhone, add Alongsyd to your home screen first."
              : state === "denied"
                ? "Blocked — enable notifications for this site in your browser settings."
                : state === "on"
                  ? "On — we'll ping you when a parent answers your question."
                  : "Get a nudge when a parent answers your question."}
          </p>
        </div>
        {state === "on" ? (
          <button
            onClick={disable}
            disabled={busy}
            className="flex-none rounded-lg border border-line px-3 py-1.5 text-sm text-muted"
          >
            Turn off
          </button>
        ) : state === "off" ? (
          <button
            onClick={enable}
            disabled={busy}
            className="flex-none rounded-lg bg-teal px-3 py-1.5 text-sm font-semibold text-surface"
          >
            {busy ? "…" : "Turn on"}
          </button>
        ) : null}
      </div>
    );
  }

  // ---- Feed nudge ----------------------------------------------------------
  if (state !== "off") return null; // only when opt-in is genuinely available
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-teal/30 bg-teal-soft/40 p-3">
      <span className="text-xl" aria-hidden>
        🔔
      </span>
      <p className="flex-1 text-sm text-teal-strong">
        Turn on notifications and we&apos;ll tell you the moment a parent answers
        your question.
      </p>
      <button
        onClick={enable}
        disabled={busy}
        className="flex-none rounded-lg bg-teal px-3 py-1.5 text-sm font-semibold text-surface"
      >
        {busy ? "…" : "Turn on"}
      </button>
    </div>
  );
}
