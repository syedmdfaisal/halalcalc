// ═══════════════════════════════════════════════════════════════════════════
//  HALALCALC.MY — CENTRALISED RATES CONFIGURATION
//  All profit rates, Nisab values, and financing rates live here.
//
//  HOW TO UPDATE:
//  1. Open this file
//  2. Change the relevant number(s) below
//  3. Update LAST_VERIFIED to today's date
//  4. Save → git push → Netlify auto-deploys in ~30 seconds
//
//  MAINTENANCE SCHEDULE:
//  ┌─────────────────────────────┬───────────────┬────────────────────────────────┐
//  │ What                        │ How Often     │ Where to Verify                │
//  ├─────────────────────────────┼───────────────┼────────────────────────────────┤
//  │ MY Nisab (gold/silver)      │ Jan & Jul     │ zakatselangor.com.my           │
//  │ SG Nisab                    │ Monthly       │ zakat.sg                       │
//  │ ID Nisab                    │ Annually      │ baznas.go.id                   │
//  │ MY Islamic FD rates         │ Monthly       │ ringgitplus.com (Islamic FD)   │
//  │ SG savings rates            │ Monthly       │ Each bank's app / website      │
//  │ ID deposito rates           │ Quarterly     │ BSI, Muamalat websites         │
//  │ MY home financing rates     │ Quarterly     │ iMoney.my / each bank          │
//  └─────────────────────────────┴───────────────┴────────────────────────────────┘
// ═══════════════════════════════════════════════════════════════════════════

// ── UPDATE THIS DATE every time you change anything below ──────────────────
export const LAST_VERIFIED = "22 May 2026";


// ── ZAKAT NISAB ────────────────────────────────────────────────────────────
export const NISAB = {
  MY: {
    goldGrams: 85, silverGrams: 595,
    goldNisabMYR: 29961,     // ← UPDATE biannually (Jan & Jul) from zakatselangor.com.my
    silverNisabMYR: 2677,    // ← UPDATE biannually from zakatselangor.com.my
    source: "Lembaga Zakat Selangor (Jan–Jun 2026)",
    verifyUrl: "https://www.zakatselangor.com.my",
  },
  SG: {
    goldGrams: 86, silverGrams: 600,
    goldNisabSGD: 12000,     // ← UPDATE monthly from zakat.sg
    silverNisabSGD: 800,     // ← UPDATE monthly from zakat.sg
    source: "MUIS (May 2026)",
    verifyUrl: "https://www.zakat.sg",
  },
  ID: {
    goldGrams: 85,
    nisabIDR: 91681728,      // ← UPDATE annually from baznas.go.id
    monthlyNisabIDR: 7640144,
    source: "BAZNAS SK 2026",
    verifyUrl: "https://baznas.go.id",
  },
};


