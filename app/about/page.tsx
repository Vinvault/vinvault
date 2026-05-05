import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import AppHeader from "@/app/components/AppHeader";

export const metadata = {
  title: "About — VinVault Classic Car Registry",
  description: "Learn how VinVault works and how you can contribute to the world's most complete classic car registry.",
};

export default function AboutPage() {
  return (
    <main style={{ background: '#080F1A', color: '#E2EEF7', fontFamily: 'Verdana, sans-serif', minHeight: '100vh' }}>
      <AppHeader />

      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <div className="vv-page-container">
        <p style={{ color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px' }}>ABOUT</p>
        <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.1' }}>
          What is VinVault?
        </h1>
        <p style={{ color: '#8BA5B8', fontSize: '17px', lineHeight: '1.8', marginBottom: '48px', maxWidth: '640px' }}>
          VinVault is a community-powered registry dedicated to documenting the complete chassis history of the world's most significant, rare, and collectible automobiles.
        </p>

        <div style={{ borderTop: '1px solid #1E3A5A', paddingTop: '48px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Why we built this</h2>
          <p style={{ color: '#8BA5B8', fontSize: '15px', lineHeight: '1.8', marginBottom: '16px' }}>
            For rare, historically significant cars, provenance is everything. A collectible with documented history is worth significantly more — and tells a richer story — than one whose origins are unknown.
          </p>
          <p style={{ color: '#8BA5B8', fontSize: '15px', lineHeight: '1.8', marginBottom: '16px' }}>
            Yet no single, authoritative, publicly accessible record exists for most iconic models. Auction houses hold fragments. Private collectors guard documents. Magazine articles scatter clues across decades.
          </p>
          <p style={{ color: '#8BA5B8', fontSize: '15px', lineHeight: '1.8' }}>
            VinVault exists to change that — one chassis at a time, in the open.
          </p>
        </div>

        <div style={{ borderTop: '1px solid #1E3A5A', paddingTop: '48px', marginBottom: '48px' }}>
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
                <div style={{ color: '#1E3A5A', fontSize: '32px', fontWeight: 'bold', minWidth: '48px', lineHeight: 1, paddingTop: '4px' }}>{item.step}</div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: '#8BA5B8', fontSize: '14px', lineHeight: '1.8' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E3A5A', paddingTop: '48px', marginBottom: '48px' }}>
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
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#0A1828', border: '1px solid #1E3A5A' }}>
                <span style={{ color: '#4A90B8', fontSize: '16px' }}>·</span>
                <span style={{ color: '#8BA5B8', fontSize: '14px' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E3A5A', paddingTop: '48px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>How to contribute</h2>
          <p style={{ color: '#8BA5B8', fontSize: '15px', lineHeight: '1.8', marginBottom: '28px' }}>
            The registry is only as complete as the information the community provides. If you have knowledge of any collectible automobile — whether you own it, have seen it at a show, or read about it in a magazine — please submit the details.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/submit" style={{ background: '#4A90B8', color: '#fff', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}>
              SUBMIT A CAR
            </Link>
            <Link href="/ferrari/288-gto" style={{ border: '1px solid #4A90B8', color: '#4A90B8', padding: '13px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}>
              VIEW REGISTRY
            </Link>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E3A5A', paddingTop: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Current registries</h2>
          <div style={{ background: '#0A1828', border: '1px solid #1E3A5A', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: '#4A90B8', fontSize: '10px', letterSpacing: '3px', marginBottom: '6px' }}>FERRARI</p>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>288 GTO</h3>
              <p style={{ color: '#4A6A8A', fontSize: '12px' }}>1984–1985 · 272 produced</p>
            </div>
            <Link href="/ferrari/288-gto" style={{ color: '#4A90B8', textDecoration: 'none', fontSize: '13px', border: '1px solid #1E3A5A', padding: '8px 20px' }}>
              View Registry →
            </Link>
          </div>
          <p style={{ color: '#4A6A8A', fontSize: '13px', marginTop: '20px', fontStyle: 'italic' }}>
            More registries — Lamborghini Miura, Ferrari F40, Porsche 959 — are planned and coming soon.
          </p>
        </div>
      </div>

      <footer className="vv-footer">
        <span><span style={{ color: '#4A90B8' }}>Vin</span>Vault Registry © 2026</span>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#4A6A8A', textDecoration: 'none' }}>Home</Link>
          <Link href="/ferrari/288-gto" style={{ color: '#4A6A8A', textDecoration: 'none' }}>Registry</Link>
          <Link href="/submit" style={{ color: '#4A6A8A', textDecoration: 'none' }}>Submit</Link>
          <Link href="/login" style={{ color: '#4A6A8A', textDecoration: 'none' }}>Sign In</Link>
        </div>
      </footer>
    </main>
  );
}
