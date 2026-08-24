import { useState, useEffect, useRef } from "react";

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

// ─── FARAID CALCULATION ENGINE (Shafi'i madhab — official in MY, SG, ID) ──
function calculateFaraid(input) {
  const {
    deceasedGender, estateGross, debts, funeralCosts,
    husband, wives, sons, daughters,
    father, mother, patGrandfather, matGrandmother,
    fullBrothers, fullSisters, halfBrothersPat, halfSistersPat,
    uterineSiblings,
  } = input;

  const estateNet = Math.max(0, (estateGross||0) - (debts||0) - (funeralCosts||0));
  const isMale = deceasedGender === "M";
  const hasSon = (sons||0) > 0;
  const hasDaughter = (daughters||0) > 0;
  const hasChild = hasSon || hasDaughter;

  // ── Blocking (Hajb) ───────────────────────────────────────────────────
  // Father blocks: grandfather, all siblings
  // Son (or son's son) blocks: grandfather from asabah, all siblings from inheriting
  const fatherBlocks  = !!father;
  const sonBlocks     = hasSon;
  const childBlocks   = hasChild; // blocks siblings & uterine siblings from inheriting

  const effPatGF   = !!patGrandfather && !fatherBlocks;
  const effMatGM   = !!matGrandmother && !mother;
  const effFB      = (!childBlocks && !fatherBlocks) ? (fullBrothers||0) : 0;
  const effFS      = (!childBlocks && !fatherBlocks) ? (fullSisters||0) : 0;
  const effHBP     = (!childBlocks && !fatherBlocks && effFB===0) ? (halfBrothersPat||0) : 0;
  const effHSP     = (!childBlocks && !fatherBlocks && effFB===0) ? (halfSistersPat||0) : 0;
  const effUterine = (!childBlocks && !fatherBlocks) ? (uterineSiblings||0) : 0;

  const blocked = [];
  if (!!patGrandfather && fatherBlocks)  blocked.push("Paternal Grandfather (blocked by Father)");
  if (!!matGrandmother && !!mother)       blocked.push("Maternal Grandmother (blocked by Mother)");
  if ((fullBrothers||0)>0 && childBlocks) blocked.push("Full Brothers/Sisters (blocked by Children)");
  if ((fullBrothers||0)>0 && fatherBlocks && !childBlocks) blocked.push("Full Brothers/Sisters (blocked by Father)");
  if ((halfBrothersPat||0)>0 && (effFB>0 || childBlocks || fatherBlocks)) blocked.push("Paternal Half-Brothers/Sisters (blocked)");
  if ((uterineSiblings||0)>0 && childBlocks) blocked.push("Uterine Siblings (blocked by Children)");

  // ── Fixed Shares (Furud) ──────────────────────────────────────────────
  let heirs = [];
  let totalFixed = 0;

  const addFixed = (name, icon, count, num, den, note, heirType="fixed") => {
    if (!count || count <= 0) return;
    const share = num / den;
    heirs.push({ name, icon, count, totalShare: share, perPersonShare: share/count, fraction: `${num}/${den}`, note, type: heirType });
    if (heirType === "fixed") totalFixed += share;
  };

  // Spouse
  if (!isMale && husband) {
    addFixed("Husband", "👨", 1, hasChild ? 1 : 1, hasChild ? 4 : 2, hasChild ? "1/4 — children present" : "1/2 — no children");
  }
  if (isMale && (wives||0) > 0) {
    addFixed(`Wife${(wives||0)>1?"ves":""}`, "👩", wives||0, hasChild ? 1 : 1, hasChild ? 8 : 4,
      `${hasChild?"1/8":"1/4"} total, shared equally${(wives||0)>1?` among ${wives} wives`:""}`);
  }

  // Father
  if (father && hasChild) {
    addFixed("Father", "👴", 1, 1, 6, "1/6 — children present");
    // Father also gets residue when only daughters — handled in asabah
  }

  // Mother
  if (mother) {
    const sibCount = (fullBrothers||0)+(fullSisters||0)+(halfBrothersPat||0)+(halfSistersPat||0)+(uterineSiblings||0);
    const spousePresent = (!isMale && husband) || (isMale && (wives||0)>0);
    const isUmariyyatain = spousePresent && father && !hasChild;

    if (isUmariyyatain) {
      // Mother gets 1/3 of residue after spouse — handled after spouse shares
      const spouseShare = (!isMale && husband) ? (1/2) : ((wives||0)>0 ? 1/4 : 0);
      const residueAfterSpouse = 1 - spouseShare;
      const motherShare = residueAfterSpouse / 3;
      heirs.push({ name:"Mother", icon:"👵", count:1, totalShare:motherShare, perPersonShare:motherShare, fraction:"1/3 of residue", note:"Umariyyatain — 1/3 of what remains after spouse share", type:"fixed" });
      totalFixed += motherShare;
    } else if (hasChild || sibCount >= 2) {
      addFixed("Mother", "👵", 1, 1, 6, hasChild ? "1/6 — children present" : "1/6 — 2 or more siblings present");
    } else {
      addFixed("Mother", "👵", 1, 1, 3, "1/3 — no children, fewer than 2 siblings");
    }
  }

  // Paternal Grandfather (when no father)
  if (effPatGF && hasChild) {
    addFixed("Paternal Grandfather", "👴", 1, 1, 6, "1/6 — children present, no father (acts as father)");
  }

  // Maternal Grandmother (when no mother)
  if (effMatGM) {
    addFixed("Maternal Grandmother", "👵", 1, 1, 6, "1/6 — no mother present");
  }

  // Daughters (when no sons)
  if (hasDaughter && !hasSon) {
    const n = (daughters||0)===1 ? 1 : 2, d = (daughters||0)===1 ? 2 : 3;
    addFixed(`Daughter${(daughters||0)>1?"s":""}`, "👧", daughters||0, n, d,
      (daughters||0)===1 ? "1/2 — sole daughter, no sons" : `2/3 shared — ${daughters} daughters, no sons`);
  }

  // Full Sisters (when no children, no father, no brothers as asabah)
  if (effFS > 0 && effFB === 0 && !hasSon && !father && !effPatGF) {
    if (!hasDaughter) {
      const n = effFS===1 ? 1 : 2, d = effFS===1 ? 2 : 3;
      addFixed(`Full Sister${effFS>1?"s":""}`, "👩", effFS, n, d,
        effFS===1 ? "1/2 — sole full sister, no brothers, no children, no father" : "2/3 shared — 2+ full sisters");
    }
  }

  // Uterine Siblings (half-siblings via mother only — no children, no father)
  if (effUterine > 0) {
    const n = effUterine===1 ? 1 : 1, d = effUterine===1 ? 6 : 3;
    addFixed(`Uterine Sibling${effUterine>1?"s":""}`, "👤", effUterine, n, d,
      effUterine===1 ? "1/6 — sole uterine sibling" : "1/3 shared — 2+ uterine siblings");
  }

  // ── Residue (Asabah) ──────────────────────────────────────────────────
  let residue = Math.max(0, 1 - totalFixed);
  const hasAsabah = hasSon || (father && !hasChild) || (effPatGF && !hasChild) || (effFB > 0) || (effHBP > 0) ||
                    (hasDaughter && effFS > 0) || (hasDaughter && effFB === 0 && effFS === 0 && father && !hasSon);

  if (hasSon) {
    // Sons + daughters together as asabah
    const totalParts = (sons||0)*2 + (hasDaughter ? (daughters||0) : 0);
    const sonTotal = ((sons||0)*2/totalParts) * residue;
    const daTotal  = hasDaughter ? ((daughters||0)/totalParts) * residue : 0;
    heirs.push({ name:`Son${(sons||0)>1?"s":""}`, icon:"👦", count:sons||0, totalShare:sonTotal, perPersonShare:sonTotal/(sons||0), fraction:"Residue", note:`Asabah — son gets 2× daughter's share${hasDaughter?" (combined residue)":""}`, type:"asabah" });
    if (hasDaughter) {
      heirs.push({ name:`Daughter${(daughters||0)>1?"s":""}`, icon:"👧", count:daughters||0, totalShare:daTotal, perPersonShare:daTotal/(daughters||0), fraction:"Residue", note:"Asabah with sons — daughter gets 1× share (son gets 2×)", type:"asabah" });
    }
  } else if (father && !hasChild) {
    // Father gets residue
    const fIdx = heirs.findIndex(h => h.name === "Father");
    if (fIdx >= 0) {
      heirs[fIdx].totalShare += residue;
      heirs[fIdx].perPersonShare += residue;
      heirs[fIdx].note += " + residue (no children)";
    } else {
      heirs.push({ name:"Father", icon:"👴", count:1, totalShare:residue, perPersonShare:residue, fraction:"Residue", note:"Asabah — no children, no son above", type:"asabah" });
    }
  } else if (effPatGF && !hasChild && !father) {
    // Grandfather gets residue
    const gfIdx = heirs.findIndex(h => h.name==="Paternal Grandfather");
    if (gfIdx >= 0) {
      heirs[gfIdx].totalShare += residue;
      heirs[gfIdx].perPersonShare += residue;
      heirs[gfIdx].note += " + residue (no father, no children)";
    } else {
      heirs.push({ name:"Paternal Grandfather", icon:"👴", count:1, totalShare:residue, perPersonShare:residue, fraction:"Residue", note:"Asabah — no father, no children", type:"asabah" });
    }
  } else if (effFB > 0) {
    // Full brothers + sisters as asabah
    const totalParts = effFB*2 + effFS;
    const bTotal = (effFB*2/totalParts)*residue;
    const sTotal = effFS > 0 ? (effFS/totalParts)*residue : 0;
    heirs.push({ name:`Full Brother${effFB>1?"s":""}`, icon:"👱", count:effFB, totalShare:bTotal, perPersonShare:bTotal/effFB, fraction:"Residue", note:"Asabah — no father, no children", type:"asabah" });
    if (effFS > 0) {
      const fsIdx = heirs.findIndex(h => h.name.startsWith("Full Sister"));
      if (fsIdx >= 0) { heirs[fsIdx].totalShare = sTotal; heirs[fsIdx].perPersonShare = sTotal/effFS; heirs[fsIdx].note = "Asabah with full brothers"; }
      else heirs.push({ name:`Full Sister${effFS>1?"s":""}`, icon:"👩", count:effFS, totalShare:sTotal, perPersonShare:sTotal/effFS, fraction:"Residue", note:"Asabah with full brothers — sister gets 1× (brother gets 2×)", type:"asabah" });
    }
  } else if (effHBP > 0 && effFB === 0) {
    // Paternal half-brothers + sisters
    const totalParts = effHBP*2 + effHSP;
    const bTotal = (effHBP*2/totalParts)*residue;
    const sTotal = effHSP > 0 ? (effHSP/totalParts)*residue : 0;
    heirs.push({ name:`Half-Brother${effHBP>1?"s":" (Paternal)"}`, icon:"👱", count:effHBP, totalShare:bTotal, perPersonShare:bTotal/effHBP, fraction:"Residue", note:"Asabah — paternal half-brothers, no full brothers", type:"asabah" });
    if (effHSP > 0) heirs.push({ name:`Half-Sister${effHSP>1?"s":" (Paternal)"}`, icon:"👩", count:effHSP, totalShare:sTotal, perPersonShare:sTotal/effHSP, fraction:"Residue", note:"Asabah with paternal half-brothers", type:"asabah" });
  } else if (hasDaughter && effFS > 0 && !hasSon && !father && !effPatGF && effFB===0) {
    // Full sisters become asabah with daughters (asabah bil-ghair)
    const fsIdx = heirs.findIndex(h => h.name.startsWith("Full Sister"));
    if (fsIdx >= 0) { heirs[fsIdx].totalShare = residue; heirs[fsIdx].perPersonShare = residue/effFS; heirs[fsIdx].note = "Asabah with daughters (asabah bil-ghair)"; heirs[fsIdx].type = "asabah"; }
    else heirs.push({ name:`Full Sister${effFS>1?"s":""}`, icon:"👩", count:effFS, totalShare:residue, perPersonShare:residue/effFS, fraction:"Residue", note:"Asabah with daughters (asabah bil-ghair)", type:"asabah" });
  }

  // ── Total check & Awl / Radd ──────────────────────────────────────────
  let totalActual = heirs.reduce((s,h) => s+h.totalShare, 0);
  let needsAwl = false, needsRadd = false, awlNote = "", raddNote = "";
  const asabahPresent = heirs.some(h => h.type === "asabah");

  if (totalActual > 1.0001) {
    // AWL: scale down all shares proportionally
    needsAwl = true;
    awlNote = `Total fixed shares exceeded 1 (${(totalActual*100).toFixed(1)}%). Shares scaled down proportionally (Awl principle).`;
    heirs = heirs.map(h => ({ ...h, totalShare: h.totalShare/totalActual, perPersonShare: h.perPersonShare/totalActual }));
    totalActual = 1;
  } else if (totalActual < 0.9999 && !asabahPresent && heirs.length > 0) {
    // RADD: return remainder to non-spouse heirs proportionally
    needsRadd = true;
    const nonSpouse = heirs.filter(h => h.name!=="Husband" && !h.name.startsWith("Wife"));
    const nonSpouseTotal = nonSpouse.reduce((s,h) => s+h.totalShare, 0);
    const remainder = 1 - totalActual;
    raddNote = `Remainder (${(remainder*100).toFixed(1)}%) returned to non-spouse heirs proportionally (Radd principle).`;
    heirs = heirs.map(h => {
      if (h.name==="Husband" || h.name.startsWith("Wife")) return h;
      const extra = nonSpouseTotal > 0 ? (h.totalShare/nonSpouseTotal)*remainder : 0;
      return { ...h, totalShare: h.totalShare+extra, perPersonShare: (h.totalShare+extra)/h.count };
    });
    totalActual = heirs.reduce((s,h) => s+h.totalShare, 0);
  }

  // ── Monetary amounts ──────────────────────────────────────────────────
  const result = heirs.map(h => ({
    ...h,
    totalAmount: h.totalShare * estateNet,
    perPersonAmount: h.perPersonShare * estateNet,
    pct: (h.totalShare * 100).toFixed(2),
  }));

  return { estateGross:estateGross||0, debts:debts||0, funeralCosts:funeralCosts||0, estateNet, heirs:result, blocked, needsAwl, needsRadd, awlNote, raddNote };
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:22, marginBottom:14, boxShadow:T.shadow, ...style }}>{children}</div>
);
const CardTitle = ({ icon, children }) => (
  <div style={{ fontSize:13, fontWeight:700, color:T.text2, marginBottom:16, display:"flex", alignItems:"center", gap:7, textTransform:"uppercase", letterSpacing:"0.6px" }}>
    {icon && <span style={{ fontSize:16 }}>{icon}</span>}{children}
  </div>
);
const Label = ({ children }) => <div style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6 }}>{children}</div>;
const AlertBox = ({ type="info", children }) => {
  const c={info:{bg:"#EEF6FF",border:"#BFDBFE",text:"#1E40AF"},warn:{bg:"#FFFBEB",border:"#FDE68A",text:"#92400E"},green:{bg:T.successLight,border:"#A7F3D0",text:T.success},danger:{bg:T.dangerLight,border:"#FCA5A5",text:T.danger}}[type];
  return <div style={{ padding:"10px 13px", borderRadius:T.radiusSm, fontSize:12, lineHeight:1.6, marginBottom:8, background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>{children}</div>;
};
const IslamicDivider = () => (
  <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 20px" }}>
    <div style={{ flex:1, height:1, background:T.border }}/>
    <svg width="20" height="20" viewBox="0 0 20 20">{[0,45,90,135].map(a=><g key={a} transform={`rotate(${a} 10 10)`}><rect x="9.2" y="1" width="1.6" height="18" rx="0.8" fill={T.border}/></g>)}<circle cx="10" cy="10" r="2.5" fill={T.border}/></svg>
    <div style={{ flex:1, height:1, background:T.border }}/>
  </div>
);

// Number stepper component
const Stepper = ({ label, value, onChange, min=0, max=20, hint }) => (
  <div style={{ padding:"13px 14px", background:"#F7FAF8", border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: hint ? 4 : 0 }}>
      <span style={{ fontSize:13, fontWeight:600, color:T.text1 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <button onClick={() => onChange(Math.max(min, value-1))}
          style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.border}`, background:T.surface, color:T.text1, fontSize:16, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
        <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:T.brand, minWidth:28, textAlign:"center" }}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value+1))}
          style={{ width:30, height:30, borderRadius:"50%", border:`1px solid ${T.brand}`, background:T.brandLight, color:T.brand, fontSize:16, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
      </div>
    </div>
    {hint && <div style={{ fontSize:11, color:T.text3, marginTop:2 }}>{hint}</div>}
  </div>
);

// Toggle (yes/no)
const Toggle = ({ label, value, onChange, hint, disabled=false }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 14px", background: disabled ? "#F0F0F0" : value ? T.brandLight : "#F7FAF8", border:`1px solid ${disabled ? T.border : value ? T.brand+"55" : T.border}`, borderRadius:T.radiusSm, opacity: disabled ? 0.5 : 1 }}>
    <div>
      <div style={{ fontSize:13, fontWeight:600, color:T.text1 }}>{label}</div>
      {hint && <div style={{ fontSize:11, color:T.text3, marginTop:2 }}>{hint}</div>}
    </div>
    <button onClick={() => !disabled && onChange(!value)}
      style={{ width:44, height:24, borderRadius:12, border:"none", cursor: disabled ? "not-allowed" : "pointer", position:"relative", background: value ? T.brand : "#D1D5DB", transition:"background 0.2s" }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: value ? 23 : 3, transition:"left 0.2s" }}/>
    </button>
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
const AdPostResult = () => (
  <div style={{ margin:"0 0 16px" }}>
    <div style={{ height:100, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Advertisement — Post Result</span>
    </div>
  </div>
);
const AdMobileRect = ({ show }) => !show ? null : (
  <div style={{ display:"flex", justifyContent:"center", margin:"0 0 14px" }}>
    <div style={{ width:300, height:250, background:"#F0F4F2", border:`1px dashed ${T.border}`, borderRadius:T.radiusSm, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
      <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Ad Space — Mobile 300×250</span>
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

const COUNTRIES = {
  MY:{ name:"Malaysia",  flag:"🇲🇾", sym:"RM",  authority:"Jabatan Kehakiman Syariah Malaysia (JKSM)", authorityUrl:"https://www.jksm.gov.my" },
  SG:{ name:"Singapore", flag:"🇸🇬", sym:"S$",  authority:"Syariah Court Singapore / MUIS",            authorityUrl:"https://www.syariahcourt.gov.sg" },
  ID:{ name:"Indonesia", flag:"🇮🇩", sym:"Rp",  authority:"Pengadilan Agama / Kompilasi Hukum Islam",  authorityUrl:"https://www.badilag.mahkamahagung.go.id" },
  OTHER:{ name:"Other",  flag:"🌍", sym:"$",    authority:"Consult your local Syariah authority",       authorityUrl:null },
};

const COLORS = ["#0A7C4E","#9B7B2E","#1D4ED8","#7E22CE","#B91C1C","#0F766E","#B45309","#15803D","#1E40AF","#92400E","#1D4ED8","#4D7C0F"];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function FaraidCalculator() {
  const [countryKey,      setCK]  = useState("MY");
  const [deceasedGender,  setDG]  = useState("M");
  const [estateGross,     setEG]  = useState("");
  const [debts,           setDbt] = useState("");
  const [funeralCosts,    setFC]  = useState("");
  const [husband,         setH]   = useState(false);
  const [wives,           setW]   = useState(0);
  const [sons,            setSn]  = useState(0);
  const [daughters,       setDa]  = useState(0);
  const [father,          setFa]  = useState(false);
  const [mother,          setMo]  = useState(false);
  const [patGrandfather,  setPGF] = useState(false);
  const [matGrandmother,  setMGM] = useState(false);
  const [fullBrothers,    setFB]  = useState(0);
  const [fullSisters,     setFS]  = useState(0);
  const [halfBrothersPat, setHBP] = useState(0);
  const [halfSistersPat,  setHSP] = useState(0);
  const [uterineSiblings, setUS]  = useState(0);
  const [result,          setRes] = useState(null);
  const [isMobile,        setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < 880);
  const resultsRef = useRef(null);

  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 880);
    window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn);
  }, []);

  const country = COUNTRIES[countryKey];
  const fmt = n => new Intl.NumberFormat("en-MY", { minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);
  const fmtC = n => {
    if (countryKey==="ID" && n>=1e9) return (n/1e9).toFixed(2)+"M";
    if (n>=1e6) return (n/1e6).toFixed(2)+"M";
    if (n>=1e3) return (n/1e3).toFixed(1)+"K";
    return fmt(n);
  };

  const doCalc = () => {
    const r = calculateFaraid({ deceasedGender, estateGross:parseFloat(String(estateGross).replace(/,/g,""))||0, debts:parseFloat(String(debts).replace(/,/g,""))||0, funeralCosts:parseFloat(String(funeralCosts).replace(/,/g,""))||0, husband, wives, sons, daughters, father, mother, patGrandfather, matGrandmother, fullBrothers, fullSisters, halfBrothersPat, halfSistersPat, uterineSiblings });
    setRes(r);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
  };

  const resetAll = () => {
    setEG(""); setDbt(""); setFC(""); setH(false); setW(0); setSn(0); setDa(0);
    setFa(false); setMo(false); setPGF(false); setMGM(false);
    setFB(0); setFS(0); setHBP(0); setHSP(0); setUS(0); setRes(null);
  };

  const hasAnyHeir = husband||wives>0||sons>0||daughters>0||father||mother||patGrandfather||matGrandmother||fullBrothers>0||fullSisters>0||halfBrothersPat>0||halfSistersPat>0||uterineSiblings>0;

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
              📜 HalalCalc.com — Islamic Finance Tools
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize: isMobile ? "2rem" : "2.8rem", fontWeight:400, margin:"0 0 8px", lineHeight:1.15, color:"#fff" }}>
              Faraid Inheritance Calculator
            </h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.75)", maxWidth:520, marginTop:8, lineHeight:1.6 }}>
              Calculate the Islamic distribution of an estate according to Shariah law (Shafi'i madhab) — the official school of jurisprudence in Malaysia, Singapore &amp; Indonesia.
            </p>
          </div>
        </div>

        <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"center" }}>
          <AdLeaderboard/>
        </div>

        <div style={{ maxWidth: isMobile ? "100%" : 1040, margin:"0 auto", padding: isMobile ? "20px 16px" : "28px 28px" }}>

          <AlertBox type="warn">
            ⚠ <strong>Important disclaimer:</strong> This calculator is for educational guidance only. For a legally binding Faraid ruling and estate distribution, consult a certified Syariah lawyer or your local Syariah Court. Estate distribution errors have real legal and family consequences.
          </AlertBox>

          <div style={{ display: isMobile ? "block" : "flex", gap:28, alignItems:"flex-start" }}>

            {/* Main column */}
            <div style={{ flex:1, minWidth:0 }}>

              {/* Country */}
              <Card>
                <CardTitle icon="🌏">Jurisdiction</CardTitle>
                <div style={{ display:"flex", gap:8, flexWrap: isMobile ? "wrap" : "nowrap", marginBottom:14 }}>
                  {Object.entries(COUNTRIES).map(([k,c]) => (
                    <button key={k} onClick={() => setCK(k)}
                      style={{ flex:1, minWidth: isMobile ? "calc(50% - 4px)" : "auto", padding:"11px 8px", borderRadius:T.radiusSm, border:`1.5px solid ${countryKey===k ? T.brand : T.border}`, background: countryKey===k ? T.brandLight : T.surface, cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ fontSize:22, marginBottom:3 }}>{c.flag}</div>
                      <div style={{ fontSize:11, fontWeight:700, color: countryKey===k ? T.brand : T.text3 }}>{c.name}</div>
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 13px", background:"#F7FAF8", border:`1px solid ${T.border}`, borderRadius:T.radiusXs }}>
                  <span style={{ fontSize:12, fontWeight:600, color:T.text2 }}>🏛 {country.authority}</span>
                  {country.authorityUrl && <a href={country.authorityUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, fontWeight:700, color:T.brand, textDecoration:"none", background:T.brandLight, padding:"4px 10px", borderRadius:20 }}>Official Site ↗</a>}
                </div>
              </Card>

              {/* Deceased & Estate */}
              <Card>
                <CardTitle icon="📋">Estate Details</CardTitle>

                <div style={{ marginBottom:14 }}>
                  <Label>Deceased Was</Label>
                  <div style={{ display:"flex", gap:8 }}>
                    {[["M","👨 Male"],["F","👩 Female"]].map(([v,l]) => (
                      <button key={v} onClick={() => { setDG(v); setH(false); setW(0); setRes(null); }}
                        style={{ flex:1, padding:"11px 0", borderRadius:T.radiusSm, border:`1.5px solid ${deceasedGender===v ? T.brand : T.border}`, background: deceasedGender===v ? T.brandLight : T.surface, color: deceasedGender===v ? T.brand : T.text3, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap:12 }}>
                  {[
                    { label:"Total Estate Value", state:estateGross, set:setEG, note:"Gross before deductions" },
                    { label:"Outstanding Debts", state:debts, set:setDbt, note:"Loans, bills, etc." },
                    { label:"Funeral & Burial Costs", state:funeralCosts, set:setFC, note:"Janazah & burial expenses" },
                  ].map((f,i) => (
                    <div key={i}>
                      <Label>{f.label}</Label>
                      <div style={{ display:"flex", alignItems:"stretch", border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, overflow:"hidden" }}>
                        <div style={{ padding:"10px 10px", background:T.brandLight, color:T.brand, fontSize:13, fontWeight:700, borderRight:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{country.sym}</div>
                        <input type="number" min="0" placeholder="0" value={f.state}
                          onChange={e => { f.set(e.target.value); setRes(null); }}
                          style={{ flex:1, border:"none", outline:"none", padding:"10px 12px", fontSize:14, color:T.text1, background:"transparent", minWidth:0 }}/>
                      </div>
                      <div style={{ fontSize:11, color:T.text3, marginTop:3 }}>{f.note}</div>
                    </div>
                  ))}
                </div>

                {/* Net estate display */}
                {(parseFloat(estateGross)||0) > 0 && (
                  <div style={{ marginTop:14, padding:"12px 16px", background:T.goldLight, border:`1px solid #E8D9A0`, borderRadius:T.radiusSm, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#7A6020" }}>Net Distributable Estate</div>
                    <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:T.gold }}>
                      {country.sym} {fmt(Math.max(0, (parseFloat(estateGross)||0)-(parseFloat(debts)||0)-(parseFloat(funeralCosts)||0)))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Heirs */}
              <Card>
                <CardTitle icon="👨‍👩‍👧‍👦">Surviving Heirs</CardTitle>
                <AlertBox type="info">Only include heirs who were alive at the time of death. Leave at zero or off for deceased or absent relatives.</AlertBox>

                {/* Spouse */}
                <div style={{ fontSize:12, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8, marginTop:4 }}>Spouse</div>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:8, marginBottom:14 }}>
                  {deceasedGender === "F"
                    ? <Toggle label="Husband" value={husband} onChange={v => { setH(v); setRes(null); }} hint="Did the deceased leave behind a husband?"/>
                    : <Stepper label="Number of Wives" value={wives} onChange={v => { setW(v); setRes(null); }} max={4} hint="Islam permits up to 4 wives — they share the wife's portion equally"/>
                  }
                  <div style={{ padding:"13px 14px", background:"#F0F4F2", border:`1px solid ${T.border}`, borderRadius:T.radiusSm, display:"flex", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:T.text3, lineHeight:1.5 }}>
                      {deceasedGender==="F" ? "👨 Husband receives 1/2 (no children) or 1/4 (with children)" : `👩 Wife/wives share 1/4 (no children) or 1/8 (with children) equally`}
                    </span>
                  </div>
                </div>

                {/* Children */}
                <div style={{ fontSize:12, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>Children</div>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:8, marginBottom:14 }}>
                  <Stepper label="👦 Sons" value={sons} onChange={v => { setSn(v); setRes(null); }} hint="Each son receives 2× a daughter's share"/>
                  <Stepper label="👧 Daughters" value={daughters} onChange={v => { setDa(v); setRes(null); }} hint="Sole daughter: 1/2. Two or more daughters: 2/3 shared (when no sons)"/>
                </div>

                {/* Parents */}
                <div style={{ fontSize:12, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>Parents</div>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:8, marginBottom:14 }}>
                  <Toggle label="👴 Father" value={father} onChange={v => { setFa(v); setRes(null); }} hint="1/6 with children; full residue otherwise"/>
                  <Toggle label="👵 Mother" value={mother} onChange={v => { setMo(v); setRes(null); }} hint="1/6 with children or 2+ siblings; 1/3 otherwise"/>
                </div>

                {/* Grandparents */}
                <div style={{ fontSize:12, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>Grandparents (when parent is absent)</div>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:8, marginBottom:14 }}>
                  <Toggle label="👴 Paternal Grandfather" value={patGrandfather} onChange={v => { setPGF(v); setRes(null); }} disabled={!!father} hint={father ? "Blocked by Father" : "Steps into father's role when father is absent"}/>
                  <Toggle label="👵 Maternal Grandmother" value={matGrandmother} onChange={v => { setMGM(v); setRes(null); }} disabled={!!mother} hint={mother ? "Blocked by Mother" : "Receives 1/6 when mother is absent"}/>
                </div>

                {/* Siblings */}
                <div style={{ fontSize:12, fontWeight:700, color:T.text3, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>Siblings (blocked if children or father are present)</div>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:8, marginBottom:8 }}>
                  <Stepper label="👱 Full Brothers" value={fullBrothers} onChange={v => { setFB(v); setRes(null); }}/>
                  <Stepper label="👩 Full Sisters"  value={fullSisters}  onChange={v => { setFS(v); setRes(null); }}/>
                  <Stepper label="👱 Half-Brothers (Paternal)" value={halfBrothersPat} onChange={v => { setHBP(v); setRes(null); }}/>
                  <Stepper label="👩 Half-Sisters (Paternal)"  value={halfSistersPat}  onChange={v => { setHSP(v); setRes(null); }}/>
                </div>
                <Stepper label="👤 Uterine Siblings (Maternal Half)" value={uterineSiblings} onChange={v => { setUS(v); setRes(null); }} hint="Siblings via mother only — 1/6 (one) or 1/3 shared (two or more); blocked by children and father"/>
              </Card>

              {/* Mobile ad */}
              <AdMobileRect show={isMobile}/>

              {/* Calculate */}
              <button onClick={doCalc} disabled={!hasAnyHeir}
                style={{ width:"100%", padding:"15px 0", background: hasAnyHeir ? T.brand : "#9CA3AF", color:"#fff", border:"none", borderRadius:T.radiusSm, fontSize:15, fontWeight:700, cursor: hasAnyHeir ? "pointer" : "not-allowed", boxShadow: hasAnyHeir ? `0 4px 16px rgba(10,124,78,0.3)` : "none", transition:"all 0.15s" }}
                onMouseEnter={e => { if (hasAnyHeir) { e.target.style.background=T.brandDark; e.target.style.transform="translateY(-1px)"; }}}
                onMouseLeave={e => { if (hasAnyHeir) { e.target.style.background=T.brand; e.target.style.transform="translateY(0)"; }}}>
                Calculate Faraid Distribution 📜
              </button>
              {!hasAnyHeir && <div style={{ fontSize:11, color:T.text3, textAlign:"center", marginTop:6 }}>Please add at least one surviving heir above.</div>}

              {/* Results */}
              {result && (
                <div ref={resultsRef} style={{ marginTop:24 }}>
                  <IslamicDivider/>
                  <AdPostResult/>

                  {/* Estate summary */}
                  <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:9, marginBottom:14 }}>
                    {[
                      { v:fmt(result.estateGross),    l:"Gross Estate",     sym:country.sym },
                      { v:fmt(result.debts),           l:"Debts Deducted",   sym:country.sym },
                      { v:fmt(result.funeralCosts),    l:"Funeral Costs",    sym:country.sym },
                      { v:fmt(result.estateNet),       l:"Net for Distribution", sym:country.sym, highlight:true },
                    ].map((s,i) => (
                      <div key={i} style={{ background: s.highlight ? T.goldLight : T.surface, border:`1px solid ${s.highlight ? "#E8D9A0" : T.border}`, borderRadius:T.radiusSm, padding:"13px 14px", boxShadow:T.shadow }}>
                        <div style={{ fontSize:10, color: s.highlight ? "#7A6020" : T.text3, fontWeight:700, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.4px" }}>{s.l}</div>
                        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color: s.highlight ? T.gold : T.text1 }}>
                          <span style={{ fontSize:11, color: s.highlight ? "#7A6020" : T.text3 }}>{s.sym} </span>{s.v}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Awl / Radd notices */}
                  {result.needsAwl  && <AlertBox type="warn">⚖ <strong>Awl applied:</strong> {result.awlNote}</AlertBox>}
                  {result.needsRadd && <AlertBox type="info">↩ <strong>Radd applied:</strong> {result.raddNote}</AlertBox>}

                  {/* Blocked heirs */}
                  {result.blocked.length > 0 && (
                    <AlertBox type="danger">
                      🚫 <strong>Blocked (Mahjub) heirs — receive nothing:</strong><br/>
                      {result.blocked.map((b,i) => <span key={i}>• {b}<br/></span>)}
                    </AlertBox>
                  )}

                  {/* Main distribution card */}
                  <Card>
                    <CardTitle icon="⚖️">Estate Distribution</CardTitle>

                    {/* Donut-style visual */}
                    <div style={{ marginBottom:20 }}>
                      <div style={{ height:8, borderRadius:4, overflow:"hidden", display:"flex", marginBottom:16 }}>
                        {result.heirs.map((h,i) => (
                          <div key={i} style={{ width:`${h.totalShare*100}%`, background:COLORS[i%COLORS.length], transition:"width 0.4s ease" }}/>
                        ))}
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                        {result.heirs.map((h,i) => (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                            <div style={{ width:10, height:10, borderRadius:"50%", background:COLORS[i%COLORS.length], flexShrink:0 }}/>
                            <span style={{ fontSize:11, color:T.text2, fontWeight:600 }}>{h.icon} {h.name} ({h.pct}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Per-heir rows */}
                    {result.heirs.map((h,i) => (
                      <div key={i} style={{ marginBottom:14, padding:"14px 16px", background: i===0 ? T.goldLight : T.bg, border:`1px solid ${i===0 ? "#E8D9A0" : T.border}`, borderRadius:T.radiusSm }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:20 }}>{h.icon}</span>
                            <div>
                              <div style={{ fontSize:14, fontWeight:700, color:T.text1 }}>{h.name}</div>
                              <div style={{ fontSize:11, color:T.text3, marginTop:1 }}>{h.note}</div>
                            </div>
                          </div>
                          <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color: i===0 ? T.gold : T.brand }}>
                              {h.pct}%
                            </div>
                            <div style={{ fontSize:10, color:T.text3 }}>{h.fraction}</div>
                          </div>
                        </div>
                        <div style={{ height:4, background:"#E8EDE9", borderRadius:2, overflow:"hidden", marginBottom:10 }}>
                          <div style={{ height:"100%", width:`${h.totalShare*100}%`, background:COLORS[i%COLORS.length], borderRadius:2 }}/>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                          <div style={{ background:T.surface, borderRadius:T.radiusXs, padding:"9px 12px", border:`1px solid ${T.border}` }}>
                            <div style={{ fontSize:10, color:T.text3, fontWeight:700, marginBottom:3, textTransform:"uppercase" }}>
                              {h.count > 1 ? `Share (${h.count} persons total)` : "Total Share"}
                            </div>
                            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color:T.text1 }}>
                              {country.sym} {fmt(h.totalAmount)}
                            </div>
                          </div>
                          <div style={{ background:T.surface, borderRadius:T.radiusXs, padding:"9px 12px", border:`1px solid ${T.border}` }}>
                            <div style={{ fontSize:10, color:T.text3, fontWeight:700, marginBottom:3, textTransform:"uppercase" }}>Per Person</div>
                            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color: i===0 ? T.gold : T.brand }}>
                              {country.sym} {fmt(h.perPersonAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card>

                  {/* Estate distribution table */}
                  <Card>
                    <CardTitle icon="📊">Summary Table</CardTitle>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                        <thead>
                          <tr style={{ borderBottom:`2px solid ${T.border}` }}>
                            {["Heir","Count","Share","% of Estate","Total Amount","Per Person"].map(h => (
                              <th key={h} style={{ padding:"8px 6px", textAlign: h==="Heir"?"left":"right", color:T.text3, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.heirs.map((h,i) => (
                            <tr key={i} style={{ background: i%2===0 ? T.bg : T.surface, borderBottom:`1px solid ${T.border}` }}>
                              <td style={{ padding:"8px 6px", fontWeight:600, color:T.text1 }}>{h.icon} {h.name}</td>
                              <td style={{ padding:"8px 6px", textAlign:"right", color:T.text3 }}>{h.count}</td>
                              <td style={{ padding:"8px 6px", textAlign:"right", color:T.text2 }}>{h.fraction}</td>
                              <td style={{ padding:"8px 6px", textAlign:"right", fontWeight:700, color: h.type==="asabah" ? T.brand : T.gold }}>{h.pct}%</td>
                              <td style={{ padding:"8px 6px", textAlign:"right", fontWeight:700, color:T.text1 }}>{country.sym} {fmt(h.totalAmount)}</td>
                              <td style={{ padding:"8px 6px", textAlign:"right", color:T.text2 }}>{country.sym} {fmt(h.perPersonAmount)}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop:`2px solid ${T.border}`, background:T.goldLight }}>
                            <td colSpan={3} style={{ padding:"8px 6px", fontWeight:800, color:T.gold }}>Total</td>
                            <td style={{ padding:"8px 6px", textAlign:"right", fontWeight:800, color:T.gold }}>100%</td>
                            <td style={{ padding:"8px 6px", textAlign:"right", fontWeight:800, color:T.gold }}>{country.sym} {fmt(result.estateNet)}</td>
                            <td style={{ padding:"8px 6px", textAlign:"right", color:T.text3 }}>—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Next steps */}
                  <Card>
                    <CardTitle icon="📌">Next Steps</CardTitle>
                    <div style={{ display:"grid", gap:8 }}>
                      {[
                        { step:"1", text:`Get a certified Faraid certificate from ${countryKey==="MY"?"the Syariah Court or a registered Syariah lawyer":countryKey==="SG"?"the Syariah Court of Singapore":countryKey==="ID"?"the Pengadilan Agama":"your local Syariah authority"}.` },
                        { step:"2", text:"Settle all outstanding debts and funeral expenses before distributing the estate." },
                        { step:"3", text:"If any heir is under 18 years of age, a guardian (wali) must be appointed to manage their share." },
                        { step:"4", text:"If any party disputes the distribution, seek mediation through the appropriate Syariah court." },
                      ].map((s,i) => (
                        <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:T.radiusSm }}>
                          <div style={{ width:24, height:24, borderRadius:"50%", background:T.brand, color:"#fff", fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{s.step}</div>
                          <div style={{ fontSize:12, color:T.text2, lineHeight:1.6 }}>{s.text}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <button onClick={resetAll}
                    style={{ width:"100%", padding:"12px 0", background:"transparent", color:T.text3, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, fontWeight:600, cursor:"pointer", marginTop:4 }}>
                    Reset Calculator
                  </button>
                </div>
              )}

              <div style={{ fontSize:11, color:T.text3, lineHeight:1.8, textAlign:"center", marginTop:24, padding:"0 8px" }}>
                This calculator follows the Shafi'i school of Islamic jurisprudence (the official madhab in Malaysia, Singapore &amp; Indonesia).<br/>
                Results are for guidance only. Always consult a certified Syariah lawyer for legally binding estate distribution.<br/>
                <a href="https://www.jksm.gov.my" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>JKSM Malaysia</a> ·&nbsp;
                <a href="https://www.syariahcourt.gov.sg" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>Syariah Court Singapore</a> ·&nbsp;
                <a href="https://www.badilag.mahkamahagung.go.id" target="_blank" rel="noopener noreferrer" style={{ color:T.brand }}>Pengadilan Agama Indonesia</a><br/>
              HalalCalc.com is an independent tool and is not affiliated with any bank, government body, or Islamic authority.
              </div>
            </div>

            {/* Sidebar — desktop only */}
            {!isMobile && (
              <div style={{ width:300, flexShrink:0, position:"sticky", top:20 }}>
                <AdSidebarRect/>

                <Card style={{ marginBottom:14 }}>
                  <CardTitle icon="📖">Faraid Quick Guide</CardTitle>
                  <div style={{ fontSize:12, lineHeight:1.8, color:T.text2 }}>
                    <div style={{ fontWeight:700, color:T.text1, marginBottom:4 }}>Order of Priority</div>
                    {["1. Settle debts & funeral costs first","2. Distribute to fixed-share heirs (Ashabul Furud)","3. Remainder to residuary heirs (Asabah)","4. Apply Awl or Radd if needed"].map((s,i)=>(
                      <div key={i} style={{ fontSize:11, color:T.text2, padding:"4px 0", borderBottom:`1px solid ${T.border}` }}>{s}</div>
                    ))}
                    <div style={{ fontWeight:700, color:T.text1, marginTop:10, marginBottom:4 }}>Key Principle</div>
                    <div style={{ fontSize:11, color:T.text2, lineHeight:1.6 }}>
                      A son generally receives double a daughter's share (<strong>للذكر مثل حظ الأنثيين</strong>). Fixed share holders take priority over residuary heirs.
                    </div>
                  </div>
                </Card>

                <Card style={{ marginBottom:14 }}>
                  <CardTitle icon="⚖️">Common Share Fractions</CardTitle>
                  {[
                    { heir:"Husband (no children)",   share:"1/2" },
                    { heir:"Husband (with children)", share:"1/4" },
                    { heir:"Wife/ves (no children)",  share:"1/4" },
                    { heir:"Wife/ves (with children)",share:"1/8" },
                    { heir:"Father (with children)",  share:"1/6" },
                    { heir:"Mother (with children)",  share:"1/6" },
                    { heir:"Sole Daughter",           share:"1/2" },
                    { heir:"Two or more Daughters",   share:"2/3" },
                  ].map((r,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${T.border}`, fontSize:11 }}>
                      <span style={{ color:T.text2 }}>{r.heir}</span>
                      <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:14, color:T.gold }}>{r.share}</span>
                    </div>
                  ))}
                </Card>

                <Card>
                  <CardTitle icon="🔧">More Tools</CardTitle>
                  {[{ name:"Zakat Calculator", icon:"☪" }, { name:"Home Financing Calculator", icon:"🏠" }, { name:"Savings Calculator", icon:"💰" }].map((t,i) => (
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
