import Link from "next/link";
import InfoPage, { Section } from "@/components/InfoPage";
import { ORG } from "@/config/org";
import { COUNTRY } from "@/config/country";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Service"
      intro="The simple agreement for using Alongsyd. Please read it — especially the note on what Alongsyd is and isn't."
      updated={ORG.legalUpdated}
    >
      <Section title="Agreeing to these terms">
        <p>
          By creating an account or using {ORG.name}, you agree to these terms. If
          you don&apos;t agree, please don&apos;t use the service.
        </p>
      </Section>

      <Section title="What Alongsyd is">
        <p>
          Alongsyd is a peer community where parents and caregivers of children
          with additional needs share questions, answers and experience, plus a
          plain-language guide to {COUNTRY.benefits.name}. It is a place for
          shared, lived experience.
        </p>
      </Section>

      <Section title="Not professional advice">
        <p>
          Content on Alongsyd — including answers from other parents and
          information about schemes and benefits — is shared by community members
          and compiled for general guidance. It is <b>not</b> medical, legal,
          financial, or professional advice, and it may be incomplete or out of
          date.
        </p>
        <p>
          Always confirm anything important with a qualified professional or the
          relevant official authority before acting on it. Alongsyd is not an
          emergency service — if your child needs urgent help, contact your doctor
          or local emergency services.
        </p>
      </Section>

      <Section title="Who can use Alongsyd">
        <p>
          You must be 18 or older and a parent, caregiver, or someone supporting a
          family, and you&apos;re responsible for keeping your account secure.
        </p>
      </Section>

      <Section title="Being a good member">
        <p>By posting, you agree to:</p>
        <p>
          · Be respectful, honest and supportive.
          <br />· Not post false or harmful claims, especially about health or
          treatments.
          <br />· Not share another person&apos;s private information, or your
          child&apos;s identifying details.
          <br />· Not use Alongsyd for spam, harassment, or anything unlawful.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          You keep ownership of what you post. By sharing it, you grant {ORG.name}{" "}
          a licence to display it within the service, and to use it in{" "}
          <b>anonymised</b> form to help other families and improve the product,
          as described in our{" "}
          <Link href="/privacy" className="font-medium text-teal-strong">
            Privacy Policy
          </Link>
          .
        </p>
      </Section>

      <Section title="Moderation">
        <p>
          To keep the community safe, we may review, edit, or remove content and
          suspend accounts that break these terms. You can report anything that
          concerns you from within the app or by emailing us.
        </p>
      </Section>

      <Section title="No warranty and liability">
        <p>
          Alongsyd is provided &ldquo;as is&rdquo;, without warranties of any
          kind. To the fullest extent permitted by law, {ORG.operator} is not
          liable for any loss arising from your use of the service or reliance on
          content shared by members.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of {COUNTRY.name}. We may update
          them from time to time; continued use after a change means you accept
          the updated terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Write to{" "}
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
