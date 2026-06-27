# SMLife v2 - AI Smart Pricing Assistant

SMLife is an AI-powered pricing assistant built for women-led SMEs. It helps entrepreneurs calculate the **true cost** of their products — surfacing hidden costs like fuel, electricity, packaging, and labour that most pricing tools miss — then provides **AI-powered insights** to price confidently and profitably.

## Vision

SMLife was built for the woman who makes, creates, and delivers, to ensure that every product she sells is a step toward financial freedom rather than further into loss.

## Features

✅ **Complete 5-tab pricing calculator** - Production, Overhead, Logistics, Labour, Goals
✅ **Hidden cost detection** - Surfaces costs like transport, fuel, electricity, packaging, delivery, rent, and your time
✅ **AI Pricing Coach** - Interactive chat panel for pricing strategy and business advice
✅ **Competitor benchmarking** - Compare your pricing to market standards
✅ **Cost breakdown visualization** - See where every naira goes
✅ **Profit health meter** - Instantly see if your pricing is healthy
✅ **Save & track calculations** - Monitor your pricing history and progress
✅ **Mobile-first design** - Works seamlessly on any device

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Build**: Vite 6
- **Style**: Vanilla CSS with custom properties (no frameworks)
- **Icons**: Lucide (SVG icon library)
- **AI**: OpenRouter SDK (with graceful rule-based fallback)
- **Animations**: GSAP
- **Auth**: LocalStorage-based mock authentication
- **Routing**: Hash-based SPA routing

## Getting Started

See [SETUP.md](SETUP.md) for installation and development instructions.

## Routes

| Path | View | Auth Required |
|------|------|---------------|
| `#/` | Landing with Calculator | No |
| `#/dashboard` | Dashboard overview | Yes |
| `#/history` | Saved calculations list | Yes |
| `#/profile` | User profile & preferences | Yes |
| `#/pricing` | Premium pricing page | No |

## AI Integration

- **Default**: Rule-based insights (works offline)
- **With API key**: OpenRouter calls for personalized pricing strategy
- **Fallback**: Graceful degradation if API fails
- **Prompt types**: Insight, Optimization, Market context, Coach Q&A

## Mobile Strategy

- Bottom navigation bar for mobile users
- Hamburger drawer for additional navigation
- Responsive grid layouts (1 → 2 → 3 columns)
- Large touch targets (48px+)
- Safe area insets for notched devices

## License

This project is private and proprietary.