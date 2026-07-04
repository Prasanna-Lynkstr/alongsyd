"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button that disables itself while its parent <form> action is in
 * flight. This is the guard against duplicate posts: the create/answer actions
 * do slow work (embedding) before redirecting, so without this a second click
 * (or an impatient tap during the redirect) fires the action twice and inserts
 * a duplicate row. Must be rendered inside the <form> whose action it submits.
 */
export default function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
