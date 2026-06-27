# SMLife v2 — AI Smart Pricing Assistant

## Vision

SMLife is an AI-powered pricing assistant built for women-led SMEs. It helps entrepreneurs calculate the **true cost** of their products — surfacing hidden costs like fuel, electricity, packaging, and labour that most pricing tools miss — then provides **AI-powered insights** to price confidently and profitably.

---

## Architecture

### Tech Stack
- **Language**: TypeScript (strict mode)
- **Build**: Vite 6
- **Style**: Vanilla CSS with custom properties (no frameworks)
- **Icons**: Lucide (SVG icon library)
- **AI**: OpenRouter SDK (graceful fallback to rule-based)
- **Animations**: GSAP *(pending)*
- **Auth**: Mock — localStorage based, no backend
- **Routing**: Hash-based SPA (#/ route)

### Project Structure

```
smlife/
├── index.html                 # Entry HTML shell
├── package.json               # Dependencies & scripts
├── tsconfig.json              # Strict TS config
├── vite.config.ts             # Vite configuration
├── .env.example               # OpenRouter API key template
├── public/
│   └── favicon.svg
└── src/
    ├── main.ts                # App bootstrap, router, nav, shell
    ├── vite-env.d.ts          # Vite env type declarations
    ├── types.ts               # All TS interfaces & constants
    ├── state.ts               # Global state + localStorage persistence
    ├── router.ts              # Hash-based SPA router
    ├── currency.ts            # Currency symbols, formatting, 12 currencies
    ├── pricing-engine.ts      # Pure math: cost calculation engine
    ├── icons.ts               # Lucide icon utility (cache, string/el rendering)
    ├── ai/
    │   └── client.ts          # OpenRouter API client + AI prompts + rule-based fallback
    ├── components/
    │   ├── Hero.ts            # Animated hero with orbs, CTA
    │   ├── Features.ts        # Feature cards grid (6 features)
    │   ├── TipsSection.ts     # Smart pricing tips (6 cards)
    │   ├── EmpowermentBanner.ts # Call-to-action banner
    │   ├── Footer.ts          # Site footer
    │   ├── Calculator.ts      # Full 5-tab calculator + results + meter + breakdown
    │   ├── Dashboard.ts       # Post-login dashboard overview
    │   ├── History.ts         # Saved calculations list
    │   ├── Profile.ts         # User profile + preferences
    │   ├── Auth.ts            # Sign-in/Sign-up modal
    │   └── AICoach.ts         # AI chat panel (question/answer)
    └── styles/
        └── main.css           # Complete design system (responsive, mobile-first)
```

---

## Routes

| Hash | View | Auth Required |
|---|---|---|
| `#/` | Landing (Hero → Calculator → Features → Tips) | No |
| `#/dashboard` | Dashboard overview with stats & recent calcs | Yes |
| `#/history` | Full saved calculations list | Yes |
| `#/profile` | User profile, currency pref, sign out | Yes |

---

## Data Flow

```
User fills inputs (5 tabs)
        ↓
PricingEngine.calculate(inputs)
        ↓
CalcResult: { totalCost, breakeven, recommended, profit, margin, breakdown }
        ↓
Display results → Profit Meter → Cost Breakdown Bars → Competitor Comparison
        ↓
AI Insight (OpenRouter API if key configured, else rule-based)
        ↓
User can save → localStorage → appears in Dashboard + History
```

---

## AI Integration

- **Default**: Rule-based insights (deterministic, works offline)
- **With API key**: OpenRouter calls for personalized pricing strategy, cost optimization, and market context
- **Fallback**: If API fails, silently falls back to rule-based + shows message
- **Coach Chat**: Persistent Q&A panel, rule-based fallback when no API key

### AI Prompt Types
1. **Insight**: Analyze inputs + results → personalized pricing advice
2. **Optimization**: Suggest specific cost reduction strategies
3. **Market**: Brief market context based on product type and price point
4. **Coach**: Free-form Q&A about pricing, costs, business strategy

---

## Mobile Strategy

- **Bottom nav** with 4 tabs (Calculator, Dashboard, History, Profile)
- **Top nav** hidden on mobile (< 768px), shown on desktop
- **Hamburger drawer** with slide-in animation
- **Sticky coach chat** FAB button → bottom sheet panel
- **Full-width inputs** with large touch targets (48px+)
- **Responsive grid** layouts (1 col → 2 col → 3 col)
- `env(safe-area-inset-bottom)` for notched devices

---

## Phases

| Phase | Status | What |
|---|---|---|
| 1. Project Setup | ✅ Done | Vite + TS + deps + configs |
| 2. Core Logic | ✅ Done | Types, state, currency, pricing engine |
| 3. CSS Design System | ✅ Done | Full responsive CSS, mobile-first |
| 4. App Shell + Router | ✅ Done | Nav, drawer, routing, bottom nav |
| 5. Landing Sections | ✅ Done | Hero, Features, Tips, Banner, Footer |
| 6. Calculator | ✅ Done | 5 tabs, inputs, results, meter, breakdown, competitor |
| 7. AI Integration | ✅ Done | OpenRouter client, prompts, fallback, AICoach |
| 8. Auth + Dashboard | ✅ Done | Sign-in modal, Dashboard, History, Profile |
| 9. GSAP Animations | ✅ done | Scroll-triggered, number tweens, transitions |
| 10. Polish | ✅ done | Icon audit, mobile QA, edge cases, copy |
