# Finsight — Paytm Build for India 2026

> **Turning financial behavior into credit identity — for 300M+ Indians the system forgot.**

**Team Genesis · Delhi Technological University · Fin-o-Hack 2025**

---

## The Problem

India has 1.04 billion credit-eligible adults. Only 277 million (27%) actively use formal credit products. Only 119 million (11.5%) even track their credit score.

**763 million people** have years of UPI activity, bill payments, and financial discipline — but zero credit identity. Not because they can't repay. Because the system never watched.

```
No Credit History → Banks Reject
        ↑                  ↙
No Score Built  ←  No Loan Taken

Finsight breaks this loop with behavioral data.
```

---

## What Finsight Does

Finsight is a **native Paytm module** — no new app, no new habit. It reads your existing UPI data and does two things simultaneously:

### Frontier 1 — AI Spending Assistant
Auto-categorizes every Paytm UPI transaction into 7 categories. No manual entry.

- Smart spending categorization (Food, Transport, Bills, Shopping, Entertainment, Savings, Others)
- Budget vs Actual live tracking with alerts
- Goal Vaults with FLDG collateral function
- Weekly AI-generated spending insights
- Anomaly detection on unusual spend spikes

**Sample insight:** *"You spent ₹3,240 on food — ₹740 over budget. Swiggy accounts for 68% of that. Want a meal plan?"*

### Frontier 2 — CIBIL Analyser (Dual Mode)

**For users who have a CIBIL score:** Deep SHAP-powered analysis of exactly what is helping and hurting the score, with a weekly improvement plan and point estimates.

**For users with no score:** A behavioral proxy score (300–850) built from 90 days of Paytm activity, plus a structured credit ladder that creates a real CIBIL history through NBFC-reported micro-overdrafts.

**Sample insight:** *"Your score dropped 8 pts: balance below ₹200 on 5 days. Maintain ₹500 for 7 more days — it'll recover."*

---

## The Credit Ladder

The path from zero credit identity to NBFC loan approval:

| Step | Action | Unlock |
|------|--------|--------|
| 1 | Build 14-day discipline streak (balance ≥₹500, bills paid, 3+ UPI txns/week) | ₹200 micro-overdraft |
| 2 | Draw and repay micro-overdraft | First formal tradeline reported to bureau by NBFC |
| 3 | Climb the ladder (30 → 60 → 90 days) | ₹500 → ₹1,000 → ₹2,000 → ₹3,000 |
| 4 | Apply for real loan via NBFC partner | Goal vault acts as FLDG collateral signal |

Credit limits: **₹200 → ₹500 → ₹1,000 → ₹2,000 → ₹3,000 → NBFC loan**

> All credit disbursed by a **licensed NBFC partner**. Finsight generates the behavioral score and eligibility signal only. This is the same DSA model used by Slice, Fi, Jupiter, and CRED.

---

## AI Saathi

Conversational financial advisor powered by **Claude (Anthropic)**. Speaks Hindi, English, and Hinglish. Knows the user's complete Finsight context on every query.

```
Raju:      Mera score kyun nahi badh raha?

AI Saathi: Main dekh raha hoon — aapka balance pichhle 5 baar 
           ₹200 se neeche gaya. Yahi sabse bada reason hai (-8 pts).
           Agar aap next 14 din ₹500 maintain karein, toh score 
           542 ho jayega. Aur 1 missed bill tha April 2 ko — 
           use jaldi pay karein (+15 pts possible).

Raju:      ₹200 ka overdraft kab milega?

AI Saathi: Aap currently Day 8 of 14 hain 🔥
           Agar aap next 6 din criteria maintain karein — balance 
           ₹500+, koi bill miss na karein — toh April 9 ko ₹200 
           overdraft unlock ho jayega. Paytm ke andar hi milega.
```

**What AI Saathi knows about you:** Finsight Score, top SHAP factors, current streak, budget status, active goals, credit ladder position.

**What AI Saathi never does:** Tax advice, investment advice, any guidance outside personal finance — redirects to professionals.

---

## Scoring Model

### The 7 Behavioral Features (XGBoost)

| Feature | Weight | What it measures |
|---------|--------|-----------------|
| Bill payment regularity | 25% | % of bills paid on time in 90-day window |
| Balance stability | 20% | Days wallet balance above ₹500 / 90 |
| Balance volatility | 15% | Coefficient of variation of daily balance |
| UPI transaction frequency | 15% | Average transactions per week, log-transformed |
| Merchant diversity | 10% | Distinct spend categories used out of 7 |
| Credit utilization | 10% | BNPL and credit usage vs limit |
| Transaction recency | 5% | Days since last significant transaction |

