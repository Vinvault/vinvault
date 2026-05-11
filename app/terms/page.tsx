import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — VinVault",
  description: "VinVault Terms of Service covering user submissions, data accuracy, intellectual property, and account policies.",
};

const sectionH2: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#1A1A1A',
  borderBottom: '2px solid #E8E2D8',
  paddingBottom: '12px',
  marginBottom: '20px',
  marginTop: '40px',
};

const bodyText: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '15px',
  color: '#1A1A1A',
  lineHeight: '1.9',
  marginBottom: '16px',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={sectionH2}>{title}</h2>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#1A1A1A', lineHeight: '1.9' }}>
        {children}
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div style={{ background: '#F8F6F1', minHeight: '100vh', color: '#1A1A1A', fontFamily: 'Georgia, serif' }}>

      {/* Hero */}
      <section style={{ background: '#FFFDF8', borderBottom: '1px solid #E8E2D8', padding: '48px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#9A8A7A', textTransform: 'uppercase', marginBottom: '12px' }}>LEGAL</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '12px' }}>Terms of Service</h1>
          <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px', color: '#C9A84C', margin: 0 }}>Last updated: 3 May 2026</p>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>
        <p style={bodyText}>
          By accessing or using VinVault ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
        </p>

        <Section title="1. User Submissions">
          <p style={{ marginBottom: '12px' }}>When you submit information about a vehicle to the VinVault registry, you represent and warrant that:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '8px' }}>The information you provide is accurate to the best of your knowledge.</li>
            <li style={{ marginBottom: '8px' }}>You have the right to share this information and are not violating any third-party rights.</li>
            <li style={{ marginBottom: '8px' }}>You understand that submissions are subject to review and may be rejected, edited, or removed.</li>
            <li style={{ marginBottom: '8px' }}>False or deliberately misleading submissions may result in account termination.</li>
          </ul>
          <p style={{ marginBottom: 0 }}>By submitting data, you grant VinVault a worldwide, royalty-free, perpetual licence to use, reproduce, modify, and display that content in connection with operating and improving the registry.</p>
        </Section>

        <Section title="2. Data Accuracy">
          <p style={{ marginBottom: '12px' }}>VinVault strives to maintain accurate registry records, but we make no warranties regarding the completeness, accuracy, or reliability of any information published on the platform.</p>
          <p style={{ marginBottom: '12px' }}>All published chassis records have been reviewed by community validators, but errors may still exist. VinVault shall not be liable for any reliance placed on registry data for commercial, legal, insurance, or investment purposes.</p>
          <p style={{ marginBottom: 0 }}>If you discover an error in a published record, please contact us so we can investigate and correct it.</p>
        </Section>

        <Section title="3. Intellectual Property">
          <p style={{ marginBottom: '12px' }}>The VinVault platform, its design, branding, and original content are owned by VinVault and protected by copyright and other intellectual property laws.</p>
          <p style={{ marginBottom: '12px' }}>Make, model, and chassis data submitted by users is factual information and is not subject to copyright protection. Historical facts about vehicles belong to the public domain.</p>
          <p style={{ marginBottom: 0 }}>You may not scrape, reproduce, or redistribute VinVault registry data in bulk without express written permission.</p>
        </Section>

        <Section title="4. Account Termination">
          <p style={{ marginBottom: '12px' }}>VinVault reserves the right to suspend or terminate accounts that:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '8px' }}>Submit false, fraudulent, or deliberately misleading information.</li>
            <li style={{ marginBottom: '8px' }}>Attempt to manipulate registry records for financial gain.</li>
            <li style={{ marginBottom: '8px' }}>Engage in spam, abuse, or harassment.</li>
            <li style={{ marginBottom: '8px' }}>Violate these Terms of Service in any material way.</li>
          </ul>
          <p style={{ marginBottom: 0 }}>Upon termination, your account information will be removed, but submitted registry data may be retained in anonymised form.</p>
        </Section>

        <Section title="5. Limitation of Liability">
          <p style={{ marginBottom: '12px' }}>To the maximum extent permitted by applicable law, VinVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
          <p style={{ marginBottom: 0 }}>Our total liability to you for any claim arising from or relating to these Terms or the Service shall not exceed €100.</p>
        </Section>

        <Section title="6. Changes to These Terms">
          <p style={{ marginBottom: 0 }}>We may update these Terms of Service from time to time. Continued use of the Service after changes constitutes your acceptance of the new terms. We will make reasonable efforts to notify users of material changes.</p>
        </Section>

        <Section title="7. Contact">
          <p style={{ marginBottom: 0 }}>For questions about these Terms, please contact us via the <Link href="/faq" style={{ color: '#1A3A5A', textDecoration: 'none' }}>FAQ page</Link> or by submitting an inquiry through the registry.</p>
        </Section>
      </div>
    </div>
  );
}
