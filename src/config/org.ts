/**
 * Organisation / contact details surfaced across the About, Privacy, Terms and
 * Contact pages (and the footer). Content, not logic — kept here so a rename,
 * new contact address, or policy revision is a one-line change.
 */

export const ORG = {
  /** Product name shown to users. */
  name: "Alongsyd",
  /** Who operates the product. */
  operator: "Lynkstr",
  /** Single inbox for support, privacy/data requests, and reports. */
  contactEmail: "alongsyd@lynkstr.com",
  /** Human-readable date the legal pages were last revised. */
  legalUpdated: "3 July 2026",
  /** Year shown in the footer copyright line. */
  year: 2026,
} as const;
