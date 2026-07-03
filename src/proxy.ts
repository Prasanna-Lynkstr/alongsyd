import type { NextRequest } from "next/server";
import { updateSession } from "@/engine/supabase/middleware";

/**
 * Runs on every navigation to keep the Supabase auth session fresh (Next 16's
 * "proxy" convention — formerly "middleware").
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets, the service worker, and the
     * PWA manifest, so auth cookies refresh on real navigations only.
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
