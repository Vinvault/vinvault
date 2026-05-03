export default function RegistryLoading() {
  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Georgia, serif", minHeight: "100vh" }}>
      {/* Header skeleton */}
      <div style={{ background: "#0A1828", borderBottom: "1px solid #1E3A5A", padding: "18px 40px", height: "61px" }} />

      {/* Hero skeleton */}
      <section style={{ padding: "60px 40px 40px", borderBottom: "1px solid #1E3A5A" }}>
        <div className="vv-skeleton" style={{ height: "12px", width: "120px", marginBottom: "16px" }} />
        <div className="vv-skeleton" style={{ height: "40px", width: "320px", marginBottom: "16px" }} />
        <div className="vv-skeleton" style={{ height: "16px", width: "500px", marginBottom: "8px" }} />
        <div className="vv-skeleton" style={{ height: "16px", width: "400px", marginBottom: "40px" }} />
        <div style={{ display: "flex", gap: "48px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <div className="vv-skeleton" style={{ height: "28px", width: "60px", marginBottom: "8px" }} />
              <div className="vv-skeleton" style={{ height: "12px", width: "80px" }} />
            </div>
          ))}
        </div>
      </section>

      {/* Filter skeleton */}
      <div style={{ padding: "24px 40px", borderBottom: "1px solid #1E3A5A", display: "flex", gap: "16px" }}>
        <div className="vv-skeleton" style={{ height: "40px", width: "240px" }} />
        <div className="vv-skeleton" style={{ height: "40px", width: "140px" }} />
        <div className="vv-skeleton" style={{ height: "40px", width: "140px" }} />
      </div>

      {/* Table skeleton */}
      <section style={{ padding: "24px 40px 60px" }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: "flex", gap: "20px", padding: "18px 0", borderBottom: "1px solid #0D1E36", alignItems: "center" }}>
            <div className="vv-skeleton" style={{ height: "16px", width: "24px" }} />
            <div className="vv-skeleton" style={{ height: "16px", width: "200px" }} />
            <div className="vv-skeleton" style={{ height: "16px", width: "120px" }} />
            <div className="vv-skeleton" style={{ height: "16px", width: "100px" }} />
            <div className="vv-skeleton" style={{ height: "20px", width: "80px", borderRadius: "2px" }} />
          </div>
        ))}
      </section>
    </main>
  );
}
