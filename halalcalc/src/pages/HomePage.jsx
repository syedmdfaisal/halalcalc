import { useState, useEffect } from "react";

const T = {
  bg:"#F4F7F5", surface:"#FFFFFF", border:"#DDE6E1",
  brand:"#0A7C4E", brandDark:"#075C39", brandLight:"#EAF4EE",
  gold:"#9B7B2E", goldLight:"#FDF8EC",
  text1:"#0C1E14", text2:"#3D5247", text3:"#7A9488",
  success:"#276749", successLight:"#F0FAF4",
  shadow:"0 1px 4px rgba(10,60,30,0.06), 0 4px 16px rgba(10,60,30,0.05)",
  shadowMd:"0 4px 24px rgba(10,60,30,0.10)",
  shadowLg:"0 8px 40px rgba(10,60,30,0.14)",
  radius:"16px", radiusSm:"10px", radiusXs:"6px",
};

// ─── AD SLOTS ─────────────────────────────────────────────────────────────
const AdLeaderboard = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"16px 0", background:T.surface, borderBottom:`1px solid ${T.border}` }}>
    {/* REPLACE WITH ADSENSE: 728x90 horizontal */}
    <div style={{ width:728, height:90, maxWidth:"100%", background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusXs, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Advertisement — 728×90</span>
    </div>
  </div>
);

const AdMidPage = () => (
  <div style={{ display:"flex", justifyContent:"center", margin:"32px 0" }}>
    {/* REPLACE WITH ADSENSE: responsive in-content */}
    <div style={{ width:"100%", maxWidth:728, height:90, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusXs, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Advertisement — In-Content</span>
    </div>
  </div>
);

const AdStickyFooter = () => (
  <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, display:"flex", justifyContent:"center", alignItems:"center", background:T.surface, borderTop:`1px solid ${T.border}`, height:60, boxShadow:"0 -2px 12px rgba(0,0,0,0.08)" }}>
    {/* REPLACE WITH ADSENSE: 320x50 anchor */}
    <div style={{ width:320, height:50, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusXs, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:10, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Sticky Footer — 320×50</span>
    </div>
  </div>
);

// ─── DATA ─────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    id:"zakat",
    icon:"☪",
    title:"Zakat Calculator",
    subtitle:"Calculate your annual Zakat obligation",
    desc:"Enter your savings, gold, investments, business assets and receivables. Get an accurate Zakat figure based on the official Nisab threshold for your country — updated biannually.",
    features:["8 asset categories","Malaysia, Singapore & Indonesia","Nisab in gold or silver standard","Payment breakdown — monthly, weekly, Ramadan"],
    badge:"Most Used",
    badgeColor:T.gold,
    url:"/zakat-calculator",
    countries:["🇲🇾","🇸🇬","🇮🇩"],
  },
  {
    id:"home",
    icon:"🏠",
    title:"Home Financing Calculator",
    subtitle:"Compare Shariah-compliant home financing",
    desc:"Compare Musharakah Mutanaqisah, BBA, Murabaha and Ijara financing structures side by side. Includes full amortisation schedule and Malaysia stamp duty estimation.",
    features:["4 financing structures","Amortisation schedule","Malaysia stamp duty calculator","Recommended income check"],
    badge:"High Value",
    badgeColor:T.brand,
    url:"/home-financing",
    countries:["🇲🇾","🇸🇬","🇮🇩"],
  },
  {
    id:"savings",
    icon:"💰",
    title:"Savings & FD Calculator",
    subtitle:"Find the best Islamic profit rate",
    desc:"Compare profit rates from 13 Islamic banks across Malaysia, Singapore and Indonesia. See which bank gives you the best Mudarabah return for your deposit amount and tenure.",
    features:["13 banks compared","Rates updated monthly","Mudarabah & Wadiah explained","Multi-tenure projection"],
    badge:"Updated Monthly",
    badgeColor:"#1D4ED8",
    url:"/savings-calculator",
    countries:["🇲🇾","🇸🇬","🇮🇩"],
  },
  {
    id:"faraid",
    icon:"📜",
    title:"Faraid Calculator",
    subtitle:"Islamic estate distribution made clear",
    desc:"Calculate the Shariah-compliant distribution of an estate under the Shafi'i madhab. Covers all 15 heir categories, blocking rules, Awl and Radd principles.",
    features:["15 heir categories","Full blocking (Hajb) rules","Awl & Radd automatic","Visual distribution chart"],
    badge:"Unique Tool",
    badgeColor:"#7E22CE",
    url:"/faraid-calculator",
    countries:["🇲🇾","🇸🇬","🇮🇩"],
  },
];

const STATS = [
  { value:"4",       label:"Free Tools",             icon:"🔧" },
  { value:"1.8B+",   label:"Muslims Worldwide",      icon:"🌍" },
  { value:"3",       label:"Countries Covered",      icon:"🗺" },
  { value:"100%",    label:"Shariah-Compliant",      icon:"✅" },
];

const FAQS = [
  { q:"Are these calculators free to use?", a:"Yes — all tools on HalalCalc.com are completely free. No registration, no subscription, no hidden fees." },
  { q:"Which school of Islamic jurisprudence do these tools follow?", a:"All tools follow the Shafi'i madhab, which is the official school of jurisprudence in Malaysia, Singapore and Indonesia. Where different rulings exist (such as the Nisab standard), we follow the official position of each country's Islamic authority — JAKIM/Lembaga Zakat for Malaysia, MUIS for Singapore, and BAZNAS for Indonesia." },
  { q:"How often are the rates updated?", a:"We verify and update all profit rates, Nisab thresholds and financing rates on a regular schedule — Malaysian FD rates monthly, Nisab figures biannually (January and July) for Malaysia, monthly for Singapore, and annually for Indonesia. Every tool displays a 'Last Verified' badge so you always know when rates were last checked." },
  { q:"Can I use these calculators for official Zakat payment or estate distribution?", a:"These tools are for guidance and planning only. For official Zakat payment, always use your state's Lembaga Zakat portal (Malaysia), MUIS (Singapore), or BAZNAS (Indonesia). For estate distribution, always consult a certified Syariah lawyer or your local Syariah Court." },
  { q:"Is HalalCalc.com affiliated with any bank or Islamic authority?", a:"No. HalalCalc.com is fully independent and not affiliated with any bank, government body, or Islamic authority. All tools are built to help Muslims make informed financial decisions — we do not provide official rulings or licensed financial advice." },
  { q:"Will you add more countries?", a:"Yes — Brunei is next on our roadmap, followed by Bangladesh and Pakistan. We add countries carefully to ensure calculations follow each country's official rulings, not just generic Islamic finance standards." },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────
const IslamicStar = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" style={{ opacity:0.15 }}>
    {[0,45,90,135].map(a=><g key={a} transform={`rotate(${a} 16 16)`}><rect x="15" y="1" width="2" height="30" rx="1" fill="#fff"/></g>)}
    <circle cx="16" cy="16" r="5" fill="#fff"/>
  </svg>
);

const ToolCard = ({ tool, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background:T.surface, border:`1px solid ${hovered ? tool.badgeColor+"66" : T.border}`, borderRadius:T.radius, padding:24, boxShadow: hovered ? T.shadowLg : T.shadow, transition:"all 0.2s", cursor:"pointer", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:`${tool.badgeColor}15`, border:`1px solid ${tool.badgeColor}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
          {tool.icon}
        </div>
        <span style={{ fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:20, background:`${tool.badgeColor}15`, color:tool.badgeColor, border:`1px solid ${tool.badgeColor}33`, letterSpacing:"0.5px", textTransform:"uppercase" }}>
          {tool.badge}
        </span>
      </div>

      {/* Title */}
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.35rem", fontWeight:400, color:T.text1, margin:"0 0 4px", lineHeight:1.25 }}>{tool.title}</h2>
      <div style={{ fontSize:12, fontWeight:600, color:tool.badgeColor, marginBottom:12 }}>{tool.subtitle}</div>
      <p style={{ fontSize:13, color:T.text2, lineHeight:1.7, margin:"0 0 16px", flex:1 }}>{tool.desc}</p>

      {/* Features */}
      <div style={{ marginBottom:18 }}>
        {tool.features.map((f,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 0", fontSize:12, color:T.text2 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:tool.badgeColor, flexShrink:0 }}/>
            {f}
          </div>
        ))}
      </div>

      {/* Countries */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:4 }}>
          {tool.countries.map((c,i) => <span key={i} style={{ fontSize:18 }}>{c}</span>)}
        </div>
        <a href={tool.url}
           style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 18px", background: hovered ? tool.badgeColor : T.brandLight, color: hovered ? "#fff" : T.brand, borderRadius:20, fontSize:12, fontWeight:700, textDecoration:"none", transition:"all 0.2s", border:`1px solid ${hovered ? tool.badgeColor : T.border}` }}>
          Open Calculator →
        </a>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function HomePage() {
  const [isMobile, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [openFaq, setFaq] = useState(null);

  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:T.bg, minHeight:"100vh", paddingBottom:80, color:T.text1 }}>

        {/* ── NAV ── */}
        <nav style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:T.brand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>☪</div>
            <div>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text1, lineHeight:1 }}>HalalCalc</div>
              <div style={{ fontSize:9, color:T.text3, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase" }}>.com</div>
            </div>
          </div>
          <div style={{ display:"flex", gap: isMobile ? 12 : 24, alignItems:"center" }}>
            {!isMobile && [
              { label:"Zakat",       url:"/zakat-calculator" },
              { label:"Financing",   url:"/home-financing" },
              { label:"Savings",     url:"/savings-calculator" },
              { label:"Faraid",      url:"/faraid-calculator" },
            ].map((l,i) => (
              <a key={i} href={l.url} style={{ fontSize:13, fontWeight:600, color:T.text2, textDecoration:"none" }}
                 onMouseEnter={e=>e.target.style.color=T.brand} onMouseLeave={e=>e.target.style.color=T.text2}>
                {l.label}
              </a>
            ))}
            <a href="/zakat-calculator" style={{ padding:"8px 16px", background:T.brand, color:"#fff", borderRadius:20, fontSize:12, fontWeight:700, textDecoration:"none" }}>
              Start Calculating
            </a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{ background:`linear-gradient(145deg, ${T.brand} 0%, ${T.brandDark} 100%)`, color:"#fff", padding: isMobile ? "56px 24px 64px" : "80px 40px 96px", position:"relative", overflow:"hidden", textAlign:"center" }}>

          {/* Background pattern */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.06, pointerEvents:"none" }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="20" fill="none" stroke="#fff" strokeWidth="1"/>
                <circle cx="30" cy="30" r="10" fill="none" stroke="#fff" strokeWidth="0.5"/>
                <line x1="30" y1="10" x2="30" y2="50" stroke="#fff" strokeWidth="0.3"/>
                <line x1="10" y1="30" x2="50" y2="30" stroke="#fff" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>

          {/* Decorative stars */}
          <div style={{ position:"absolute", top:24, left:24 }}><IslamicStar/></div>
          <div style={{ position:"absolute", top:40, right:32, transform:"scale(0.6)" }}><IslamicStar/></div>
          <div style={{ position:"absolute", bottom:24, left:"40%", transform:"scale(0.4)" }}><IslamicStar/></div>

          <div style={{ position:"relative", zIndex:1, maxWidth:680, margin:"0 auto" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:20, padding:"6px 16px", marginBottom:24, fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"rgba(255,255,255,0.85)" }}>
              ☪ Free Islamic Finance Tools for Southeast Asia
            </div>

            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "2.4rem" : "3.8rem", fontWeight:400, lineHeight:1.15, margin:"0 0 20px", color:"#fff" }}>
              Shariah-Compliant<br/>
              <span style={{ color:"#C9A84C" }}>Financial Calculators</span>
            </h1>

            <p style={{ fontSize: isMobile ? "15px" : "17px", color:"rgba(255,255,255,0.78)", lineHeight:1.75, margin:"0 0 36px", maxWidth:560, marginLeft:"auto", marginRight:"auto" }}>
              Free, accurate tools for Muslim financial planning — Zakat, home financing,
              savings, and inheritance. Based on official rulings from JAKIM, MUIS, and BAZNAS.
            </p>

            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <a href="/zakat-calculator"
                 style={{ padding:"14px 28px", background:"#C9A84C", color:T.text1, borderRadius:10, fontSize:14, fontWeight:800, textDecoration:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.2)", transition:"transform 0.15s" }}
                 onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                 onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                Calculate My Zakat ☪
              </a>
              <a href="#tools"
                 style={{ padding:"14px 28px", background:"rgba(255,255,255,0.12)", color:"#fff", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none", border:"1px solid rgba(255,255,255,0.25)" }}>
                See All Tools ↓
              </a>
            </div>

            {/* Country badges */}
            <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:28, flexWrap:"wrap" }}>
              {[["🇲🇾","Malaysia","JAKIM / Lembaga Zakat"],["🇸🇬","Singapore","MUIS"],["🇮🇩","Indonesia","BAZNAS / MUI"]].map(([flag,name,auth],i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:"rgba(255,255,255,0.1)", borderRadius:20, border:"1px solid rgba(255,255,255,0.15)" }}>
                  <span style={{ fontSize:16 }}>{flag}</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#fff" }}>{name}</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)" }}>{auth}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LEADERBOARD AD ── */}
        <AdLeaderboard/>

        {/* ── STATS BAR ── */}
        <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}` }}>
          <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 24px", display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:16 }}>
            {STATS.map((s,i) => (
              <div key={i} style={{ textAlign:"center", padding:"12px" }}>
                <div style={{ fontSize:24, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:T.brand, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12, color:T.text3, marginTop:4, fontWeight:600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:960, margin:"0 auto", padding: isMobile ? "40px 16px" : "60px 24px" }}>

          {/* ── TOOLS GRID ── */}
          <div id="tools" style={{ scrollMarginTop:80 }}>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:T.brand, marginBottom:10 }}>The Tools</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "1.9rem" : "2.6rem", fontWeight:400, color:T.text1, margin:"0 0 12px" }}>
                Four Free Tools.<br/>One Islamic Finance Hub.
              </h2>
              <p style={{ fontSize:14, color:T.text2, maxWidth:520, margin:"0 auto", lineHeight:1.7 }}>
                Each tool follows the official Shariah rulings of your country — not generic international standards.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16 }}>
              {TOOLS.map(tool => <ToolCard key={tool.id} tool={tool} isMobile={isMobile}/>)}
            </div>
          </div>

          {/* ── MID-PAGE AD ── */}
          <AdMidPage/>

          {/* ── WHY HALALCALC ── */}
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding: isMobile ? "32px 20px" : "48px 40px", marginBottom:48, boxShadow:T.shadow }}>
            <div style={{ textAlign:"center", marginBottom:36 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:T.brand, marginBottom:10 }}>Why HalalCalc.com</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "1.8rem" : "2.2rem", fontWeight:400, color:T.text1, margin:0 }}>
                Built for Southeast Asian Muslims
              </h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap:24 }}>
              {[
                { icon:"🎯", title:"Country-Specific", desc:"Each tool uses the official Nisab values, ruling standards and authorities for Malaysia, Singapore and Indonesia — not generic global figures." },
                { icon:"✅", title:"Verified Regularly", desc:"Every rate, Nisab value and financing figure is checked and updated on a published schedule. Every tool shows exactly when it was last verified." },
                { icon:"🔒", title:"No Data Collected", desc:"These tools run entirely in your browser. Nothing you enter is sent to any server. Your financial details stay private." },
                { icon:"📱", title:"Mobile Friendly", desc:"Every tool is designed for phone screens first. Calculate your Zakat, check financing costs or plan your estate from anywhere." },
                { icon:"🕌", title:"Shafi'i Madhab", desc:"All calculations follow the Shafi'i school — the official madhab of Malaysia, Singapore and Indonesia — for religiously sound results." },
                { icon:"🆓", title:"Completely Free", desc:"All four tools are free, with no registration, no subscription and no premium paywall. Islamic financial planning should be accessible to everyone." },
              ].map((f,i) => (
                <div key={i} style={{ display:"flex", gap:14 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:T.brandLight, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.text1, marginBottom:5 }}>{f.title}</div>
                    <div style={{ fontSize:12, color:T.text2, lineHeight:1.7 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div style={{ marginBottom:48 }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:T.brand, marginBottom:10 }}>FAQ</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "1.8rem" : "2.2rem", fontWeight:400, color:T.text1, margin:0 }}>
                Common Questions
              </h2>
            </div>
            <div style={{ maxWidth:720, margin:"0 auto" }}>
              {FAQS.map((faq,i) => (
                <div key={i} style={{ background:T.surface, border:`1px solid ${openFaq===i ? T.brand+"55" : T.border}`, borderRadius:T.radiusSm, marginBottom:8, overflow:"hidden", boxShadow:T.shadow, transition:"border-color 0.15s" }}>
                  <button onClick={() => setFaq(openFaq===i ? null : i)}
                    style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left", gap:12 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:T.text1, lineHeight:1.4 }}>{faq.q}</span>
                    <span style={{ fontSize:18, color:T.brand, flexShrink:0, transform: openFaq===i ? "rotate(45deg)" : "rotate(0)", transition:"transform 0.2s" }}>+</span>
                  </button>
                  {openFaq===i && (
                    <div style={{ padding:"0 20px 16px", fontSize:13, color:T.text2, lineHeight:1.75, borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA BANNER ── */}
          <div style={{ background:`linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`, borderRadius:T.radius, padding: isMobile ? "36px 24px" : "48px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.06, pointerEvents:"none" }}>
              <defs><pattern id="cta-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="14" fill="none" stroke="#fff" strokeWidth="1"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#cta-grid)"/>
            </svg>
            <div style={{ position:"relative", zIndex:1 }}>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "1.8rem" : "2.4rem", fontWeight:400, color:"#fff", margin:"0 0 12px" }}>
                Ready to calculate your Zakat?
              </h2>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.75)", margin:"0 0 28px", lineHeight:1.7 }}>
                Start with the most important calculation of the year — your annual Zakat obligation.
              </p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <a href="/zakat-calculator"
                   style={{ padding:"13px 28px", background:"#C9A84C", color:T.text1, borderRadius:10, fontSize:14, fontWeight:800, textDecoration:"none" }}>
                  Calculate My Zakat ☪
                </a>
                <a href="/faraid-calculator"
                   style={{ padding:"13px 28px", background:"rgba(255,255,255,0.12)", color:"#fff", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none", border:"1px solid rgba(255,255,255,0.25)" }}>
                  Plan My Estate 📜
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ background:T.surface, borderTop:`1px solid ${T.border}`, padding: isMobile ? "40px 24px 80px" : "48px 40px 80px" }}>
          <div style={{ maxWidth:960, margin:"0 auto" }}>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr", gap:40, marginBottom:32 }}>

              {/* Brand */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:T.brand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>☪</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:T.text1 }}>HalalCalc.com</div>
                </div>
                <p style={{ fontSize:12, color:T.text3, lineHeight:1.8, maxWidth:300 }}>
                  Free, Shariah-compliant financial calculators for Muslims in Malaysia, Singapore and Indonesia.
                  Based on official rulings from JAKIM, MUIS and BAZNAS.
                </p>
                <p style={{ fontSize:11, color:T.text3, marginTop:10, lineHeight:1.7 }}>
                  HalalCalc.com is an independent tool and is not affiliated with any bank, government body, or Islamic authority.
                </p>
              </div>

              {/* Tools */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:T.text1, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:14 }}>Tools</div>
                {[
                  { label:"☪ Zakat Calculator",    url:"/zakat-calculator" },
                  { label:"🏠 Home Financing",     url:"/home-financing" },
                  { label:"💰 Savings & FD",       url:"/savings-calculator" },
                  { label:"📜 Faraid Calculator",  url:"/faraid-calculator" },
                ].map((l,i) => (
                  <a key={i} href={l.url} style={{ display:"block", fontSize:13, color:T.text2, textDecoration:"none", marginBottom:8, fontWeight:500 }}
                     onMouseEnter={e=>e.target.style.color=T.brand} onMouseLeave={e=>e.target.style.color=T.text2}>
                    {l.label}
                  </a>
                ))}
              </div>

              {/* Authorities */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:T.text1, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:14 }}>Official Authorities</div>
                {[
                  { label:"🇲🇾 Lembaga Zakat Selangor", url:"https://www.zakatselangor.com.my" },
                  { label:"🇸🇬 MUIS (Singapore)",       url:"https://www.zakat.sg" },
                  { label:"🇮🇩 BAZNAS (Indonesia)",      url:"https://baznas.go.id" },
                  { label:"🇲🇾 Bank Negara Malaysia",    url:"https://www.bnm.gov.my" },
                  { label:"🇸🇬 MAS (Singapore)",         url:"https://www.mas.gov.sg" },
                  { label:"🇮🇩 OJK (Indonesia)",         url:"https://www.ojk.go.id" },
                ].map((l,i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ display:"block", fontSize:12, color:T.text3, textDecoration:"none", marginBottom:6 }}
                     onMouseEnter={e=>e.target.style.color=T.brand} onMouseLeave={e=>e.target.style.color=T.text3}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div style={{ fontSize:11, color:T.text3 }}>
                © {new Date().getFullYear()} HalalCalc.com · All rights reserved
              </div>
              <div style={{ display:"flex", gap:20 }}>
                {[{ label:"Privacy Policy", url:"/privacy" }, { label:"About", url:"/about" }, { label:"Contact", url:"/contact" }].map((l,i) => (
                  <a key={i} href={l.url} style={{ fontSize:11, color:T.text3, textDecoration:"none", fontWeight:600 }}
                     onMouseEnter={e=>e.target.style.color=T.brand} onMouseLeave={e=>e.target.style.color=T.text3}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>

        <AdStickyFooter/>
      </div>
    </>
  );
}
