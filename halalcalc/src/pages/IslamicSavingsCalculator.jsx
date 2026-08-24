import { useState, useMemo, useEffect, useRef } from "react";

const T = {
  bg:"#F4F7F5", surface:"#FFFFFF", border:"#DDE6E1", borderFocus:"#0A7C4E",
  brand:"#0A7C4E", brandDark:"#075C39", brandLight:"#EAF4EE",
  gold:"#9B7B2E", goldLight:"#FDF8EC",
  text1:"#0C1E14", text2:"#3D5247", text3:"#7A9488",
  success:"#276749", successLight:"#F0FAF4",
  shadow:"0 1px 4px rgba(10,60,30,0.06), 0 4px 16px rgba(10,60,30,0.05)",
  shadowMd:"0 4px 24px rgba(10,60,30,0.10)",
  radius:"14px", radiusSm:"8px", radiusXs:"6px",
};

const LAST_VERIFIED = "8 August 2026";

// ─── RATES DATA (update from rates.config.js monthly) ─────────────────────
const SAVINGS_DATA = {
  MY:{
    type:"Islamic Fixed Deposit (IFD)", contract:"Mudarabah (profit-sharing)",
    nisbah:"Typically 70–80% to customer", protection:"PIDM — up to RM 250,000",
    protectionUrl:"https://www.pidm.gov.my", sym:"RM",
    tenures:[1,2,3,6,9,12,24], defaultTenure:12, minDeposit:500,
    banks:[
      { name:"Maybank Islamic",    short:"Maybank",    color:"#B45309", rates:{1:2.85,2:2.90,3:3.10,6:3.15,9:3.18,12:3.20,24:3.25}, url:"https://www.maybank2u.com.my/maybank2u/malaysia/en/islamic-products-services.page" },
      { name:"CIMB Islamic",       short:"CIMB",       color:"#B91C1C", rates:{1:2.80,2:2.85,3:3.05,6:3.15,9:3.18,12:3.20,24:3.22}, url:"https://www.cimb.com.my" },
      { name:"Bank Islam",         short:"Bank Islam", color:"#15803D", rates:{1:2.85,2:2.90,3:3.10,6:3.20,9:3.22,12:3.25,24:3.28}, url:"https://www.bankislam.com" },
      { name:"RHB Islamic",        short:"RHB",        color:"#7E22CE", rates:{1:2.80,2:2.85,3:3.05,6:3.15,9:3.17,12:3.20,24:3.20}, url:"https://www.rhbgroup.com" },
      { name:"MBSB Bank",          short:"MBSB",       color:"#1D4ED8", rates:{1:2.90,2:2.95,3:3.15,6:3.25,9:3.28,12:3.30,24:3.35}, url:"https://www.mbsb.com.my" },
      { name:"Public Islamic Bank",short:"Public",     color:"#0F766E", rates:{1:2.82,2:2.88,3:3.08,6:3.18,9:3.20,12:3.22,24:3.25}, url:"https://www.publicislamicbank.com.my" },
    ],
  },
  SG:{
    type:"Islamic Savings Account", contract:"FastSaver-i: Mudarabah · OCBC: Wadiah",
    nisbah:"Mudarabah: profit-sharing | Wadiah: no fixed return",
    protection:"SDIC — up to S$ 75,000", protectionUrl:"https://www.sdic.org.sg", sym:"S$",
    tenures:[1,3,6,12], defaultTenure:12, minDeposit:1000,
    note:"Singapore Islamic accounts are savings products, not fixed deposits. Rates are SORA-linked and change monthly.",
    banks:[
      { name:"CIMB FastSaver-i",  short:"CIMB",    color:"#B91C1C", rates:{1:1.50,3:1.50,6:2.00,12:2.88}, url:"https://www.cimb.com.sg/en/personal/banking-with-us/accounts/savings-accounts/cimb-fastsaver-i-account.html", conditions:"Up to 2.88% with salary crediting + card spend. Base: 1.50%." },
      { name:"OCBC Al-Amin",      short:"OCBC",    color:"#15803D", rates:{1:0.20,3:0.20,6:0.20,12:0.20}, url:"https://www.ocbc.com.sg/personal-banking/accounts/savings-accounts", conditions:"Wadiah — principal 100% guaranteed. No minimum profit." },
      { name:"Maybank Savings-i", short:"Maybank", color:"#B45309", rates:{1:0.25,3:0.25,6:0.28,12:0.30}, url:"https://www.maybank2u.com.sg/en/personal/islamic/deposits/index.page", conditions:"Basic Mudarabah savings account." },
    ],
  },
  ID:{
    type:"Deposito Syariah", contract:"Mudharabah Muthlaqah (profit-sharing)",
    nisbah:"Typically 50–65% to customer", protection:"LPS — up to Rp 2 miliar",
    protectionUrl:"https://www.lps.go.id", sym:"Rp",
    tenures:[1,3,6,12,24], defaultTenure:12, minDeposit:1000000,
    note:"Rates shown are indicative equivalent rates. Actual returns depend on the bank's realised profits and agreed nisbah.",
    banks:[
      { name:"Bank Syariah Indonesia (BSI)", short:"BSI",          color:"#15803D", rates:{1:5.25,3:5.50,6:5.75,12:6.00,24:6.00}, url:"https://www.bankbsi.co.id" },
      { name:"Bank Muamalat",               short:"Muamalat",      color:"#1D4ED8", rates:{1:5.00,3:5.25,6:5.50,12:5.75,24:5.75}, url:"https://www.bankmuamalat.co.id" },
      { name:"BCA Syariah",                 short:"BCA Syariah",   color:"#7E22CE", rates:{1:4.75,3:5.00,6:5.25,12:5.50,24:5.50}, url:"https://www.bcasyariah.co.id" },
      { name:"Bank Mega Syariah",           short:"Mega Syariah",  color:"#B91C1C", rates:{1:5.00,3:5.25,6:5.50,12:5.75,24:5.75}, url:"https://www.megasyariah.co.id" },
    ],
  },
};

