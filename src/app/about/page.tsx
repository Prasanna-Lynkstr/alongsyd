import Link from "next/link";
import InfoPage, { Section } from "@/components/InfoPage";
import { ORG } from "@/config/org";
import { COUNTRY } from "@/config/country";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <InfoPage
      title="About Alongsyd"
      intro="The story behind Alongsyd — from the two parents who needed it first."
    >
      <Section title="Why Alongsyd exists">
        <p>
          We&apos;re parents of a boy born in 2011 — he&apos;s fifteen now, and he
          has autism.
        </p>
        <p>
          When he was diagnosed at just over a year old, we had no idea what
          autism meant. There was so little guidance. So we did what most parents
          do: we chased a target. We tried everything we could to make him
          &ldquo;normal,&rdquo; convinced that with enough effort we could get
          there.
        </p>
        <p>
          It took us a long time to understand what autism really is — and
          everything changed the day we did. When we stopped chasing and started
          learning, when we accepted him as he is and held realistic hopes for
          what could change and made peace with what may not, our whole lives
          shifted. He didn&apos;t need fixing. We needed understanding.
        </p>
        <p>
          Like every parent, we still have questions — at every stage, every
          single day. And so often we&apos;ve wished for a quick way to see what
          other parents went through: how they handled a certain moment, how they
          planned ahead, what worked and what didn&apos;t. WhatsApp groups and
          social media help enormously. But we wanted something focused — a
          companion that walks the whole journey with you, all the way through to
          the hardest question of all: who cares for our children after us.
        </p>
        <p>
          Alongsyd is that companion. This is just the beginning. We intend to
          grow it into a super app — for the super parents who care for these
          super kids.
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

      <Section title="Say hello">
        <p>
          Alongsyd is built with and for parents, under {ORG.operator}. It&apos;s
          early, and we&apos;re shaping it together with the community — we&apos;d
          genuinely love to hear from you at{" "}
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
