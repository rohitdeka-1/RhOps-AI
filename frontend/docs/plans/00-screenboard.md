# Screens — Team Directory

One entry per screen from the plan's Screen List. Read [00-breadboard.md](00-breadboard.md) for product scope and component choices.

* * *

## Landing page (`/`)

Marketing page that sells Team Directory to team leads and operations managers. Primary CTA ("Get started") leads to sign-up; "View demo" leads to `/demo/overview`.

(Demo routes `/demo/*` mirror authenticated routes pre-populated with seed data — no separate wireframes needed.)

**Populated wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory                    [View demo]  [Get started]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│           Know your team.                                                │
│           The human directory for small teams —                          │
│           search, browse, and never miss a birthday.                    │
│                                                                          │
│           [Get started →]       [View demo]                             │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │ ● ● ●  teamdirectory.app/directory                               │  │
│   │  ┌────────────────────────────────────────────────────────────┐  │  │
│   │  │  Engineering  ·  Product  ·  Design  ·  Operations         │  │  │
│   │  │  ┌──────┐  Jamie Lin        Senior Engineer                 │  │  │
│   │  │  │  JL  │  jamie@acme.co    SF · 3 yrs                     │  │  │
│   │  │  └──────┘                                                   │  │  │
│   │  └────────────────────────────────────────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ── Features ─────────────────────────────────────────────────────────  │
│  [ Directory ]  [ Profiles ]  [ Birthdays ]  [ Overview ]              │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │ ● ● ●  (feature mockup for active tab)                           │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ── Why teams love it ────────────────────────────────────────────────  │
│  ┌──────────────┐  ┌──────────────────────┐  ┌──────────────┐         │
│  │ [Users]      │  │ [Cake]               │  │ [Handshake]  │         │
│  │ Know your    │  │ Never miss a         │  │ Grow         │         │
│  │ team         │  │ birthday             │  │ together     │         │
│  └──────────────┘  └──────────────────────┘  └──────────────┘         │
│                                                                          │
│  ── Testimonials ─────────────────────────────────────────────────────  │
│  ┌──────────┐  ┌──────────────────────────┐  ┌──────────┐             │
│  │ (fade)   │  │ "We finally stopped       │  │ (fade)   │             │
│  │          │  │  asking 'what's your       │  │          │             │
│  │          │  │  last name again?'"        │  │          │             │
│  │          │  │  Maya R, Head of Ops       │  │          │             │
│  └──────────┘  └──────────────────────────┘  └──────────┘             │
│                       ○  ●  ○                                           │
│                                                                          │
│  ── CTA ──────────────────────────────────────────────────────────────  │
│           Your team deserves better than a spreadsheet.                  │
│           [Get started →]                                               │
│                                                                          │
│  ── Footer ───────────────────────────────────────────────────────────  │
│  [logo] Team Directory    Product    Company    Legal                   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Header

- `header` component. Sticky nav: wordmark + logo left, "View demo" (ghost `button`) + "Get started" (primary `button`) right.
- No nav links — page is short enough to scroll without an anchor menu. Two CTAs serve two visitor intents: explore first vs. convert now.
- No login link — returning users know where `/auth` is; the header stays clean for first-time visitors.

### Hero

- `hero-02` — centered layout. Bold headline "Know your team." with a two-line subtitle. Two CTA buttons below: primary "Get started →" and ghost "View demo".
- App mockup of the directory list inside a `mockups` browser chrome wrapper — shows avatars, name, role, tenure at a glance. Proves the product before scrolling.
- No `text-rotator` — the headline is direct and doesn't need a cycling word. Rotating words undermine the confident, no-jargon voice.

### Feature showcase

- `feature-showcase-02` with `cycler-nav` (auto-cycling tabs). Four tabs: Directory, Profiles, Birthdays, Overview. Each tab shows a product screenshot inside `mockups` browser chrome.
- Auto-cycling communicates the full product surface without requiring the visitor to scroll past four static blocks.
- No static `feature-showcase-01` grid — the directory's value is in the interaction pattern (grouped rows, avatars), which a cropped static grid thumbnail can't convey.

### Why teams love it

- `features-03` — three-column icon-led benefit cards: [Users] Know your team, [Cake] Never miss a birthday, [Handshake] Grow together.
- Lucide icons only: `Users`, `Cake`, `Handshake`.
- No feature grid duplication — this section communicates human outcomes, not features. The showcase above handles feature specifics.

### Testimonials

- `testimonial-01` — horizontal carousel, center card highlighted, flanking cards fade and shrink. Three testimonials from team leads and ops managers.
- No wall of logos — the audience is small-team operators, not enterprise buyers. Peer quotes land better than brand names.
- Dots pagination below. Three entries is enough; a slider would feel excessive.

### CTA banner

- `cta-01`. Single closing moment before the footer. Repeats "Get started →" — same destination as the hero. No second CTA here — one decision, one button.

### Footer

- **new** `pages/landing/components/footer.tsx` — three-column minimal footer: logo + tagline left, Product/Company links center, Legal links right.
- No newsletter form — the product converts on sign-up, not email capture.
- No social icons row — this is a B2B team tool; social proof is handled by testimonials above.

* * *

**Data shape** (`src/data/seed.ts`):

- Feature tabs: 4 entries — Directory ("Browse your whole team grouped by department"), Profiles ("Fun facts, contact info, and tenure at a glance"), Birthdays ("A calendar that makes every colleague feel remembered"), Overview ("See who's new and who's celebrating this month")
- Testimonials: 3 entries — Maya R (Head of Ops, Meridian, "We finally stopped asking 'what's your last name again?'"), Tom K (Engineering Manager, Stackform, "Birthday dots on the calendar. That's the feature that got everyone using it."), Priya S (People Lead, Loopcast, "Replaced a messy Notion table we'd been avoiding for two years.")
- Footer links: Product (Features, Demo, Pricing), Company (About, Blog), Legal (Privacy, Terms)

**Data operations**:

| Operation | On this screen |
| --- | --- |
| **Create** | none |
| **Read** | feature tab copy, testimonials, footer links (static marketing content) |
| **Update** | none |
| **Delete** | none |
| **Filter** | none |
| **Sort** | none |
| **Search** | none |
| **Paginate** | none |
| **Aggregate** | none |
| **Drill down** | none |
| **Auth** | public |

**States**: populated (only — landing has no empty state)

* * *

## Auth (`/auth`)

Single-route sign in / sign up screen with tabs, OAuth buttons, and email/password form. Gateway to the full app.

