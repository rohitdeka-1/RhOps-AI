# Typography

Two surfaces, one type scale. The scale lives in `base.css` (`@theme inline`). Landing pages and app pages use it differently.

---

## Type scale

Defined in `src/base.css`. Constant across all style packs.

Sizes `xs`–`2xl` are body/label territory (no letter-spacing). Sizes `3xl`–`6xl` are heading territory (negative letter-spacing).

| Class | Size | Line-height | Letter-spacing |
|-------|------|-------------|----------------|
| `text-xs` | 12px | 16px | — |
| `text-sm` | 13px | 18px | — |
| `text-base` | 14px | 20px | — |
| `text-lg` | 16px | 24px | — |
| `text-xl` | 18px | 28px | — |
| `text-2xl` | 20px | 28px | — |
| `text-3xl` | 24px | 32px | -0.96px |
| `text-4xl` | 32px | 40px | -1.28px |
| `text-5xl` | 40px | 48px | -2.4px |
| `text-6xl` | 48px | 56px | -2.88px |

---

## Landing pages

Wrap the page (or section) in `.landing`. Heading elements get sized automatically — no classes needed on `<h1>`–`<h4>`.

```tsx
<div className="landing">
  <h1 className="display">Ship faster with AI</h1>
  <h2>Features</h2>
  <h3>Built for teams</h3>
  <h4>Sub-heading</h4>
  <p className="text-lg text-muted-foreground">Subtitle text</p>
  <p className="text-base">Body paragraph</p>
</div>
```

### Landing heading sizes

| Element | Desktop | Mobile (< 950px) |
|---------|---------|-------------------|
| `h1` | 40px (text-5xl) | 32px (text-4xl) |
| `h1.display` | clamp(44px → 88px) | fluid |
| `h2` | 32px (text-4xl) | 24px (text-3xl) |
| `h3` | 24px (text-3xl) | 20px (text-2xl) |
| `h4` | 20px (text-2xl) | 18px (text-xl) |

The `.display` modifier on `h1` enables fluid sizing for hero headlines. It scales smoothly from 44px to 88px with no breakpoint jumps.

Font family comes from `font-heading` (set in `base.css`). Font weight comes from `var(--font-heading-weight)` (set in `style-pack.css`). No weight classes needed on headings.

### Landing body text

Body text uses Tailwind utility classes directly:

| Role | Class |
|------|-------|
| Subtitle / lead | `text-lg text-muted-foreground` |
| Body paragraph | `text-base` |
| Fine print, labels | `text-sm text-muted-foreground` |

---

## App / workspace pages

No `.landing` wrapper. Heading elements have no automatic sizing. Use Tailwind utility classes and shadcn components.

```tsx
<div>
  <h1 className="text-3xl tracking-tight">Dashboard</h1>
  <CardTitle>Revenue</CardTitle>
  <p className="text-sm text-muted-foreground">Last 30 days</p>
</div>
```

| Element | Class | Size |
|---------|-------|------|
| Page title | `text-3xl tracking-tight` | 24px |
| Section / card title | `text-lg font-semibold` or `<CardTitle>` | 16px |
| Body text, nav, tables, forms | `text-sm` | 13px (default) |
| Metadata, helper text | `text-sm text-muted-foreground` | 13px |
| Modal / full-width body | `text-base` | 14px |
| Small labels, badges | `text-xs` | 12px |

`text-sm` (13px) is the default for all app UI. Use `text-base` only in generous-space contexts.

shadcn components (`CardTitle`, `DialogTitle`, `Button`, etc.) carry their own Tailwind weight classes. These override the style-pack heading weight — that's intentional. App chrome has consistent weights regardless of the marketing heading weight.

---

## Font slots

Two CSS variables, swapped per style pack in `style-pack.css`:

| Variable | Role | Default |
|----------|------|---------|
| `--font-heading` | Headings, display type | Figtree |
| `--font-body` | Body, UI text | Figtree |
| `--font-heading-weight` | Heading font weight | 600 |
| `--font-body-weight` | Body font weight | 400 |

- `font-heading` class applies `--font-heading` family
- `font-sans` class applies `--font-body` family (default on `<body>`)
- Heading weight is set on `h1`–`h6` via `var(--font-heading-weight)` in `style-pack.css`
- Body weight is set on `body` via `var(--font-body-weight)` in `style-pack.css`
- Both are overridable at runtime via TDP postMessage

---

## How it works

Three CSS files, each with one job:

| File | Owns | Touches |
|------|------|---------|
| `index.css` | shadcn color tokens, radius, animations | shadcn CLI writes here |
| `base.css` | Type scale + `.landing` element styles | We own this |
| `style-pack.css` | Font families, weights, color overrides | Swapped per pack |

Weight flows through two paths:
- **Landing headings**: `<h2>` gets `font-weight: var(--font-heading-weight)` from `style-pack.css`. The style pack controls it.
- **App UI**: `<CardTitle>` gets `font-semibold` from shadcn's Tailwind class. The class overrides the CSS var. shadcn owns it.

These don't conflict because they serve different surfaces.

---

## Rules

- `tabular-nums` on any column of numbers (prices, counts, percentages)
- `text-balance` on headings — distributes text evenly across lines
- `text-pretty` on paragraphs — prevents orphaned words on last line
- Never hardcode font-family — use `font-heading` or `font-sans` so style packs work
- Never add weight classes to landing headings — weight comes from the style pack
