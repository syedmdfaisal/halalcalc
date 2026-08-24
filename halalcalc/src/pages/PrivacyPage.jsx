const T = { bg:"#F4F7F5", surface:"#FFFFFF", border:"#DDE6E1", brand:"#0A7C4E", brandLight:"#EAF4EE", text1:"#0C1E14", text2:"#3D5247", text3:"#7A9488", shadow:"0 1px 4px rgba(10,60,30,0.06), 0 4px 16px rgba(10,60,30,0.05)", radius:"14px" }

export default function PrivacyPage() {
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
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"2.4rem", fontWeight:400, margin:"0 0 12px", color:"#fff" }}>Privacy Policy</h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.65)" }}>Last updated: 8 August 2026</p>
          </div>

          {[
            { title:"1. Overview", body:"HalalCalc.com is committed to protecting your privacy. This policy explains how we handle information when you use our website at halalcalc.com." },
            { title:"2. Data We Do NOT Collect", body:"All calculations on HalalCalc.com run entirely in your browser (client-side). The financial figures you enter — including estate values, savings amounts, income, and asset details — are never transmitted to our servers and are never stored anywhere.\n\nWe do not collect:\n• Names, email addresses, or contact details (unless you contact us voluntarily)\n• Financial data entered into any calculator\n• Zakat amounts, estate values, or inheritance details\n• Login credentials (we have no login system)" },
            { title:"3. Cookies and Analytics", body:"We use Google Analytics to understand how many people visit the site and which tools are most popular. Google Analytics collects anonymous usage data such as page views, session duration, and device type. This data is aggregated and cannot identify you personally.\n\nWe display advertisements through Google AdSense. Google AdSense may use cookies to show you relevant ads based on your browsing history. You can opt out of personalised advertising at https://adssettings.google.com.\n\nBy using HalalCalc.com, you consent to the use of analytics and advertising cookies as described above." },
            { title:"4. Third-Party Links", body:"Our tools include links to external websites including Islamic banks, Zakat payment portals, and government authorities. We are not responsible for the privacy practices of these external sites. We recommend reviewing their privacy policies before using their services." },
            { title:"5. Sponsored Partner Links", body:"Some links on HalalCalc.com are affiliate or sponsored links. These are clearly labelled as 'Sponsored' where they appear. If you click these links and make a purchase or sign up for a service, we may receive a commission. This does not affect the price you pay." },
            { title:"6. Children's Privacy", body:"HalalCalc.com is not directed at children under the age of 13. We do not knowingly collect data from children." },
            { title:"7. Changes to This Policy", body:"We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated date. Continued use of HalalCalc.com after changes constitutes acceptance of the updated policy." },
            { title:"8. Contact", body:"If you have any questions about this privacy policy, please contact us via the Contact page." },
          ].map((s,i) => (
            <div key={i} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"22px 26px", marginBottom:12, boxShadow:T.shadow }}>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.15rem", fontWeight:400, color:T.text1, marginBottom:10 }}>{s.title}</h2>
              <div style={{ fontSize:13, color:T.text2, lineHeight:1.85 }}>
                {s.body.split("\n").map((line,j) => <p key={j} style={{ marginBottom: line===""?8:0 }}>{line}</p>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