// ── ISLAMIC FD & SAVINGS RATES ─────────────────────────────────────────────
export const SAVINGS_RATES = {
  MY: {
    contract: "Mudarabah (profit-sharing)",
    nisbah: "Typically 70–80% to customer / 20–30% to bank",
    protection: "PIDM — up to RM 250,000 per bank",
    protectionUrl: "https://www.pidm.gov.my",
    tenures: [1, 2, 3, 6, 9, 12, 24], defaultTenure: 12, minDeposit: 500,
    banks: [
      { name:"Maybank Islamic",    short:"Maybank",    color:"#f5a623", rates:{ 1:2.85, 2:2.90, 3:3.10, 6:3.15, 9:3.18, 12:3.20, 24:3.25 } }, // ← UPDATE monthly: maybank2u.com.my
      { name:"CIMB Islamic",       short:"CIMB",       color:"#e74c3c", rates:{ 1:2.80, 2:2.85, 3:3.05, 6:3.15, 9:3.18, 12:3.20, 24:3.22 } }, // ← UPDATE monthly: cimb.com.my
      { name:"Bank Islam",         short:"Bank Islam", color:"#27ae60", rates:{ 1:2.85, 2:2.90, 3:3.10, 6:3.20, 9:3.22, 12:3.25, 24:3.28 } }, // ← UPDATE monthly: bankislam.com
      { name:"RHB Islamic",        short:"RHB",        color:"#8e44ad", rates:{ 1:2.80, 2:2.85, 3:3.05, 6:3.15, 9:3.17, 12:3.20, 24:3.20 } }, // ← UPDATE monthly: rhbgroup.com
      { name:"MBSB Bank",          short:"MBSB",       color:"#2980b9", rates:{ 1:2.90, 2:2.95, 3:3.15, 6:3.25, 9:3.28, 12:3.30, 24:3.35 } }, // ← UPDATE monthly: mbsb.com.my
      { name:"Public Islamic Bank",short:"Public",     color:"#16a085", rates:{ 1:2.82, 2:2.88, 3:3.08, 6:3.18, 9:3.20, 12:3.22, 24:3.25 } }, // ← UPDATE monthly: publicislamicbank.com.my
    ],
  },
  SG: {
    contract: "FastSaver-i: Mudarabah · OCBC Al-Amin: Wadiah",
    nisbah: "Mudarabah: profit-sharing | Wadiah: guaranteed principal, no fixed return",
    protection: "SDIC — up to S$ 75,000 per bank",
    protectionUrl: "https://www.sdic.org.sg",
    tenures: [1, 3, 6, 12], defaultTenure: 12, minDeposit: 1000,
    note: "Singapore Islamic accounts are savings products, not fixed deposits. Rates are indicative and SORA-linked — they change monthly.",
    banks: [
      { name:"CIMB FastSaver-i",  short:"CIMB",    color:"#e74c3c", rates:{ 1:1.50, 3:1.50, 6:2.00, 12:2.88 }, conditions:"Up to 2.88% with salary crediting + card spend. Base: 1.50%." }, // ← UPDATE monthly: cimb.com.sg
      { name:"OCBC Al-Amin",      short:"OCBC",    color:"#27ae60", rates:{ 1:0.20, 3:0.20, 6:0.20, 12:0.20 }, conditions:"Wadiah — principal 100% guaranteed." },                          // ← UPDATE monthly: ocbc.com.sg
      { name:"Maybank Savings-i", short:"Maybank", color:"#f5a623", rates:{ 1:0.25, 3:0.25, 6:0.28, 12:0.30 }, conditions:"Basic Mudarabah savings account." },                            // ← UPDATE monthly: maybank2u.com.sg
    ],
  },
  ID: {
    contract: "Mudharabah Muthlaqah (profit-sharing)",
    nisbah: "Typically 50–65% to customer / 35–50% to bank",
    protection: "LPS — up to Rp 2 miliar per bank",
    protectionUrl: "https://www.lps.go.id",
    tenures: [1, 3, 6, 12, 24], defaultTenure: 12, minDeposit: 1000000,
    note: "Rates are indicative equivalent rates — actual returns depend on the bank's realised profits and agreed nisbah.",
    banks: [
      { name:"Bank Syariah Indonesia (BSI)", short:"BSI",         color:"#27ae60", rates:{ 1:5.25, 3:5.50, 6:5.75, 12:6.00, 24:6.00 } }, // ← UPDATE quarterly: bankbsi.co.id
      { name:"Bank Muamalat",               short:"Muamalat",     color:"#2980b9", rates:{ 1:5.00, 3:5.25, 6:5.50, 12:5.75, 24:5.75 } }, // ← UPDATE quarterly: bankmuamalat.co.id
      { name:"BCA Syariah",                 short:"BCA Syariah",  color:"#8e44ad", rates:{ 1:4.75, 3:5.00, 6:5.25, 12:5.50, 24:5.50 } }, // ← UPDATE quarterly: bcasyariah.co.id
      { name:"Bank Mega Syariah",           short:"Mega Syariah", color:"#e74c3c", rates:{ 1:5.00, 3:5.25, 6:5.50, 12:5.75, 24:5.75 } }, // ← UPDATE quarterly: megasyariah.co.id
    ],
  },
};


// ── ISLAMIC HOME FINANCING TYPICAL RATES ──────────────────────────────────
export const FINANCING_RATES = {
  MY:    { typical: 4.25 },  // ← UPDATE quarterly — verify at iMoney.my
  SG:    { typical: 3.75 },  // ← UPDATE quarterly — verify with MAS / banks
  ID:    { typical: 8.50 },  // ← UPDATE quarterly — follows BI Rate; verify with OJK
  OTHER: { typical: 5.00 },
};


// ═══════════════════════════════════════════════════════════════════════════
//  HOW TO USE IN YOUR NETLIFY PROJECT
//  ───────────────────────────────────
//  In each tool file, add at the top:
//
//    import { LAST_VERIFIED, NISAB, SAVINGS_RATES, FINANCING_RATES }
//      from '../config/rates.config.js';
//
//  Recommended folder structure:
//    src/
//    ├── config/
//    │   └── rates.config.js         ← this file (the only file you update)
//    ├── tools/
//    │   ├── ZakatCalculator.jsx
//    │   ├── IslamicHomeFinancing.jsx
//    │   └── IslamicSavingsCalculator.jsx
//    └── ...
// ═══════════════════════════════════════════════════════════════════════════
