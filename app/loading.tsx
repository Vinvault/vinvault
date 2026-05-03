export default function HomeLoading() {
  return (
    <main style={{ background: "#080F1A", minHeight: "100vh" }}>
      <div style={{ background: "#0A1828", borderBottom: "1px solid #1E3A5A", padding: "18px 40px", height: "61px" }} />
      <section style={{ textAlign: "center", padding: "90px 40px 72px", borderBottom: "1px solid #1E3A5A" }}>
        <div className="vv-skeleton" style={{ height: "12px", width: "180px", margin: "0 auto 20px" }} />
        <div className="vv-skeleton" style={{ height: "56px", width: "600px", maxWidth: "90%", margin: "0 auto 20px" }} />
        <div className="vv-skeleton" style={{ height: "20px", width: "400px", maxWidth: "90%", margin: "0 auto 44px" }} />
        <div className="vv-skeleton" style={{ height: "48px", width: "520px", maxWidth: "100%", margin: "0 auto" }} />
      </section>
      <section style={{ background: "#0A1828", padding: "28px 40px", display: "flex", justifyContent: "center", gap: "80px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ textAlign: "center" }}>
            <div className="vv-skeleton" style={{ height: "36px", width: "60px", margin: "0 auto 8px" }} />
            <div className="vv-skeleton" style={{ height: "12px", width: "100px", margin: "0 auto" }} />
          </div>
        ))}
      </section>
    </main>
  );
}
