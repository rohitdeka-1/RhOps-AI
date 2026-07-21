# Atlas Port Plan

Port Atlas's theme, typography, and app shell into a new Lovable starter repo. The base template stays untouched — this is a fork.

Source: `/Users/georgemaine/Development/growthxai/atlas/app/frontend/`
Target: new repo `lovable-atlas-template-starter`

---

## Phase 1 — Scaffold

1. Copy `lovable-base-template-starter` to `lovable-atlas-template-starter`
2. `git init`, fresh history
3. Update `package.json` name
4. Create repo `growthxai/lovable-atlas-template-starter`, push

---

## Phase 2 — Theme tokens

Copy Atlas's `application.css` token block into `src/index.css`. Replace the existing `:root` and add `.dark`.

**Changes to `src/index.css`:**

```css
:root {
  --radius: 0.625rem;              /* was 0.5rem */
  /* all color tokens identical — Atlas uses neutral OKLCH same as ours */
  --sheet: #fcfcfd;                /* new token */
  --hairline: lch(91.9 0 282);    /* new token */
}

.dark {
  /* full dark mode block from Atlas */
  --sheet: var(--background);
  --hairline: oklch(1 0 0 / 12%);
}
```

**Add to Tailwind config** (or `@theme inline` if we migrate to TW4):
- `--color-sheet: var(--sheet)`
- `--color-hairline: var(--hairline)`

**`border-hairline` utilities** — already exist in our `base.css`. Verify they reference `--color-hairline`.

---

## Phase 3 — Fonts

Swap Figtree → Geist Variable + Geist Mono.

1. `npm install @fontsource-variable/geist @fontsource-variable/geist-mono`
2. Import in `src/main.tsx` or CSS entry:
   ```css
   @import '@fontsource-variable/geist';
   @import '@fontsource-variable/geist-mono';
   ```
3. Update `src/style-pack.css`:
   ```css
   :root {
     --font-heading: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
     --font-body: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
     --font-heading-weight: 600;
     --font-body-weight: 400;
   }
   ```
4. Update `tailwind.config.ts` `fontFamily` if needed:
   ```ts
   fontFamily: {
     sans: ['Geist Variable', ...defaultTheme.fontFamily.sans],
     mono: ['Geist Mono Variable', ...defaultTheme.fontFamily.mono],
   }
   ```
5. Remove Figtree font links from `index.html`

---

## Phase 4 — App shell (workspace layout)

Port Atlas's `workspace-layout.tsx` pattern. Create `src/layouts/workspace-layout.tsx`.

**Structure:**

```
┌──────────────────────────────────────────────────────────────┐
│ <div> h-screen flex flex-col bg-zinc-50                      │
│       background: radial-gradient(circle, border 1px, …)     │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ <header> h-16 px-6                                       │ │
│ │   left: WorkspaceLogo                                    │ │
│ │   center: NavigationTabs                                 │ │
│ │   right: UserMenu                                        │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ <div> flex-1 overflow-hidden px-0 pt-2 lg:px-6          │ │
│ │                                                          │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ <div> bg-sheet shadow-md lg:rounded-t-xl             │ │ │
│ │ │       border border-border flex-1                    │ │ │
│ │ │                                                      │ │ │
│ │ │ ┌──────────────────────────────────────────────────┐ │ │ │
│ │ │ │ breadcrumbs (optional) — border-b-hairline       │ │ │ │
│ │ │ └──────────────────────────────────────────────────┘ │ │ │
│ │ │                                                      │ │ │
│ │ │   <Outlet /> — page content                         │ │ │
│ │ │                                                      │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Key classes from Atlas:**
- Outer: `flex h-screen flex-col bg-zinc-50 dark:bg-black` + dot-grid background
- Content wrapper: `flex-1 flex flex-col overflow-hidden px-0 pt-2 lg:px-6`
- Sheet: `flex-1 flex flex-col overflow-hidden bg-sheet shadow-md lg:rounded-t-xl border border-border`
- Breadcrumbs: `px-4 py-3 border-b-hairline` with chevron separators

**Files to create:**
- `src/layouts/workspace-layout.tsx` — the shell
- `src/pages/workspace/components/top-bar.tsx` — header (logo left, tabs center, user right)
- `src/pages/workspace/components/breadcrumbs.tsx` — breadcrumb nav

**Wire into `App.tsx`:**
```tsx
<Route element={<WorkspaceLayout />}>
  <Route path="/workspace" element={<Workspace />} />
</Route>
```

---

## Phase 5 — Typography alignment

Atlas uses plain Tailwind classes, no `.landing` wrapper in the app shell.

| Element | Atlas class | Notes |
|---|---|---|
| Page title | `text-[28px] font-semibold leading-none tracking-tight` | Matches our `text-3xl` range |
| Eyebrow / section label | `font-mono text-[11px] uppercase tracking-wider text-muted-foreground` | New pattern — add to ui-guidelines |
| Body text | `text-sm` (14px default) | Same as our app convention |
| Metadata | `text-sm text-muted-foreground` | Same |
| Mono values | `font-mono text-[11px]` | Uses Geist Mono |

The landing page keeps `.landing` wrapper + style-pack headings. The workspace pages use plain Tailwind classes — same split we already document in `docs/design/typography.md`.

---

## Phase 6 — Workspace starter page

Create a minimal workspace home page to prove the shell works.

**`src/pages/workspace/index.tsx`:**
- Page title: "Dashboard"
- Empty state or simple card grid
- Uses `<Main>` wrapper for scroll + padding

---

## Files summary

| File | Action |
|---|---|
| `src/index.css` | Update — new tokens, dark mode, radius bump |
| `src/style-pack.css` | Update — Geist fonts |
| `tailwind.config.ts` | Update — font families, sheet/hairline colors |
| `index.html` | Update — swap Figtree → Geist font links |
| `src/layouts/workspace-layout.tsx` | Create |
| `src/pages/workspace/components/top-bar.tsx` | Create |
| `src/pages/workspace/components/breadcrumbs.tsx` | Create |
| `src/pages/workspace/index.tsx` | Create |
| `src/App.tsx` | Update — add workspace route |
| `docs/design/typography.md` | Update — add eyebrow pattern |

---

## Build order

1. Scaffold new repo from base template
2. Theme tokens (`index.css`) → `npm run build`
3. Fonts (install, import, style-pack, config) → `npm run build`
4. Workspace layout shell → `npm run build`
5. Top bar + breadcrumbs → `npm run build`
6. Workspace home page → `npm run build`, verify in browser
7. Verify landing page still works (fonts changed, tokens tweaked)
