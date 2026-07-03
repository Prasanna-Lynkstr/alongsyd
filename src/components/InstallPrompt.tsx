"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "alongsyd-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Nudge to install the PWA. On Android/desktop Chrome we capture the native
 * `beforeinstallprompt` and offer a one-tap Install; on iOS Safari (which has
 * no such event) we show the Share → Add to Home Screen instruction. Installing
 * is also the prerequisite for Web Push on iPhone. Dismissible + remembered.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = navigator as Navigator & { standalone?: boolean };
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    if (installed || localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS Safari never fires beforeinstallprompt — detect it to show the manual
    // Add-to-Home-Screen instruction instead. Deferred to avoid a synchronous
    // effect-body setState.
    queueMicrotask(() => {
      setHidden(false);
      const ua = window.navigator.userAgent;
      const isIOS = /iphone|ipad|ipod/i.test(ua);
      const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
      if (isIOS && isSafari) setIosHint(true);
    });

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }

  if (hidden || (!deferred && !iosHint)) return null;

  return (
    <div className="rounded-2xl border border-teal/30 bg-teal-soft/40 p-3">
      <div className="flex items-start gap-3">
        <span className="text-xl" aria-hidden>
          📲
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-teal-strong">
            Add Alongsyd to your home screen
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {deferred
              ? "One tap to install — it opens like an app and can notify you when a parent answers."
              : "Tap the Share button, then “Add to Home Screen” — it opens like an app and unlocks answer notifications."}
          </p>
          {deferred && (
            <button
              onClick={install}
              className="mt-2 rounded-lg bg-teal px-3 py-1.5 text-sm font-semibold text-surface"
            >
              Install
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex-none text-faint"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
