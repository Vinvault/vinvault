import Link from "next/link";

const carData: Record<string, any> = {
  "ZFFPA16B000040001": {
    chassis: "ZFFPA16B000040001",
    engine_number: "F114A000040001",
    gearbox_number: "G288000040001",
    production_date: "March 1984",
    original_market: "Italy",
    exterior_color: "Rosso Corsa",
    interior_color: "Nero",
    matching_numbers: true,
    originality_score: 9.5,
    condition_score: 8.8,
    documentation: "Full",
    has_service_history: true,
    has_books: true,
    has_toolkit: true,
    provenance: [
      { year: "1984", event: "Delivered new to first owner, Rome, Italy" },
      { year: "1991", event: "Sold to second owner, Milan, Italy" },
      { year: "2003", event: "Sold at auction, RM Sotheby's, €420,000" },
      { year: "2023", event: "Last known sale, private transaction" },
    ],
    last_sale_price: 2800000,
    estimated_value: 3200000,
    status: "documented",
  },
};

export default function CarPage({ params }: { params: { chassis: string } }) {
  const car = carData[params.chassis];

  if (!car) {
    return (
      <main style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <p style={{color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px'}}>CHASSIS NOT FOUND</p>
          <h1 style={{fontSize: '32px', marginBottom: '24px'}}>{params.chassis}</h1>
          <p style={{color: '#8BA5B8', marginBottom: '32px'}}>This chassis has not been documented yet.</p>
          <Link href="/submit" style={{background: '#4A90B8', color: '#fff', padding: '12px 28px', textDecoration: 'none'}}>Submit This Car</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{background: '#080F1A', color: '#E2EEF7', fontFamily: 'Georgia, serif', minHeight: '100vh'}}>

      {/* Header */}
      <header style={{background: '#0A1828', borderBottom: '1px solid #1E3A5A', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Link href="/" style={{textDecoration: 'none'}}>
          <span style={{fontSize: '24px', fontWeight: 'bold'}}>
            <span style={{color: '#4A90B8'}}>Vin</span>
            <span style={{color: '#E2EEF7'}}>Vault</span>
          </span>
          <span style={{color: '#4A90B8', fontSize: '10px', letterSpacing: '4px', marginLeft: '10px'}}>REGISTRY</span>
        </Link>
        <div style={{color: '#8BA5B8', fontSize: '13px'}}>
          <Link href="/registry/ferrari-288-gto" style={{color: '#4A90B8', textDecoration: 'none'}}>Ferrari 288 GTO</Link>
          {' → '}{car.chassis}
        </div>
      </header>

      {/* Car header */}
      <section style={{padding: '60px 40px 40px', borderBottom: '1px solid #1E3A5A'}}>
        <p style={{color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px'}}>FERRARI 288 GTO · CHASSIS RECORD</p>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h1 style={{fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'monospace', letterSpacing: '2px'}}>{car.chassis}</h1>
            <p style={{color: '#8BA5B8'}}>Produced {car.production_date} · Original market: {car.original_market}</p>
          </div>
          <span style={{
            background: '#0D2A1A',
            color: '#4AB87A',
            padding: '8px 20px',
            fontSize: '12px',
            letterSpacing: '2px'
          }}>DOCUMENTED</span>
        </div>
      </section>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', maxWidth: '1200px', margin: '0 auto', padding: '40px'}}>

        {/* Left column */}
        <div style={{paddingRight: '40px', borderRight: '1px solid #1E3A5A'}}>

          {/* Identity */}
          <div style={{marginBottom: '40px'}}>
            <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>IDENTITY</h2>
            {[
              {label: 'Chassis Number', value: car.chassis},
              {label: 'Engine Number', value: car.engine_number},
              {label: 'Gearbox Number', value: car.gearbox_number},
              {label: 'Matching Numbers', value: car.matching_numbers ? '✓ Yes' : '✗ No'},
            ].map(row => (
              <div key={row.label} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #0D1E36'}}>
                <span style={{color: '#8BA5B8', fontSize: '14px'}}>{row.label}</span>
                <span style={{fontSize: '14px', fontFamily: row.label.includes('Number') ? 'monospace' : 'Georgia'}}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Appearance */}
          <div style={{marginBottom: '40px'}}>
            <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>APPEARANCE</h2>
            {[
              {label: 'Exterior Color', value: car.exterior_color},
              {label: 'Interior Color', value: car.interior_color},
            ].map(row => (
              <div key={row.label} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #0D1E36'}}>
                <span style={{color: '#8BA5B8', fontSize: '14px'}}>{row.label}</span>
                <span style={{fontSize: '14px'}}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Scores */}
          <div style={{marginBottom: '40px'}}>
            <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>CONDITION & ORIGINALITY</h2>
            {[
              {label: 'Originality Score', value: `${car.originality_score} / 10`},
              {label: 'Condition Score', value: `${car.condition_score} / 10`},
              {label: 'Documentation', value: car.documentation},
              {label: 'Service History', value: car.has_service_history ? '✓ Present' : '✗ Missing'},
              {label: 'Books', value: car.has_books ? '✓ Present' : '✗ Missing'},
              {label: 'Toolkit', value: car.has_toolkit ? '✓ Present' : '✗ Missing'},
            ].map(row => (
              <div key={row.label} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #0D1E36'}}>
                <span style={{color: '#8BA5B8', fontSize: '14px'}}>{row.label}</span>
                <span style={{fontSize: '14px'}}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{paddingLeft: '40px'}}>

          {/* Market value */}
          <div style={{background: '#0A1828', border: '1px solid #1E3A5A', padding: '28px', marginBottom: '32px'}}>
            <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>MARKET VALUE</h2>
            <div style={{fontSize: '36px', fontWeight: 'bold', color: '#E2EEF7', marginBottom: '8px'}}>
              €{car.estimated_value.toLocaleString()}
            </div>
            <p style={{color: '#8BA5B8', fontSize: '13px'}}>Estimated current value</p>
            <div style={{borderTop: '1px solid #1E3A5A', marginTop: '20px', paddingTop: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#8BA5B8', fontSize: '13px'}}>Last sale price</span>
                <span style={{fontSize: '13px'}}>€{car.last_sale_price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Provenance */}
          <div>
            <h2 style={{color: '#4A90B8', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>PROVENANCE</h2>
            {car.provenance.map((p: any, i: number) => (
              <div key={i} style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                <div style={{color: '#4A90B8', fontSize: '13px', minWidth: '40px', fontWeight: 'bold'}}>{p.year}</div>
                <div style={{color: '#8BA5B8', fontSize: '14px', lineHeight: '1.6'}}>{p.event}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{borderTop: '1px solid #1E3A5A', padding: '32px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px'}}>
        <span style={{color: '#4A90B8'}}>Vin</span>Vault Registry © 2026 · vinvault.net
      </footer>

    </main>
  );
}
