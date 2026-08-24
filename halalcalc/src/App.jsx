import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import HomePage                  from './pages/HomePage'
import ZakatCalculator           from './pages/ZakatCalculator'
import IslamicHomeFinancing      from './pages/IslamicHomeFinancing'
import IslamicSavingsCalculator  from './pages/IslamicSavingsCalculator'
import FaraidCalculator          from './pages/FaraidCalculator'
import AboutPage                 from './pages/AboutPage'
import PrivacyPage               from './pages/PrivacyPage'
import ContactPage               from './pages/ContactPage'

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Update page title and meta description on route change for SEO
function MetaUpdater() {
  const { pathname } = useLocation()
  useEffect(() => {
    const metas = {
      '/':                    { title:'HalalCalc.com — Free Islamic Finance Calculators',                        desc:'Free Shariah-compliant financial calculators for Muslims in Malaysia, Singapore and Indonesia.' },
      '/zakat-calculator':    { title:'Zakat Calculator 2026 — Malaysia, Singapore & Indonesia | HalalCalc.com', desc:'Calculate your Zakat obligation based on official Nisab thresholds from JAKIM, MUIS and BAZNAS. Free, accurate and updated twice yearly.' },
      '/home-financing':      { title:'Islamic Home Financing Calculator — MM, BBA, Murabaha | HalalCalc.com',   desc:'Compare Shariah-compliant home financing structures for Malaysia, Singapore and Indonesia. Full amortisation schedule included.' },
      '/savings-calculator':  { title:'Islamic Savings & Fixed Deposit Calculator 2026 | HalalCalc.com',         desc:'Compare Mudarabah profit rates from 13 Islamic banks across Malaysia, Singapore and Indonesia. Updated monthly.' },
      '/faraid-calculator':   { title:'Faraid Inheritance Calculator — Shafi\'i Madhab | HalalCalc.com',         desc:'Calculate Islamic estate distribution according to Shafi\'i rulings. Covers all 15 heir categories including Awl and Radd.' },
      '/about':               { title:'About HalalCalc.com — Islamic Finance Tools for Southeast Asia',           desc:'Learn about HalalCalc.com — free, independent Shariah-compliant financial calculators for Muslims in Malaysia, Singapore and Indonesia.' },
      '/privacy':             { title:'Privacy Policy | HalalCalc.com',                                          desc:'HalalCalc.com privacy policy. All calculations run in your browser. No personal data is collected or stored.' },
      '/contact':             { title:'Contact Us | HalalCalc.com',                                              desc:'Contact the HalalCalc.com team.' },
    }
    const meta = metas[pathname] || metas['/']
    document.title = meta.title
    const descEl = document.querySelector('meta[name="description"]')
    if (descEl) descEl.setAttribute('content', meta.desc)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MetaUpdater />
      <Routes>
        <Route path="/"                   element={<HomePage />} />
        <Route path="/zakat-calculator"   element={<ZakatCalculator />} />
        <Route path="/home-financing"     element={<IslamicHomeFinancing />} />
        <Route path="/savings-calculator" element={<IslamicSavingsCalculator />} />
        <Route path="/faraid-calculator"  element={<FaraidCalculator />} />
        <Route path="/about"              element={<AboutPage />} />
        <Route path="/privacy"            element={<PrivacyPage />} />
        <Route path="/contact"            element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  )
}
