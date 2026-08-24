import { useState, useMemo, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const T = {
  bg:          "#F4F7F5",
  surface:     "#FFFFFF",
  border:      "#DDE6E1",
  borderFocus: "#0A7C4E",
  brand:       "#0A7C4E",
  brandDark:   "#075C39",
  brandLight:  "#EAF4EE",
  gold:        "#9B7B2E",
  goldLight:   "#FDF8EC",
  text1:       "#0C1E14",
  text2:       "#3D5247",
  text3:       "#7A9488",
  danger:      "#C53030",
  dangerLight: "#FEF2F2",
  success:     "#276749",
  successLight:"#F0FAF4",
  shadow:      "0 1px 4px rgba(10,60,30,0.06), 0 4px 16px rgba(10,60,30,0.05)",
  shadowMd:    "0 4px 24px rgba(10,60,30,0.10)",
  radius:      "14px",
  radiusSm:    "8px",
  radiusXs:    "6px",
};

// ─── RATES (from rates.config.js — update monthly) ───────────────────────
const LAST_VERIFIED = "8 August 2026";

const NISAB_DATA = {
  MY: { goldGrams:85, silverGrams:595, goldMYR:29961, silverMYR:2677, source:"Lembaga Zakat Selangor (Jan–Jun 2026)", verifyUrl:"https://www.zakatselangor.com.my" },
  SG: { goldGrams:86, silverGrams:600, goldSGD:12000,  silverSGD:800,  source:"MUIS (May 2026)",                     verifyUrl:"https://www.zakat.sg" },
  ID: { goldGrams:85, nisabIDR:91681728,                               source:"BAZNAS SK 2026",                       verifyUrl:"https://baznas.go.id" },
};

// ─── COUNTRY CONFIG ───────────────────────────────────────────────────────
const COUNTRIES = {
  MY: {
    name:"Malaysia", flag:"🇲🇾", sym:"RM", currency:"MYR",
    authority:"Lembaga Zakat / JAKIM", authorityUrl:"https://www.zakatselangor.com.my",
    standards:["gold","silver"], defaultStd:"gold",
    incomeZakat: true,
    notes:[
      { type:"info",  text:"Gold jewellery (al-Huli) zakat varies by state — check with your state Zakat authority." },
      { type:"info",  text:"Nisab is updated twice yearly (January & July) based on live gold prices." },
      { type:"warn",  text:"Gold pledged as collateral: deduct the loan amount and storage fees before calculating." },
    ],
  },
  SG: {
    name:"Singapore", flag:"🇸🇬", sym:"S$", currency:"SGD",
    authority:"MUIS", authorityUrl:"https://www.zakat.sg",
    standards:["gold","silver"], defaultStd:"gold",
    incomeZakat: false,
    notes:[
      { type:"warn",  text:"Enter the lowest balance your savings held over the past 355 days (Hijri year) — not your current balance." },
      { type:"warn",  text:"Income / salary zakat is not obligatory in Singapore — no fatwa currently mandates it. That field is disabled." },
      { type:"info",  text:"The haul period resets if savings fall below Nisab at any point during the year." },
    ],
  },
  ID: {
    name:"Indonesia", flag:"🇮🇩", sym:"Rp", currency:"IDR",
    authority:"BAZNAS / MUI", authorityUrl:"https://baznas.go.id",
    standards:["gold"], defaultStd:"gold",
    incomeZakat: true,
    notes:[
      { type:"info",  text:"Indonesia uses 14-karat gold (not 24k) as the Nisab standard — per MUI Fatwa No. 3/2003 & PMA No. 31/2019." },
      { type:"info",  text:"BAZNAS official 2026 Nisab: Rp 91,681,728/year or Rp 7,640,144/month for income zakat." },
    ],
  },
};

// ─── ASSET DEFINITIONS ────────────────────────────────────────────────────
const ASSETS = [
  { id:"cash",        label:"Cash & Bank Savings",     icon:"💵", hint:"All cash at home and in bank/savings accounts" },
  { id:"gold",        label:"Gold (Market Value)",      icon:"🥇", hint:"Jewellery, bars, coins — enter current market value" },
  { id:"silver",      label:"Silver (Market Value)",    icon:"🥈", hint:"Silverware, bars, coins — enter current market value" },
  { id:"stocks",      label:"Stocks & Investments",     icon:"📈", hint:"Shares, unit trusts, ASB/Amanah Saham at market value" },
  { id:"business",    label:"Business Stock & Inventory",icon:"🏪",hint:"Value of goods/products held for sale (not fixed assets)" },
  { id:"receivables", label:"Money Owed to You",        icon:"📋", hint:"Outstanding payments and loans given to others (collectable debts)" },
  { id:"rental",      label:"Rental Income (Annual)",   icon:"🏠", hint:"Total rental income received this year" },
  { id:"crypto",      label:"Cryptocurrency",           icon:"₿",  hint:"Current market value of all crypto holdings" },
  { id:"income",      label:"Annual Income / Salary",   icon:"💼", hint:"Gross annual employment or business income" },
];

// ─── SVG COMPONENTS ───────────────────────────────────────────────────────
const CrescentWatermark = () => (
  <svg width="220" height="220" viewBox="0 0 220 220" style={{ position:"absolute", right:-30, top:-20, opacity:0.04, pointerEvents:"none" }}>
    <path d="M110 20 A90 90 0 1 1 109.99 20 Z" fill="none" stroke={T.brand} strokeWidth="2"/>
    <path d="M140 35 A70 70 0 1 0 140.01 35 Z" fill={T.bg} stroke="none"/>
    <circle cx="155" cy="60" r="12" fill="none" stroke={T.brand} strokeWidth="1.5"/>
  </svg>
);

const IslamicDivider = () => (
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 20px" }}>
    <div style={{ flex:1, height:1, background:T.border }}/>
    <svg width="20" height="20" viewBox="0 0 20 20">
      {[0,45,90,135].map(a => (
        <g key={a} transform={`rotate(${a} 10 10)`}>
          <rect x="9.2" y="1" width="1.6" height="18" rx="0.8" fill={T.border}/>
        </g>
      ))}
      <circle cx="10" cy="10" r="2.5" fill={T.border}/>
    </svg>
    <div style={{ flex:1, height:1, background:T.border }}/>
  </div>
);

// ─── AD SLOT COMPONENTS ───────────────────────────────────────────────────
// Replace placeholder divs with your real AdSense <ins> tags when approved.

const AdLeaderboard = () => (          // Desktop only — below hero
  <div style={{ display:"none", textAlign:"center", margin:"0 0 24px", ["@media(minWidth:880px)"]:{display:"block"} }}>
    {/* ADSENSE: data-ad-format="horizontal" 728x90 */}
    <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:728, height:90, maxWidth:"100%", background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Advertisement — 728×90</span>
    </div>
  </div>
);

const AdSidebarRect = () => (          // Desktop right sidebar — sticky 300×250
  <>
    {/* ADSENSE: 300x250 rectangle */}
    <div style={{ width:300, height:250, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, marginBottom:16 }}>
      <span style={{ fontSize:20, opacity:0.3 }}>📢</span>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Ad Space</span>
      <span style={{ fontSize:10, color:T.text3 }}>300 × 250</span>
    </div>
  </>
);

const AdMobileRect = () => (           // Mobile only — between assets and debts
  <div style={{ display:"flex", justifyContent:"center", margin:"0 0 16px" }}>
    {/* ADSENSE: 300x250 — show only on mobile with CSS media query in production */}
    <div style={{ width:300, height:250, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Ad Space — Mobile 300×250</span>
    </div>
  </div>
);

const AdPostResult = () => (           // After results — highest CTR position
  <div style={{ margin:"0 0 16px" }}>
    {/* ADSENSE: responsive auto format */}
    <div style={{ height:100, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Advertisement — Post Result (Responsive)</span>
    </div>
  </div>
);

const AdStickyFooter = () => (         // Mobile sticky footer
  <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, display:"flex", justifyContent:"center", alignItems:"center", background:T.surface, borderTop:`1px solid ${T.border}`, height:60, boxShadow:"0 -2px 12px rgba(0,0,0,0.08)" }}>
    {/* ADSENSE: 320x50 anchor ad */}
    <div style={{ width:320, height:50, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusXs, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:10, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Sticky Footer — 320×50</span>
    </div>
  </div>
);

const AffiliateCards = ({ countryKey }) => {
  const partners = {
    MY:[
      { name:"Lembaga Zakat Selangor", desc:"Pay your Zakat online — fast, official, secure", url:"https://www.zakatselangor.com.my", cta:"Pay Zakat Now" },
      { name:"Maybank Islamic", desc:"Shariah-compliant savings, financing & investment", url:"https://www.maybank2u.com.my/maybank2u/malaysia/en/islamic-products-services.page", cta:"Explore Products" },
    ],
    SG:[
      { name:"MUIS — Zakat.sg", desc:"Pay your Zakat officially through Singapore's Islamic authority", url:"https://www.zakat.sg", cta:"Pay Zakat Now" },
    ],
    ID:[
      { name:"BAZNAS", desc:"Pay your Zakat officially through Indonesia's national body", url:"https://baznas.go.id", cta:"Bayar Zakat" },
    ],
  };
  const list = partners[countryKey] || [];
  if (!list.length) return null;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:1, textAlign:"center", marginBottom:10 }}>— Sponsored Partners —</div>
      {list.map((p,i) => (
        <a key={i} href={p.url} target="_blank" rel="noopener noreferrer sponsored"
           style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, textDecoration:"none", marginBottom:8, transition:"box-shadow 0.15s" }}
           onMouseEnter={e=>e.currentTarget.style.boxShadow=T.shadowMd}
           onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.text1, marginBottom:2 }}>{p.name}</div>
            <div style={{ fontSize:12, color:T.text3 }}>{p.desc}</div>
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:T.brand, whiteSpace:"nowrap", marginLeft:16, padding:"6px 12px", background:T.brandLight, borderRadius:20 }}>{p.cta} →</div>
        </a>
      ))}
      <div style={{ fontSize:10, color:T.text3, textAlign:"center", marginTop:4 }}>Sponsored · Replace with your affiliate links</div>
    </div>
  );
};