const COUNTRIES = {
  MY:{ name:"Malaysia",  flag:"🇲🇾" },
  SG:{ name:"Singapore", flag:"🇸🇬" },
  ID:{ name:"Indonesia", flag:"🇮🇩" },
};

const TENURE_LABELS = { 1:"1 Month",2:"2 Months",3:"3 Months",6:"6 Months",9:"9 Months",12:"12 Months",24:"24 Months" };

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────
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
const AlertBox = ({ type="info", children }) => {
  const c = { info:{bg:"#EEF6FF",border:"#BFDBFE",text:"#1E40AF"}, warn:{bg:"#FFFBEB",border:"#FDE68A",text:"#92400E"}, green:{bg:T.successLight,border:"#A7F3D0",text:T.success} }[type];
  return <div style={{ padding:"10px 13px", borderRadius:T.radiusSm, fontSize:12, lineHeight:1.6, marginBottom:8, background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>{children}</div>;
};
const LastVerifiedBadge = () => {
  const days = Math.floor((new Date() - new Date(LAST_VERIFIED)) / 86400000);
  const stale = days > 45;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 14px", borderRadius:T.radiusSm, marginBottom:16, background: stale?"#FFFBEB":T.successLight, border:`1px solid ${stale?"#FDE68A":"#A7F3D0"}` }}>
      <span style={{ fontSize:12, fontWeight:600, color: stale?"#92400E":T.success }}>{stale?"⚠️":"✅"} Rates last verified: <strong>{LAST_VERIFIED}</strong></span>
      <span style={{ fontSize:11, color:T.text3 }}>{days===0?"Today":`${days}d ago`}</span>
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
    <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:728, height:90, maxWidth:"100%", background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusXs }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Advertisement — 728×90</span>
    </div>
  </div>
);
const AdSidebarRect = () => (
  <div style={{ width:300, height:250, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, marginBottom:16 }}>
    <span style={{ fontSize:20, opacity:0.3 }}>📢</span>
    <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Ad Space — 300×250</span>
  </div>
);
const AdMobileRect = ({ show }) => !show ? null : (
  <div style={{ display:"flex", justifyContent:"center", margin:"0 0 14px" }}>
    <div style={{ width:300, height:250, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Ad Space — Mobile 300×250</span>
    </div>
  </div>
);
const AdPostResult = () => (
  <div style={{ margin:"0 0 16px" }}>
    <div style={{ height:100, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Advertisement — Post Result</span>
    </div>
  </div>
);
const AdStickyFooter = () => (
  <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, display:"flex", justifyContent:"center", alignItems:"center", background:T.surface, borderTop:`1px solid ${T.border}`, height:60, boxShadow:"0 -2px 12px rgba(0,0,0,0.08)" }}>
    <div style={{ width:320, height:50, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusXs, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:10, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Sticky Footer — 320×50</span>
    </div>
  </div>
);
const AffiliateCards = ({ countryKey, data }) => {
  const list = data.banks.slice(0, 2);
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:1, textAlign:"center", marginBottom:10 }}>— Sponsored Partners —</div>
      {list.map((b,i) => (
        <a key={i} href={b.url} target="_blank" rel="noopener noreferrer sponsored"
           style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, textDecoration:"none", marginBottom:8 }}
           onMouseEnter={e=>e.currentTarget.style.boxShadow=T.shadowMd} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.text1, marginBottom:2 }}>{b.name}</div>
            <div style={{ fontSize:12, color:T.text3 }}>Best {data.defaultTenure}-month rate: <strong style={{ color:T.gold }}>{b.rates[data.defaultTenure]}% p.a.</strong></div>
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:T.brand, whiteSpace:"nowrap", marginLeft:16, padding:"6px 12px", background:T.brandLight, borderRadius:20 }}>Open Account →</div>
        </a>
      ))}
      <div style={{ fontSize:10, color:T.text3, textAlign:"center", marginTop:4 }}>Sponsored · Replace with your affiliate links</div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function IslamicSavingsCalculator() {
  const [countryKey, setCK]   = useState("MY");
  const [deposit,    setDep]  = useState("");
  const [tenure,     setTen]  = useState(12);
  const [selBank,    setBank] = useState(0);
  const [mode,       setMode] = useState("bank");
  const [customRate, setCR]   = useState("");
  const [calculated, setCalc] = useState(false);
  const [isMobile,   setMob]  = useState(() => typeof window !== "undefined" && window.innerWidth < 880);
  const resultsRef = useRef(null);

  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 880);
    window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn);
  }, []);

  const data = SAVINGS_DATA[countryKey];
  const sym  = data.sym;

  const setCountry = (k) => { setCK(k); setBank(0); setCalc(false); setCR(""); setTen(SAVINGS_DATA[k].defaultTenure); };

  const principal = parseFloat(String(deposit).replace(/,/g,"")) || 0;
  const selectedBank = data.banks[selBank];
  const rate = mode === "manual"
    ? (parseFloat(customRate) || 0)
    : (selectedBank?.rates[tenure] ?? Object.values(selectedBank?.rates || {})[0] ?? 0);
  const profit   = principal * (rate / 100) * (tenure / 12);
  const maturity = principal + profit;

  const bankComparison = useMemo(() =>
    data.banks.map(b => ({ ...b, rate: b.rates[tenure] ?? Object.values(b.rates).at(-1), profit: principal * ((b.rates[tenure] ?? Object.values(b.rates).at(-1)) / 100) * (tenure / 12) }))
    .sort((a, b) => b.rate - a.rate),
    [data, tenure, principal]
  );
  const maxProfit = Math.max(...bankComparison.map(b => b.profit), 1);

  const fmt = n => new Intl.NumberFormat("en-MY", { minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);
  const fmtC = n => {
    if (countryKey==="ID" && n>=1e9) return (n/1e9).toFixed(2)+"M";
    if (countryKey==="ID" && n>=1e6) return (n/1e6).toFixed(2)+" jt";
    if (n>=1e6) return (n/1e6).toFixed(3)+"M";
    if (n>=1e3) return (n/1e3).toFixed(2)+"K";
    return fmt(n);
  };

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
              💰 HalalCalc.com — Islamic Finance Tools
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "2rem" : "2.8rem", fontWeight:400, margin:"0 0 8px", lineHeight:1.15, color:"#fff" }}>
              Savings & Fixed Deposit Calculator
            </h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.75)", maxWidth:520, marginTop:8, lineHeight:1.6 }}>
              Compare Shariah-compliant profit rates across Islamic banks in Malaysia, Singapore &amp; Indonesia.
              Find the best Mudarabah rate for your deposit.
            </p>
          </div>
        </div>

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
                      style={{ flex:1, minWidth: isMobile ? "calc(33% - 4px)" : "auto", padding:"11px 8px", borderRadius:T.radiusSm, border:`1.5px solid ${countryKey===k ? T.brand : T.border}`, background: countryKey===k ? T.brandLight : T.surface, cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ fontSize:22, marginBottom:3 }}>{c.flag}</div>
                      <div style={{ fontSize:11, fontWeight:700, color: countryKey===k ? T.brand : T.text3 }}>{c.name}</div>
                    </button>
                  ))}
                </div>

                {/* Contract & protection */}
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:9 }}>
                  <div style={{ padding:"10px 13px", background:"#F7FAF8", borderRadius:T.radiusXs, border:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:10, fontWeight:700, color:T.brand, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>Contract Type</div>
                    <div style={{ fontSize:12, color:T.text2, lineHeight:1.5 }}>{data.contract}</div>
                  </div>
                  <div style={{ padding:"10px 13px", background:T.successLight, borderRadius:T.radiusXs, border:`1px solid #A7F3D0` }}>
                    <div style={{ fontSize:10, fontWeight:700, color:T.success, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>🛡 Deposit Protection</div>
                    <div style={{ fontSize:12, color:T.text2, lineHeight:1.5 }}>
                      {data.protection}&nbsp;
                      <a href={data.protectionUrl} target="_blank" rel="noopener noreferrer" style={{ color:T.brand, fontSize:11, fontWeight:700 }}>Verify ↗</a>
                    </div>
                  </div>
                </div>
                {data.note && <AlertBox type="warn" children={`⚠ ${data.note}`}/>}
              </Card>

              {/* Deposit details */}
              <Card>
                <CardTitle icon="🏦">Your Deposit</CardTitle>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14, marginBottom:14 }}>
                  <div>
                    <Label note={`Min: ${sym} ${new Intl.NumberFormat().format(data.minDeposit)}`}>Deposit Amount</Label>
                    <div style={{ display:"flex", alignItems:"stretch", border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, overflow:"hidden" }}>
                      <div style={{ padding:"10px 12px", background:T.brandLight, color:T.brand, fontSize:13, fontWeight:700, borderRight:`1px solid ${T.border}` }}>{sym}</div>
                      <input type="number" min="0" placeholder={String(data.minDeposit)} value={deposit}
                        onChange={e => { setDep(e.target.value); setCalc(false); }}
                        style={{ flex:1, border:"none", outline:"none", padding:"10px 12px", fontSize:14, color:T.text1, background:"transparent", minWidth:0 }}/>
                    </div>
                  </div>
                  <div>
                    <Label>Tenure</Label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {data.tenures.map(t => (
                        <button key={t} onClick={() => { setTen(t); setCalc(false); }}
                          style={{ padding:"7px 10px", borderRadius:T.radiusXs, border:`1.5px solid ${tenure===t ? T.brand : T.border}`, background: tenure===t ? T.brandLight : T.surface, color: tenure===t ? T.brand : T.text3, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>
                          {TENURE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mode toggle */}
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  {[["bank","🏛 Select Bank Rate"],["manual","✏️ Enter Custom Rate"]].map(([m,l]) => (
                    <button key={m} onClick={() => { setMode(m); setCalc(false); }}
                      style={{ flex:1, padding:"10px 0", borderRadius:T.radiusSm, border:`1.5px solid ${mode===m ? T.brand : T.border}`, background: mode===m ? T.brandLight : T.surface, color: mode===m ? T.brand : T.text3, fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>
                      {l}
                    </button>
                  ))}
                </div>

                {mode === "bank" ? (
                  <div>
                    <Label>Select Bank</Label>
                    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap:8 }}>
                      {data.banks.map((b,i) => (
                        <button key={i} onClick={() => { setBank(i); setCalc(false); }}
                          style={{ padding:"11px 8px", borderRadius:T.radiusSm, border:`1.5px solid ${selBank===i ? b.color : T.border}`, background: selBank===i ? `${b.color}12` : T.surface, cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                          <div style={{ fontSize:11, fontWeight:800, color: selBank===i ? b.color : T.text3, marginBottom:2 }}>{b.short}</div>
                          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color: selBank===i ? b.color : T.text1 }}>
                            {(b.rates[tenure] ?? Object.values(b.rates).at(-1)).toFixed(2)}%
                          </div>
                          <div style={{ fontSize:9, color:T.text3 }}>p.a.</div>
                        </button>
                      ))}
                    </div>
                    {selectedBank?.conditions && <AlertBox type="info" children={`ℹ️ ${selectedBank.conditions}`}/>}
                  </div>
                ) : (
                  <div>
                    <Label>Custom Profit Rate</Label>
                    <div style={{ display:"flex", alignItems:"stretch", border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, overflow:"hidden" }}>
                      <input type="number" min="0" step="0.05" placeholder="3.20" value={customRate}
                        onChange={e => { setCR(e.target.value); setCalc(false); }}
                        style={{ flex:1, border:"none", outline:"none", padding:"10px 12px", fontSize:14, color:T.text1, background:"transparent", minWidth:0 }}/>
                      <div style={{ padding:"10px 12px", background:T.brandLight, color:T.brand, fontSize:13, fontWeight:700, borderLeft:`1px solid ${T.border}` }}>% p.a.</div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Mudarabah explainer */}
              <Card style={{ padding:"16px 20px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.brand, marginBottom:6 }}>📖 How Islamic Profit-Sharing Works</div>
                <div style={{ fontSize:12, color:T.text2, lineHeight:1.7 }}>
                  Unlike conventional interest (riba, which is forbidden), Islamic deposits use a <strong>Mudarabah</strong> contract.
                  The bank invests your money in halal activities and shares the profit at an agreed ratio — <strong>{data.nisbah}</strong>.
                  The advertised rate is indicative but banks almost always honour it.
                </div>
              </Card>

              {/* Mobile ad */}
              <AdMobileRect show={isMobile}/>

              {/* Calculate */}
              <button onClick={doCalc}
                style={{ width:"100%", padding:"15px 0", background:T.brand, color:"#fff", border:"none", borderRadius:T.radiusSm, fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 16px rgba(10,124,78,0.3)`, transition:"all 0.15s" }}
                onMouseEnter={e => { e.target.style.background=T.brandDark; e.target.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.target.style.background=T.brand; e.target.style.transform="translateY(0)"; }}>
                Calculate My Returns 💰
              </button>

              {/* Results */}
              {calculated && principal > 0 && rate > 0 && (
                <div ref={resultsRef} style={{ marginTop:24 }}>
                  <IslamicDivider/>
                  <AdPostResult/>

                  {/* Main result */}
                  <div style={{ background:T.surface, border:`1px solid ${T.gold}55`, borderRadius:T.radius, padding:"28px 24px", marginBottom:14, textAlign:"center", boxShadow:T.shadow, position:"relative", overflow:"hidden" }}>
                    <svg style={{ position:"absolute", right:-20, top:-20, opacity:0.04, pointerEvents:"none" }} width="220" height="220" viewBox="0 0 220 220">
                      <path d="M110 20 A90 90 0 1 1 109.99 20 Z" fill="none" stroke={T.brand} strokeWidth="2"/>
                      <path d="M140 35 A70 70 0 1 0 140.01 35 Z" fill={T.bg} stroke="none"/>
                      <circle cx="155" cy="60" r="12" fill="none" stroke={T.brand} strokeWidth="1.5"/>
                    </svg>
                    <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Total Profit Earned</div>
                    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "2.8rem" : "3.8rem", color:T.gold, lineHeight:1.05, marginBottom:4 }}>
                      {sym} {fmt(profit)}
                    </div>
                    <div style={{ fontSize:13, color:T.text3, marginBottom:18 }}>
                      {mode==="bank" ? selectedBank?.name : "Custom Rate"} · {TENURE_LABELS[tenure]} · {rate.toFixed(2)}% p.a.
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
                      {[
                        { v:fmt(principal), l:"Principal",     gold:false },
                        { v:fmt(profit),    l:"Profit",        gold:true  },
                        { v:fmt(maturity),  l:"Total at Maturity", gold:false },
                      ].map((s,i) => (
                        <div key={i} style={{ background:T.bg, borderRadius:T.radiusXs, padding:"10px 8px" }}>
                          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color: s.gold ? T.gold : T.text1, fontWeight:400 }}>{s.v}</div>
                          <div style={{ fontSize:10, color:T.text3, marginTop:2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breakdown bars */}
                  <Card>
                    <CardTitle icon="📊">Breakdown</CardTitle>
                    {[
                      { label:"Your Principal", value:principal, color:T.brand },
                      { label:"Profit Earned",  value:profit,    color:T.gold  },
                    ].map((row,i) => (
                      <div key={i} style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                          <span style={{ color:T.text2, fontWeight:500 }}>{row.label} ({((row.value/maturity)*100).toFixed(1)}%)</span>
                          <span style={{ fontWeight:700 }}>{sym} {fmt(row.value)}</span>
                        </div>
                        <div style={{ height:5, background:"#EEF1EF", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${(row.value/maturity)*100}%`, background:row.color, borderRadius:3 }}/>
                        </div>
                      </div>
                    ))}
                    <AlertBox type="green" children={`🛡 ${data.protection} — Your principal is protected.`}/>
                  </Card>

                  {/* Bank comparison */}
                  {data.banks.length > 1 && principal > 0 && (
                    <Card>
                      <CardTitle icon="🏛">Bank Comparison — {TENURE_LABELS[tenure]}</CardTitle>
                      <div style={{ fontSize:12, color:T.text3, marginBottom:14 }}>
                        All rates for {sym} {fmt(principal)} over {TENURE_LABELS[tenure]}. Indicative as of {LAST_VERIFIED}.
                      </div>
                      {bankComparison.map((b,i) => (
                        <div key={i} style={{ marginBottom:10, padding:"12px 14px", background: i===0 ? T.goldLight : T.bg, borderRadius:T.radiusSm, border:`1px solid ${i===0 ? "#E8D9A0" : T.border}` }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              {i===0 && <span style={{ fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20, background:T.goldLight, color:T.gold, border:`1px solid #E8D9A0` }}>BEST</span>}
                              <span style={{ fontSize:13, fontWeight:700, color: i===0 ? T.gold : T.text1 }}>{b.name}</span>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color: i===0 ? T.gold : T.text1 }}>{b.rate.toFixed(2)}% p.a.</div>
                              <div style={{ fontSize:11, color:T.text3 }}>Profit: {sym} {fmt(b.profit)}</div>
                            </div>
                          </div>
                          <div style={{ height:4, background:"#E8EDE9", borderRadius:2, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${(b.profit/maxProfit)*100}%`, background: i===0 ? T.gold : T.brand, borderRadius:2 }}/>
                          </div>
                        </div>
                      ))}
                      <div style={{ fontSize:11, color:T.text3, textAlign:"center", marginTop:4 }}>Rates are indicative — check each bank's app for the latest promotions.</div>
                    </Card>
                  )}

                  {/* Multi-tenure projection */}
                  {mode==="bank" && selectedBank && (
                    <Card>
                      <CardTitle icon="📅">All Tenures — {selectedBank.name}</CardTitle>
                      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap:8 }}>
                        {Object.entries(selectedBank.rates).map(([t,r]) => {
                          const p = principal * (r/100) * (parseInt(t)/12);
                          const active = parseInt(t) === tenure;
                          return (
                            <div key={t} style={{ padding:"12px", background: active ? T.goldLight : T.bg, border:`1px solid ${active ? "#E8D9A0" : T.border}`, borderRadius:T.radiusSm, textAlign:"center" }}>
                              <div style={{ fontSize:10, fontWeight:700, color: active ? T.gold : T.text3, textTransform:"uppercase", marginBottom:4 }}>{TENURE_LABELS[parseInt(t)]}</div>
                              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:15, color: active ? T.gold : T.text1 }}>+{sym} {fmtC(p)}</div>
                              <div style={{ fontSize:10, color:T.text3, marginTop:2 }}>{r.toFixed(2)}% p.a.</div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  <AffiliateCards countryKey={countryKey} data={data}/>

                  <button onClick={() => { setDep(""); setCR(""); setCalc(false); }}
                    style={{ width:"100%", padding:"12px 0", background:"transparent", color:T.text3, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    Reset Calculator
                  </button>
                </div>
              )}

              <div style={{ fontSize:11, color:T.text3, lineHeight:1.8, textAlign:"center", marginTop:24, padding:"0 8px" }}>
                All profit rates are indicative as of {LAST_VERIFIED}. Rates are subject to change without notice.<br/>
                Always verify current rates directly with your bank before placing a deposit.<br/>
                <a href="https://www.pidm.gov.my" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>PIDM (Malaysia)</a> ·&nbsp;
                <a href="https://www.sdic.org.sg" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>SDIC (Singapore)</a> ·&nbsp;
                <a href="https://www.lps.go.id" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>LPS (Indonesia)</a><br/>
              HalalCalc.com is an independent tool and is not affiliated with any bank, government body, or Islamic authority.
              </div>
            </div>

            {/* Sidebar */}
            {!isMobile && (
              <div style={{ width:300, flexShrink:0, position:"sticky", top:20 }}>
                <AdSidebarRect/>
                <Card style={{ marginBottom:14 }}>
                  <CardTitle icon="⭐">Best Rates Today</CardTitle>
                  <div style={{ fontSize:11, color:T.text3, marginBottom:10 }}>12-month indicative rates</div>
                  {["MY","SG","ID"].map(k => {
                    const d = SAVINGS_DATA[k]; const best = [...d.banks].sort((a,b) => (b.rates[12]??0)-(a.rates[12]??0))[0];
                    return (
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:T.text1 }}>{COUNTRIES[k].flag} {best?.short}</div>
                          <div style={{ fontSize:10, color:T.text3 }}>{d.type}</div>
                        </div>
                        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color:T.gold }}>{best?.rates[12]?.toFixed(2)}%</div>
                      </div>
                    );
                  })}
                  <div style={{ fontSize:10, color:T.text3, marginTop:8 }}>Verify with each bank before depositing.</div>
                </Card>
                <Card>
                  <CardTitle icon="🔧">More Tools</CardTitle>
                  {[{ name:"Zakat Calculator", icon:"☪" }, { name:"Home Financing Calculator", icon:"🏠" }, { name:"Faraid Calculator", icon:"📜" }].map((t,i) => (
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
