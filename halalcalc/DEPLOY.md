# HalalCalc.com — Deployment Guide

## What's in this project

```
halalcalc/
├── public/
│   ├── favicon.svg         ← Site icon
│   └── robots.txt          ← SEO crawler instructions
├── src/
│   ├── config/
│   │   └── rates.config.js ← UPDATE RATES HERE monthly
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ZakatCalculator.jsx
│   │   ├── IslamicHomeFinancing.jsx
│   │   ├── IslamicSavingsCalculator.jsx
│   │   ├── FaraidCalculator.jsx
│   │   ├── AboutPage.jsx
│   │   ├── PrivacyPage.jsx
│   │   └── ContactPage.jsx
│   ├── App.jsx             ← Router (links all pages together)
│   └── main.jsx            ← Entry point
├── index.html              ← SEO meta tags live here
├── package.json
├── vite.config.js
└── netlify.toml            ← Netlify build settings
```

---

## How to deploy on Netlify (step by step)

### Step 1 — Upload to GitHub
1. Create a free account at github.com if you don't have one
2. Create a new repository called "halalcalc"
3. Upload all these files into it

### Step 2 — Connect to Netlify
1. Go to netlify.com and log in
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub → select your "halalcalc" repository
4. Build settings are auto-detected from netlify.toml:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### Step 3 — Add your domain
1. Go to Site Settings → Domain Management
2. Add custom domain: halalcalc.com
3. Follow Netlify's instructions to update your domain's nameservers

### Step 4 — Before applying for AdSense
Make sure these pages are live:
- halalcalc.com/about ✓
- halalcalc.com/privacy ✓
- halalcalc.com/contact ✓

Then apply at adsense.google.com.

### Step 5 — Activate AdSense (after approval)
In index.html, uncomment and update this line with your Publisher ID:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ID-HERE" crossorigin="anonymous"></script>
```
Then in each tool file, replace the placeholder ad divs with your real <ins> AdSense tags.

---

## Monthly maintenance (30 minutes)

1. Open `src/config/rates.config.js`
2. Check and update any changed rates (see comments in the file for where to verify each rate)
3. Update `LAST_VERIFIED` to today's date
4. Push to GitHub → Netlify auto-deploys in ~60 seconds

---

## Activating the Contact Form

The contact form currently shows a success message on click but doesn't send emails.
To activate it for free using Netlify Forms:

1. In ContactPage.jsx, wrap the form fields in a `<form>` element with these attributes:
   ```html
   <form name="contact" method="POST" data-netlify="true">
   ```
2. Netlify will automatically capture form submissions
3. View submissions in your Netlify dashboard under Forms

---

## Important URLs
- Site: https://www.halalcalc.com
- Netlify dashboard: https://app.netlify.com
- Google AdSense: https://adsense.google.com
- Google Analytics: https://analytics.google.com
- Google Search Console: https://search.google.com/search-console
