# SMLife v2 — Task Tracker

## Current Status: Build in progress (Phase 9/10)

---

## ✅ Phase 1 — Project Setup
- [x] Create directory structure
- [x] Write `package.json` with deps (typescript, gsap, lucide, @openrouter/sdk, vite)
- [x] Write `tsconfig.json` (strict)
- [x] Write `vite.config.ts`
- [x] Write `.env.example`, `.gitignore`
- [x] Write `src/vite-env.d.ts`
- [x] Create `index.html` entry point
- [x] Install dependencies via pnpm
- [x] Verify dev server starts

## ✅ Phase 2 — Core Logic
- [x] Write `src/types.ts` — all interfaces, CalcInputs, CalcResult, UserProfile, SavedCalc, CurrencyCode
- [x] Write `src/state.ts` — AppState store with localStorage persistence, subscribe/notify
- [x] Write `src/currency.ts` — 12 currencies, formatting (fmt, fmtCompact)
- [x] Write `src/pricing-engine.ts` — Pure calculation function

## ✅ Phase 3 — CSS Design System
- [x] Design tokens (colors, radii, shadows, fonts)
- [x] Reset & base styles
- [x] Loading screen
- [x] Top nav (scrolled state) + desktop nav links
- [x] Mobile drawer with overlay
- [x] Bottom nav (mobile)
- [x] Hero section (orbs, badge, CTA)
- [x] Stats strip
- [x] Section common styles
- [x] Buttons (primary, rose, outline, ghost, danger, sizes)
- [x] Calculator (header, tabs, inputs, results, meter, breakdown)
- [x] Competitor box
- [x] AI insight box
- [x] Features grid
- [x] Tips ticker + tips grid
- [x] Empowerment banner
- [x] Footer
- [x] Auth modal (overlay, tabs, form)
- [x] Dashboard (welcome, stat cards, history list, empty state)
- [x] AI Coach (toggle button, bottom sheet panel, chat messages, input)
- [x] Profile page
- [x] Toasts
- [x] Responsive breakpoints (480px, 768px, 1024px)

## ✅ Phase 4 — App Shell + Router
- [x] Write `src/router.ts` — Hash-based routing with param support
- [x] Build shell in `main.ts`: nav, drawer, bottom nav, coach toggle, toast container
- [x] Bind navigation events (desktop links, drawer links, bottom nav)
- [x] Nav scroll state
- [x] Hamburger drawer open/close
- [x] Auth button (shows user name when signed in)
- [x] Update bottom nav active state
- [x] Route guards (redirect to auth for dashboard/history/profile)
- [x] Inline: Ticker, Stats, Cost Alert render helpers

## ✅ Phase 5 — Landing Sections
- [x] Hero (orbs, logo, tagline, CTA buttons)
- [x] Features (6 cards with Lucide icons)
- [x] Tips Section (6 tip cards with Lucide icons)
- [x] Empowerment Banner (with CTA to calculator)
- [x] Footer

## ✅ Phase 6 — Calculator
- [x] 5 tab panels: Production, Overhead, Logistics, Labour, Goals
- [x] Currency selector (syncs with state)
- [x] Product name input
- [x] Calculate button with loading state
- [x] Reset button
- [x] Results display (6 cards)
- [x] Profit health meter (3 states: bad/ok/good)
- [x] Competitor comparison (show/hide)
- [x] Cost breakdown bar chart
- [x] AI insight panel with 3 action buttons
- [x] Save calculation (localStorage)
- [x] Tab switching with icons

## ✅ Phase 7 — AI Integration
- [x] OpenRouter API client (fetch-based)
- [x] System prompt for pricing coach
- [x] Insight prompt
- [x] Cost optimization prompt
- [x] Market context prompt
- [x] Rule-based fallback insight generator
- [x] AI Coach chat panel
- [x] Coach chat message history
- [x] Coach typing indicator
- [x] Rule-based fallback responses for coach
- [x] Graceful degradation (no key → rule-based + hint message)

## ✅ Phase 8 — Auth + Dashboard
- [x] Auth modal with Sign In / Sign Up tabs
- [x] Form validation
- [x] localStorage session persistence
- [x] Sign out
- [x] Dashboard: welcome, stats (products, avg margin, total profit)
- [x] Dashboard: recent calculations list (top 5)
- [x] Dashboard: empty state
- [x] Dashboard: quick actions (new calc, open coach)
- [x] History: full list with delete
- [x] History: clear all
- [x] Profile: name, email, business
- [x] Profile: currency preference selector
- [x] Profile: sign out button
- [x] Auth UI updates across nav

## 🔄 Phase 9 — Fix Build Errors
- [ ] Fix lucide import (`createElement` usage)
- [ ] Fix any TypeScript strict mode errors
- [ ] Verify dev server compiles without errors
- [ ] Test all routes render correctly

## 🔲 Phase 9 — GSAP Animations
- [ ] Hero: stagger entrance animation
- [ ] Hero orbs: floating animation
- [ ] Stats: count-up on scroll
- [ ] Features: stagger fade-in on scroll
- [ ] Calculator results: number tween
- [ ] Profit meter: smooth fill
- [ ] Auth modal: scale-in
- [ ] Dashboard: stagger cards

## 🔲 Phase 10 — Polish
- [ ] Lucide icon audit (replace all emojis)
- [ ] Mobile QA (touch targets, overflow, bottom nav)
- [ ] Edge case: empty calculator
- [ ] Edge case: 0 units
- [ ] Copy polish (hero, CTAs, error messages)
- [ ] Performance check (lazy load sections)
- [ ] Loading states