// ─── SHARED UI PRIMITIVES ─────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:22, marginBottom:14, boxShadow:T.shadow, ...style }}>
    {children}
  </div>
);

const CardTitle = ({ icon, children }) => (
  <div style={{ fontSize:13, fontWeight:700, color:T.text2, marginBottom:16, display:"flex", alignItems:"center", gap:7, textTransform:"uppercase", letterSpacing:"0.6px" }}>
    {icon && <span style={{ fontSize:16 }}>{icon}</span>}
    {children}
  </div>
);

const Label = ({ children, note }) => (
  <div style={{ marginBottom:6 }}>
    <span style={{ fontSize:12, fontWeight:700, color:T.text2 }}>{children}</span>
    {note && <span style={{ fontSize:11, color:T.text3, marginLeft:6 }}>{note}</span>}
  </div>
);

const InputWithPrefix = ({ prefix, value, onChange, placeholder, disabled=false }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex", alignItems:"stretch", border:`1.5px solid ${focused ? T.brand : T.border}`, borderRadius:T.radiusSm, overflow:"hidden", background: disabled ? "#F8FAF9" : T.surface, transition:"border-color 0.15s" }}>
      <div style={{ padding:"10px 12px", background: disabled ? "#F0F4F2" : T.brandLight, color: disabled ? T.text3 : T.brand, fontSize:13, fontWeight:700, whiteSpace:"nowrap", borderRight:`1px solid ${focused ? T.brand : T.border}`, transition:"all 0.15s" }}>
        {prefix}
      </div>
      <input type="number" min="0" placeholder={placeholder || "0"} value={value} disabled={disabled}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex:1, border:"none", outline:"none", padding:"10px 12px", fontSize:14, color: disabled ? T.text3 : T.text1, background:"transparent", minWidth:0 }}/>
    </div>
  );
};

