import { useState, useMemo, useEffect, useRef } from "react";

// ─── DESIGN TOKENS (shared across all HalalCalc tools) ───────────────────
const T = {
  bg:"#F4F7F5", surface:"#FFFFFF", border:"#DDE6E1", borderFocus:"#0A7C4E",
  brand:"#0A7C4E", brandDark:"#075C39", brandLight:"#EAF4EE",
  gold:"#9B7B2E", goldLight:"#FDF8EC",
  text1:"#0C1E14", text2:"#3D5247", text3:"#7A9488",
  danger:"#C53030", dangerLight:"#FEF2F2",
  success:"#276749", successLight:"#F0FAF4",
  shadow:"0 1px 4px rgba(10,60,30,0.06), 0 4px 16px rgba(10,60,30,0.05)",
  shadowMd:"0 4px 24px rgba(10,60,30,0.10)",
  radius:"14px", radiusSm:"8px", radiusXs:"6px",
};

// ─── RATES CONFIG (update from rates.config.js monthly) ──────────────────
const LAST_VERIFIED = "8 August 2026";
const FINANCING_RATES = { MY:4.25, SG:3.75, ID:8.50, OTHER:5.00 };

// ─── COUNTRY CONFIG ───────────────────────────────────────────────────────
const COUNTRIES = {
  MY:{
    name:"Malaysia", flag:"🇲🇾", sym:"RM",
    maxTenure:35, minDP:10,
    structures:["MM","BBA","Murabaha"],
    defaultStructure:"MM",
    typicalRate: FINANCING_RATES.MY,
    authority:"Bank Negara Malaysia", authorityUrl:"https://www.bnm.gov.my",
    stampDuty:true,
    notes:[
      { type:"info",  text:"Maximum tenure is 35 years or until age 70 — whichever is earlier." },
      { type:"info",  text:"Minimum down payment: 10% for first two properties; 30% for third property and above." },
      { type:"warn",  text:"Stamp duty applies: 0.5% on financing amount + tiered transfer duty on property price." },
      { type:"info",  text:"Monthly Reducing Term Takaful (MRTT) is recommended to protect your financing." },
    ],
  },
  SG:{
    name:"Singapore", flag:"🇸🇬", sym:"S$",
    maxTenure:30, minDP:25,
    structures:["MM","Ijara"],
    defaultStructure:"MM",
    typicalRate: FINANCING_RATES.SG,
    authority:"Monetary Authority of Singapore", authorityUrl:"https://www.mas.gov.sg",
    stampDuty:false,
    notes:[
      { type:"warn",  text:"Total Debt Servicing Ratio (TDSR) must not exceed 55% of gross monthly income." },
      { type:"info",  text:"Minimum cash down payment: 5%. Remainder may be paid via CPF Ordinary Account." },
      { type:"info",  text:"Maximum Loan-to-Value (LTV): 75% for first property." },
      { type:"warn",  text:"Islamic home financing options in Singapore are limited. Enquire directly with OCBC Al-Amin or Maybank Islamic before proceeding." },
    ],
  },
  ID:{
    name:"Indonesia", flag:"🇮🇩", sym:"Rp",
    maxTenure:30, minDP:15,
    structures:["MM","Murabaha"],
    defaultStructure:"Murabaha",
    typicalRate: FINANCING_RATES.ID,
    authority:"Otoritas Jasa Keuangan (OJK)", authorityUrl:"https://www.ojk.go.id",
    stampDuty:false,
    notes:[
      { type:"info",  text:"KPR Syariah is available from Bank Syariah Indonesia and other Islamic banks." },
      { type:"info",  text:"Maximum LTV: 85% for first property (15% minimum down payment)." },
      { type:"warn",  text:"Profit rates follow the Bank Indonesia reference rate — verify current rates before signing." },
    ],
  },
  OTHER:{
    name:"Other", flag:"🌍", sym:"$",
    maxTenure:30, minDP:20,
    structures:["MM","Murabaha"],
    defaultStructure:"MM",
    typicalRate: FINANCING_RATES.OTHER,
    authority:"Consult your local Islamic authority", authorityUrl:null,
    stampDuty:false, notes:[],
  },
};