### Score Mapping
```
Finsight Score = 300 + (P × 550)
where P = XGBoost output probability (0.0 to 1.0)

Example: P = 0.567 → Score = 300 + 311.85 = 612
```

### Score Bands
| Range | Band | Meaning |
|-------|------|---------|
| 300–549 | Poor | Significant behavioral issues |
| 550–649 | Fair | Some positive signals, needs improvement |
| 650–749 | Good | Solid behavioral track record |
| 750–850 | Excellent | Top-tier behavioral profile |

### SHAP Explainability
Every score change has a plain-language reason code:
- `+18 pts` — Bill Payment Regularity: 7 of 7 bills paid on time
- `+12 pts` — UPI Activity: 25 transactions in last 30 days
- `-14 pts` — Credit Utilization: 74% of BNPL limit used
- `-8 pts` — Balance Stability: balance dropped below ₹200 on 5 occasions

---

## Technical Architecture

```
📲 DATA INGESTION          🧠 AI / ML ENGINE
Paytm UPI API         →   XGBoost scoring
Bill payment data         SHAP explainability
Wallet balance            Risk engine
Spending categories       FastAPI inference

⚙️ PLATFORM LAYER         📱 USER LAYER
Node.js + Express     →   React Native
PostgreSQL + Redis         Score dial (SVG)
NBFC partner API           AI Saathi (Claude)
Polygon blockchain         Credit ladder UI
```

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native, Victory Native (charts), Reanimated 2, Zustand + React Query |
| Backend | Node.js + Express, PostgreSQL (Supabase), Redis, Celery job queue |
| AI / ML | XGBoost 2.0 + SHAP, FastAPI inference, Claude API (AI Saathi), Python 3.11 |
| Infrastructure | Polygon (score hash), Paytm/UPI APIs, Docker + Railway, NBFC OAuth2 API |

### RBI Compliance
- Paytm Payments Bank **cannot lend** (PPI rules) — Finsight never disburses credit directly
- All overdrafts and loans disbursed by a **licensed NBFC partner** via API
- Finsight generates behavioral score + eligibility signal only
- Earns referral fee per approved loan
- Score hashed to **Polygon blockchain** — tamper-proof, third-party verifiable

---

## Market Opportunity

| Metric | Figure |
|--------|--------|
| India digital lending market | ₹270B (39.5% CAGR since 2012) |
| Addressable users | 300M credit-invisible adults with Paytm activity |
| Lending risk to Paytm | ₹0 — all credit via NBFC partner |
| Days to first credit | 14 (discipline streak unlock) |

### Revenue Model
- **NBFC referral fee** per approved loan (₹200–500 depending on loan size)
- **Score API access** for partner NBFCs and insurers
- **Aggregated workforce insights** for gig platforms (anonymized)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
git clone https://github.com/team-genesis/finsight
cd finsight
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Add your Gemini API key to `.env`:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

### Deploy to Vercel (PWA install on Android)

```bash
npx vercel --prod
```

After deploying, open Chrome on Android → visit the URL → three-dot menu → "Add to Home Screen"

---

## Project Structure

```
finsight/
├── src/
│   ├── App.tsx          # All 9 screens — single file
│   ├── lib/
│   │   ├── saathi.ts    # Gemini AI Saathi integration
│   │   └── utils.ts     # cn() helper
│   ├── main.tsx
│   └── index.css
├── public/
│   ├── icon-192.png
│   └── icon-512.png
├── .env.example
├── vite.config.ts
├── package.json
└── README.md
```

### Screen Flow

```
Landing → Onboarding → Mock Paytm Home → Score Calculation
       → Score Reveal → Dashboard → Habit Tracker
       → AI Saathi Chat → Loan Offer
```

---

## Screens

| Screen | Description |
|--------|-------------|
| Landing | Full-screen navy splash with FinSight branding |
| Onboarding | 4-card data source preview + consent |
| Mock Paytm Home | Simulates Paytm home with Finsight teaser card |
| Score Calculation | Animated arc + 3-step UPI/bill/balance analysis |
| Score Reveal | Gauge dial + 12-week history chart + SHAP chips |
| Dashboard | Score card + spending donut + credit ladder + budgets |
| Habit Tracker | 14-day streak dots + milestone habit cards |
| AI Saathi | Live Gemini-powered chat with financial context injection |
| Loan Offer | 3-tier NBFC loan selector + pre-filled KYC + Apply CTA |

---

## Team

**Team Genesis — Delhi Technological University**

Built for Fin-o-Hack 2025 · Paytm Build for India challenge

---

## License

MIT — built for hackathon demonstration purposes.

> *CIBIL checks your past. Finsight builds your future.*
