import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — VinVault",
  description: "VinVault Privacy Policy — how we collect, use and protect your data. GDPR compliant.",
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

export default function PrivacyPage() {
  return (
    <div style={{ background: '#F8F6F1', minHeight: '100vh', color: '#1A1A1A', fontFamily: 'Georgia, serif' }}>

      {/* Hero */}
      <section style={{ background: '#FFFDF8', borderBottom: '1px solid #E8E2D8', padding: '48px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#9A8A7A', textTransform: 'uppercase', marginBottom: '12px' }}>LEGAL</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '12px' }}>Privacy Policy</h1>
          <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px', color: '#C9A84C', margin: 0 }}>Last updated: 3 May 2026 · Applies to users in the EU and worldwide</p>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#1A1A1A', lineHeight: '1.9', marginBottom: '16px' }}>
          VinVault ("we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect information about you when you use VinVault (the "Service") at vinvault.net. It complies with the EU General Data Protection Regulation (GDPR) and applicable UK data protection law.
        </p>

        <Section title="1. Data We Collect">
          <p style={{ marginBottom: '12px' }}>We collect the following categories of personal data:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Account data:</strong> email address and password (hashed) when you create an account.</li>
            <li style={{ marginBottom: '8px' }}><strong>Submission data:</strong> chassis records and associated vehicle details you submit to the registry, including your email address as submitter.</li>
            <li style={{ marginBottom: '8px' }}><strong>Usage data:</strong> pages visited, browser type, and approximate geographic location via IP address, collected anonymously for analytics.</li>
            <li style={{ marginBottom: '8px' }}><strong>Cookies:</strong> essential session cookies and optional analytics cookies (see Section 4).</li>
          </ul>
          <p style={{ marginBottom: 0 }}>We do not collect payment information, government ID, or sensitive personal data as defined by GDPR Article 9.</p>
        </Section>

        <Section title="2. Legal Basis for Processing (GDPR)">
          <p style={{ marginBottom: '12px' }}>We process your personal data under the following legal bases:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: 0 }}>
            <li style={{ marginBottom: '8px' }}><strong>Contract performance:</strong> to provide your account, manage your submissions, and operate the registry.</li>
            <li style={{ marginBottom: '8px' }}><strong>Legitimate interests:</strong> to prevent fraud, improve the service, and maintain the integrity of registry records.</li>
            <li style={{ marginBottom: '8px' }}><strong>Consent:</strong> for optional analytics cookies and newsletter communications.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul style={{ paddingLeft: '24px', marginBottom: 0 }}>
            <li style={{ marginBottom: '8px' }}>To operate and maintain your account.</li>
            <li style={{ marginBottom: '8px' }}>To review and publish vehicle submissions.</li>
            <li style={{ marginBottom: '8px' }}>To send transactional emails (e.g. submission status updates) via Brevo.</li>
            <li style={{ marginBottom: '8px' }}>To detect and prevent fraudulent submissions.</li>
            <li style={{ marginBottom: '8px' }}>To analyse usage patterns and improve the service.</li>
          </ul>
        </Section>

        <Section title="4. Cookies">
          <p style={{ marginBottom: '12px' }}>We use the following types of cookies:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Essential cookies:</strong> session authentication cookies required for logged-in functionality. These cannot be disabled without breaking the site.</li>
            <li style={{ marginBottom: '8px' }}><strong>Analytics cookies:</strong> optional cookies that help us understand how visitors use the site. You can decline these via our cookie consent banner.</li>
          </ul>
          <p style={{ marginBottom: 0 }}>You can manage cookie preferences in your browser settings at any time.</p>
        </Section>

        <Section title="5. Data Retention">
          <p style={{ marginBottom: '12px' }}>We retain your data as follows:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: 0 }}>
            <li style={{ marginBottom: '8px' }}>Account data: until you request deletion or 3 years after your last activity.</li>
            <li style={{ marginBottom: '8px' }}>Approved registry submissions: indefinitely, as these are part of the permanent public record. Your email address is not publicly displayed.</li>
            <li style={{ marginBottom: '8px' }}>Rejected submissions: deleted after 90 days.</li>
          </ul>
        </Section>

        <Section title="6. Your Rights (GDPR)">
          <p style={{ marginBottom: '12px' }}>If you are in the EU or UK, you have the following rights:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
            <li style={{ marginBottom: '8px' }}><strong>Rectification:</strong> request correction of inaccurate data.</li>
            <li style={{ marginBottom: '8px' }}><strong>Erasure:</strong> request deletion of your account and personal data.</li>
            <li style={{ marginBottom: '8px' }}><strong>Restriction:</strong> request that we limit processing of your data.</li>
            <li style={{ marginBottom: '8px' }}><strong>Portability:</strong> receive your data in a structured, machine-readable format.</li>
            <li style={{ marginBottom: '8px' }}><strong>Objection:</strong> object to processing based on legitimate interests.</li>
            <li style={{ marginBottom: '8px' }}><strong>Withdraw consent:</strong> withdraw consent for analytics cookies at any time.</li>
          </ul>
          <p style={{ marginBottom: 0 }}>To exercise any of these rights, contact us as described in Section 9.</p>
        </Section>

        <Section title="7. Data Sharing">
          <p style={{ marginBottom: '12px' }}>We do not sell your personal data. We share data only with:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: 0 }}>
            <li style={{ marginBottom: '8px' }}><strong>Supabase</strong> (database hosting, EU region).</li>
            <li style={{ marginBottom: '8px' }}><strong>Brevo</strong> (transactional email delivery).</li>
            <li style={{ marginBottom: '8px' }}>Law enforcement, when legally required.</li>
          </ul>
        </Section>

        <Section title="8. Security">
          <p style={{ marginBottom: 0 }}>We implement appropriate technical and organisational measures to protect your personal data, including TLS encryption in transit, hashed password storage, and access controls. No system is completely secure; please use a strong unique password.</p>
        </Section>

        <Section title="9. Contact & Data Controller">
          <p style={{ marginBottom: 0 }}>VinVault is the data controller for personal data processed through this site. For privacy enquiries, data subject requests, or complaints, contact us via the <Link href="/faq" style={{ color: '#1A3A5A', textDecoration: 'none' }}>FAQ page</Link>. You also have the right to lodge a complaint with your national data protection authority.</p>
        </Section>
      </div>
    </div>
  );
}
