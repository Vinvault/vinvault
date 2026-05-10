import Link from "next/link";

const cars = [
  { chassis: "ZFFPA16B000040001", year: 1984, color: "Rosso Corsa", market: "Italy", status: "documented" },
  { chassis: "ZFFPA16B000040002", year: 1984, color: "Bianco", market: "Italy", status: "documented" },
  { chassis: "ZFFPA16B000040003", year: 1984, color: "Nero", market: "Germany", status: "unverified" },
];

export default function Ferrari288GTORegistry() {
  return (
    <main style={{background: '#F8F6F1', color: '#1A1A1A', fontFamily: 'Verdana, sans-serif', minHeight: '100vh'}}>

      {/* Page title */}
      <section style={{padding: '60px 40px 40px', borderBottom: '1px solid #E8E2D8'}}>
        <p style={{color: '#C9A84C', letterSpacing: '3px', fontSize: '11px', marginBottom: '16px'}}>WORLD REGISTRY</p>
        <h1 style={{fontSize: '42px', fontWeight: 'bold', marginBottom: '16px'}}>Ferrari 288 GTO</h1>
        <p style={{color: '#6A5A4A', fontSize: '16px', maxWidth: '600px', lineHeight: '1.7'}}>
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
              <div style={{fontSize: '28px', fontWeight: 'bold', color: '#C9A84C'}}>{s.n}</div>
              <div style={{color: '#6A5A4A', fontSize: '12px', letterSpacing: '1px', marginTop: '4px'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section style={{padding: '24px 40px', borderBottom: '1px solid #E8E2D8', display: 'flex', gap: '16px', alignItems: 'center'}}>
        <input 
          placeholder="Search chassis number..." 
          style={{background: '#F8F6F1', border: '1px solid #E8E2D8', color: '#1A1A1A', padding: '10px 16px', fontSize: '14px', width: '280px', fontFamily: 'Verdana, sans-serif'}}
        />
        <select style={{background: '#F8F6F1', border: '1px solid #E8E2D8', color: '#6A5A4A', padding: '10px 16px', fontSize: '14px', fontFamily: 'Verdana, sans-serif'}}>
          <option>All Markets</option>
          <option>Italy</option>
          <option>USA</option>
          <option>Germany</option>
          <option>Japan</option>
          <option>UK</option>
        </select>
        <select style={{background: '#F8F6F1', border: '1px solid #E8E2D8', color: '#6A5A4A', padding: '10px 16px', fontSize: '14px', fontFamily: 'Verdana, sans-serif'}}>
          <option>All Status</option>
          <option>Documented</option>
          <option>Unverified</option>
          <option>Missing</option>
        </select>
        <Link href="/submit" style={{marginLeft: 'auto', background: '#C9A84C', color: '#fff', padding: '10px 24px', textDecoration: 'none', fontSize: '14px'}}>
          + Submit a Car
        </Link>
      </section>

      {/* Table */}
      <section style={{padding: '0 40px 60px'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '24px'}}>
          <thead>
            <tr style={{borderBottom: '1px solid #E8E2D8', color: '#C9A84C', fontSize: '11px', letterSpacing: '2px', textAlign: 'left'}}>
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
              <tr key={car.chassis} style={{borderBottom: '1px solid #F8F6F1', transition: 'background 0.2s'}}>
                <td style={{padding: '18px 12px', color: '#9A8A7A', fontSize: '13px'}}>{i + 1}</td>
                <td style={{padding: '18px 12px', fontFamily: 'monospace', fontSize: '14px', color: '#1A1A1A', letterSpacing: '1px'}}>{car.chassis}</td>
                <td style={{padding: '18px 12px', color: '#6A5A4A'}}>{car.year}</td>
                <td style={{padding: '18px 12px', color: '#6A5A4A'}}>{car.color}</td>
                <td style={{padding: '18px 12px', color: '#6A5A4A'}}>{car.market}</td>
                <td style={{padding: '18px 12px'}}>
                  <span style={{
                    background: car.status === 'documented' ? '#E8F4EC' : '#FBF3E0',
                    color: car.status === 'documented' ? '#4AB87A' : '#B8944A',
                    padding: '4px 12px',
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    {car.status.toUpperCase()}
                  </span>
                </td>
                <td style={{padding: '18px 12px'}}>
                  <Link href={`/registry/ferrari-288-gto/${car.chassis}`} style={{color: '#C9A84C', fontSize: '13px', textDecoration: 'none'}}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{color: '#9A8A7A', fontSize: '13px', marginTop: '32px', textAlign: 'center'}}>
          Showing 3 of 272 chassis. Help us complete the registry — <Link href="/submit" style={{color: '#C9A84C'}}>submit a car</Link>.
        </p>
      </section>



    </main>
  );
}