const SegmentControl = ({ options, value, onChange }) => (
  <div style={{ display:"flex", gap:4, padding:4, background:"#EEF3F0", borderRadius:10 }}>
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(o.value)}
        style={{ flex:1, padding:"7px 0", borderRadius:7, border:"none", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
          background: value===o.value ? T.surface : "transparent",
          color: value===o.value ? T.brand : T.text3,
          boxShadow: value===o.value ? T.shadow : "none" }}>
        {o.label}
      </button>
    ))}
  </div>
);

const AlertBox = ({ type="info", children }) => {
  const colors = {
    info:  { bg:"#EEF6FF", border:"#BFDBFE", text:"#1E40AF" },
    warn:  { bg:"#FFFBEB", border:"#FDE68A", text:"#92400E" },
    green: { bg:T.successLight, border:"#A7F3D0", text:T.success },
  };
  const c = colors[type];
  return (
    <div style={{ padding:"10px 13px", borderRadius:T.radiusSm, fontSize:12, lineHeight:1.6, marginBottom:8, background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>
      {children}
    </div>
  );
};

const LastVerifiedBadge = () => {
  const verified = new Date(LAST_VERIFIED);
  const today = new Date();
  const days = Math.floor((today - verified) / 86400000);
  const stale = days > 45;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 14px", borderRadius:T.radiusSm, marginBottom:16,
      background: stale ? "#FFFBEB" : T.successLight,
      border: `1px solid ${stale ? "#FDE68A" : "#A7F3D0"}` }}>
      <span style={{ fontSize:12, fontWeight:600, color: stale ? "#92400E" : T.success }}>
        {stale ? "⚠️" : "✅"} Rates last verified: <strong>{LAST_VERIFIED}</strong>
      </span>
      <span style={{ fontSize:11, color:T.text3 }}>
        {stale ? "May be outdated" : `${days === 0 ? "Today" : `${days}d ago`}`}
      </span>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function ZakatCalculator() {
  const [countryKey, setCK]   = useState("MY");
  const [nisabStd,   setStd]  = useState("gold");
  const [assets,     setAss]  = useState({});
  const [debts,      setDbt]  = useState("");
  const [calculated, setCalc] = useState(false);
  const [showNotes,  setNote] = useState(false);
  const [isMobile,   setMob]  = useState(() => typeof window !== "undefined" && window.innerWidth < 880);
  const resultsRef = useRef(null);

  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 880);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const country = COUNTRIES[countryKey];
  const nisab   = NISAB_DATA[countryKey];

  const setCountry = (k) => {
    setCK(k);
    setStd(COUNTRIES[k].defaultStd);
    setAss({});
    setDbt("");
    setCalc(false);
  };

  const handleAsset = (id, val) => {
    setAss(p => ({ ...p, [id]: val }));
    setCalc(false);
  };

  // Nisab threshold
  const nisabThreshold = useMemo(() => {
    if (countryKey === "MY") return nisabStd === "gold" ? nisab.goldMYR : nisab.silverMYR;
    if (countryKey === "SG") return nisabStd === "gold" ? nisab.goldSGD : nisab.silverSGD;
    if (countryKey === "ID") return nisab.nisabIDR;
    return 0;
  }, [countryKey, nisabStd, nisab]);

  const totalAssets = useMemo(() =>
    ASSETS.filter(a => !(a.id === "income" && !country.incomeZakat))
      .reduce((s, a) => s + (parseFloat(assets[a.id]) || 0), 0),
    [assets, country]);

  const totalDebts  = parseFloat(debts) || 0;
  const zakatable   = Math.max(0, totalAssets - totalDebts);
  const nisabMet    = zakatable >= nisabThreshold;
  const zakatDue    = nisabMet ? zakatable * 0.025 : 0;
  const pct         = nisabThreshold > 0 ? Math.min(100, (zakatable / nisabThreshold) * 100) : 0;

  const fmt = n => new Intl.NumberFormat("en-MY", { minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);
  const fmtShort = n => {
    if (countryKey==="ID" && n >= 1e9) return (n/1e9).toFixed(2)+"M";
    if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
    if (n >= 1e3) return (n/1e3).toFixed(1)+"K";
    return fmt(n);
  };

  const doCalc = () => {
    setCalc(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
  };

  const S = {
    page:   { fontFamily:"'Inter',system-ui,sans-serif", background:T.bg, minHeight:"100vh", paddingBottom:80, color:T.text1 },
    hero:   { background:T.brand, color:"#fff", padding: isMobile ? "36px 20px 32px" : "44px 40px 40px", position:"relative", overflow:"hidden" },
    heroSub:{ fontSize:15, color:"rgba(255,255,255,0.75)", maxWidth:500, marginTop:8, lineHeight:1.6 },
    outer:  { maxWidth: isMobile ? "100%" : 1040, margin:"0 auto", padding: isMobile ? "20px 16px" : "28px 28px" },
    layout: { display: isMobile ? "block" : "flex", gap:28, alignItems:"flex-start" },
    main:   { flex:1, minWidth:0 },
    sidebar:{ width:300, flexShrink:0, position:"sticky", top:20 },
    calcBtn:{ width:"100%", padding:"15px 0", background:T.brand, color:"#fff", border:"none", borderRadius:T.radiusSm, fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:"0.3px", boxShadow:`0 4px 16px rgba(10,124,78,0.3)`, transition:"all 0.15s" },
    resetBtn:{ width:"100%", padding:"12px 0", background:"transparent", color:T.text3, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, fontWeight:600, cursor:"pointer", marginTop:8 },
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={S.page}>

        {/* ── HERO ── */}
        <div style={S.hero}>
          {/* Subtle pattern */}
          <svg style={{ position:"absolute", right:0, top:0, opacity:0.07, pointerEvents:"none" }} width="300" height="200" viewBox="0 0 300 200">
            {[0,1,2,3,4].map(i => [0,1,2].map(j => (
              <circle key={`${i}${j}`} cx={i*70+35} cy={j*70+35} r={25} fill="none" stroke="#fff" strokeWidth="1"/>
            )))}
          </svg>
          <div style={{ maxWidth:1040, margin:"0 auto", padding: isMobile ? "0" : "0 28px", position:"relative", zIndex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"rgba(255,255,255,0.6)", marginBottom:10 }}>
              ☪ HalalCalc.my — Islamic Finance Tools
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "2rem" : "2.8rem", fontWeight:400, margin:"0 0 8px", lineHeight:1.15, color:"#fff" }}>
              Zakat Calculator
            </h1>
            <p style={S.heroSub}>
              Free, Shariah-compliant Zakat calculator for Malaysia, Singapore &amp; Indonesia.
              Based on official rulings from JAKIM, MUIS, and BAZNAS.
            </p>
          </div>
        </div>

        {/* ── LEADERBOARD AD (desktop) ── */}
        <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding: isMobile ? "12px 16px" : "12px 28px", display:"flex", justifyContent:"center" }}>
          <AdLeaderboard/>
        </div>

        <div style={S.outer}>
          <LastVerifiedBadge/>

          <div style={S.layout}>
            {/* ── MAIN COLUMN ── */}
            <div style={S.main}>

              {/* Country */}
              <Card>
                <CardTitle icon="🌏">Select Your Country</CardTitle>
                <div style={{ display:"flex", gap:8, flexWrap: isMobile ? "wrap" : "nowrap", marginBottom:14 }}>
                  {Object.entries(COUNTRIES).map(([k,c]) => (
                    <button key={k} onClick={() => setCountry(k)}
                      style={{ flex:1, minWidth:isMobile ? "calc(50% - 4px)" : "auto", padding:"11px 8px", borderRadius:T.radiusSm, border:`1.5px solid ${countryKey===k ? T.brand : T.border}`, background: countryKey===k ? T.brandLight : T.surface, cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ fontSize:22, marginBottom:3 }}>{c.flag}</div>
                      <div style={{ fontSize:11, fontWeight:700, color: countryKey===k ? T.brand : T.text3 }}>{c.name}</div>
                    </button>
                  ))}
                </div>

                {/* Nisab standard toggle */}
                {country.standards.length > 1 && (
                  <div style={{ marginBottom:14 }}>
                    <Label>Nisab Standard</Label>
                    <SegmentControl
                      options={[{ value:"gold", label:"🥇 Gold Standard" }, { value:"silver", label:"🥈 Silver Standard" }]}
                      value={nisabStd}
                      onChange={v => { setStd(v); setCalc(false); }}/>
                  </div>
                )}

                {/* Nisab display */}
                <div style={{ padding:"13px 16px", background:T.goldLight, border:`1px solid #E8D9A0`, borderRadius:T.radiusSm, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#7A6020", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>
                      Current Nisab — {nisabStd==="gold" ? `${nisab.goldGrams || 85}g Gold (24k)` : `${nisab.silverGrams || 595}g Silver`}
                    </div>
                    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:T.gold }}>
                      {country.sym} {fmt(nisabThreshold)}
                    </div>
                  </div>
                  <a href={country.authorityUrl} target="_blank" rel="noopener noreferrer"
                     style={{ fontSize:11, fontWeight:700, color:T.brand, textDecoration:"none", background:T.brandLight, padding:"6px 11px", borderRadius:20 }}>
                    Verify ↗
                  </a>
                </div>

                {/* Progress to Nisab */}
                {totalAssets > 0 && !calculated && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:T.text3, marginBottom:5 }}>
                      <span>{pct < 100 ? `${pct.toFixed(0)}% of Nisab reached` : "✓ Nisab threshold reached"}</span>
                      <span>{country.sym} {fmt(zakatable)} / {fmt(nisabThreshold)}</span>
                    </div>
                    <div style={{ height:5, background:"#E8EDE9", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background: pct>=100 ? T.gold : T.brand, borderRadius:3, transition:"width 0.4s ease" }}/>
                    </div>
                  </div>
                )}

                {/* Country notes */}
                {country.notes.length > 0 && (
                  <div style={{ marginTop:12 }}>
                    <button onClick={() => setNote(!showNotes)}
                      style={{ background:"none", border:"none", fontSize:12, fontWeight:600, color:T.brand, cursor:"pointer", padding:0 }}>
                      {showNotes ? "▲ Hide" : "▼ Show"} {country.name} Zakat rules
                    </button>
                    {showNotes && (
                      <div style={{ marginTop:10 }}>
                        {country.notes.map((n,i) => <AlertBox key={i} type={n.type}>{n.text}</AlertBox>)}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Assets */}
              <Card>
                <CardTitle icon="📦">Your Zakatable Assets</CardTitle>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:12 }}>
                  {ASSETS.map(a => {
                    const disabled = a.id==="income" && !country.incomeZakat;
                    return (
                      <div key={a.id} style={{ padding:14, background: assets[a.id] ? T.brandLight : "#FAFCFB", border:`1px solid ${assets[a.id] ? T.brand+"44" : T.border}`, borderRadius:T.radiusSm, transition:"all 0.15s", opacity: disabled ? 0.45 : 1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                          <span style={{ fontSize:16 }}>{a.icon}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:T.text2 }}>{a.label}</span>
                        </div>
                        <div style={{ fontSize:11, color:T.text3, marginBottom:8, lineHeight:1.4 }}>
                          {disabled ? "Not applicable in Singapore (no income zakat fatwa)" : a.hint}
                        </div>
                        <InputWithPrefix prefix={country.sym} value={assets[a.id] || ""} placeholder="0.00"
                          onChange={e => handleAsset(a.id, e.target.value)} disabled={disabled}/>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Mobile ad — 300×250 between assets and debts */}
              {isMobile && <AdMobileRect/>}

              {/* Debts */}
              <Card>
                <CardTitle icon="➖">Deductible Debts</CardTitle>
                <AlertBox type="info">
                  Deduct short-term debts due within the year — bills, personal loans, rent payable. Do not deduct the full balance of long-term mortgages.
                </AlertBox>
                <Label>Total Deductible Debts</Label>
                <InputWithPrefix prefix={country.sym} value={debts} placeholder="0.00"
                  onChange={e => { setDbt(e.target.value); setCalc(false); }}/>
              </Card>

              {/* Calculate */}
              <button style={S.calcBtn}
                onClick={doCalc}
                onMouseEnter={e => { e.target.style.background=T.brandDark; e.target.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.target.style.background=T.brand; e.target.style.transform="translateY(0)"; }}>
                Calculate My Zakat ☪
              </button>

              {/* ── RESULTS ── */}
              {calculated && (
                <div ref={resultsRef} style={{ marginTop:24 }}>
                  <IslamicDivider/>

                  {/* Post-result ad */}
                  <AdPostResult/>

                  {/* Main result card */}
                  <div style={{ background: nisabMet ? T.surface : T.surface, border:`1px solid ${nisabMet ? T.gold+"66" : T.border}`, borderRadius:T.radius, padding:"28px 24px", marginBottom:14, textAlign:"center", position:"relative", overflow:"hidden", boxShadow:T.shadow }}>
                    <CrescentWatermark/>
                    {nisabMet ? (
                      <>
                        <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Zakat Due This Year</div>
                        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "2.8rem" : "3.8rem", color:T.gold, lineHeight:1.05, marginBottom:4 }}>
                          {country.sym} {fmt(zakatDue)}
                        </div>
                        <div style={{ fontSize:13, color:T.text3, marginBottom:18 }}>
                          2.5% of {country.sym} {fmt(zakatable)} zakatable wealth
                        </div>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:T.successLight, border:`1px solid #A7F3D0`, borderRadius:20, padding:"6px 14px" }}>
                          <span style={{ fontSize:12, fontWeight:600, color:T.success }}>✓ Alhamdulillah — Nisab threshold met</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize:36, marginBottom:10 }}>🤲</div>
                        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.8rem", color:T.text1, marginBottom:8 }}>Zakat Not Yet Obligatory</div>
                        <div style={{ fontSize:14, color:T.text2, lineHeight:1.7, maxWidth:380, margin:"0 auto 12px" }}>
                          Your zakatable wealth ({country.sym} {fmt(zakatable)}) is below the Nisab threshold of {country.sym} {fmt(nisabThreshold)}.
                        </div>
                        <AlertBox type="info">You are encouraged to give Sadaqah voluntarily. May Allah increase your wealth. 🤲</AlertBox>
                      </>
                    )}
                  </div>

                  {/* Breakdown + payment options */}
                  {nisabMet && (
                    <>
                      {/* Stats row */}
                      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:10, marginBottom:14 }}>
                        {[
                          { v:fmt(totalAssets),   l:"Total Assets",       sym:country.sym },
                          { v:fmt(totalDebts),    l:"Deductible Debts",   sym:country.sym },
                          { v:fmt(zakatable),     l:"Net Zakatable",      sym:country.sym },
                          { v:"2.5%",             l:"Zakat Rate",         sym:"" },
                        ].map((s,i) => (
                          <div key={i} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"13px 14px", boxShadow:T.shadow }}>
                            <div style={{ fontSize:11, color:T.text3, fontWeight:600, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.4px" }}>{s.l}</div>
                            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text1 }}>
                              {s.sym && <span style={{ fontSize:12, color:T.text3 }}>{s.sym} </span>}{s.v}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Per-asset bars */}
                      <Card>
                        <CardTitle icon="📊">Asset Breakdown</CardTitle>
                        {ASSETS.filter(a => parseFloat(assets[a.id]) > 0).map(a => {
                          const val = parseFloat(assets[a.id]) || 0;
                          const share = totalAssets > 0 ? (val/totalAssets)*100 : 0;
                          return (
                            <div key={a.id} style={{ marginBottom:11 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                                <span style={{ color:T.text2, fontWeight:500 }}>{a.icon} {a.label}</span>
                                <span style={{ fontWeight:700, color:T.text1 }}>{country.sym} {fmt(val)} <span style={{ color:T.text3, fontWeight:400 }}>({share.toFixed(1)}%)</span></span>
                              </div>
                              <div style={{ height:4, background:"#EEF1EF", borderRadius:2, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${share}%`, background: share > 50 ? T.brand : T.gold, borderRadius:2 }}/>
                              </div>
                            </div>
                          );
                        })}
                      </Card>

                      {/* Payment options */}
                      <Card>
                        <CardTitle icon="🗓">Payment Options</CardTitle>
                        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:9 }}>
                          {[
                            { l:"Pay Once",        v:zakatDue,       sub:"Full annual amount" },
                            { l:"Monthly",         v:zakatDue/12,    sub:"Across 12 months" },
                            { l:"Weekly",          v:zakatDue/52,    sub:"Over 52 weeks" },
                            { l:"Daily (Ramadan)", v:zakatDue/30,    sub:"Over 30 days" },
                          ].map((p,i) => (
                            <div key={i} style={{ padding:"12px 10px", textAlign:"center", background: i===0 ? T.brandLight : "#F7FAF8", border:`1px solid ${i===0 ? T.brand+"55" : T.border}`, borderRadius:T.radiusSm }}>
                              <div style={{ fontSize:10, fontWeight:700, color: i===0 ? T.brand : T.text3, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:5 }}>{p.l}</div>
                              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color: i===0 ? T.brand : T.text1 }}>{country.sym} {fmtShort(p.v)}</div>
                              <div style={{ fontSize:10, color:T.text3, marginTop:2 }}>{p.sub}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </>
                  )}

                  {/* Affiliates */}
                  <AffiliateCards countryKey={countryKey}/>

                  {/* Reset */}
                  <button style={S.resetBtn} onClick={() => { setAss({}); setDbt(""); setCalc(false); }}>
                    Reset Calculator
                  </button>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{ fontSize:11, color:T.text3, lineHeight:1.8, textAlign:"center", marginTop:24, padding:"0 8px" }}>
                This calculator provides estimates only and does not constitute Shariah or financial advice.<br/>
                Always verify Zakat obligations with a qualified Islamic scholar or your local Zakat authority.<br/>
                <a href="https://www.zakatselangor.com.my" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>Lembaga Zakat Selangor</a> ·&nbsp;
                <a href="https://www.zakat.sg" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>MUIS (Singapore)</a> ·&nbsp;
                <a href="https://baznas.go.id" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>BAZNAS (Indonesia)</a><br/>
              HalalCalc.com is an independent tool and is not affiliated with any bank, government body, or Islamic authority.
              </div>
            </div>

            {/* ── SIDEBAR (desktop only) ── */}
            {!isMobile && (
              <div style={S.sidebar}>
                <AdSidebarRect/>

                {/* Quick reference card */}
                <Card style={{ marginBottom:14 }}>
                  <CardTitle icon="📖">Quick Reference</CardTitle>
                  <div style={{ fontSize:12, color:T.text2, lineHeight:1.8 }}>
                    <div style={{ fontWeight:700, color:T.text1, marginBottom:4 }}>Zakat Rate</div>
                    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:T.gold, marginBottom:10 }}>2.5%</div>
                    <div style={{ fontWeight:700, color:T.text1, marginBottom:4 }}>Haul Period</div>
                    <div style={{ marginBottom:10 }}>1 lunar year (354–355 days) of ownership above Nisab</div>
                    <div style={{ fontWeight:700, color:T.text1, marginBottom:4 }}>Who Must Pay</div>
                    <div>Any Muslim whose net zakatable wealth has exceeded the Nisab for a full lunar year</div>
                  </div>
                </Card>

                {/* Nisab quick table */}
                <Card style={{ marginBottom:14 }}>
                  <CardTitle icon="⚖️">Nisab Thresholds</CardTitle>
                  {[
                    { country:"🇲🇾 Malaysia",   val:"RM 29,961",  std:"85g gold" },
                    { country:"🇸🇬 Singapore",  val:"S$ 12,000",  std:"86g gold" },
                    { country:"🇮🇩 Indonesia",  val:"Rp 91.7M",   std:"85g gold (14k)" },
                  ].map((r,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i<2 ? `1px solid ${T.border}` : "none" }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:T.text1 }}>{r.country}</div>
                        <div style={{ fontSize:10, color:T.text3 }}>{r.std}</div>
                      </div>
                      <div style={{ fontSize:12, fontWeight:700, color:T.gold }}>{r.val}</div>
                    </div>
                  ))}
                  <div style={{ fontSize:10, color:T.text3, marginTop:8 }}>Approximate — May 2026. Verify before paying.</div>
                </Card>

                {/* Other tools */}
                <Card>
                  <CardTitle icon="🔧">More Tools</CardTitle>
                  {[
                    { name:"Home Financing Calculator", icon:"🏠" },
                    { name:"Islamic Savings Calculator", icon:"💰" },
                    { name:"Faraid (Inheritance) Calculator", icon:"📜" },
                  ].map((t,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 0", borderBottom: i<2 ? `1px solid ${T.border}` : "none", cursor:"pointer" }}>
                      <span style={{ fontSize:16 }}>{t.icon}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:T.brand }}>{t.name}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* ── STICKY FOOTER AD (mobile) ── */}
        <AdStickyFooter/>
      </div>
    </>
  );
}
