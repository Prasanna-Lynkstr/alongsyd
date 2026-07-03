import InfoPage, { Section } from "@/components/InfoPage";
import { ORG } from "@/config/org";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact us"
      intro="We're a small team and we read every message. Here's how to reach us."
    >
      <Section title="Email">
        <p>
          For anything at all — support, feedback, privacy and data requests,
          reporting content, or partnership ideas — email us at:
        </p>
        <p>
          <a
            href={`mailto:${ORG.contactEmail}`}
            className="font-semibold text-teal-strong"
          >
            {ORG.contactEmail}
          </a>
        </p>
        <p>We aim to reply within a few working days.</p>
      </Section>

      <Section title="Reporting something urgent on the platform">
        <p>
          If you see content that&apos;s harmful or unsafe, use the report option
          inside the app so our moderators can act quickly, or email us with the
          details.
        </p>
      </Section>

      <Section title="In an emergency">
        <p>
          Alongsyd is a community, not an emergency or crisis service. If your
          child is in danger or needs urgent medical help, please contact your
          doctor or your local emergency services right away.
        </p>
      </Section>

      <div className="pt-2">
        <a
          href={`mailto:${ORG.contactEmail}`}
          className="inline-block rounded-xl bg-teal px-5 py-3 text-center font-semibold text-surface"
        >
          Email {ORG.name}
        </a>
      </div>
    </InfoPage>
  );
}