**Populated wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory                                    [← Home]      │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│                   ┌───────────────────────────────────┐                 │
│                   │                                   │                 │
│                   │  Welcome back                     │                 │
│                   │  Sign in to your team directory   │                 │
│                   │                                   │                 │
│                   │  [ Sign in ]   [ Sign up ]        │                 │
│                   │                                   │                 │
│                   │  [G]  Continue with Google        │                 │
│                   │  [A]  Continue with Apple         │                 │
│                   │                                   │                 │
│                   │  ─────────────  or  ──────────── │                 │
│                   │                                   │                 │
│                   │  Email                            │                 │
│                   │  ┌─────────────────────────────┐ │                 │
│                   │  │ you@company.com             │ │                 │
│                   │  └─────────────────────────────┘ │                 │
│                   │                                   │                 │
│                   │  Password                         │                 │
│                   │  ┌─────────────────────────────┐ │                 │
│                   │  │ ••••••••••••                │ │                 │
│                   │  └─────────────────────────────┘ │                 │
│                   │                                   │                 │
│                   │  [        Sign in        ]        │                 │
│                   │                                   │                 │
│                   │  Forgot password?                 │                 │
│                   │                                   │                 │
│                   └───────────────────────────────────┘                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Page shell

- `application-layout` — fullscreen, no topbar chrome. Centered card on a muted background.
- "← Home" ghost link top-right returns to `/`. Back link rather than a full header keeps the page focused on the single job: authenticate.
- No sidebar, no topbar nav — auth is a focus-mode screen. Zero distraction.

### Auth card

- shadcn `card` with `tabs` for Sign in / Sign up toggle. Tab switch updates the headline copy and shows/hides the "Forgot password?" link.
- OAuth buttons: two full-width `button` (outline variant) with SVG brand icons — Google `[G]`, Apple `[A]`. OAuth first because it's the lowest-friction path.
- Divider: "or" text separator between OAuth and email form.
- Email + password: shadcn `form` with two `input` fields and validation. Primary `button` "Sign in" / "Create account" at bottom.
- Sign up tab adds a "Full name" field above email. No confirm-password field — reduces friction; email-based recovery handles the mistake case.
- On success: both OAuth and email/password navigate to `/overview`.
- No "remember me" checkbox — session management is handled server-side. Adding it would imply a choice that doesn't meaningfully exist.

* * *

**Data shape** (`src/data/seed.ts`):

- No seed data on this screen — auth is stateless from the UI's perspective.

**Data operations**:

| Operation | On this screen |
| --- | --- |
| **Create** | sign up creates a new user account |
| **Read** | none |
| **Update** | none |
| **Delete** | none |
| **Filter** | none |
| **Sort** | none |
| **Search** | none |
| **Paginate** | none |
| **Aggregate** | none |
| **Drill down** | none |
| **Auth** | public |

**First-time view notes**:

- Default tab is Sign in. New visitors click "Sign up" to switch.
- Primary CTA: "Create account" button on the Sign up tab.
- Secondary option: Google or Apple OAuth buttons.

**States**: sign-in tab (default), sign-up tab, loading (button spinner, inputs disabled), error (inline `alert` below the form — "Invalid email or password")

* * *

## Overview (`/overview`)

Dashboard landing screen after sign-in. Shows inline stat row, recent hires list with avatars, and a birthday callout. Entry point for the "+ New" employee action.

**First-time wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Overview                                                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │                                                          │   │   │
│  │  │   [ghost skeleton rows ─ faded directory list behind]    │   │   │
│  │  │                                                          │   │   │
│  │  │         ┌────────────────────────────────────┐          │   │   │
│  │  │         │  No team members yet.              │          │   │   │
│  │  │         │  Add your first team member to     │          │   │   │
│  │  │         │  get started.                      │          │   │   │
│  │  │         │                                    │          │   │   │
│  │  │         │  [+ Add your first team member]    │          │   │   │
│  │  │         └────────────────────────────────────┘          │   │   │
│  │  │                                                          │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Populated wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  [Home]  Overview                                                        │
│  10 employees · 4 departments · 2 new hires                             │
│                                                                          │
│  Recent hires                                                            │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                                          │
│  [av] Marcus Webb       Product Designer · Design     Started May 2024  │
│  [av] Aisha Okonkwo     Product Manager · Product     Started Apr 2024  │
│  [av] Lin Chen          Operations Lead · Operations  Started Mar 2024  │
│                                                                          │
│  View all in directory →                                                │
│                                                                          │
│  🎂 Jamie Lin's birthday in 3 days                                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Topbar

- `workspace-layout-02` topbar shell. Logo left, four pill-tab nav items center (Overview, Directory, Calendar, Settings), "+ New" primary `button` and user `avatar` right.
- "+ New" navigates to `/directory/new` from any screen in the app.
- Active tab "Overview" is visually distinguished with the primary mint color fill.
- No search in the topbar — search lives on the Directory screen where results are actionable.

### Page header (shared `PageHeader` component)

- Reused across all screens. Pattern: `[icon] Title` left + optional sort control right (`text-primary`) + stats subtitle below (`text-muted-foreground`).
- Overview: `[Home] Overview` + "10 employees · 4 departments · 2 new hires". No sort control on Overview.
- Plain inline text, not `card` components or metric boxes. Per plan D1 / idea spec: "stat row is plain text, not cards."
- "New hires" count = employees with start_date within the last 60 days. Derived on render, not stored.

### Recent hires list

- Section heading "Recent hires" with dotted separator below. Single column, full width.
- 3 rows, most recent start dates first. Each row: `avatar` (40px) + full name (`font-medium`) + role · department (`text-muted-foreground`) + "Started {month year}" right-aligned.
- Rows are clickable → navigates to `/directory/:id`. Hover: `bg-muted/50`.
- "View all in directory →" text link at bottom navigates to `/directory`.
- No cards, no two-column layout — single reading column matching the Directory row pattern.

### Birthday callout

- Single-line inline callout below the recent hires: "🎂 Jamie Lin's birthday in 3 days" (`text-sm text-muted-foreground`).
- Shows the next upcoming birthday only. If no upcoming birthdays within 30 days, the callout is hidden.
- Not a separate card or panel — one line is enough for a small team.

### Blankslate (first-time)

- When `employees` count is 0: skeleton background (ghost rows of a faded directory list, bottom gradient fade) with a centered floating shadcn `card` (shadow-lg).
- Card text: "No team members yet. Add your first team member to get started." Primary `button` "Add your first team member" navigates to `/directory/new`.
- The recent hires panel and birthday panel are not rendered in the empty state — there's nothing to show. The blankslate replaces both panels.

* * *

**Data shape** (`src/data/seed.ts`):

- employees: 10 entries — see canonical seed below in Directory screen. Overview reads from the same entity.
- Recent hires surface: Marcus Webb (May 2024, Design, SF), Aisha Okonkwo (Apr 2024, Product, Remote), Lin Chen (Mar 2024, Operations, NYC)
- Upcoming birthdays: derived from birthday field — up to 3 nearest upcoming

**Data operations**:

| Operation | On this screen |
| --- | --- |
| **Create** | "+ New" button navigates to `/directory/new` |
| **Read** | employees aggregate (count, dept count, new hire count), 3 most recent hires, up to 3 upcoming birthdays |
| **Update** | none |
| **Delete** | none |
| **Filter** | none |
| **Sort** | recent hires sorted by start_date desc; birthdays sorted by proximity to today |
| **Search** | none |
| **Paginate** | none |
| **Aggregate** | total employee count, department count, new hire count (start_date within 60 days), upcoming birthday count |
| **Drill down** | click recent hire row → Employee Detail (`/directory/:id`); "View calendar →" → Calendar (`/calendar`); "View all in directory →" → Directory (`/directory`) |
| **Auth** | protected |