const STRUCTURES = {
  MM:       { name:"Musharakah Mutanaqisah", short:"Diminishing Partnership", icon:"🤝", calc:"amortizing",
              desc:"You and the bank co-own the property. You gradually buy the bank's share while paying rental on the bank's portion. Most widely used in Malaysia and Singapore." },
  BBA:      { name:"Bai' Bithaman Ajil",     short:"Deferred Sale (Fixed)",   icon:"📜", calc:"fixed",
              desc:"Bank buys then resells at a fixed marked-up price payable in equal instalments. Total cost is agreed upfront and never changes." },
  Murabaha: { name:"Murabaha",               short:"Cost-Plus (Fixed)",       icon:"📊", calc:"fixed",
              desc:"Bank discloses its cost and adds an agreed profit margin. Profit amount is transparent and locked in from day one." },
  Ijara:    { name:"Ijara Muntahia Bittamleek", short:"Lease-to-Own",         icon:"🏠", calc:"amortizing",
              desc:"Bank purchases and leases the property to you. Ownership transfers at end of term. Monthly payments are rental, not loan repayments." },
};

// ─── CALCULATIONS ─────────────────────────────────────────────────────────
const calcMonthly = (principal, annualRate, tenureYears, calcType) => {
  if (!principal || !annualRate || !tenureYears) return 0;
  if (calcType === "fixed") return (principal + principal * (annualRate/100) * tenureYears) / (tenureYears * 12);
  const r = annualRate / 100 / 12, n = tenureYears * 12;
  return r === 0 ? principal/n : principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1);
};

const calcStampDuty = (price, financing) => {
  let mot = price <= 100000 ? price*0.01 : price <= 500000 ? 1000+(price-100000)*0.02
          : price <= 1000000 ? 9000+(price-500000)*0.03 : 24000+(price-1000000)*0.04;
  return { mot, loan: financing*0.005, total: mot + financing*0.005 };
};

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:22, marginBottom:14, boxShadow:T.shadow, ...style }}>{children}</div>
);
const CardTitle = ({ icon, children }) => (
  <div style={{ fontSize:13, fontWeight:700, color:T.text2, marginBottom:16, display:"flex", alignItems:"center", gap:7, textTransform:"uppercase", letterSpacing:"0.6px" }}>
    {icon && <span style={{ fontSize:16 }}>{icon}</span>}{children}
  </div>
);
const Label = ({ children, note }) => (
  <div style={{ marginBottom:6 }}>
    <span style={{ fontSize:12, fontWeight:700, color:T.text2 }}>{children}</span>
    {note && <span style={{ fontSize:11, color:T.text3, marginLeft:6 }}>{note}</span>}
  </div>
);
const InputWithPrefix = ({ prefix, suffix, value, onChange, placeholder, step }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ display:"flex", alignItems:"stretch", border:`1.5px solid ${f ? T.brand : T.border}`, borderRadius:T.radiusSm, overflow:"hidden", transition:"border-color 0.15s" }}>
      {prefix && <div style={{ padding:"10px 12px", background:T.brandLight, color:T.brand, fontSize:13, fontWeight:700, whiteSpace:"nowrap", borderRight:`1px solid ${f ? T.brand : T.border}` }}>{prefix}</div>}
      <input type="number" min="0" step={step||"any"} placeholder={placeholder||"0"} value={value}
        onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ flex:1, border:"none", outline:"none", padding:"10px 12px", fontSize:14, color:T.text1, background:"transparent", minWidth:0 }}/>
      {suffix && <div style={{ padding:"10px 12px", background:T.brandLight, color:T.brand, fontSize:13, fontWeight:700, whiteSpace:"nowrap", borderLeft:`1px solid ${f ? T.brand : T.border}` }}>{suffix}</div>}
    </div>
  );
};
const AlertBox = ({ type="info", children }) => {
  const c = { info:{ bg:"#EEF6FF", border:"#BFDBFE", text:"#1E40AF" }, warn:{ bg:"#FFFBEB", border:"#FDE68A", text:"#92400E" }, green:{ bg:T.successLight, border:"#A7F3D0", text:T.success } }[type];
  return <div style={{ padding:"10px 13px", borderRadius:T.radiusSm, fontSize:12, lineHeight:1.6, marginBottom:8, background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>{children}</div>;
};
const SegmentControl = ({ options, value, onChange }) => (
  <div style={{ display:"flex", gap:4, padding:4, background:"#EEF3F0", borderRadius:10 }}>
    {options.map(o => (
      <button key={o.value} onClick={()=>onChange(o.value)}
        style={{ flex:1, padding:"7px 0", borderRadius:7, border:"none", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
          background: value===o.value ? T.surface : "transparent", color: value===o.value ? T.brand : T.text3, boxShadow: value===o.value ? T.shadow : "none" }}>
        {o.label}
      </button>
    ))}
  </div>
);
const LastVerifiedBadge = () => {
  const days = Math.floor((new Date() - new Date(LAST_VERIFIED)) / 86400000);
  const stale = days > 45;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 14px", borderRadius:T.radiusSm, marginBottom:16,
      background: stale ? "#FFFBEB" : T.successLight, border:`1px solid ${stale ? "#FDE68A" : "#A7F3D0"}` }}>
      <span style={{ fontSize:12, fontWeight:600, color: stale ? "#92400E" : T.success }}>
        {stale ? "⚠️" : "✅"} Rates last verified: <strong>{LAST_VERIFIED}</strong>
      </span>
      <span style={{ fontSize:11, color:T.text3 }}>{days === 0 ? "Today" : `${days}d ago`}</span>
    </div>
  );
};
const IslamicDivider = () => (
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 20px" }}>
    <div style={{ flex:1, height:1, background:T.border }}/>
    <svg width="20" height="20" viewBox="0 0 20 20">{[0,45,90,135].map(a=><g key={a} transform={`rotate(${a} 10 10)`}><rect x="9.2" y="1" width="1.6" height="18" rx="0.8" fill={T.border}/></g>)}<circle cx="10" cy="10" r="2.5" fill={T.border}/></svg>
    <div style={{ flex:1, height:1, background:T.border }}/>
  </div>
);

