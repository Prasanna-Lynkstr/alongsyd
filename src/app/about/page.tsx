import Link from "next/link";
import InfoPage, { Section } from "@/components/InfoPage";
import { ORG } from "@/config/org";
import { COUNTRY } from "@/config/country";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <InfoPage
      title="About Alongsyd"
      intro="A companion for the whole special-needs parenting journey — from diagnosis through the years ahead."
    >
      <Section title="Why we exist">
        <p>
          Raising a child with additional needs comes with questions no one
          prepares you for — and answers that are scattered across clinics,
          government offices, WhatsApp groups and hard-won personal experience.
          Alongsyd brings that lived wisdom into one calm place, so no parent has
          to start from zero.
        </p>
      </Section>

      <Section title="How it works">
        <p>
          <b>Ask a real question</b> about your child, and get a trustworthy
          answer from parents who have solved the same thing. Every question
          asked and answered makes Alongsyd smarter for the next family.
        </p>
        <p>
          <b>Check what you&apos;re entitled to.</b> Our plain-language guide to{" "}
          {COUNTRY.benefits.name} helps you understand certificates, schemes and
          support your child may qualify for — no sign-in needed.
        </p>
      </Section>

      <Section title="Built on trust">
        <p>
          You&apos;re known only by an alias and an avatar. We never ask for your
          child&apos;s name, and your phone or email is used only to sign you in.
          You&apos;re not just getting help here — you&apos;re helping build it,
          alongside every other family.
        </p>
        <p>
          See our{" "}
          <Link href="/privacy" className="font-medium text-teal-strong">
            Privacy Policy
          </Link>{" "}
          for exactly what we collect and why.
        </p>
      </Section>

      <Section title="Who's behind it">
        <p>
          {ORG.name} is a project by {ORG.operator}, built with and for parents.
          It&apos;s early, and we&apos;re shaping it together with the community —
          we&apos;d genuinely love to hear from you at{" "}
          <a
            href={`mailto:${ORG.contactEmail}`}
            className="font-medium text-teal-strong"
          >
            {ORG.contactEmail}
          </a>
          .
        </p>
      </Section>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/login"
          className="rounded-xl bg-teal px-5 py-3 text-center font-semibold text-surface"
        >
          Join the community
        </Link>
        <Link
          href="/schemes"
          className="rounded-xl border border-line bg-surface px-5 py-3 text-center font-semibold text-teal-strong"
        >
          Check entitlements
        </Link>
      </div>
    </InfoPage>
  );
}