**First-time view notes**:

- Blankslate card: "No team members yet. Add your first team member to get started."
- Primary CTA: "Add your first team member" button — navigates to `/directory/new`.
- No secondary option — the only way to get data is to add an employee. No CSV import in scope.

**States**: first-time (blankslate), populated (shown above), loading (skeleton rows in both panels), navigating to /directory/new

* * *

## Directory (`/directory`)

Searchable, filterable employee roster grouped by department. The main workspace of the app — browse, find, add, edit, and remove team members.

**First-time wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Directory                                                               │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  [ghost skeleton rows ─ faded department groups behind]          │   │
│  │                                                                  │   │
│  │         ┌────────────────────────────────────┐                  │   │
│  │         │  No team members yet.              │                  │   │
│  │         │  Add the first one to get started. │                  │   │
│  │         │                                    │                  │   │
│  │         │  [+ Add your first team member]    │                  │   │
│  │         └────────────────────────────────────┘                  │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

**Populated wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  [≡ ⊞]          [+ New] [↑ Import]              [🗑] [···]     │    │
│  │  view            create                           actions       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  [Users]  Directory                              by First name ▾        │
│  10 employees · 4 departments                                           │
│                                                                          │
│  [Search by name, role, or location…]  [Department ▾]  [Location ▾]    │
│                                                                          │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  [ ]  NAME ↑              ROLE              DEPT        JOINED  │    │
│  │  ────────────────────────────────────────────────────────────── │    │
│  │  ENGINEERING · 4                                                │    │
│  │  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │    │
│  │  [ ] ┌────┐  Jamie Lin         Senior Engineer  [Eng]  Jun 2021 │    │
│  │      │ JL │                    SF                               │    │
│  │      └────┘                                          [⋯]       │    │
│  │  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │    │
│  │  [ ] ┌────┐  Raj Patel         Staff Engineer   [Eng]  Aug 2021 │    │
│  │      │ RP │                    NYC                              │    │
│  │      └────┘                                          [⋯]       │    │
│  │  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │    │
│  │  [ ] ┌────┐  Sora Tanaka       Engineer         [Eng]  Mar 2023 │    │
│  │      │ ST │                    Remote                           │    │
│  │      └────┘                                          [⋯]       │    │
│  │  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │    │
│  │  [ ] ┌────┐  Devon Park        Engineer         [Eng]  Jan 2024 │    │
│  │      │ DP │                    Austin                           │    │
│  │      └────┘                                          [⋯]       │    │
│  │                                                                 │    │
│  │  PRODUCT · 2                                                    │    │
│  │  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │    │
│  │  [ ] ┌────┐  Aisha Okonkwo     Product Manager  [Prd]  Apr 2024 │    │
│  │      │ AO │                    Remote                           │    │
│  │      └────┘                                          [⋯]       │    │
│  │  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │    │
│  │  [ ] ┌────┐  Carlos Méndez     Product Lead     [Prd]  Nov 2022 │    │
│  │      │ CM │                    SF                               │    │
│  │      └────┘                                          [⋯]       │    │
│  │                                                                 │    │
│  │  (DESIGN · 2 and OPERATIONS · 2 follow same pattern)           │    │
│  │                                                                 │    │
│  │  ── Batch toolbar (appears when ≥1 row selected) ─────────── │    │
│  │  2 selected   [Delete selected]   [✕ Clear]                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

### Topbar

- Same `workspace-layout-02` topbar as Overview. "+ New" primary `button` navigates to `/directory/new`.

### Toolbar (iCloud-style grouped actions)

- Sticky toolbar below the topbar, above the page header. Three action groups separated by flex spacers:
  - **Left group**: `[≡]`/`[⊞]` view toggle (list/grid, `toggle-group`). No sort here — sort lives in the page header "by First name ▾" control.
  - **Center group**: `[+ New]` primary creation button — navigates to `/directory/new` (full-page create form). `[↑ Import]` ghost button — opens CSV Import `dialog`. Two creation paths: one-at-a-time and bulk.
  - **Right group**: `[🗑]` delete (ghost, disabled until ≥1 row selected) + `[···]` more actions dropdown.
- Search lives in the filter bar below (always visible), not in the toolbar — a people directory needs the search input ready to type at all times, not collapsed behind an icon.
- All actions immediately visible — no hidden menus for primary actions. `gap-2` within groups, `flex-1` spacers between groups.

### Page header (shared `PageHeader` component)

- `[Users]` icon + "Directory" heading left. "by First name ▾" sort control right (`text-primary text-sm`) — clicking opens a `dropdown-menu` with options: First name A–Z (default), Last name A–Z, Start date (newest), Start date (oldest), Date added (newest).
- Subtitle: "10 employees · 4 departments" (`text-muted-foreground`). Updates reactively when filters are active.
- Same `PageHeader` component as Overview, Calendar, Employee Detail — consistent across all screens.

### Filter bar

- Below page header: search `input` ("Search by name, role, or location…") + Department `select` + Location `select`. All in one row.
- Search filters in-place as the user types — matches against `full_name`, `role`, and `location` fields.
- Department options: All, Engineering, Product, Design, Operations (hardcoded enum).
- Location options: derived from unique `location` values in the dataset (All, SF, NYC, Austin, Remote).
- All filters stack — search + department + location can be active simultaneously.
- No date-range filter — this is a people list, not a time-series dataset.

### Column headers

- Thin header row below the filter bar: NAME, ROLE, DEPT, JOINED — `text-xs uppercase tracking-wider text-muted-foreground`. Dotted `border-b` below.
- Not sortable via column click — sort lives in the page hero and toolbar. Headers provide visual structure for scanning.

### Employee table (list view)

- shadcn `table` with department-grouped rows and dotted `separator` dividers between rows. Column headers: checkbox (select all), NAME ↑ (sortable), ROLE, DEPT, JOINED.
- Department group headers in mono uppercase ("ENGINEERING · 4") span full row width, styled with `text-xs font-medium uppercase tracking-wider text-muted-foreground`.
- Each row: shadcn `checkbox` left for multi-select + `avatar` (initials, 40px) + full name (semibold) + location in muted-foreground below the name + role + department `badge` (mint tint for engineering, other tints for other depts) + start year.
- Row end: `[⋯]` `dropdown-menu` with "Edit" (navigates to `/directory/:id` in edit mode) and "Delete" (opens Confirm Delete `dialog`).
- Clicking the row (not the checkbox, not the overflow menu) navigates to `/directory/:id`.
- Hover: `bg-muted/60` wash on the row.
- No email/phone column — too much information for a scannable list. Contact details live on the profile. The table's job is identification, not contact lookup.

### Grid view

