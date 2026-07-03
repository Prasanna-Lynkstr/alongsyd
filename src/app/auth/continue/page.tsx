import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/engine/auth";

/**
 * The single decision point after a successful sign-in. Sends the parent to the
 * right place: profile setup → consent → the one-time welcome → the feed.
 */
export default async function ContinuePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile || !profile.alias) redirect("/onboarding/profile");
  if (!profile.consentedAt) redirect("/onboarding/consent");
  if (!profile.onboardedAt) redirect("/onboarding/welcome");
  redirect("/ask");
}
