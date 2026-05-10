import Link from "next/link";

const carData: Record<string, any> = {
  "zffpa16b000040001": {
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

export default async function CarPage({ params }: { params: Promise<{ chassis: string }> }) {
  const { chassis } = await params;
  const car = carData[chassis?.toLowerCase() ?? ""];

  if (!car) {
    return (
      <main style={{background: '#F8F6F1', color: '#1A1A1A', fontFamily: 'Verdana, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <p style={{color: '#C9A84C', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px'}}>CHASSIS NOT FOUND</p>
          <h1 style={{fontSize: '32px', marginBottom: '24px', fontFamily: 'monospace'}}>{chassis?.toUpperCase()}</h1>
          <p style={{color: '#6A5A4A', marginBottom: '32px'}}>This chassis has not been documented yet.</p>
          <Link href="/submit" style={{background: '#C9A84C', color: '#fff', padding: '12px 28px', textDecoration: 'none'}}>Submit This Car</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{background: '#F8F6F1', color: '#1A1A1A', fontFamily: 'Verdana, sans-serif', minHeight: '100vh'}}>
      <section style={{padding: '60px 40px 40px', borderBottom: '1px solid #E8E2D8'}}>
        <p style={{color: '#C9A84C', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px'}}>FERRARI 288 GTO · CHASSIS RECORD</p>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h1 style={{fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'monospace', letterSpacing: '2px'}}>{car.chassis}</h1>
            <p style={{color: '#6A5A4A'}}>Produced {car.production_date} · Original market: {car.original_market}</p>
          </div>
          <span style={{background: '#E8F4EC', color: '#4AB87A', padding: '8px 20px', fontSize: '12px', letterSpacing: '2px'}}>DOCUMENTED</span>
        </div>
      </section>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', maxWidth: '1200px', margin: '0 auto', padding: '40px'}}>
        <div style={{paddingRight: '40px', borderRight: '1px solid #E8E2D8'}}>
          <div style={{marginBottom: '40px'}}>
            <h2 style={{color: '#C9A84C', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>IDENTITY</h2>
            {[
              {label: 'Chassis Number', value: car.chassis},
              {label: 'Engine Number', value: car.engine_number},
              {label: 'Gearbox Number', value: car.gearbox_number},
              {label: 'Matching Numbers', value: car.matching_numbers ? '✓ Yes' : '✗ No'},
            ].map(row => (
              <div key={row.label} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F8F6F1'}}>
                <span style={{color: '#6A5A4A', fontSize: '14px'}}>{row.label}</span>
                <span style={{fontSize: '14px', fontFamily: row.label.includes('Number') ? 'monospace' : 'Verdana'}}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{marginBottom: '40px'}}>
            <h2 style={{color: '#C9A84C', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>APPEARANCE</h2>
            {[
              {label: 'Exterior Color', value: car.exterior_color},
              {label: 'Interior Color', value: car.interior_color},
            ].map(row => (
              <div key={row.label} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F8F6F1'}}>
                <span style={{color: '#6A5A4A', fontSize: '14px'}}>{row.label}</span>
                <span style={{fontSize: '14px'}}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{marginBottom: '40px'}}>
            <h2 style={{color: '#C9A84C', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>CONDITION & ORIGINALITY</h2>
            {[
              {label: 'Originality Score', value: `${car.originality_score} / 10`},
              {label: 'Condition Score', value: `${car.condition_score} / 10`},
              {label: 'Documentation', value: car.documentation},
              {label: 'Service History', value: car.has_service_history ? '✓ Present' : '✗ Missing'},
              {label: 'Books', value: car.has_books ? '✓ Present' : '✗ Missing'},
              {label: 'Toolkit', value: car.has_toolkit ? '✓ Present' : '✗ Missing'},
            ].map(row => (
              <div key={row.label} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F8F6F1'}}>
                <span style={{color: '#6A5A4A', fontSize: '14px'}}>{row.label}</span>
                <span style={{fontSize: '14px'}}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{paddingLeft: '40px'}}>
          <div style={{background: '#FFFDF8', border: '1px solid #E8E2D8', padding: '28px', marginBottom: '32px'}}>
            <h2 style={{color: '#C9A84C', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>MARKET VALUE</h2>
            <div style={{fontSize: '36px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '8px'}}>
              €{car.estimated_value.toLocaleString()}
            </div>
            <p style={{color: '#6A5A4A', fontSize: '13px'}}>Estimated current value</p>
            <div style={{borderTop: '1px solid #E8E2D8', marginTop: '20px', paddingTop: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#6A5A4A', fontSize: '13px'}}>Last sale price</span>
                <span style={{fontSize: '13px'}}>€{car.last_sale_price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 style={{color: '#C9A84C', fontSize: '11px', letterSpacing: '3px', marginBottom: '20px'}}>PROVENANCE</h2>
            {car.provenance.map((p: any, i: number) => (
              <div key={i} style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                <div style={{color: '#C9A84C', fontSize: '13px', minWidth: '40px', fontWeight: 'bold'}}>{p.year}</div>
                <div style={{color: '#6A5A4A', fontSize: '14px', lineHeight: '1.6'}}>{p.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </main>
  );
}
