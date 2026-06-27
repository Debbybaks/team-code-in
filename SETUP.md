# SMLife v2 - Setup Guide

## Prerequisites

- Node.js 20+ (recommended: 20.12.2 LTS)
- pnpm 9+ (recommended: 9.0.6)
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smlife
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenRouter API key:
   ```
   VITE_OPENROUTER_API_KEY=your_api_key_here
   ```

## Development

### Start development server
```bash
pnpm dev
```

This will start the Vite development server at `http://localhost:5173`

### Build for production
```bash
pnpm build
```

### Preview production build
```bash
pnpm preview
```

## Project Structure

```
smlife/
├── index.html                 # Entry HTML shell
├── package.json               # Dependencies & scripts
├── tsconfig.json              # Strict TS config
├── vite.config.ts             # Vite configuration
├── .env.example               # OpenRouter API key template
├── public/                    # Static assets
│   └── favicon.svg
└── src/
    ├── main.ts                # App bootstrap & router
    ├── vite-env.d.ts          # Vite env type declarations
    ├── types.ts               # All TS interfaces & constants
    ├── state.ts               # Global state + localStorage
    ├── router.ts              # Hash-based SPA router
    ├── currency.ts            # Currency formatting
    ├── pricing-engine.ts      # Core calculation logic
    ├── icons.ts               # Lucide icon utility
    ├── ai/
    │   └── client.ts          # OpenRouter API client
    ├── components/            # All UI components
    └── styles/
        └── main.css           # Complete design system
```

## Key Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |

## Configuration

### TypeScript

The project uses strict TypeScript configuration. Key settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "target": "ES2022",
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Vite

Vite is configured for:
- TypeScript support
- CSS processing
- Production optimization

## Troubleshooting

### Lucide Icons not working

If you see errors about Lucide icons:
1. Ensure you're importing from `lucide` package correctly
2. Check that all icon names in `ICONS` object match Lucide's naming convention
3. Clear node_modules and reinstall dependencies

### TypeScript errors

If you encounter TypeScript errors:
1. Run `pnpm build` to see all TypeScript errors
2. Check for strict null checks and type annotations
3. Ensure all imports are correct

### GSAP animations not working

For GSAP animation issues:
1. Ensure GSAP is properly imported
2. Check that animation targets exist in the DOM when animations are triggered
3. Verify that GSAP scripts are loaded in the correct order