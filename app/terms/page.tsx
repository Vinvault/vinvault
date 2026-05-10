import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumb from "@/app/components/Breadcrumb";
import { colors } from "@/app/components/ui/tokens";

export const metadata: Metadata = {
  title: "Terms of Service — VinVault",
  description: "VinVault Terms of Service covering user submissions, data accuracy, intellectual property, and account policies.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '36px', marginBottom: '36px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>{title}</h2>
      <div style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8' }}>{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />
      <div className="vv-page-container">
        <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Legal</p>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '48px', fontFamily: 'Verdana, sans-serif' }}>Last updated: 3 May 2026</p>

        <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8', marginBottom: '36px' }}>
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
          <p>By submitting data, you grant VinVault a worldwide, royalty-free, perpetual licence to use, reproduce, modify, and display that content in connection with operating and improving the registry.</p>
        </Section>

        <Section title="2. Data Accuracy">
          <p style={{ marginBottom: '12px' }}>VinVault strives to maintain accurate registry records, but we make no warranties regarding the completeness, accuracy, or reliability of any information published on the platform.</p>
          <p style={{ marginBottom: '12px' }}>All published chassis records have been reviewed by community validators, but errors may still exist. VinVault shall not be liable for any reliance placed on registry data for commercial, legal, insurance, or investment purposes.</p>
          <p>If you discover an error in a published record, please contact us so we can investigate and correct it.</p>
        </Section>

        <Section title="3. Intellectual Property">
          <p style={{ marginBottom: '12px' }}>The VinVault platform, its design, branding, and original content are owned by VinVault and protected by copyright and other intellectual property laws.</p>
          <p style={{ marginBottom: '12px' }}>Make, model, and chassis data submitted by users is factual information and is not subject to copyright protection. Historical facts about vehicles belong to the public domain.</p>
          <p>You may not scrape, reproduce, or redistribute VinVault registry data in bulk without express written permission.</p>
        </Section>

        <Section title="4. Account Termination">
          <p style={{ marginBottom: '12px' }}>VinVault reserves the right to suspend or terminate accounts that:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '8px' }}>Submit false, fraudulent, or deliberately misleading information.</li>
            <li style={{ marginBottom: '8px' }}>Attempt to manipulate registry records for financial gain.</li>
            <li style={{ marginBottom: '8px' }}>Engage in spam, abuse, or harassment.</li>
            <li style={{ marginBottom: '8px' }}>Violate these Terms of Service in any material way.</li>
          </ul>
          <p>Upon termination, your account information will be removed, but submitted registry data may be retained in anonymised form.</p>
        </Section>

        <Section title="5. Limitation of Liability">
          <p style={{ marginBottom: '12px' }}>To the maximum extent permitted by applicable law, VinVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
          <p>Our total liability to you for any claim arising from or relating to these Terms or the Service shall not exceed €100.</p>
        </Section>

        <Section title="6. Changes to These Terms">
          <p>We may update these Terms of Service from time to time. Continued use of the Service after changes constitutes your acceptance of the new terms. We will make reasonable efforts to notify users of material changes.</p>
        </Section>

        <Section title="7. Contact">
          <p>For questions about these Terms, please contact us via the <Link href="/faq" style={{ color: colors.accentBlue, textDecoration: 'none' }}>FAQ page</Link> or by submitting an inquiry through the registry.</p>
        </Section>
      </div>
    </main>
  );
}
