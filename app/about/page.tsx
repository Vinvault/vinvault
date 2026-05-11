import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";

export const metadata = {
  title: "About VinVault",
  description: "VinVault is a community-verified registry for the world's most special automobiles. Learn how we document and preserve automotive history.",
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

const callout: React.CSSProperties = {
  background: '#FFFDF8',
  borderLeft: '3px solid #C9A84C',
  padding: '16px 20px',
  marginBottom: '20px',
};

export default function AboutPage() {
  return (
    <div style={{ background: '#F8F6F1', minHeight: '100vh', color: '#1A1A1A', fontFamily: 'Georgia, serif' }}>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />

      {/* Hero */}
      <section style={{ background: '#FFFDF8', borderBottom: '1px solid #E8E2D8', padding: '48px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#9A8A7A', textTransform: 'uppercase', marginBottom: '12px' }}>ABOUT</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '16px' }}>
            The Definitive Record of Rare Automobiles
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#6A5A4A', lineHeight: '1.8', margin: 0 }}>
            VinVault is a community-powered registry dedicated to documenting the complete chassis history of the world's most significant, rare, and collectible automobiles.
          </p>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>

        <h2 style={sectionH2}>Why we built this</h2>
        <p style={bodyText}>
          For rare, historically significant cars, provenance is everything. A collectible with documented history is worth significantly more — and tells a richer story — than one whose origins are unknown.
        </p>
        <p style={bodyText}>
          Yet no single, authoritative, publicly accessible record exists for most iconic models. Auction houses hold fragments. Private collectors guard documents. Magazine articles scatter clues across decades.
        </p>
        <div style={callout}>
          <p style={{ ...bodyText, marginBottom: 0 }}>
            VinVault exists to change that — one chassis at a time, in the open.
          </p>
        </div>

        <h2 style={sectionH2}>How the registry works</h2>
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
              <div style={{ color: '#E8E2D8', fontSize: '32px', fontWeight: 'bold', minWidth: '48px', lineHeight: 1, paddingTop: '4px' }}>{item.step}</div>
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#6A5A4A', lineHeight: '1.8', margin: 0 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 style={sectionH2}>What we document</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            'Chassis number', 'Engine number', 'Gearbox number', 'Production date',
            'Original market', 'Exterior color', 'Interior color', 'Matching numbers status',
            'Condition score', 'Service history', 'Original books & toolkit', 'Known ownership history',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#FFFDF8', border: '1px solid #E8E2D8' }}>
              <span style={{ color: '#C9A84C', fontSize: '16px' }}>·</span>
              <span style={{ color: '#6A5A4A', fontSize: '14px', fontFamily: 'Verdana, sans-serif' }}>{item}</span>
            </div>
          ))}
        </div>

        <h2 style={sectionH2}>How to contribute</h2>
        <p style={bodyText}>
          The registry is only as complete as the information the community provides. If you have knowledge of any collectible automobile — whether you own it, have seen it at a show, or read about it in a magazine — please submit the details.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Link href="/submit" style={{ background: '#1A1A1A', color: '#FFFDF8', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
            Submit a Car
          </Link>
          <Link href="/ferrari/288-gto" style={{ border: '1px solid #1A1A1A', color: '#1A1A1A', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
            View Registry
          </Link>
        </div>

        <h2 style={sectionH2}>Current registries</h2>
        <div style={callout}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '3px', marginBottom: '6px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Ferrari</p>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '4px' }}>288 GTO</h3>
              <p style={{ color: '#9A8A7A', fontSize: '12px', fontFamily: 'Verdana, sans-serif', margin: 0 }}>1984–1985 · 272 produced</p>
            </div>
            <Link href="/ferrari/288-gto" style={{ color: '#1A3A5A', textDecoration: 'none', fontSize: '13px', border: '1px solid #E8E2D8', padding: '8px 20px', fontFamily: 'Verdana, sans-serif' }}>
              View Registry →
            </Link>
          </div>
        </div>
        <p style={{ color: '#9A8A7A', fontSize: '13px', marginTop: '20px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          More registries — Lamborghini Miura, Ferrari F40, Porsche 959 — are planned and coming soon.
        </p>

        <h2 style={sectionH2}>Contact</h2>
        <p style={bodyText}>
          For questions, corrections, or partnership enquiries, reach out directly. We read every message.
        </p>
        <a href="mailto:contact@vinvault.net" style={{ color: '#C9A84C', fontSize: '16px', textDecoration: 'none', fontFamily: 'Verdana, sans-serif', letterSpacing: '1px' }}>
          contact@vinvault.net
        </a>
      </div>
    </div>
  );
}