**Grid view wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  [≡ ⊞●]          [+ New] [↑ Import]              [🗑] [···]    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  [Users]  Directory                              by First name ▾        │
│  10 employees · 4 departments                                           │
│                                                                          │
│  [Search by name, role, or location…]  [Department ▾]  [Location ▾]    │
│                                                                          │
│  ● ENGINEERING · 4                                                       │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                                          │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐                             │
│  │      │   │      │   │      │   │      │                             │
│  │  JL  │   │  RP  │   │  ST  │   │  DP  │                             │
│  │ 80px │   │ 80px │   │ 80px │   │ 80px │                             │
│  │      │   │      │   │      │   │      │                             │
│  └──────┘   └──────┘   └──────┘   └──────┘                             │
│  Jamie Lin  Raj Patel   Sora T.   Devon Park                            │
│  Sr. Eng.   Staff Eng.  Engineer  Engineer                              │
│                                                                          │
│  ● PRODUCT · 2                                                           │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                                          │
│  ┌──────┐   ┌──────┐                                                    │
│  │  AO  │   │  CM  │                                                    │
│  │ 80px │   │ 80px │                                                    │
│  └──────┘   └──────┘                                                    │
│  Aisha O.   Carlos M.                                                   │
│  Prod. Mgr  Prod. Lead                                                  │
│                                                                          │
│  (● DESIGN · 2 and ● OPERATIONS · 2 follow same pattern)               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

- Triggered by the `[LayoutGrid]` toggle. Replaces the table with a responsive CSS grid.
- Same department grouping as list view — colored dot + name + count headers, dotted dividers between groups.
- Each cell: 80px circular `avatar` (image or initials, `rounded-full`), name below (`text-sm font-medium`, centered), role (`text-xs text-muted-foreground`, centered). Apple Classroom-style density.
- Responsive: 6 columns desktop, 4 tablet, 3 mobile. `gap-6` between cells, `gap-8` between groups.
- No location or joined date in grid view — the grid is for visual recognition, not data comparison.
- Click cell navigates to `/directory/:id`. Right-click opens same context menu as list row overflow (Edit, Delete).
- Multi-select: `Cmd/Ctrl+click` toggles selection, selected cells get `ring-2 ring-primary`. Batch toolbar appears same as list view.
- View preference persists in `localStorage`.

### Batch delete toolbar

- Appears pinned to the bottom of the table when ≥1 `checkbox` is selected. Shows "N selected", "Delete selected" destructive `button`, and "✕ Clear" ghost button.
- "Delete selected" opens Confirm Batch Delete `dialog`.
- Toolbar fades in/out — not always visible, to avoid cluttering the normal browsing state.

### New Employee page (`/directory/new`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Home / Directory / New employee                                        │
│                                                                          │
│  [UserPlus]  New employee                                                │
│  Fill in the details to add a team member.                              │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  Identity                                                        │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │   │
│  │  │ Full name *          │  │ Role / title *       │             │   │
│  │  └──────────────────────┘  └──────────────────────┘             │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │   │
│  │  │ Department *   [▾]   │  │ Start date *  [📅]   │             │   │
│  │  └──────────────────────┘  └──────────────────────┘             │   │
│  │                                                                  │   │
│  │  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──    │   │
│  │                                                                  │   │
│  │  Contact                                                         │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │   │
│  │  │ Email                │  │ Phone                │             │   │
│  │  └──────────────────────┘  └──────────────────────┘             │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │   │
│  │  │ Location             │  │ Birthday (MM-DD)     │             │   │
│  │  └──────────────────────┘  └──────────────────────┘             │   │
│  │                                                                  │   │
│  │  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──    │   │
│  │                                                                  │   │
│  │  Fun facts (optional)                                            │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │   │
│  │  │ Desk snack           │  │ Hidden talent        │             │   │
│  │  └──────────────────────┘  └──────────────────────┘             │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐             │   │
│  │  │ Karaoke song         │  │ Dream vacation       │             │   │
│  │  └──────────────────────┘  └──────────────────────┘             │   │
│  │                                                                  │   │
│  │                          [Cancel]   [Add team member →]          │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

