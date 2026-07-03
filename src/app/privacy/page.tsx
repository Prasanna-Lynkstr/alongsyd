import Link from "next/link";
import InfoPage, { Section } from "@/components/InfoPage";
import { ORG } from "@/config/org";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      intro="Trust is the whole point of Alongsyd. Here's exactly what we collect, why, and the control you have over it — in plain language."
      updated={ORG.legalUpdated}
    >
      <Section title="What we collect">
        <p>
          <b>To sign you in:</b> your phone number or email address. This is never
          shown to other members.
        </p>
        <p>
          <b>Your profile:</b> an alias and avatar you choose, and optional context
          about your child — condition, age band, and city/state. We{" "}
          <b>never</b> ask for or store your child&apos;s name.
        </p>
        <p>
          <b>What you post:</b> the questions, answers and scheme notes you share
          with the community.
        </p>
        <p>
          <b>Technical basics:</b> if you opt in to notifications, a push
          subscription for your device, plus standard logs needed to run the
          service securely.
        </p>
      </Section>

      <Section title="How we use it">
        <p>
          To run the community, show your questions and answers to other parents,
          make results more relevant to your child&apos;s context, and send the
          push notifications you explicitly opt in to (for example, when someone
          answers your question).
        </p>
        <p>
          We may use conversations in <b>anonymised</b> form to improve Alongsyd —
          never in a way that identifies you or your family. We do not sell your
          personal data, and we do not use it for third-party advertising.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>
          We rely on a small number of trusted service providers who process data
          only on our behalf:
        </p>
        <p>
          · <b>Supabase</b> — secure hosting, database and sign-in.
          <br />· <b>OpenAI</b> — turns question text into search signals so
          relevant answers surface (content is sent for processing, not used to
          train their models).
          <br />· <b>Web push services</b> — deliver notifications you opt in to.
        </p>
        <p>
          We may also disclose information if required by law, or to protect the
          safety of our members.
        </p>
      </Section>

      <Section title="What other members can see">
        <p>
          Only your alias, avatar, and the content you choose to post. Your phone
          number and email are used solely to sign you in and are never visible to
          anyone else.
        </p>
      </Section>

      <Section title="About your child's information">
        <p>
          Alongsyd is for parents and caregivers — children do not have accounts.
          Any details you share about your child are limited to condition, age and
          location, never their name, and you can remove them at any time.
        </p>
      </Section>

      <Section title="Retention and your rights">
        <p>
          We keep your information for as long as your account is active. You can
          ask us to access, correct, or delete your data — including closing your
          account entirely — by emailing{" "}
          <a
            href={`mailto:${ORG.contactEmail}`}
            className="font-medium text-teal-strong"
          >
            {ORG.contactEmail}
          </a>
          . We&apos;ll act on genuine requests promptly.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          We use only the essential cookies needed to keep you signed in. There
          are no advertising or third-party tracking cookies.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we make meaningful changes, we&apos;ll update this page and the date
          above. Questions? Read our{" "}
          <Link href="/terms" className="font-medium text-teal-strong">
            Terms
          </Link>{" "}
          or write to{" "}
          <a
            href={`mailto:${ORG.contactEmail}`}
            className="font-medium text-teal-strong"
          >
            {ORG.contactEmail}
          </a>
          .
        </p>
      </Section>
    </InfoPage>
  );
}
