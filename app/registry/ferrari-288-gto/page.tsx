import Link from "next/link";

const cars = [
  { chassis: "ZFFPA16B000040001", year: 1984, color: "Rosso Corsa", market: "Italy", status: "documented" },
  { chassis: "ZFFPA16B000040002", year: 1984, color: "Bianco", market: "Italy", status: "documented" },
  { chassis: "ZFFPA16B000040003", year: 1984, color: "Nero", market: "Germany", status: "unverified" },
];

export default function Ferrari288GTORegistry() {
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
        <div style={{color: '#8BA5B8', fontSize: '13px'}}>Ferrari 288 GTO</div>
      </header>

      {/* Page title */}
      <section style={{padding: '60px 40px 40px', borderBottom: '1px solid #1E3A5A'}}>
        <p style={{color: '#4A90B8', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px'}}>WORLD REGISTRY</p>
        <h1 style={{fontSize: '42px', fontWeight: 'bold', marginBottom: '16px'}}>Ferrari 288 GTO</h1>
        <p style={{color: '#8BA5B8', fontSize: '16px', maxWidth: '600px', lineHeight: '1.7'}}>
          272 cars were produced between 1984 and 1985. This registry aims to document every single chassis — its history, ownership, and current status.
        </p>

        {/* Stats bar */}
        <div style={{display: 'flex', gap: '48px', marginTop: '40px'}}>
          {[
            {n: '272', l: 'Total Produced'},
            {n: '3', l: 'Documented'},
            {n: '269', l: 'Undocumented'},
            {n: '1%', l: 'Complete'},
          ].map(s => (
            <div key={s.l}>
              <div style={{fontSize: '28px', fontWeight: 'bold', color: '#4A90B8'}}>{s.n}</div>
              <div style={{color: '#8BA5B8', fontSize: '12px', letterSpacing: '1px', marginTop: '4px'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section style={{padding: '24px 40px', borderBottom: '1px solid #1E3A5A', display: 'flex', gap: '16px', alignItems: 'center'}}>
        <input 
          placeholder="Search chassis number..." 
          style={{background: '#0D1E36', border: '1px solid #1E3A5A', color: '#E2EEF7', padding: '10px 16px', fontSize: '14px', width: '280px', fontFamily: 'Georgia, serif'}}
        />
        <select style={{background: '#0D1E36', border: '1px solid #1E3A5A', color: '#8BA5B8', padding: '10px 16px', fontSize: '14px', fontFamily: 'Georgia, serif'}}>
          <option>All Markets</option>
          <option>Italy</option>
          <option>USA</option>
          <option>Germany</option>
          <option>Japan</option>
          <option>UK</option>
        </select>
        <select style={{background: '#0D1E36', border: '1px solid #1E3A5A', color: '#8BA5B8', padding: '10px 16px', fontSize: '14px', fontFamily: 'Georgia, serif'}}>
          <option>All Status</option>
          <option>Documented</option>
          <option>Unverified</option>
          <option>Missing</option>
        </select>
        <Link href="/submit" style={{marginLeft: 'auto', background: '#4A90B8', color: '#fff', padding: '10px 24px', textDecoration: 'none', fontSize: '14px'}}>
          + Submit a Car
        </Link>
      </section>

      {/* Table */}
      <section style={{padding: '0 40px 60px'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '24px'}}>
          <thead>
            <tr style={{borderBottom: '1px solid #1E3A5A', color: '#4A90B8', fontSize: '11px', letterSpacing: '2px', textAlign: 'left'}}>
              <th style={{padding: '16px 12px'}}>#</th>
              <th style={{padding: '16px 12px'}}>CHASSIS NUMBER</th>
              <th style={{padding: '16px 12px'}}>YEAR</th>
              <th style={{padding: '16px 12px'}}>COLOR</th>
              <th style={{padding: '16px 12px'}}>MARKET</th>
              <th style={{padding: '16px 12px'}}>STATUS</th>
              <th style={{padding: '16px 12px'}}></th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, i) => (
              <tr key={car.chassis} style={{borderBottom: '1px solid #0D1E36', transition: 'background 0.2s'}}>
                <td style={{padding: '18px 12px', color: '#4A6A8A', fontSize: '13px'}}>{i + 1}</td>
                <td style={{padding: '18px 12px', fontFamily: 'monospace', fontSize: '14px', color: '#E2EEF7', letterSpacing: '1px'}}>{car.chassis}</td>
                <td style={{padding: '18px 12px', color: '#8BA5B8'}}>{car.year}</td>
                <td style={{padding: '18px 12px', color: '#8BA5B8'}}>{car.color}</td>
                <td style={{padding: '18px 12px', color: '#8BA5B8'}}>{car.market}</td>
                <td style={{padding: '18px 12px'}}>
                  <span style={{
                    background: car.status === 'documented' ? '#0D2A1A' : '#2A1A0D',
                    color: car.status === 'documented' ? '#4AB87A' : '#B8944A',
                    padding: '4px 12px',
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    {car.status.toUpperCase()}
                  </span>
                </td>
                <td style={{padding: '18px 12px'}}>
                  <Link href={`/registry/ferrari-288-gto/${car.chassis}`} style={{color: '#4A90B8', fontSize: '13px', textDecoration: 'none'}}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{color: '#4A6A8A', fontSize: '13px', marginTop: '32px', textAlign: 'center'}}>
          Showing 3 of 272 chassis. Help us complete the registry — <Link href="/submit" style={{color: '#4A90B8'}}>submit a car</Link>.
        </p>
      </section>

      {/* Footer */}
      <footer style={{borderTop: '1px solid #1E3A5A', padding: '32px 40px', textAlign: 'center', color: '#4A6A8A', fontSize: '13px'}}>
        <span style={{color: '#4A90B8'}}>Vin</span>Vault Registry © 2026 · vinvault.net
      </footer>

    </main>
  );
}
