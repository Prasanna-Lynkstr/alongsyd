/**
 * Community-content rules that both the server (enforcement) and the client
 * (whether to show the control) need to agree on.
 */

/**
 * How long after posting a parent may still edit or delete their own question.
 * After this, the question belongs to the community — corrections happen via a
 * follow-up answer, not a silent rewrite. Enforced server-side in
 * `editQuestion` / `deleteQuestion`; the UI uses it only to decide whether to
 * offer the controls.
 */
export const QUESTION_EDIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/** True if a question created at `createdAt` (ISO) is still within its window. */
export function withinEditWindow(createdAt: string): boolean {
  const posted = new Date(createdAt).getTime();
  if (Number.isNaN(posted)) return false;
  return Date.now() - posted < QUESTION_EDIT_WINDOW_MS;
}