// ─── AD SLOTS ─────────────────────────────────────────────────────────────
const AdLeaderboard = () => (
  <div style={{ textAlign:"center", padding:"12px 0" }}>
    {/* REPLACE: AdSense horizontal 728x90 */}
    <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:728, height:90, maxWidth:"100%", background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusXs }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Advertisement — 728×90</span>
    </div>
  </div>
);
const AdSidebarRect = () => (
  <div style={{ width:300, height:250, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, marginBottom:16 }}>
    {/* REPLACE: AdSense 300x250 */}
    <span style={{ fontSize:20, opacity:0.3 }}>📢</span>
    <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Ad Space — 300×250</span>
  </div>
);
const AdMobileRect = ({ show }) => !show ? null : (
  <div style={{ display:"flex", justifyContent:"center", margin:"0 0 14px" }}>
    {/* REPLACE: AdSense 300x250 mobile */}
    <div style={{ width:300, height:250, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Ad Space — Mobile 300×250</span>
    </div>
  </div>
);
const AdPostResult = () => (
  <div style={{ margin:"0 0 16px" }}>
    {/* REPLACE: AdSense responsive auto */}
    <div style={{ height:100, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Advertisement — Post Result</span>
    </div>
  </div>
);
const AdStickyFooter = () => (
  <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, display:"flex", justifyContent:"center", alignItems:"center", background:T.surface, borderTop:`1px solid ${T.border}`, height:60, boxShadow:"0 -2px 12px rgba(0,0,0,0.08)" }}>
    {/* REPLACE: AdSense 320x50 anchor */}
    <div style={{ width:320, height:50, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusXs, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:10, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Sticky Footer — 320×50</span>
    </div>
  </div>
);
const AffiliateCards = ({ countryKey }) => {
  const partners = {
    MY:[
      { name:"Maybank Islamic", desc:"Home financing from Malaysia's largest Islamic bank", url:"https://www.maybank2u.com.my/maybank2u/malaysia/en/islamic-products-services.page", cta:"Compare Rates" },
      { name:"Bank Islam Malaysia", desc:"Shariah-compliant home financing solutions", url:"https://www.bankislam.com", cta:"Apply Now" },
    ],
    SG:[
      { name:"OCBC Al-Amin", desc:"Enquire directly on current Islamic home financing availability", url:"https://www.ocbc.com.my/ocbc_alamin", cta:"Enquire Now" },
      { name:"Maybank Islamic (SG)", desc:"Islamic wealth management & savings — speak to an adviser", url:"https://www.maybank2u.com.sg/en/personal/islamic/deposits/index.page", cta:"Speak to Adviser" },
    ],
    ID:[
      { name:"Bank Syariah Indonesia (BSI)", desc:"KPR Syariah — Shariah-compliant home financing", url:"https://www.bankbsi.co.id", cta:"Apply Now" },
    ],
  };
  const list = partners[countryKey] || [];
  if (!list.length) return null;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:1, textAlign:"center", marginBottom:10 }}>— Sponsored Partners —</div>
      {list.map((p,i) => (
        <a key={i} href={p.url} target="_blank" rel="noopener noreferrer sponsored"
           style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, textDecoration:"none", marginBottom:8 }}
           onMouseEnter={e=>e.currentTarget.style.boxShadow=T.shadowMd} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function IslamicHomeFinancing() {
  const [countryKey, setCK]    = useState("MY");
  const [structure,  setStr]   = useState("MM");
  const [propPrice,  setPP]    = useState("");
  const [dpMode,     setDPM]   = useState("pct");
  const [dpValue,    setDPV]   = useState("");
  const [profitRate, setPR]    = useState("");
  const [tenure,     setTen]   = useState(30);
  const [calculated, setCalc]  = useState(false);
  const [showNotes,  setNote]  = useState(false);
  const [showAmort,  setAmort] = useState(false);
  const [isMobile,   setMob]   = useState(() => typeof window !== "undefined" && window.innerWidth < 880);
  const resultsRef = useRef(null);

  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 880);
    window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn);
  }, []);

  const country = COUNTRIES[countryKey];
  const strConfig = STRUCTURES[structure];

  const setCountry = (k) => { setCK(k); setStr(COUNTRIES[k].defaultStructure); setPP(""); setDPV(""); setPR(""); setTen(30); setCalc(false); };

  const pp = parseFloat(String(propPrice).replace(/,/g,"")) || 0;
  const dpAmt = dpMode === "amt" ? (parseFloat(String(dpValue).replace(/,/g,"")) || 0) : pp * (parseFloat(dpValue) || country.minDP) / 100;
  const dpPct = pp > 0 ? (dpAmt / pp) * 100 : parseFloat(dpValue) || country.minDP;
  const financingAmt = Math.max(0, pp - dpAmt);
  const rate = parseFloat(profitRate) || country.typicalRate;
  const monthly = useMemo(() => calcMonthly(financingAmt, rate, tenure, strConfig.calc), [financingAmt, rate, tenure, strConfig]);
  const totalPaid = monthly * tenure * 12;
  const totalProfit = totalPaid - financingAmt;
  const profitPct = totalPaid > 0 ? (totalProfit / totalPaid) * 100 : 0;
  const recommendedIncome = monthly * 3;
  const stampDuty = country.stampDuty && pp > 0 ? calcStampDuty(pp, financingAmt) : null;
  const ltv = pp > 0 ? (financingAmt / pp) * 100 : 0;

  const amortRows = useMemo(() => {
    if (!calculated || strConfig.calc === "fixed") return [];
    const r = rate/100/12, n = tenure*12, mon = monthly;
    let bal = financingAmt;
    return Array.from({ length: Math.min(n, 12) }, (_,i) => {
      const profit = bal * r, principal = mon - profit;
      bal = Math.max(0, bal - principal);
      return { month: i+1, monthly: mon, profit, principal, balance: bal };
    });
  }, [calculated, financingAmt, rate, tenure, monthly, strConfig]);

  const fmt = n => new Intl.NumberFormat("en-MY", { minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);
  const fmtC = n => {
    if (countryKey==="ID" && n>=1e9) return (n/1e9).toFixed(2)+"M";
    if (n>=1e6) return (n/1e6).toFixed(2)+"M";
    if (n>=1e3) return (n/1e3).toFixed(1)+"K";
    return fmt(n);
  };
  const sym = country.sym;

  const doCalc = () => { setCalc(true); setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100); };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:T.bg, minHeight:"100vh", paddingBottom:80, color:T.text1 }}>

        {/* Hero */}
        <div style={{ background:T.brand, color:"#fff", padding: isMobile ? "36px 20px 32px" : "44px 40px 40px", position:"relative", overflow:"hidden" }}>
          <svg style={{ position:"absolute", right:0, top:0, opacity:0.07, pointerEvents:"none" }} width="300" height="200" viewBox="0 0 300 200">
            {[0,1,2,3,4].map(i=>[0,1,2].map(j=><circle key={`${i}${j}`} cx={i*70+35} cy={j*70+35} r={25} fill="none" stroke="#fff" strokeWidth="1"/>))}
          </svg>
          <div style={{ maxWidth:1040, margin:"0 auto", padding: isMobile ? 0 : "0 28px", position:"relative", zIndex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"rgba(255,255,255,0.6)", marginBottom:10 }}>
              🏠 HalalCalc.com — Islamic Finance Tools
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "2rem" : "2.8rem", fontWeight:400, margin:"0 0 8px", lineHeight:1.15, color:"#fff" }}>
              Home Financing Calculator
            </h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.75)", maxWidth:520, marginTop:8, lineHeight:1.6 }}>
              Compare Shariah-compliant home financing structures — Musharakah Mutanaqisah, BBA, Murabaha &amp; Ijara.
              Based on official standards from BNM, MAS &amp; OJK.
            </p>
          </div>
        </div>

        {/* Leaderboard ad */}
        <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"center" }}>
          <AdLeaderboard/>
        </div>

        <div style={{ maxWidth: isMobile ? "100%" : 1040, margin:"0 auto", padding: isMobile ? "20px 16px" : "28px 28px" }}>
          <LastVerifiedBadge/>
          <div style={{ display: isMobile ? "block" : "flex", gap:28, alignItems:"flex-start" }}>

            {/* Main column */}
            <div style={{ flex:1, minWidth:0 }}>

              {/* Country */}
              <Card>
                <CardTitle icon="🌏">Select Your Country</CardTitle>
                <div style={{ display:"flex", gap:8, flexWrap: isMobile ? "wrap" : "nowrap", marginBottom:14 }}>
                  {Object.entries(COUNTRIES).map(([k,c]) => (
                    <button key={k} onClick={() => setCountry(k)}
                      style={{ flex:1, minWidth: isMobile ? "calc(50% - 4px)" : "auto", padding:"11px 8px", borderRadius:T.radiusSm, border:`1.5px solid ${countryKey===k ? T.brand : T.border}`, background: countryKey===k ? T.brandLight : T.surface, cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ fontSize:22, marginBottom:3 }}>{c.flag}</div>
                      <div style={{ fontSize:11, fontWeight:700, color: countryKey===k ? T.brand : T.text3 }}>{c.name}</div>
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 13px", background:"#F7FAF8", border:`1px solid ${T.border}`, borderRadius:T.radiusXs, marginBottom: country.notes.length ? 12 : 0 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:T.text2 }}>🏛 {country.authority}</span>
                  {country.authorityUrl && <a href={country.authorityUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontWeight:700, color:T.brand, textDecoration:"none", background:T.brandLight, padding:"4px 10px", borderRadius:20 }}>Verify ↗</a>}
                </div>
                {country.notes.length > 0 && (
                  <div style={{ marginTop:10 }}>
                    <button onClick={() => setNote(!showNotes)} style={{ background:"none", border:"none", fontSize:12, fontWeight:600, color:T.brand, cursor:"pointer", padding:0 }}>
                      {showNotes ? "▲ Hide" : "▼ Show"} {country.name} financing rules
                    </button>
                    {showNotes && <div style={{ marginTop:10 }}>{country.notes.map((n,i) => <AlertBox key={i} type={n.type}>{n.text}</AlertBox>)}</div>}
                  </div>
                )}
              </Card>

              {/* Structure */}
              <Card>
                <CardTitle icon="🕌">Financing Structure</CardTitle>
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${country.structures.length},1fr)`, gap:8, marginBottom:14 }}>
                  {country.structures.map(s => (
                    <button key={s} onClick={() => { setStr(s); setCalc(false); }}
                      style={{ padding:"12px 8px", borderRadius:T.radiusSm, border:`1.5px solid ${structure===s ? T.brand : T.border}`, background: structure===s ? T.brandLight : T.surface, cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>{STRUCTURES[s].icon}</div>
                      <div style={{ fontSize:11, fontWeight:700, color: structure===s ? T.brand : T.text3, lineHeight:1.3 }}>{STRUCTURES[s].short}</div>
                    </button>
                  ))}
                </div>
                <div style={{ padding:"12px 14px", background:T.brandLight, borderRadius:T.radiusSm, border:`1px solid ${T.brand}33` }}>
                  <div style={{ fontSize:12, fontWeight:700, color:T.brand, marginBottom:4 }}>{strConfig.icon} {strConfig.name}</div>
                  <div style={{ fontSize:12, color:T.text2, lineHeight:1.6 }}>{strConfig.desc}</div>
                  <span style={{ display:"inline-block", marginTop:8, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20,
                    background: strConfig.calc==="fixed" ? "#EFF6FF" : T.successLight,
                    color: strConfig.calc==="fixed" ? "#1D4ED8" : T.success,
                    border: `1px solid ${strConfig.calc==="fixed" ? "#BFDBFE" : "#A7F3D0"}` }}>
                    {strConfig.calc==="fixed" ? "Fixed Total Cost" : "Reducing Balance"}
                  </span>
                </div>
              </Card>

              {/* Property Details */}
              <Card>
                <CardTitle icon="🏡">Property Details</CardTitle>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14, marginBottom:14 }}>
                  <div>
                    <Label>Property Price</Label>
                    <InputWithPrefix prefix={sym} value={propPrice} placeholder="500,000"
                      onChange={e => { setPP(e.target.value); setCalc(false); }}/>
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <Label>Down Payment</Label>
                      <SegmentControl options={[{value:"pct",label:"%"},{value:"amt",label:sym}]} value={dpMode} onChange={v => { setDPM(v); setDPV(""); setCalc(false); }}/>
                    </div>
                    <InputWithPrefix prefix={dpMode==="pct" ? "%" : sym} value={dpValue} placeholder={dpMode==="pct" ? String(country.minDP) : ""}
                      onChange={e => { setDPV(e.target.value); setCalc(false); }}/>
                    <div style={{ fontSize:11, color:T.text3, marginTop:5 }}>Min {country.minDP}% · {sym} {pp > 0 ? fmt(dpAmt) : "—"}</div>
                  </div>
                </div>
                {pp > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:T.goldLight, border:`1px solid #E8D9A0`, borderRadius:T.radiusSm }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#7A6020", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>Financing Amount</div>
                      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:T.gold }}>{sym} {fmt(financingAmt)}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#7A6020", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>LTV Ratio</div>
                      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color: ltv > 90 ? T.danger : T.text1 }}>{ltv.toFixed(1)}%</div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Mobile ad */}
              <AdMobileRect show={isMobile}/>

              {/* Financing Terms */}
              <Card>
                <CardTitle icon="📋">Financing Terms</CardTitle>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
                  <div>
                    <Label note={`Typical ${country.name}: ~${country.typicalRate}%`}>Annual Profit Rate</Label>
                    <InputWithPrefix suffix="% p.a." value={profitRate} placeholder={String(country.typicalRate)}
                      onChange={e => { setPR(e.target.value); setCalc(false); }}/>
                  </div>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <Label>Tenure</Label>
                      <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.brand }}>{tenure} yrs</span>
                    </div>
                    <input type="range" min="5" max={country.maxTenure} step="1" value={tenure}
                      onChange={e => { setTen(parseInt(e.target.value)); setCalc(false); }}
                      style={{ width:"100%", accentColor:T.brand, cursor:"pointer" }}/>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.text3, marginTop:3 }}>
                      <span>5 yrs</span><span>Max {country.maxTenure} yrs</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Calculate button */}
              <button onClick={doCalc}
                style={{ width:"100%", padding:"15px 0", background:T.brand, color:"#fff", border:"none", borderRadius:T.radiusSm, fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 16px rgba(10,124,78,0.3)`, transition:"all 0.15s" }}
                onMouseEnter={e => { e.target.style.background=T.brandDark; e.target.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.target.style.background=T.brand; e.target.style.transform="translateY(0)"; }}>
                Calculate My Financing 🏠
              </button>

              {/* Results */}
              {calculated && financingAmt > 0 && (
                <div ref={resultsRef} style={{ marginTop:24 }}>
                  <IslamicDivider/>

                  {/* Singapore warning */}
                  {countryKey === "SG" && <AlertBox type="warn">⚠ Islamic home financing options in Singapore are currently limited. Speak directly to OCBC Al-Amin or Maybank Islamic (SG) to confirm current product availability before proceeding.</AlertBox>}

                  <AdPostResult/>

                  {/* Main result */}
                  <div style={{ background:T.surface, border:`1px solid ${T.gold}55`, borderRadius:T.radius, padding:"28px 24px", marginBottom:14, textAlign:"center", boxShadow:T.shadow, position:"relative", overflow:"hidden" }}>
                    <svg style={{ position:"absolute", right:-20, top:-20, opacity:0.04, pointerEvents:"none" }} width="220" height="220" viewBox="0 0 220 220">
                      <path d="M110 20 A90 90 0 1 1 109.99 20 Z" fill="none" stroke={T.brand} strokeWidth="2"/>
                      <path d="M140 35 A70 70 0 1 0 140.01 35 Z" fill={T.bg} stroke="none"/>
                      <circle cx="155" cy="60" r="12" fill="none" stroke={T.brand} strokeWidth="1.5"/>
                    </svg>
                    <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Monthly Instalment</div>
                    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "2.8rem" : "3.8rem", color:T.gold, lineHeight:1.05, marginBottom:4 }}>
                      {sym} {fmt(monthly)}
                    </div>
                    <div style={{ fontSize:13, color:T.text3, marginBottom:18 }}>
                      {strConfig.name} · {tenure} years · {rate.toFixed(2)}% p.a.
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:9 }}>
                      {[
                        { v:fmt(financingAmt),    l:"Financing Amount" },
                        { v:fmt(totalProfit),     l:"Total Profit" },
                        { v:fmt(totalPaid),       l:"Total Repayment" },
                        { v:profitPct.toFixed(1)+"%", l:"Profit Ratio" },
                      ].map((s,i) => (
                        <div key={i} style={{ background:T.bg, borderRadius:T.radiusXs, padding:"10px 8px" }}>
                          <div style={{ fontSize:14, fontWeight:700, color:T.text1 }}>{s.v}</div>
                          <div style={{ fontSize:10, color:T.text3, marginTop:2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost breakdown */}
                  <Card>
                    <CardTitle icon="📊">Cost Breakdown</CardTitle>
                    {[
                      { label:"Your Principal", value:financingAmt, total:totalPaid, color:T.brand },
                      { label:"Total Profit Paid", value:totalProfit, total:totalPaid, color:T.gold },
                    ].map((row,i) => (
                      <div key={i} style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                          <span style={{ color:T.text2, fontWeight:500 }}>{row.label} ({((row.value/totalPaid)*100).toFixed(1)}%)</span>
                          <span style={{ fontWeight:700 }}>{sym} {fmt(row.value)}</span>
                        </div>
                        <div style={{ height:5, background:"#EEF1EF", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${(row.value/totalPaid)*100}%`, background:row.color, borderRadius:3 }}/>
                        </div>
                      </div>
                    ))}
                    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap:9, marginTop:14 }}>
                      {[
                        { v:fmt(monthly),           l:"Monthly",             sym },
                        { v:fmt(monthly*12),         l:"Annual",              sym },
                        { v:fmt(recommendedIncome),  l:"Min. Income Needed",  sym },
                      ].map((s,i) => (
                        <div key={i} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"12px", textAlign:"center" }}>
                          <div style={{ fontSize:10, color:T.text3, fontWeight:700, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.4px" }}>{s.l}</div>
                          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color:T.text1 }}>
                            <span style={{ fontSize:11, color:T.text3 }}>{s.sym} </span>{fmtC(parseFloat(s.v.replace(/,/g,"")))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <AlertBox type="info" children={`💡 Recommended gross monthly income: at least ${sym} ${fmt(recommendedIncome)} (based on 1/3 income rule).`}/>
                  </Card>

                  {/* Malaysia stamp duty */}
                  {stampDuty && pp > 0 && (
                    <Card>
                      <CardTitle icon="🧾">Estimated Upfront Costs (Malaysia)</CardTitle>
                      <div style={{ fontSize:12, color:T.text3, marginBottom:14 }}>Approximate government fees — verify with a licensed solicitor before signing.</div>
                      {[
                        { l:"Down Payment", v:dpAmt, note:"" },
                        { l:"Stamp Duty — Property Transfer (MOT)", v:stampDuty.mot, note:"Tiered: 1%–4% of property price" },
                        { l:"Stamp Duty — Financing Agreement", v:stampDuty.loan, note:"0.5% of financing amount" },
                      ].map((r,i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 0", borderBottom: i<2 ? `1px solid ${T.border}` : "none" }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:T.text1 }}>{r.l}</div>
                            {r.note && <div style={{ fontSize:10, color:T.text3, marginTop:2 }}>{r.note}</div>}
                          </div>
                          <div style={{ fontSize:13, fontWeight:700, color:T.text1, marginLeft:16, whiteSpace:"nowrap" }}>{sym} {fmt(r.v)}</div>
                        </div>
                      ))}
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, padding:"12px 14px", background:T.goldLight, border:`1px solid #E8D9A0`, borderRadius:T.radiusSm }}>
                        <span style={{ fontSize:14, fontWeight:700, color:T.gold }}>Estimated Total Upfront</span>
                        <span style={{ fontSize:14, fontWeight:700, color:T.gold }}>{sym} {fmt(dpAmt + stampDuty.total)}</span>
                      </div>
                      <div style={{ fontSize:11, color:T.text3, marginTop:8, lineHeight:1.6 }}>
                        Legal fees, valuation fees, and MRTT premiums are not included. Expect an additional 1–2% of property price.
                      </div>
                    </Card>
                  )}

                  {/* Fixed structure note */}
                  {strConfig.calc === "fixed" && (
                    <AlertBox type="green">
                      ✅ <strong>Fixed Total Cost — {strConfig.short}:</strong> Your total repayment of {sym} {fmt(totalPaid)} is agreed at signing and will not change regardless of market conditions. Monthly payment: {sym} {fmt(monthly)}.
                    </AlertBox>
                  )}

                  {/* Amortization */}
                  {strConfig.calc === "amortizing" && (
                    <Card>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                        <CardTitle icon="📅" children="Repayment Schedule"/>
                        <button onClick={() => setAmort(!showAmort)}
                          style={{ background:"none", border:`1px solid ${T.brand}55`, borderRadius:T.radiusXs, color:T.brand, fontSize:12, fontWeight:600, cursor:"pointer", padding:"5px 12px" }}>
                          {showAmort ? "Hide" : "Show First 12 Months"}
                        </button>
                      </div>
                      {!showAmort && (
                        <div style={{ fontSize:12, color:T.text2, lineHeight:1.7 }}>
                          With {strConfig.name}, monthly instalments remain at <strong>{sym} {fmt(monthly)}</strong>. Early payments contain a higher profit portion — this shifts toward principal over time.
                        </div>
                      )}
                      {showAmort && (
                        <div style={{ overflowX:"auto" }}>
                          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                            <thead>
                              <tr style={{ borderBottom:`2px solid ${T.border}` }}>
                                {["Month","Instalment","Profit","Principal","Balance"].map(h => (
                                  <th key={h} style={{ padding:"8px 6px", textAlign: h==="Month" ? "left" : "right", color:T.text3, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {amortRows.map((r,i) => (
                                <tr key={i} style={{ background: i%2===0 ? T.bg : T.surface, borderBottom:`1px solid ${T.border}` }}>
                                  <td style={{ padding:"7px 6px", color:T.text3 }}>{r.month}</td>
                                  <td style={{ padding:"7px 6px", textAlign:"right", fontWeight:600 }}>{fmtC(r.monthly)}</td>
                                  <td style={{ padding:"7px 6px", textAlign:"right", color:T.gold, fontWeight:600 }}>{fmtC(r.profit)}</td>
                                  <td style={{ padding:"7px 6px", textAlign:"right", color:T.success, fontWeight:600 }}>{fmtC(r.principal)}</td>
                                  <td style={{ padding:"7px 6px", textAlign:"right" }}>{fmtC(r.balance)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ fontSize:10, color:T.text3, textAlign:"center", marginTop:8 }}>First 12 of {tenure*12} months · Gold = profit · Green = principal reduction</div>
                        </div>
                      )}
                    </Card>
                  )}

                  <AffiliateCards countryKey={countryKey}/>

                  <button onClick={() => { setPP(""); setDPV(""); setPR(""); setTen(30); setCalc(false); }}
                    style={{ width:"100%", padding:"12px 0", background:"transparent", color:T.text3, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    Reset Calculator
                  </button>
                </div>
              )}

              <div style={{ fontSize:11, color:T.text3, lineHeight:1.8, textAlign:"center", marginTop:24, padding:"0 8px" }}>
                Estimates only — not financial or Shariah advice. Verify with your bank and a licensed solicitor before signing.<br/>
                <a href="https://www.bnm.gov.my" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>Bank Negara Malaysia</a> ·&nbsp;
                <a href="https://www.mas.gov.sg" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>MAS (Singapore)</a> ·&nbsp;
                <a href="https://www.ojk.go.id" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>OJK (Indonesia)</a><br/>
              HalalCalc.com is an independent tool and is not affiliated with any bank, government body, or Islamic authority.
              </div>
            </div>

            {/* Sidebar — desktop only */}
            {!isMobile && (
              <div style={{ width:300, flexShrink:0, position:"sticky", top:20 }}>
                <AdSidebarRect/>
                <Card style={{ marginBottom:14 }}>
                  <CardTitle icon="📖">Quick Reference</CardTitle>
                  <div style={{ fontSize:12, lineHeight:1.8 }}>
                    <div style={{ fontWeight:700, color:T.text1, marginBottom:2 }}>Typical Rates (2026)</div>
                    {[{ c:"🇲🇾 Malaysia", r:`~${FINANCING_RATES.MY}% p.a.` }, { c:"🇸🇬 Singapore", r:`~${FINANCING_RATES.SG}% p.a.` }, { c:"🇮🇩 Indonesia", r:`~${FINANCING_RATES.ID}% p.a.` }].map((x,i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${T.border}` }}>
                        <span style={{ color:T.text2 }}>{x.c}</span>
                        <span style={{ fontFamily:"'DM Serif Display',serif", color:T.gold, fontSize:14 }}>{x.r}</span>
                      </div>
                    ))}
                    <div style={{ fontSize:11, color:T.text3, marginTop:8 }}>Verify current rates with your bank.</div>
                  </div>
                </Card>
                <Card style={{ marginBottom:14 }}>
                  <CardTitle icon="🔧">More Tools</CardTitle>
                  {[{ name:"Zakat Calculator", icon:"☪" }, { name:"Islamic Savings Calculator", icon:"💰" }, { name:"Faraid Calculator", icon:"📜" }].map((t,i) => (
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
        <AdStickyFooter/>
      </div>
    </>
  );
}
