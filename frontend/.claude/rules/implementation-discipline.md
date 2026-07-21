---
description: Implementation workflow, build-fix loop, verification report — applies to all coding work
paths:
  - 'src/**'
---

# Implementation Discipline

## When implementing code changes

- **Restate which screen you're implementing before each file change.** Example: "Screen 2 (Dashboard) — building `pages/dashboard/components/ticket-queue.tsx`". If you can't name the screen, you don't know what you're doing yet.
- **Do not expand scope.** Implement what the spec describes, not what you think would be cool.
- **Do not refactor unrelated code.** If a file doesn't need to change for THIS screen, leave it untouched.
- **Keep diffs minimal.** Smallest correct change. Don't reformat files, rename variables, or "improve" things outside the screen you're working on.
- **If you discover something the spec missed:** add a `// SPEC-GAP: <what's missing>` comment at the point of compromise, choose a sensible default, continue. Document it in VERIFICATION.md. Do NOT stop to ask.

---

## Per-Screen Loop (mandatory — one screen at a time)

For each screen in the plan's Screen List, in order:

### 1. Read

Re-read the spec entries for THIS screen before writing any code:
- **Screenboard** (`docs/plans/00-screenboard.md`) — the wireframe, section breakdowns, Data Operations table
- **Cloudboard** (`docs/plans/00-cloudboard.md`) — query hooks, mutations, filter params, seed filter manifest
- **Storyboard** (`docs/plans/00-storyboard.md`) — frames that start or end at this screen (transitions, copy)
- **Breadboard** (`docs/plans/00-breadboard.md`) — arrows leaving this screen (navigation targets)
- **Design patterns** (`docs/design/`) — read the pattern doc for each data operation this screen uses (e.g. `filters.md` if the screen has filters, `crud.md` if it has create/edit/delete, `peekable-sidebar.md` if the screen uses `workspace-layout-01`)

### 2. Build

- Build components in `pages/<screen>/components/` — not in the page file
- **Every component that renders data calls a DataProvider hook.** Pages AND child components. If `GoalsTable` needs a teams list for a popover, it calls `useTeams()` — it does NOT import from `data/seed.ts`. The only file that imports `data/seed.ts` is `lib/data-provider.tsx` itself.
- Import from `components/base/`, `components/ui/`, `components/ai-elements/` as needed — don't modify them

### 3. Verify

Run `npm run build` immediately. Don't batch multiple screens before building.

- **If the build fails:** read the full error, diagnose the root cause, fix it, re-run. Do NOT move on until the build passes.
- **If the build passes:** proceed to QA.

### 4. QA against the spec

Check this screen against its screenboard entry:
- Does the layout match the wireframe? (sections, components, hierarchy)
- Are all elements from the wireframe present?
- Are there extra elements NOT in the wireframe? Remove them.
- Does the copy match the storyboard's "Copy in this frame" entries?
- Do navigation arrows from the breadboard work? (click trigger → correct destination)

Check this screen against its cloudboard entry:
- Does every data section use a hook from the DataProvider, not a direct seed.ts import?
- Does every hook accept the filter params listed in the cloudboard?
- Does the SeedDataProvider actually filter the seed array when filters change? If a hook takes `(filters)`, the SeedDataProvider must filter/sort the seed data — not ignore the param with `_filters` and return the full array. Change a filter in the UI and verify the data updates.
- Are mutations wired (create, update, delete) where the cloudboard specifies them?
- Is the auth gate correct? (protected route vs public demo route)

### 5. Fix

Up to 3 fix cycles for mismatches found in QA. After 3 attempts on the same issue, add a `// SPEC-GAP:` comment and move on.

### 6. Commit

```bash
git commit -m "feat(<screen>): implement <ScreenName> per spec"
```

Only commit once QA passes (or after 3 fix cycles with gaps documented).

**Then start the loop again for the next screen.**

---

## Before the first screen

1. Write `docs/plans/IMPLEMENTATION_MAP.md` — map each screen to existing components:
   - **Reuse as-is** — existing component fits
   - **Reuse + swap content** — structure stays, data changes
   - **Adapt pattern** — keep mechanics, swap subject
   - **New component** — last resort, justify why nothing fits

2. Commit the map FIRST:
   ```bash
   git commit -m "docs: implementation map for <Template>"
   ```

