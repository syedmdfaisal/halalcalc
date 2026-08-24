import { useState } from 'react'
const T = { bg:"#F4F7F5", surface:"#FFFFFF", border:"#DDE6E1", brand:"#0A7C4E", brandDark:"#075C39", brandLight:"#EAF4EE", text1:"#0C1E14", text2:"#3D5247", text3:"#7A9488", success:"#276749", successLight:"#F0FAF4", shadow:"0 1px 4px rgba(10,60,30,0.06), 0 4px 16px rgba(10,60,30,0.05)", radius:"14px", radiusSm:"8px" }

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" })

  const inputStyle = { width:"100%", border:`1.5px solid ${T.border}`, borderRadius:T.radiusSm, padding:"11px 14px", fontSize:14, color:T.text1, background:T.surface, outline:"none", boxSizing:"border-box", fontFamily:"'Inter',system-ui,sans-serif" }

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

        <div style={{ maxWidth:640, margin:"0 auto", padding:"48px 24px 80px" }}>
          <div style={{ background:T.brand, borderRadius:T.radius, padding:"40px 36px", marginBottom:32, color:"#fff" }}>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"2.4rem", fontWeight:400, margin:"0 0 12px", color:"#fff" }}>Contact Us</h1>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.8)", lineHeight:1.7 }}>
              Questions about a calculation? Found an error? Want to suggest a new tool? We'd love to hear from you.
            </p>
          </div>

          {sent ? (
            <div style={{ background:T.successLight, border:`1px solid #A7F3D0`, borderRadius:T.radius, padding:"32px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"1.5rem", color:T.success, marginBottom:8 }}>Message Sent</h2>
              <p style={{ fontSize:14, color:T.text2 }}>Jazakallah khair — we'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"28px", boxShadow:T.shadow }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6 }}>Your Name</div>
                  <input style={inputStyle} placeholder="Ahmad" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6 }}>Email Address</div>
                  <input style={inputStyle} type="email" placeholder="ahmad@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6 }}>Subject</div>
                <select style={{ ...inputStyle, cursor:"pointer" }} value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>
                  <option value="">Select a subject...</option>
                  <option>Question about Zakat Calculator</option>
                  <option>Question about Home Financing Calculator</option>
                  <option>Question about Savings Calculator</option>
                  <option>Question about Faraid Calculator</option>
                  <option>Reporting an error</option>
                  <option>Suggesting a new tool</option>
                  <option>Partnership or advertising enquiry</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6 }}>Message</div>
                <textarea style={{ ...inputStyle, height:140, resize:"vertical" }} placeholder="Your message..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
              </div>

              {/* 
                TO ACTIVATE THIS FORM:
                Replace this button's onClick with a real form submission.
                Recommended: Use Netlify Forms (free) — add name="contact" netlify to the form element.
                Or use Formspree.io — free tier handles 50 submissions/month.
              */}
              <button
                onClick={() => { if (form.name && form.email && form.message) setSent(true) }}
                style={{ width:"100%", padding:"14px", background:T.brand, color:"#fff", border:"none", borderRadius:T.radiusSm, fontSize:14, fontWeight:700, cursor:"pointer" }}
                onMouseEnter={e=>e.target.style.background=T.brandDark}
                onMouseLeave={e=>e.target.style.background=T.brand}>
                Send Message →
              </button>

              <div style={{ fontSize:11, color:T.text3, textAlign:"center", marginTop:14, lineHeight:1.7 }}>
                We aim to respond within 2 business days.<br/>
                HalalCalc.com is an independent tool and is not affiliated with any bank or Islamic authority.
              </div>
            </div>
          )}

          <div style={{ marginTop:24, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { icon:"🐛", title:"Found an error?", desc:"If you spot a calculation error or an incorrect ruling, please let us know. Accuracy matters deeply to us." },
              { icon:"💡", title:"Suggest a tool?", desc:"Have an idea for a new Islamic finance tool? We'd love to hear what would be most useful for your community." },
            ].map((c,i) => (
              <div key={i} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"18px", boxShadow:T.shadow }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{c.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:T.text1, marginBottom:5 }}>{c.title}</div>
                <div style={{ fontSize:12, color:T.text3, lineHeight:1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
