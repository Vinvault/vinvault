import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — VinVault",
  description: "VinVault Privacy Policy — how we collect, use and protect your data. GDPR compliant.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: "1px solid #1E3A5A", paddingTop: "36px", marginBottom: "36px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>{title}</h2>
      <div style={{ color: "#8BA5B8", fontSize: "15px", lineHeight: "1.8" }}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Georgia, serif", minHeight: "100vh" }}>
      <header className="vv-header">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            <span style={{ color: "#4A90B8" }}>Vin</span><span style={{ color: "#E2EEF7" }}>Vault</span>
          </span>
          <span style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "4px" }}>REGISTRY</span>
        </Link>
        <nav className="vv-nav" style={{ fontSize: "13px" }}>
          <Link href="/" style={{ color: "#8BA5B8", textDecoration: "none", padding: "6px 12px" }}>Home</Link>
          <Link href="/ferrari/288-gto" style={{ color: "#8BA5B8", textDecoration: "none", padding: "6px 12px" }}>Registry</Link>
        </nav>
      </header>

      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      <div className="vv-page-container">
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>LEGAL</p>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "8px" }}>Privacy Policy</h1>
        <p style={{ color: "#4A6A8A", fontSize: "13px", marginBottom: "48px" }}>Last updated: 3 May 2026 · Applies to users in the EU and worldwide</p>

        <p style={{ color: "#8BA5B8", fontSize: "15px", lineHeight: "1.8", marginBottom: "36px" }}>
          VinVault ("we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect information about you when you use VinVault (the "Service") at vinvault.net. It complies with the EU General Data Protection Regulation (GDPR) and applicable UK data protection law.
        </p>

        <Section title="1. Data We Collect">
          <p style={{ marginBottom: "12px" }}>We collect the following categories of personal data:</p>
          <ul style={{ paddingLeft: "24px", marginBottom: "12px" }}>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Account data:</strong> email address and password (hashed) when you create an account.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Submission data:</strong> chassis records and associated vehicle details you submit to the registry, including your email address as submitter.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Usage data:</strong> pages visited, browser type, and approximate geographic location via IP address, collected anonymously for analytics.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Cookies:</strong> essential session cookies and optional analytics cookies (see Section 4).</li>
          </ul>
          <p>We do not collect payment information, government ID, or sensitive personal data as defined by GDPR Article 9.</p>
        </Section>

        <Section title="2. Legal Basis for Processing (GDPR)">
          <p style={{ marginBottom: "12px" }}>We process your personal data under the following legal bases:</p>
          <ul style={{ paddingLeft: "24px" }}>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Contract performance:</strong> to provide your account, manage your submissions, and operate the registry.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Legitimate interests:</strong> to prevent fraud, improve the service, and maintain the integrity of registry records.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Consent:</strong> for optional analytics cookies and newsletter communications.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul style={{ paddingLeft: "24px" }}>
            <li style={{ marginBottom: "8px" }}>To operate and maintain your account.</li>
            <li style={{ marginBottom: "8px" }}>To review and publish vehicle submissions.</li>
            <li style={{ marginBottom: "8px" }}>To send transactional emails (e.g. submission status updates) via Brevo.</li>
            <li style={{ marginBottom: "8px" }}>To detect and prevent fraudulent submissions.</li>
            <li style={{ marginBottom: "8px" }}>To analyse usage patterns and improve the service.</li>
          </ul>
        </Section>

        <Section title="4. Cookies">
          <p style={{ marginBottom: "12px" }}>We use the following types of cookies:</p>
          <ul style={{ paddingLeft: "24px" }}>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Essential cookies:</strong> session authentication cookies required for logged-in functionality. These cannot be disabled without breaking the site.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Analytics cookies:</strong> optional cookies that help us understand how visitors use the site. You can decline these via our cookie consent banner.</li>
          </ul>
          <p style={{ marginTop: "12px" }}>You can manage cookie preferences in your browser settings at any time.</p>
        </Section>

        <Section title="5. Data Retention">
          <p style={{ marginBottom: "12px" }}>We retain your data as follows:</p>
          <ul style={{ paddingLeft: "24px" }}>
            <li style={{ marginBottom: "8px" }}>Account data: until you request deletion or 3 years after your last activity.</li>
            <li style={{ marginBottom: "8px" }}>Approved registry submissions: indefinitely, as these are part of the permanent public record. Your email address is not publicly displayed.</li>
            <li style={{ marginBottom: "8px" }}>Rejected submissions: deleted after 90 days.</li>
          </ul>
        </Section>

        <Section title="6. Your Rights (GDPR)">
          <p style={{ marginBottom: "12px" }}>If you are in the EU or UK, you have the following rights:</p>
          <ul style={{ paddingLeft: "24px" }}>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Access:</strong> request a copy of the personal data we hold about you.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Rectification:</strong> request correction of inaccurate data.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Erasure:</strong> request deletion of your account and personal data.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Restriction:</strong> request that we limit processing of your data.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Portability:</strong> receive your data in a structured, machine-readable format.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Objection:</strong> object to processing based on legitimate interests.</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Withdraw consent:</strong> withdraw consent for analytics cookies at any time.</li>
          </ul>
          <p style={{ marginTop: "12px" }}>To exercise any of these rights, contact us as described in Section 9.</p>
        </Section>

        <Section title="7. Data Sharing">
          <p style={{ marginBottom: "12px" }}>We do not sell your personal data. We share data only with:</p>
          <ul style={{ paddingLeft: "24px" }}>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Supabase</strong> (database hosting, EU region).</li>
            <li style={{ marginBottom: "8px" }}><strong style={{ color: "#E2EEF7" }}>Brevo</strong> (transactional email delivery).</li>
            <li style={{ marginBottom: "8px" }}>Law enforcement, when legally required.</li>
          </ul>
        </Section>

        <Section title="8. Security">
          <p>We implement appropriate technical and organisational measures to protect your personal data, including TLS encryption in transit, hashed password storage, and access controls. No system is completely secure; please use a strong unique password.</p>
        </Section>

        <Section title="9. Contact & Data Controller">
          <p>VinVault is the data controller for personal data processed through this site. For privacy enquiries, data subject requests, or complaints, contact us via the <Link href="/faq" style={{ color: "#4A90B8", textDecoration: "none" }}>FAQ page</Link>. You also have the right to lodge a complaint with your national data protection authority.</p>
        </Section>
      </div>

      <footer className="vv-footer">
        <span><span style={{ color: "#4A90B8" }}>Vin</span>Vault Registry © 2026</span>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ color: "#4A90B8", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "#4A6A8A", textDecoration: "none" }}>Terms</Link>
          <Link href="/faq" style={{ color: "#4A6A8A", textDecoration: "none" }}>FAQ</Link>
        </div>
      </footer>
    </main>
  );
}