3. Apply the theme tint — update `src/index.css` primary color values

4. Start the dev server: `npm run dev`

---

## Auth is a screen, not a SPEC-GAP

Sign-in and sign-up are in the Screen List. They get the same per-screen loop as every other screen: read the cloudboard Auth section → build `AuthProvider`, `ProtectedRoute`, sign-in page with real `supabase.auth.signInWithOAuth` / `signInWithPassword`, sign-up page with real `supabase.auth.signUp` → verify build → QA → commit.

**Do NOT simulate auth.** Do not use `setTimeout(() => navigate('/goals'), 800)`. Do not show toasts saying "not configured." The Supabase client exists at `@/integrations/supabase/client` — import it and call the real auth methods. The providers (Google, Apple, Email) are pre-configured on the Lovable Cloud project.

Auth infrastructure to build:
- `src/lib/auth/auth-provider.tsx` — wraps the app, exposes `{ user, session, loading, signOut }`, registers `onAuthStateChange` before `getSession()`
- `src/components/protected-route.tsx` — redirects to `/sign-in` when `!user && !loading`, preserves `from` in location state
- Wrap `/*` app routes (not `/demo/*`) in `ProtectedRoute` in `App.tsx`
- Sidebar footer: sign-out button calls `supabase.auth.signOut()` + clears React Query cache

Commit: `feat(auth): implement auth per cloudboard`

---

## After all screens — Verification Report

Write `docs/plans/VERIFICATION.md` with this structure:

```markdown
# Verification — <TemplateName>

## Summary
What was implemented. What was intentionally not changed.

## Files changed

| File | Reason | Change summary |
|---|---|---|

## Acceptance criteria

One entry per screen. Derived from the screenboard wireframes.

| AC | Screen | Status | Evidence |
|---|---|---|---|

Status must be **PASS, FAIL, or NOT PROVEN**. Never claim PASS without
evidence — `npm run build` clean, file:line reference, or "compiles, not
visually verified" are all acceptable.

## Build verifications

| Build command | Result |
|---|---|

## SPEC-GAPs surfaced

List every `// SPEC-GAP:` comment in the code:

- `<file:line>` — what's missing, what default was used, what a human should decide

## Risks / not proven

Honest list. Say NOT PROVEN — never claim unverified success.

## High-risk files requiring review

| File | Risk | Why it needs review |
|---|---|---|

Rate each: LOW, MEDIUM, HIGH. Only MEDIUM and HIGH listed.
```

---

## Commit cadence

Small semantic commits. One per screen, plus bookends:

```bash
# Before any code:
git commit -m "docs: implementation map for <Template>"

# Per screen, after QA passes:
git commit -m "feat(landing): implement Landing per spec"
git commit -m "feat(dashboard): implement Dashboard per spec"
git commit -m "feat(chat): implement Chat per spec"
git commit -m "feat(auth): implement auth per cloudboard"

# After all screens:
git commit -m "docs: verification report for <Template>"

# Final:
git commit -m "feat: implement <Template> per spec"
```

**Why per-screen:** if a screen breaks the build, previous screens are still recoverable.

---

## Anti-patterns from past builds

1. ❌ Building all components inline in the page file. ✅ Build in `pages/<name>/components/`
2. ❌ Implementing all screens before running `npm run build`. ✅ Build after every screen
3. ❌ Skipping QA — "it compiles so it's done." ✅ Check against the screenboard wireframe
4. ❌ One monolithic commit at the end. ✅ Per-screen commits
5. ❌ Refactoring unrelated files mid-build. ✅ Smallest correct change
6. ❌ Claiming all ACs PASS without evidence. ✅ Mark NOT PROVEN honestly
7. ❌ Stopping mid-build to ask a question. ✅ SPEC-GAP comment, sensible default, move on
8. ❌ Reading the spec once at the start and forgetting by screen 3. ✅ Re-read per screen
9. ❌ Marking auth as SPEC-GAP and simulating with setTimeout/toast. ✅ Import `supabase` from `@/integrations/supabase/client` and call real auth methods
10. ❌ SeedDataProvider ignoring filters: `(_filters) => ok(seed.data)`. ✅ Filter the seed array: `(filters) => ok(seed.data.filter(d => d.date >= filters.startDate))`
