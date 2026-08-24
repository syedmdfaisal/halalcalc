const T = { bg:"#F4F7F5", surface:"#FFFFFF", border:"#DDE6E1", brand:"#0A7C4E", brandLight:"#EAF4EE", gold:"#9B7B2E", text1:"#0C1E14", text2:"#3D5247", text3:"#7A9488", shadow:"0 1px 4px rgba(10,60,30,0.06), 0 4px 16px rgba(10,60,30,0.05)", radius:"14px", radiusSm:"8px" }

export default function AboutPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:T.bg, minHeight:"100vh", color:T.text1 }}>
        <nav style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
          <a href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:T.brand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>☪</div>
            <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text1 }}>HalalCalc.com</span>
          </a>
          <a href="/" style={{ fontSize:13, fontWeight:600, color:T.brand, textDecoration:"none" }}>← Back to Tools</a>
        </nav>

        <div style={{ maxWidth:720, margin:"0 auto", padding:"48px 24px 80px" }}>
          <div style={{ background:T.brand, borderRadius:T.radius, padding:"40px 36px", marginBottom:32, color:"#fff" }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"rgba(255,255,255,0.6)", marginBottom:12 }}>About</div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"2.4rem", fontWeight:400, margin:"0 0 16px", color:"#fff" }}>About HalalCalc.com</h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.8)", lineHeight:1.75 }}>
              Free, independent Islamic finance calculators for Muslims in Malaysia, Singapore and Indonesia.
            </p>
          </div>

          {[
            { title:"What is HalalCalc.com?", body:"HalalCalc.com is a free, independent website providing Shariah-compliant financial calculators for Muslims in Southeast Asia. Our tools cover Zakat calculation, Islamic home financing comparison, Islamic savings and fixed deposit returns, and Faraid (Islamic inheritance) distribution.\n\nAll tools are completely free to use. No registration is required. No data is collected." },
            { title:"Why was it built?", body:"The 280 million Muslims across Malaysia, Singapore and Indonesia deserve financial tools built specifically for their needs — following the correct local Nisab standards, the official financing structures of their banks, and the Shafi'i jurisprudence that governs their religious obligations.\n\nMost existing Islamic finance tools are built for Western Muslim minorities and use incorrect Nisab values, wrong gold karat standards, or ignore country-specific rulings entirely. HalalCalc.com fixes that." },
            { title:"Which Islamic authority do we follow?", body:"All calculations follow the Shafi'i madhab — the official school of Islamic jurisprudence in Malaysia, Singapore and Indonesia.\n\nFor country-specific rulings:\n• Malaysia: JAKIM and state Lembaga Zakat authorities\n• Singapore: MUIS (Majlis Ugama Islam Singapura)\n• Indonesia: BAZNAS and MUI (Majelis Ulama Indonesia)" },
            { title:"How often are rates updated?", body:"We update rates on a published schedule:\n• Malaysian Islamic FD rates: monthly\n• Zakat Nisab (Malaysia): biannually — January and July\n• Zakat Nisab (Singapore): monthly, following MUIS\n• Zakat Nisab (Indonesia): annually, following BAZNAS\n• Home financing rates: quarterly\n\nEvery tool displays a 'Last Verified' badge showing the exact date rates were last checked." },
            { title:"Is HalalCalc.com affiliated with any bank or Islamic authority?", body:"No. HalalCalc.com is fully independent and not affiliated with any bank, government body, or Islamic authority. We do not provide official rulings, licensed financial advice, or binding Zakat or Faraid assessments.\n\nFor official Zakat payment, please use your state's Lembaga Zakat portal (Malaysia), MUIS (Singapore), or BAZNAS (Indonesia). For estate distribution, always consult a certified Syariah lawyer." },
          ].map((s,i) => (
            <div key={i} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"24px 28px", marginBottom:14, boxShadow:T.shadow }}>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.25rem", fontWeight:400, color:T.text1, marginBottom:12 }}>{s.title}</h2>
              <div style={{ fontSize:14, color:T.text2, lineHeight:1.85 }}>
                {s.body.split("\n").map((line, j) => <p key={j} style={{ marginBottom: line === "" ? 8 : 0 }}>{line}</p>)}
              </div>
            </div>
          ))}

          <div style={{ background:T.brandLight, border:`1px solid ${T.brand}33`, borderRadius:T.radius, padding:"20px 24px", marginTop:24, fontSize:13, color:T.text2, lineHeight:1.7 }}>
            HalalCalc.com is an independent tool and is not affiliated with any bank, government body, or Islamic authority.
          </div>
        </div>
      </div>
    </>
  )
}
