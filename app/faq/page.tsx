import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import type { Metadata } from "next";
import { colors } from "@/app/components/ui/tokens";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about VinVault registry, how to submit cars, claim ownership, and contribute to the community.",
};

const FAQS = [
  {
    category: "About the Registry",
    items: [
      {
        q: "What is VinVault?",
        a: "VinVault is a community-powered registry that documents the complete chassis history of significant classic cars. Starting with the Ferrari 288 GTO, we aim to create an open, permanent, publicly accessible record of every car ever produced in each model run.",
      },
      {
        q: "Why start with the Ferrari 288 GTO?",
        a: "The Ferrari 288 GTO is one of the most historically significant Ferraris ever built — only 272 were made, each representing a piece of motorsport history. Its rarity and value make provenance documentation critically important, and it made a natural starting point for the registry.",
      },
      {
        q: "Is VinVault free to use?",
        a: "Yes. Browsing the registry, searching for chassis records, and submitting cars are all completely free. We may introduce optional premium features in the future, but the core registry will always be free.",
      },
      {
        q: "Who runs VinVault?",
        a: "VinVault is an independent project run by classic car enthusiasts. We are not affiliated with any manufacturer, auction house, or commercial entity.",
      },
    ],
  },
  {
    category: "Submitting a Car",
    items: [
      {
        q: "How do I submit a car?",
        a: "Visit the Submit page, fill in the chassis details including chassis number, engine number, production date, original market, color, and condition information. Submit as much as you know — partial information is better than none.",
      },
      {
        q: "What information do I need to submit?",
        a: "Only the chassis number is required. However, the more detail you can provide — engine number, production date, exterior color, service history, provenance — the more valuable the record will be to the community.",
      },
      {
        q: "Can I submit a car I don't own?",
        a: "Yes. You can submit based on auction catalog entries, magazine articles, owner contact, or any credible source. Please cite your source in the submission form so validators can cross-reference it.",
      },
      {
        q: "Can I submit the same chassis multiple times?",
        a: "Our system checks for duplicate chassis numbers. If a chassis already has a pending or approved record, your submission will be reviewed and merged with or compared against the existing record.",
      },
    ],
  },
  {
    category: "How Verification Works",
    items: [
      {
        q: "Who reviews submissions?",
        a: "Submissions are reviewed by community validators — experienced enthusiasts and historians with deep knowledge of the specific model. They cross-reference chassis numbers against factory records, auction catalogs, magazine articles, and other primary sources.",
      },
      {
        q: "How long does verification take?",
        a: "Most submissions are reviewed within 5-10 business days. Complex cases requiring additional research may take longer. You will receive an email notification when your submission is approved or rejected.",
      },
      {
        q: "What makes a submission get rejected?",
        a: "Submissions are rejected if the chassis number cannot be verified, if the information appears inconsistent with factory records, if it is a clear duplicate with conflicting data, or if it appears to be fraudulent. If your submission is rejected, you will receive a note explaining why.",
      },
      {
        q: "Can an approved record be changed later?",
        a: "Yes. If new information comes to light — such as a rediscovered factory document or auction result — an approved record can be updated. Contact us with evidence and we will investigate.",
      },
    ],
  },
  {
    category: "After Submission",
    items: [
      {
        q: "What happens when my submission is approved?",
        a: "Your chassis gets a permanent page in the registry at vinvault.net/ferrari/288-gto/[chassis-number]. It becomes publicly visible and searchable. You will receive an email confirmation.",
      },
      {
        q: "Will my name or email be shown publicly?",
        a: "No. Submitter identity is kept private. The registry shows the chassis data but not who submitted it.",
      },
      {
        q: "Can I update a record I submitted?",
        a: "Contact us if you have additional or updated information for a record you submitted. In a future release, registered users will be able to propose edits to existing records.",
      },
      {
        q: "How do I report an error in an existing record?",
        a: "Use the contact information on the FAQ page or submit a correction via the Submit form with a note that it is a correction to an existing record.",
      },
    ],
  },
  {
    category: "Technical & Account",
    items: [
      {
        q: "Do I need an account to browse the registry?",
        a: "No. The full registry is publicly accessible without an account. An account is only needed to track your submissions.",
      },
      {
        q: "How do I create an account?",
        a: "Visit the Sign In page and choose Register. Enter your email address and a password. Your account is created immediately.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact us and we will delete your account and personal data within 30 days, as required by GDPR. Approved chassis records may be retained in anonymised form as part of the permanent public registry.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <div className="vv-page-container" style={{ maxWidth: '900px' }}>
        <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Help</p>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Frequently Asked Questions</h1>
        <p style={{ color: colors.textSecondary, fontSize: '16px', lineHeight: '1.7', marginBottom: '48px' }}>
          Everything you need to know about how VinVault works.
        </p>

        {FAQS.map((section) => (
          <div key={section.category} style={{ marginBottom: '56px' }}>
            <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '24px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
              {section.category}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {section.items.map((item, i) => (
                <details key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <summary style={{
                    padding: '20px 0',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}>
                    <span>{item.q}</span>
                    <span style={{ color: colors.accent, fontSize: '20px', flexShrink: 0 }}>+</span>
                  </summary>
                  <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8', paddingBottom: '20px', paddingRight: '32px' }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.accent}`, padding: '28px', marginTop: '40px' }}>
          <p style={{ color: colors.accent, fontSize: '11px', letterSpacing: '2px', marginBottom: '12px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Still have questions?</p>
          <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>
            Can't find what you're looking for? Submit your car and include your question in the provenance field — our team reviews every submission and will get back to you.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/submit" style={{ background: colors.accentNavy, color: '#FFFDF8', padding: '12px 28px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
              Submit a Car
            </Link>
            <Link href="/about" style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary, padding: '12px 28px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
              About VinVault
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
