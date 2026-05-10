import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import { colors } from "@/app/components/ui/tokens";

export const metadata = {
  title: "About VinVault",
  description: "VinVault is a community-verified registry for the world's most special automobiles. Learn how we document and preserve automotive history.",
};

export default function AboutPage() {
  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <section style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}`, padding: '48px 40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>About VinVault</p>
          <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.1', fontFamily: 'Georgia, serif' }}>
            The Definitive Record of Rare Automobiles
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '17px', lineHeight: '1.8', margin: 0 }}>
            VinVault is a community-powered registry dedicated to documenting the complete chassis history of the world's most significant, rare, and collectible automobiles.
          </p>
        </div>
      </section>

      <div className="vv-page-container">

        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '48px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Why we built this</h2>
          <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8', marginBottom: '16px' }}>
            For rare, historically significant cars, provenance is everything. A collectible with documented history is worth significantly more — and tells a richer story — than one whose origins are unknown.
          </p>
          <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8', marginBottom: '16px' }}>
            Yet no single, authoritative, publicly accessible record exists for most iconic models. Auction houses hold fragments. Private collectors guard documents. Magazine articles scatter clues across decades.
          </p>
          <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8' }}>
            VinVault exists to change that — one chassis at a time, in the open.
          </p>
        </div>

        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '48px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>How the registry works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {[
              {
                step: '01',
                title: 'Anyone can submit',
                body: 'If you own a car, have seen one at auction, or have documentation from a magazine or sale catalog, you can submit the chassis details through our submission form. We welcome partial information — something is always better than nothing.',
              },
              {
                step: '02',
                title: 'Submissions are reviewed',
                body: 'Every submission is reviewed by community validators with deep knowledge of the specific model. They cross-reference chassis numbers against factory records, auction catalogs, and known documentation before approving an entry.',
              },
              {
                step: '03',
                title: 'Approved entries become public record',
                body: 'Once validated, each chassis gets its own permanent page in the registry, including all known history, ownership details, and provenance. The record is public, searchable, and permanently archived.',
              },
              {
                step: '04',
                title: 'The community keeps it accurate',
                body: 'Registered users can flag discrepancies or submit additional information on existing entries. The registry evolves as new information comes to light — auction results, newly discovered documents, owner updates.',
              },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
                <div style={{ color: colors.border, fontSize: '32px', fontWeight: 'bold', minWidth: '48px', lineHeight: 1, paddingTop: '4px' }}>{item.step}</div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.8' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '48px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>What we document</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              'Chassis number',
              'Engine number',
              'Gearbox number',
              'Production date',
              'Original market',
              'Exterior color',
              'Interior color',
              'Matching numbers status',
              'Condition score',
              'Service history',
              'Original books & toolkit',
              'Known ownership history',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: colors.surface, border: `1px solid ${colors.border}` }}>
                <span style={{ color: colors.accent, fontSize: '16px' }}>·</span>
                <span style={{ color: colors.textSecondary, fontSize: '14px', fontFamily: 'Verdana, sans-serif' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '48px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>How to contribute</h2>
          <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8', marginBottom: '28px' }}>
            The registry is only as complete as the information the community provides. If you have knowledge of any collectible automobile — whether you own it, have seen it at a show, or read about it in a magazine — please submit the details.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/submit" style={{ background: colors.accentNavy, color: '#FFFDF8', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
              Submit a Car
            </Link>
            <Link href="/ferrari/288-gto" style={{ border: `1px solid ${colors.accentNavy}`, color: colors.textPrimary, padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
              View Registry
            </Link>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Current registries</h2>
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.accent}`, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: colors.accent, fontSize: '10px', letterSpacing: '3px', marginBottom: '6px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Ferrari</p>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>288 GTO</h3>
              <p style={{ color: colors.textMuted, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>1984–1985 · 272 produced</p>
            </div>
            <Link href="/ferrari/288-gto" style={{ color: colors.accentBlue, textDecoration: 'none', fontSize: '13px', border: `1px solid ${colors.border}`, padding: '8px 20px', fontFamily: 'Verdana, sans-serif' }}>
              View Registry →
            </Link>
          </div>
          <p style={{ color: colors.textMuted, fontSize: '13px', marginTop: '20px', fontStyle: 'italic' }}>
            More registries — Lamborghini Miura, Ferrari F40, Porsche 959 — are planned and coming soon.
          </p>
        </div>

        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '48px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Contact</h2>
          <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8', marginBottom: '20px' }}>
            For questions, corrections, or partnership enquiries, reach out directly. We read every message.
          </p>
          <a href="mailto:contact@vinvault.net" style={{ color: colors.accent, fontSize: '16px', textDecoration: 'none', fontFamily: 'Verdana, sans-serif', letterSpacing: '1px' }}>
            contact@vinvault.net
          </a>
        </div>
      </div>
    </main>
  );
}
