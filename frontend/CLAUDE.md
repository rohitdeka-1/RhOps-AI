# Claude Development Guide

**Philosophy:** Adapt the starter to a new template spec by reusing existing
components. Build into page folders, not from scratch.

## Core Principles

- **Pages own their components** — every page is a folder with `index.tsx` + `components/`. Build here first. Extract to `components/` only on the 3rd use
- **Two sacred folders** — `components/ui/` (shadcn) and `components/ai-elements/` (AI SDK) must not be modified. Use them, don't edit them. `components/base/` is where you wrap or extend `ui/` components (e.g. `base/button.tsx` wraps `ui/button.tsx` with `rounded-full`)
- **Reuse or modify before creating new** — read the page's existing code before creating new files. Adapt what exists
- **Real data, never placeholders** — verbatim strings from the spec. No lorem ipsum. Seed fixtures in `data/seed.ts`
- **One screen at a time** — implement, `npm run build`, verify, commit. Don't batch multiple screens
- **TypeScript strict** — no `any`, interfaces for props
- **Smallest correct change** — don't refactor unrelated code, don't add features the spec didn't ask for

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS v3 + shadcn/ui + Recharts + Tabler Icons + AI Elements

---

## Project Structure

```
src/
├── pages/                     # Route-level modules — each owns its components/
│   ├── landing/
│   │   ├── index.tsx
│   │   └── components/
│   ├── app/
│   │   ├── index.tsx
│   │   └── components/
│   ├── workspace/
│   │   ├── index.tsx
│   │   └── components/
│   └── not-found.tsx
├── layouts/                        # Page shells — <Outlet /> wrappers for App.tsx
│   ├── application-layout.tsx      # Fullscreen — no chrome (landing, auth, onboarding)
│   ├── workspace-layout-01.tsx     # Peekable sidebar
│   ├── workspace-layout-02.tsx     # Top-bar (pill tabs) + inset sheet
│   ├── workspace-layout-03.tsx     # Standard sidebar + inset card + breadcrumbs
│   └── workspace-layout-04.tsx     # Icon tab header + muted page bg
├── components/
│   ├── base/                  # Wrappers + extensions of ui/ (button, section, sidebar)
│   ├── ai-elements/           # Sacred — AI SDK components (don't modify)
│   └── ui/                    # Sacred — shadcn (don't modify, except button variants after fork)
├── data/                      # Seed fixtures (seed.ts)
└── lib/                       # Hooks, providers, utils
```

---

## Component Hierarchy

```
pages/<name>/components/    ← build here first (page-scoped)
         ↓ 3rd use
components/                 ← shared across pages (domain-specific OK)
         ↓ generality test
components/base/            ← primitives another product could use
```

Never skip levels. Never put domain components in `base/`.

---

## Don'ts

1. Don't modify `components/ui/` or `components/ai-elements/`. Use `components/base/` to wrap/extend them
2. Don't `npm install` packages — use `npx shadcn@latest add` for UI components
3. Don't build raw HTML when shadcn has the component
4. Don't use emojis as JSX content — use Tabler Icons (`@tabler/icons-react`)
5. Don't use hardcoded hex colors — use design tokens (`text-foreground`, `bg-primary`)
6. Don't create new top-level `src/` folders
7. Don't skip `npm run build` between screens

---

## Environment

**Package Manager:** npm (this repo uses `package-lock.json`)

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Type-check + build
```

**Adding shadcn components:**

```bash
npx shadcn@latest add <component>     # Installs to components/ui/
```

---

## Rules

Detailed patterns and conventions:
- `.claude/rules/react-patterns.md` — component hierarchy, extraction flow, shadcn usage
- `.claude/rules/ui-guidelines.md` — OKLCH tokens, typography, semantic colors, visual philosophy
- `.claude/rules/implementation-discipline.md` — build loop, verification, SPEC-GAP

## CSS Architecture

Three CSS files, each with one job. Loaded in order by `main.tsx`:

| File | Owns | Change per theme? |
|------|------|-------------------|
| `index.css` | shadcn color token defaults (`--color-*`), radius, `@layer base` reset. The neutral baseline. | **No** — don't touch |
| `base.css` | Landing page typography (`.landing` scoped heading sizes, line-height, letter-spacing). Constant across all style packs. | **No** — don't touch |
| `style-pack.css` | Font families, font weights, and **color overrides**. Loads last so its `:root` values win over `index.css` defaults. | **Yes** — this is the theme file. Swap fonts + colors here to re-skin the starter |

**To create a new theme:** copy the starter, edit only `style-pack.css` (colors, fonts, radius, weights) and update the font link in `index.html`. Everything else stays the same.

```
main.tsx import order:
  1. index.css      ← shadcn defaults (lowest priority)
  2. base.css       ← landing typography
  3. style-pack.css ← theme overrides (highest priority, wins)
```

## Design references

- `docs/design/typography.md` — type scale, landing vs app/workspace usage