- Full-page form at `max-w-[600px] mx-auto` inside a shadcn `card`. Same centered reading width as Employee Detail.
- Breadcrumb: Home / Directory / New employee. "Directory" links back to `/directory`.
- PageHeader: `[UserPlus] New employee` + "Fill in the details to add a team member." subtitle.
- Three field groups separated by dotted dividers: Identity (name, role, department, start date), Contact (email, phone, location, birthday), Fun facts (desk snack, hidden talent, karaoke song, dream vacation).
- Required fields: full_name, role, department, start_date. Everything else optional.
- "Cancel" navigates back to `/directory` (breadcrumb path). "Add team member →" validates and saves.
- On success: navigates to `/directory/:id` (the new employee's profile page). Toast "Jamie Lin added to Engineering."
- No avatar upload — initials avatar generated automatically from the name.

### Confirm Delete modal

- Minimal shadcn `alert-dialog`. Title: "Remove [Full Name]?" Body: "This will permanently remove them from the directory." Two buttons: "Cancel" (outline) and "Remove" (destructive).
- Triggered by row `[⋯]` → Delete, or batch delete toolbar.

### CSV Import modal

```
┌────────────────────────────────────────────────────────────────┐
│  Import team members                                    [✕]    │
│  ────────────────────────────────────────────────────────────  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │  [Upload]  Drop a CSV file here, or click to browse      │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Expected columns: name, role, department, email,              │
│  phone, location, start_date, birthday                         │
│                                                                │
│  [Download template CSV]                                       │
│                                                                │
│  ────────────────────────────────────────────────────────────  │
│                                                                │
│  Preview  (after file selected)                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ✓  Jamie Lin      Senior Engineer  Engineering  Jun 21  │ │
│  │  ✓  Raj Patel      Staff Engineer   Engineering  Aug 21  │ │
│  │  ⚠  Sora Tanaka    Engineer         (missing)    Mar 23  │ │
│  │  ✓  Devon Park     Engineer         Engineering  Jan 24  │ │
│  └──────────────────────────────────────────────────────────┘ │
│  4 rows · 1 warning                                            │
│                                                                │
│                    [Cancel]   [Import 4 employees]             │
└────────────────────────────────────────────────────────────────┘
```

- shadcn `dialog`. Two-step flow: upload → preview → confirm.
- **Upload zone**: drag-and-drop area or click-to-browse `<input type="file" accept=".csv">`. Accepts `.csv` files only.
- **Template download**: "Download template CSV" ghost link generates a CSV with the correct column headers and one example row — helps users format their data correctly.
- **Expected columns**: name (required), role (required), department (required — must match enum), email, phone, location, start_date (required, YYYY-MM-DD), birthday (MM-DD).
- **Preview table**: after file is parsed, shows each row with a ✓ (valid) or ⚠ (warning — e.g. missing required field, unrecognized department) indicator. Rows with warnings are highlighted but not blocked — the user decides whether to fix or skip.
- **Row count + warning count**: "4 rows · 1 warning" below the preview.
- **Import button**: "Import N employees" primary button. On confirm: bulk insert via `useCreateEmployees()`, modal closes, directory updates, toast "N employees imported."
- **Cancel** or `[✕]` closes without importing.
- No column mapping UI — columns must match the expected names exactly. The template CSV enforces this.

* * *

**Data shape** (`src/data/seed.ts`):

- employees (10 entries):
  1. Jamie Lin — Senior Engineer, engineering, [jamie@acme.co](mailto:jamie@acme.co), +1 415 555 0101, SF, start_date: 2021-06-14, birthday: "01-04", fun_facts: {desk_snack: "Trader Joe's Everything Bagel Seasoning", hidden_talent: "Can solve a Rubik's cube in under 2 minutes", karaoke_song: "Don't Stop Believin'", dream_vacation: "Japan during cherry blossom season"}
  2. Raj Patel — Staff Engineer, engineering, [raj@acme.co](mailto:raj@acme.co), +1 212 555 0134, NYC, start_date: 2021-08-02, birthday: "03-22"
  3. Sora Tanaka — Engineer, engineering, [sora@acme.co](mailto:sora@acme.co), +1 555 555 0178, Remote, start_date: 2023-03-15, birthday: "07-09"
  4. Devon Park — Engineer, engineering, [devon@acme.co](mailto:devon@acme.co), +1 512 555 0199, Austin, start_date: 2024-01-08, birthday: "11-30"
  5. Aisha Okonkwo — Product Manager, product, [aisha@acme.co](mailto:aisha@acme.co), +1 555 555 0142, Remote, start_date: 2024-04-22, birthday: "02-02", fun_facts: {desk_snack: "Dark chocolate almonds", hidden_talent: "Speaks three languages", karaoke_song: "Lizzo – About Damn Time", dream_vacation: "A slow train through Portugal"}
  6. Carlos Méndez — Product Lead, product, [carlos@acme.co](mailto:carlos@acme.co), +1 415 555 0167, SF, start_date: 2022-11-01, birthday: "05-18"
  7. Marcus Webb — Product Designer, design, [marcus@acme.co](mailto:marcus@acme.co), +1 415 555 0123, SF, start_date: 2024-05-06, birthday: "01-17", fun_facts: {desk_snack: "Almonds", hidden_talent: "Amateur ceramicist", karaoke_song: "Fleetwood Mac – Dreams", dream_vacation: "A road trip through Patagonia"}
  8. Yuki Fernandez — UX Designer, design, [yuki@acme.co](mailto:yuki@acme.co), +1 512 555 0145, Austin, start_date: 2022-07-18, birthday: "09-05"
  9. Lin Chen — Operations Lead, operations, [lin@acme.co](mailto:lin@acme.co), +1 212 555 0156, NYC, start_date: 2024-03-11, birthday: "06-14"
  10. Noah Williams — Operations Coordinator, operations, [noah@acme.co](mailto:noah@acme.co), +1 555 555 0188, Remote, start_date: 2021-12-20, birthday: "08-27", fun_facts: {desk_snack: "Kettle chips", hidden_talent: "Builds custom mechanical keyboards", karaoke_song: "Mr. Brightside", dream_vacation: "Iceland in winter"}

**Data operations**:

| Operation | On this screen |
| --- | --- |
| **Create** | "+ New" button → `/directory/new`; "↑ Import" button → CSV Import dialog → bulk insert |
| **Read** | full employee list grouped by department; stat row aggregates |
| **Update** | row [⋯] → Edit → navigates to Employee Detail in edit mode |
| **Delete** | row [⋯] → Delete → Confirm Delete dialog; batch delete via checkbox selection + toolbar |
| **Filter** | Department select → filters by department enum; Location select → filters by location string; both stack |
| **Sort** | page hero sort → First name A–Z / Last name A–Z / Start date newest / oldest / Date added newest |
| **Search** | search input → filters by full_name, role, location (in-place, as-you-type) |
| **Paginate** | none — 10 employees fits in memory; add later if needed |
| **Aggregate** | total count, department count shown in stat row |
| **Drill down** | click row → Employee Detail (`/directory/:id`) |
| **Auth** | protected |

**First-time view notes**:

- Blankslate card: "No team members yet. Add the first one to get started."
- Primary CTA: "Add your first team member" button — navigates to `/directory/new`.
- Secondary option: "or import from CSV" text link below the primary CTA — opens CSV Import dialog.

**States**: first-time (blankslate), list view populated (default), grid view populated, search active, department filtered, location filtered, row selected (batch toolbar), csv-import modal open (upload → preview → importing), confirm-delete modal open, loading (skeleton rows)

* * *

## Employee Detail (`/directory/:id`)

Centered profile screen for a single employee. Full contact info, tenure, department badge, and fun fact ice-breaker cards. Focused reading view.

**First-time wireframe**:

```
(No empty state — this screen only exists when an employee record exists.)
```

**Populated wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Home / Directory / Jamie Lin                                           │
│                                                                          │
│  [User]  Jamie Lin                                                       │
│  Lead Engineer · Engineering · 3 yrs                                    │
│                                                                          │
│                    ┌────────────────────────────────┐                   │
│                    │                                │                   │
│                    │         ┌──────────┐           │                   │
│                    │         │          │           │                   │
│                    │         │    JL    │           │                   │
│                    │         │ (128px)  │           │                   │
│                    │         └──────────┘           │                   │
│                    │                                │                   │
│                    │     Jamie Lin                  │                   │
│                    │     Senior Engineer            │                   │
│                    │     [Engineering]  · SF        │                   │
│                    │     Joined Jun 2021 · 3 yrs    │                   │
│                    │                                │                   │
│                    │  [Edit]           [Remove]     │                   │
│                    │                                │                   │
│                    │  ──────────────────────────    │                   │
│                    │                                │                   │
│                    │  Contact                       │                   │
│                    │  [Mail]  jamie@acme.co         │                   │
│                    │  [Phone] +1 415 555 0101       │                   │
│                    │  [Cake]  January 4             │                   │
│                    │                                │                   │
│                    │  ──────────────────────────    │                   │
│                    │                                │                   │
│                    │  Get to know Jamie             │                   │
│                    │  ┌────────────┐ ┌───────────┐ │                   │
│                    │  │[Cookie]    │ │[Zap]      │ │                   │
│                    │  │Desk snack  │ │Hidden     │ │                   │
│                    │  │Trader Joe's│ │talent     │ │                   │
│                    │  │Everything  │ │Rubik's    │ │                   │
│                    │  │Bagel       │ │cube < 2   │ │                   │
│                    │  │Seasoning   │ │min        │ │                   │
│                    │  └────────────┘ └───────────┘ │                   │
│                    │  ┌────────────┐ ┌───────────┐ │                   │
│                    │  │[Mic]       │ │[Plane]    │ │                   │
│                    │  │Karaoke     │ │Dream      │ │                   │
│                    │  │Don't Stop  │ │vacation   │ │                   │
│                    │  │Believin'   │ │Japan -    │ │                   │
│                    │  │            │ │cherry     │ │                   │
│                    │  │            │ │blossoms   │ │                   │
│                    │  └────────────┘ └───────────┘ │                   │
│                    │                                │                   │
│                    └────────────────────────────────┘                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Topbar

- Same `workspace-layout-02` topbar. "+ New" navigates to `/directory/new` from this screen too.

### Breadcrumb

- shadcn `breadcrumb` inline below the topbar: "Home / Directory / Jamie Lin". "Home" and "Directory" are links; the employee name is the current page (non-link).

### Page header (shared `PageHeader` component)

- `[User]` icon + employee name as heading. Subtitle: "Lead Engineer · Engineering · 3 yrs" (`text-muted-foreground`) — role, department, and computed tenure inline.
- No sort control on detail pages — nothing to sort.
- Same `PageHeader` component as all other screens. The person's name IS the title, their role/dept/tenure IS the stat line.

### Profile card (view mode — default)

- Single centered shadcn `card` at `max-w-[600px] mx-auto`.
- Large 128px circular `avatar` (image if `avatar_url` set, otherwise initials) centered at the top.
- Name in heading (semibold), role in muted-foreground below, then department `badge` (tinted per department) + location in muted-foreground inline.
- Tenure pill: "Joined Jun 2021 · 3 yrs" — calculated from `start_date` relative to today.
- Two action buttons below the tenure: "Edit" (outline `button`, switches to edit mode in-place) and "Remove" (destructive outline `button`, opens Confirm Delete `dialog`).
- On delete confirm, navigates to `/directory` via breadcrumb path.

### Contact section (view mode)

- shadcn `separator` divides the header from the contact block.
- Three rows: `[Mail]` email address (display-only), `[Phone]` phone number (display-only), `[Cake]` birthday formatted as "January 4" (no year).
- Contact fields are display-only. Contact section only renders if at least one contact field is populated.

### Fun facts section (view mode)

- shadcn `separator` above, then "Get to Know [First Name]" heading.
- 2×2 grid of shadcn `card` tiles (small, borderless at rest, `bg-muted/60` on hover). Each tile: Lucide icon top-left, label in mono uppercase muted text ("DESK SNACK"), answer text below.
- Icons: `[Cookie]` desk snack, `[Zap]` hidden talent, `[Mic2]` karaoke song, `[Plane]` dream vacation.
- If no fun facts: "No fun facts yet — add some by editing this profile." in muted text. No empty tile grid.

### Edit mode (inline — toggled by "Edit" button)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Home / Directory / Jamie Lin / Edit                                    │
│                                                                          │
│  [UserPen]  Editing Jamie Lin                                            │
│  Changes save when you click "Save changes."                            │
│                                                                          │
│                    ┌────────────────────────────────┐                   │
│                    │                                │                   │
│                    │         ┌──────────┐           │                   │
│                    │         │    JL    │           │                   │
│                    │         │ (128px)  │           │                   │
│                    │         └──────────┘           │                   │
│                    │                                │                   │
│                    │  Identity                      │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ Jamie Lin              │    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ Senior Engineer        │    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │  ┌──────────┐ ┌────────────┐   │                   │
│                    │  │ Eng  [▾] │ │ Jun 14 [📅]│   │                   │
│                    │  └──────────┘ └────────────┘   │                   │
│                    │                                │                   │
│                    │  ── ── ── ── ── ── ── ── ──   │                   │
│                    │                                │                   │
│                    │  Contact                       │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ jamie@acme.co          │    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ +1 415 555 0101        │    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ San Francisco, CA      │    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ 01-04                  │    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │                                │                   │
│                    │  ── ── ── ── ── ── ── ── ──   │                   │
│                    │                                │                   │
│                    │  Fun facts                     │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ Trader Joe's Everything│    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ Rubik's cube < 2 min   │    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ Don't Stop Believin'   │    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │  ┌────────────────────────┐    │                   │
│                    │  │ Japan cherry blossoms   │    │                   │
│                    │  └────────────────────────┘    │                   │
│                    │                                │                   │
│                    │  [Cancel]  [Save changes →]    │                   │
│                    │                                │                   │
│                    └────────────────────────────────┘                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

- Clicking "Edit" on the profile switches the page to edit mode **in-place** — same URL, same card, but display values become editable inputs.
- Breadcrumb appends "Edit": Home / Directory / Jamie Lin / Edit.
- PageHeader changes: `[UserPen] Editing Jamie Lin` + "Changes save when you click Save changes." subtitle.
- The same three field groups (Identity, Contact, Fun facts) as the create form, pre-filled with current values.
- Avatar stays display-only at the top — no upload in edit mode.
- "Cancel" reverts to view mode (no navigation — same page). "Save changes →" saves and reverts to view mode. Toast "Changes saved."
- Same `max-w-[600px]` centered card. The layout is identical to the create form — muscle memory transfers between create and edit.
- No separate `/directory/:id/edit` route — edit mode is a React state toggle on the same page. The breadcrumb "Edit" suffix is cosmetic (pushed via `history.replaceState`, not a real route).

* * *

**Data shape** (`src/data/seed.ts`):

- Same `employees` entity as Directory. No additional entities on this screen.

**Data operations**:

| Operation | On this screen |
| --- | --- |
| **Create** | "+ New" topbar button → `/directory/new` |
| **Read** | single employee record by id: full_name, role, department, location, start_date, birthday, email, phone, avatar_url, fun_facts |
| **Update** | "Edit" button → inline edit mode (same page, fields become editable) |
| **Delete** | "Remove" button → Confirm Delete dialog → redirects to `/directory` |
| **Filter** | none |
| **Sort** | none |
| **Search** | none |
| **Paginate** | none |
| **Aggregate** | tenure calculated from start_date to today |
| **Drill down** | none — already at the detail level |
| **Auth** | protected |

**First-time view notes**:

- No empty state — this route only resolves when a valid employee `id` exists. A 404-style "Employee not found" card renders if the id is invalid or deleted.

**States**: view mode (default, shown above), edit mode (inline — fields become editable), no-fun-facts (fun facts section shows fallback text), confirm-delete modal open, loading (skeleton avatar + lines)

* * *

## Birthday Calendar (`/calendar`)

Month calendar with avatar dots on birthday dates. Makes the team feel human — see at a glance whose birthday is coming up and click through to their profile.

**First-time wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Birthday Calendar                                                       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  [ghost skeleton calendar grid behind]                           │   │
│  │                                                                  │   │
│  │         ┌────────────────────────────────────┐                  │   │
│  │         │  No birthdays on record yet.       │                  │   │
│  │         │  Add team members to see their     │                  │   │
│  │         │  birthdays here.                   │                  │   │
│  │         │                                    │                  │   │
│  │         │  [+ Add your first team member]    │                  │   │
│  │         └────────────────────────────────────┘                  │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

**Populated wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Birthday Calendar                                                       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │   [Month]  [Week]  [Year]        [← ]  January 2025  [ →]       │   │
│  │                                                                  │   │
│  │  Sun   Mon   Tue   Wed   Thu   Fri   Sat                        │   │
│  │  ────────────────────────────────────────────────────           │   │
│  │                     1     2     3    ●4    5                    │   │
│  │                                         JL                      │   │
│  │   6     7     8     9    10    11    12                         │   │
│  │                                                                  │   │
│  │  13    14    15    16    ●17   18    19                         │   │
│  │                              MW                                  │   │
│  │  20    21    22    23    24    25    26                         │   │
│  │                                                                  │   │
│  │  27    28    29    30    31                                      │   │
│  │                                                                  │   │
│  │  ────────────────────────────────────────────────────           │   │
│  │  This month: [JL] Jamie Lin (Jan 4)  [MW] Marcus Webb (Jan 17)  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Topbar

- Same `workspace-layout-02` topbar. "+ New" navigates to `/directory/new`.

### Page header (shared `PageHeader` component)

- `[Calendar]` icon + "Birthdays" heading left. "Month ▾" view control right (`text-primary text-sm`).
- Subtitle: "3 upcoming" (`text-muted-foreground`). Updates based on the currently viewed period.
- Same `PageHeader` component as all other screens.

### Calendar controls

- View toggle: shadcn `toggle-group` with three options — Month, Week, Year. Month view is the default and most useful for at-a-glance birthday awareness.
- Previous / Next navigation: `[ChevronLeft]` and `[ChevronRight]` `button` (ghost) flanking the current period label "January 2025".
- Controls sit in a single row above the calendar grid.
- No "Today" button — adding it creates a tertiary control for a low-frequency action. The user can click next/prev to get back. Add if user research shows it's needed.

### Calendar grid (month view)

- shadcn `calendar` with custom day cell renderer. Days of the week as column headers (Sun–Sat).
- Days that have a birthday: show a circular `avatar` dot (32px, initials) below the date number. Avatar uses the same initials + color system as the directory.
- Multiple birthdays on the same date: stack up to 2 avatar dots, "+N more" text if there are more than 2.
- Clicking an avatar dot navigates to `/directory/:id` for that employee.
- Today's date is highlighted with a subtle ring (shadcn `calendar` default today indicator).
- No event titles next to dots — just the avatar. The identity is the event. Text would crowd the cell.
- Weekends are not dimmed — birthdays fall on any day and all days should feel equally actionable.

### Calendar grid (week view)

- Seven-column week grid showing the current week (Sun–Sat). Each column shows the date number at the top and any birthday avatars below.
- Same click-to-profile behavior.
- No time slots — birthdays are all-day events. A time-slotted week view (like Google Calendar) would be wrong for this use case.

### Calendar grid (year view)

- 12-month mini grid. Each month is a compact 7×5 cell grid showing only date numbers. Dates with birthdays get a small mint-colored dot indicator (no avatar — too small to render legibly).
- Click a date navigates to the month view for that month (not directly to a profile — at this zoom level multiple birthdays could share a date).
- Year view gives the "how spread out are our birthdays?" overview at a glance.

### This month panel

- Below the calendar grid: a row listing all birthdays in the currently viewed month. Format: `avatar` (32px) + "Full Name (Month Day)". Separator line above.
- Empty month: "No birthdays this month." in muted-foreground.
- Clicking a name navigates to `/directory/:id`.
- No separate sidebar panel for the birthdays list — keeping it inline below the calendar avoids a split-pane layout for what is already a single-focus screen.

* * *

**Data shape** (`src/data/seed.ts`):

- Birthdays derived from `employees.birthday` ("MM-DD") field — no separate entity needed.
- 10 birthdays across 10 employees ensure every month has at least one dot (Jan: 2, Feb: 1, Mar: 1, May: 1, Jun: 1, Jul: 1, Aug: 1, Sep: 1, Nov: 1).

**Data operations**:

| Operation | On this screen |
| --- | --- |
| **Create** | "+ New" topbar button → `/directory/new` |
| **Read** | employees.birthday + employees.full_name + employees.id for all employees; rendered into calendar day cells |
| **Update** | none |
| **Delete** | none |
| **Filter** | month/week/year view toggle; prev/next navigation changes the rendered period |
| **Sort** | birthdays sorted by day-of-month within each month panel |
| **Search** | none |
| **Paginate** | none |
| **Aggregate** | birthday count per month for the "This month" panel |
| **Drill down** | click avatar dot → Employee Detail (`/directory/:id`) |
| **Auth** | protected |

**First-time view notes**:

- Blankslate card: "No birthdays on record yet. Add team members to see their birthdays here."
- Primary CTA: "Add your first team member" — navigates to `/directory/new`.
- Calendar grid renders as a skeleton background behind the floating blankslate card.

**States**: first-time (blankslate), month view populated (default), week view, year view, navigating to /directory/new, loading (skeleton calendar grid)

* * *

## Settings (`/settings`)

Account and team management. Three tabs: Profile (name, password), Team (invite, change role, revoke), General (theme toggle, delete account).

**First-time wireframe**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Settings                                                                │
│                                                                          │
│  [ Profile ]  [ Team ]  [ General ]                                    │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Profile                                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Full name                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │ Your name                                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  Email                                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │ you@company.com  (read-only)                                │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  New password                                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │ ••••••••••••                                                │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  Confirm new password                                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │ ••••••••••••                                                │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  [Save changes]                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Populated wireframe** (Team tab active):

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [logo] Team Directory   Overview  Directory  Calendar  Settings        │
│                                                    [+ New]  [avatar]    │
│  ────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Settings                                                                │
│                                                                          │
│  [ Profile ]  [ Team ]  [ General ]                                    │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Team members                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ┌────┐  Sarah Chen          sarah@acme.co   [Admin]  [⋯]       │   │
│  │  │ SC │                                                          │   │
│  │  └────┘                                                          │   │
│  │  ┌────┐  Marcus Webb         marcus@acme.co  [Member] [⋯]       │   │
│  │  │ MW │                                                          │   │
│  │  └────┘                                                          │   │
│  │  ┌────┐  invite@pending.co   (pending)       [Member] [⋯]       │   │
│  │  │ .. │                                                          │   │
│  │  └────┘                                                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Invite a team member                                                    │
│  ┌──────────────────────────────────────┐  ┌──────────┐  [Send invite] │
│  │ colleague@company.com                │  │ Member ▾ │               │
│  └──────────────────────────────────────┘  └──────────┘               │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  (General tab shown separately below)                                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Topbar

- Same `workspace-layout-02` topbar. "Settings" nav tab is active.

### Page header (shared `PageHeader` component) + tab navigation

- `[Settings]` icon + "Settings" heading. Subtitle: "Profile · Team · General" (`text-muted-foreground`).
- shadcn `tabs` below with three tab labels: Profile, Team, General.
- Tab content renders below a full-width `separator`. No tab icons — the labels are short enough to be self-identifying without icon decoration.
- Same `PageHeader` component as all other screens.

### Profile tab

- shadcn `form` inside the tab panel. Fields: Full name (`input`, editable), Email (`input`, read-only — email is set at auth and not changeable here), New password (`input`, type="password"), Confirm new password (`input`, type="password").
- "Save changes" primary `button` at bottom. Validates that passwords match and new password is ≥ 8 characters before submitting.
- Password fields are optional — leaving them blank only updates the name. This is a common pattern that avoids forcing users to re-enter their password on every profile update.
- No avatar upload on this screen — profile avatar (`profiles.avatar_url`) is outside the MVP scope of this form. Can be added as an extension.

### Team tab

- Two sections: current members list and invite form.
- Members list: each row shows `avatar` (initials, 40px) + name/email + role `badge` (Admin = mint, Member = gray outline) + `[⋯]` `dropdown-menu`.
- Dropdown menu options: "Change to Admin" / "Change to Member" (toggle role), and "Revoke access" (opens Confirm Revoke `dialog`).
- Pending invites show in the same list with a dashed `avatar` placeholder and "(pending)" label in muted-foreground.
- Invite form below the list: email `input` + role `select` (Admin / Member) + "Send invite" `button`. Submitted invite appears in the pending list in-place.
- No bulk role change — at small-team scale, individual row actions are sufficient and safer.

### General tab

- Two settings: theme toggle and delete account.
- Theme row: "Appearance" label + description "Switch between light and dark mode" (muted-foreground) + shadcn `switch` right-aligned. Toggle applies the `.dark` class in-place immediately.
- Delete account row: "Delete account" label + description "Permanently delete your account and all data" (muted-foreground) + "Delete account" destructive `button` right-aligned. Button opens Confirm Delete Account `dialog`.
- shadcn `separator` between theme row and delete row.
- No export data option — out of scope for this template. The directory is intentionally lean.

### Confirm Revoke modal

```
┌──────────────────────────────────────────┐
│  Revoke access for Marcus Webb?          │
│                                          │
│  Marcus will lose access to the team    │
│  directory immediately.                  │
│                                          │
│  [Cancel]        [Revoke access]         │
└──────────────────────────────────────────┘
```

- shadcn `alert-dialog`. "Cancel" (outline) and "Revoke access" (destructive).

### Confirm Delete Account modal

```
┌──────────────────────────────────────────┐
│  Delete your account?                    │
│                                          │
│  This will permanently delete your      │
│  account and all team data. This        │
│  cannot be undone.                       │
│                                          │
│  Type DELETE to confirm:                 │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Cancel]        [Delete account]        │
└──────────────────────────────────────────┘
```

- shadcn `alert-dialog`. Highest severity — requires typing "DELETE" before the destructive button enables. Copy emphasizes permanence and irreversibility.

* * *

**Data shape** (`src/data/seed.ts`):

- profiles: { user_id, full_name: "Sarah Chen", avatar_url: null }
- user_roles: 2 entries — { user_id: "u1", role: "admin" }, { user_id: "u2", role: "member" }
- invitations: 1 entry — { email: "[invite@pending.co](mailto:invite@pending.co)", role: "member", status: "pending", invited_by: "u1", created_at: "2025-01-10T09:00:00Z" }

**Data operations**:

| Operation | On this screen |
| --- | --- |
| **Create** | invite form → send invite → creates invitation record |
| **Read** | profiles (current user name/email), user_roles (team member list + roles), invitations (pending invites) |
| **Update** | Profile tab: save name/password → updates profiles; Team tab: change role → updates user_roles; General tab: theme switch → applies dark class |
| **Delete** | Team tab: revoke access → removes user_roles entry (confirmation dialog); General tab: delete account (confirmation dialog) |
| **Filter** | none |
| **Sort** | team members sorted by role (admins first), then by name |
| **Search** | none |
| **Paginate** | none |
| **Aggregate** | none |
| **Drill down** | none |
| **Auth** | protected |

**First-time view notes**:

- Profile tab shows empty name field (user just signed up via email/password) or pre-filled name (signed up via OAuth).
- Team tab shows only the current user as the sole Admin. Invite form is immediately usable.
- General tab is always populated — theme toggle has a state (light/dark) from first load.

**States**: profile tab (default), team tab, general tab, invite sent (pending row appears), role changed (badge updates in-place), confirm-revoke modal open, confirm-delete-account modal open, save-success (toast notification)

* * *

## What's NOT Changing

- `src/layouts/application-layout.tsx` — used as-is for the auth screen fullscreen shell
- `src/layouts/workspace-layout-02.tsx` — used as-is for the pill-tab topbar across all app screens
- `src/components/ui/` — sacred, not modified
- `src/components/ai-elements/` — sacred, not modified
- `src/components/base/button.tsx` — used as-is
- `src/components/base/logo.tsx` — used as-is
- `src/data/landing.ts` — existing landing data file, will be extended

Removed:

- none — all existing files are kept or extended

Renames:

- none

New files:

- `src/pages/landing/components/footer.tsx` — minimal three-column landing footer (logo + tagline, nav links, legal links)
- `src/pages/overview/index.tsx` — Overview screen (`/overview`)
- `src/pages/overview/components/stat-row.tsx` — inline plain-text stat row (employees · departments · new hires)
- `src/pages/overview/components/recent-hires-card.tsx` — shadcn card with avatar-led recent hire list
- `src/pages/overview/components/birthday-callout-card.tsx` — upcoming birthdays card with avatar dots + calendar link
- `src/pages/directory/index.tsx` — Directory screen (`/directory`)
- `src/pages/directory/components/employee-table.tsx` — department-grouped shadcn table with avatars, badges, checkboxes
- `src/pages/directory/components/employee-grid.tsx` — Apple Classroom-style 80px circular avatar grid
- `src/pages/directory/new/index.tsx` — New Employee full-page form (`/directory/new`)
- `src/pages/directory/components/csv-import-dialog.tsx` — CSV upload + preview + bulk import dialog
- `src/pages/directory/components/confirm-delete-dialog.tsx` — single and batch delete confirmation alert-dialog
- `src/pages/directory/components/batch-toolbar.tsx` — sticky batch-delete toolbar (appears on multi-select)
- `src/pages/employee-detail/index.tsx` — Employee Detail screen (`/directory/:id`)
- `src/pages/employee-detail/components/fun-facts-grid.tsx` — 2×2 card grid of ice-breaker fun facts
- `src/pages/calendar/index.tsx` — Birthday Calendar screen (`/calendar`)
- `src/pages/calendar/components/birthday-calendar.tsx` — shadcn calendar with custom birthday avatar dot day renderers
- `src/pages/calendar/components/this-month-panel.tsx` — inline panel listing this month's birthdays
- `src/pages/settings/index.tsx` — Settings screen (`/settings`)
- `src/pages/settings/components/profile-form.tsx` — name + password form
- `src/pages/settings/components/team-tab.tsx` — member list + invite form
- `src/pages/settings/components/general-tab.tsx` — theme switch + delete account
- `src/pages/auth/index.tsx` — Auth screen (`/auth`) with sign in / sign up tabs + OAuth buttons
- `src/data/seed.ts` — typed seed fixtures for all 10 employees, invitations, user_roles