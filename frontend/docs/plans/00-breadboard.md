# Team Directory

## Product Overview

**Team Directory** is a lightweight employee directory for small teams who want a human way to know who works where, see who's new, and never forget a birthday. It replaces the scattered spreadsheet with a searchable, browseable roster grouped by department — complete with fun facts and a birthday calendar that makes colleagues feel real, not just names in a list.

**Core actions:**

- **Add an employee** — open a modal, fill two field groups (Identity + Contact), and the person appears in the directory instantly
- **Browse the directory** — search, filter by department or location, toggle list/grid view, and scan avatar-led rows grouped by department
- **View a profile** — see contact info, tenure, and ice-breaker fun facts for any colleague
- **Check the birthday calendar** — month/week/year views with avatar dots on dates so upcoming birthdays are never a surprise

**Tech stack**: Vite, React, TypeScript, Tailwind CSS, shadcn/ui **Pages**: `/` (landing — marketing page), `/overview` + `/demo/overview` (overview dashboard), `/directory` + `/demo/directory` (employee roster), `/directory/:id` + `/demo/directory/:id` (employee profile), `/calendar` + `/demo/calendar` (birthday calendar), `/settings` (account, team, general), `/auth` (sign in / sign up)

* * *

## Breadboard

Places, affordances, and connections. Play through the use case — does the flow work?

```
Landing Page (/)                     Overview (/overview)                             Directory (/directory)
────────────────                     ────────────────────                             ──────────────────────
  Get started ──→ Sign Up tab (/auth)  Stat row (employees · depts · new hires)       Search ──→ (in-place — results filter)
  Sign in ──→ Sign In tab (/auth)      Recent hires list ──→ Employee Detail          Filter by department ──→ (in-place — department filter)
  Features (scroll) ──→ #features      Birthday callout ──→ Calendar (/calendar)      Filter by location ──→ (in-place — location filter)
  See demo ──→ Demo Overview           "New" button ──→ Add Employee (modal — opens)  Sort control ──→ (in-place — table re-sorts)
                                       Add employee form fills ──→ (in-place —        Toggle list/grid view ──→ (in-place — layout swaps)
                                         fields validated)                            Click employee row ──→ Employee Detail (/directory/:id)
                                       Save employee ──→ (in-place — modal closes,   Row action: edit ──→ Edit Employee (modal — pre-filled)
                                         directory + stats update, auto)              Row action: delete ──→ (modal — confirm delete)
                                       Dismiss modal ──→ (in-place — modal closes)   Multi-select rows ──→ (in-place — batch toolbar appears)
                                       View all birthdays ──→ Calendar (/calendar)   Batch delete ──→ (modal — confirm batch delete)
                                                                                     "New" button ──→ Add Employee (modal — opens)
                                       Logout ──→ Sign out (clears session, returns to /)

Employee Detail (/directory/:id)     Calendar (/calendar)                             Settings (/settings)
────────────────────────────────     ────────────────────                             ────────────────────
  Edit employee ──→ Edit (modal —      Switch month/week/year view ──→ (in-place —    Profile tab: update name/password ──→ (in-place — saved)
    pre-filled fields)                   calendar re-renders)                         Team tab: invite by email ──→ (in-place — invite sent)
  Delete employee ──→ (modal —         Navigate prev/next ──→ (in-place — period      Team tab: change role ──→ (in-place — role updated)
    confirm delete)                      advances or retreats)                        Team tab: revoke access ──→ (modal — confirm revoke)
  Delete confirms ──→ Directory        Click birthday dot ──→ Employee Detail         General tab: toggle theme ──→ (in-place — theme swaps)
    (/directory, auto)                   (/directory/:id)                             General tab: delete account ──→ (modal — confirm delete)
  Back via sidebar ──→ Directory      "New" button ──→ Add Employee (modal — opens)  Logout ──→ Sign out (clears session, returns to /)
  View birthday on calendar ──→       Logout ──→ Sign out (clears session,
    Calendar (/calendar)                returns to /)
  Logout ──→ Sign out (clears session, returns to /)

Auth (/auth)
────────────
  Sign in tab ──→ (in-place — sign in form)
  Sign up tab ──→ (in-place — sign up form)
  Google OAuth ──→ Overview (/overview, auto)
  Apple OAuth ──→ Overview (/overview, auto)
  Email/password sign in ──→ Overview (/overview, on success)
  Email/password sign up ──→ Overview (/overview, on success)
  Back to home ──→ Landing (/)

FTUX — First Session
─────────────────────
  Sign up completes ──→ Overview (/overview), first-time view (empty stats, no hires)
  "New" button ──→ Add Employee (modal — opens, Identity + Contact groups)
  Fill Identity fields ──→ (in-place — department select, start date picker)
  Fill Contact fields ──→ (in-place — email, phone, location, birthday)
  Save employee ──→ (in-place — modal closes, first employee appears, auto)
  Stat row updates ──→ (in-place — 1 employee · 1 department · 1 new hire, auto)
  Click employee name ──→ Employee Detail (/directory/:id), first profile view
  View birthday on calendar ──→ Calendar (/calendar), first birthday dot visible
```

* * *

## Screen List

| # | Route | Screen | Description |
| --- | --- | --- | --- |
| 1 | `/` | Landing page | Marketing page — hero, features, testimonials, footer |
| 2 | `/auth` | Auth | Single route with Sign in / Sign up tabs; Google + Apple OAuth buttons, email/password form |
| 3 | `/overview` | Overview | Inline stat row, recent hires list with avatars, single-line birthday callout, "New" button in topbar |
| 4 | `/directory` | Directory | iCloud-style hero with stats + sort control; employee list grouped by department with search, filters, list/grid toggle, row actions, multi-select batch delete |
| 5 | `/directory/:id` | Employee Detail | Centered profile — large circular avatar, name, role, department badge, tenure, contact info, fun facts ice-breaker cards |
| 6 | `/calendar` | Birthday Calendar | Month/week/year calendar with avatar dots on birthday dates; click dot navigates to profile |
| 7 | `/settings` | Settings | Tabbed — Profile (name, password), Team (invite, change role, revoke), General (theme toggle, delete account) |

* * *

## Key Decisions

| # | Decision | Rationale |
| --- | --- | --- |
| D1 | Seed data: 10 employees across 4 departments (Engineering ×4, Product ×2, Design ×2, Operations ×2); start dates Jun 2021–May 2024; locations SF, NYC, Austin, Remote; fun facts on 4 of 10; birthdays spread across all 12 months | Demo feels human and populated at a glance. Typed fixtures in `src/data/seed.ts` mirror real Supabase row shape. Enough variety to show search, filter, and birthday dots without overloading |
| D2 | Dual routing — `/*` (Supabase-backed, auth) and `/demo/*` (seed data, no auth); `/auth` is shared (no demo mirror needed) | `/*` is the real product. `/demo/*` mirrors Overview, Directory, Detail, Calendar, and Settings with seed data for template marketing. The breadboard traces the authenticated FTUX |
| D3 | Departments are a hardcoded TypeScript enum (\`engineering | product |
| D4 | Data layer: Supabase tables — `employees` (id, user_id, full_name, role, department, email, phone, location, start_date, birthday, avatar_url, fun_facts jsonb, created_at, updated_at), `profiles` (id, user_id, full_name, avatar_url), `user_roles` (id, user_id, role), `invitations` (id, email, role, invited_by, status, created_at). RLS on all tables scoped to authenticated users. Seeded on signup via `handle_new_user()` for `/demo/*`; real accounts start empty | Named tables with full column shapes so the cloudboard step can derive the schema directly |
| D5 | Add/edit employee uses a modal with two field groups (Identity: name, role, department, start date; Contact: email, phone, location, birthday, fun facts) — NOT a separate `/employees/new` route | Modals keep the directory context visible and match the "never leave the index for creation" guideline. Fun facts are part of the edit modal, not a separate flow |
| D6 | First-run: real user signs up → Overview with empty stats and a centered "Add your first team member" prompt → "New" button opens add-employee modal → first employee appears → stat row updates. No auto-seeded data in real accounts. Empty Directory shows skeleton background + floating card with "No team members yet. Add the first one." | Empty states use skeleton backgrounds with gradient fade and a floating card (per blankslates spec). The "New" sidebar button is the consistent first-action CTA across all app screens |

* * *

## Design Decisions

**Primary color**: `mint`

**Section decisions**:

| Slot | Considered | Chosen | Why this one, not the others |
| --- | --- | --- | --- |
| Header | `header`, `header-04` | `header` | Clean horizontal nav with "Get started" + "Sign in" CTAs. `header-04` adds complexity not needed for a simple team tool aimed at small orgs — this audience wants clarity, not a feature-dense navigation bar |
| Hero | `hero-01`, `hero-02`, `hero-03` | `hero-02` | Centered layout with a bold headline and subtitle works for a people-focused tool where the product screenshot is secondary to the human benefit. `hero-01` (split/LTR with mockup) would force a directory screenshot into half the viewport — the directory's value is in density, not a cropped snippet. `hero-03` is better for launch-announcement styles — this is a steady-state team tool, not a launch moment |
| Feature showcase (primary) | `feature-showcase-01`, `feature-showcase-02`, `features-03` | `feature-showcase-02` | Auto-cycling tabs let us showcase Directory, Profile, Calendar, and Overview as distinct named features without building a dense grid. The cycler fits exactly four feature surfaces. `feature-showcase-01` is a static grid — loses the "here's what each screen does" narrative. `features-03` is better for icon-led capability lists, not screen showcases |
| Feature showcase (secondary) | `feature-showcase-01`, `feature-showcase-02`, `features-03` | `features-03` | Icon-led three-column grid for communicating the three human benefits (know your team, never miss a birthday, grow together) below the primary showcase. `feature-showcase-01` repeats the same pattern as the primary. `feature-showcase-02` cycler would be redundant back-to-back |
| Testimonials | `testimonial-01`, `testimonial-02`, `testimonial-03`, `testimonial-slider` | `testimonial-01` | Simple stacked quote cards from team leads and operations managers — the target persona for a people directory. `testimonial-slider` is better for many testimonials; we have 3. `testimonial-02` and `testimonial-03` add visual weight (large images, bold layouts) that competes with the warm, human tone this template needs |
| Footer | `invent` | `invent` | No footer component exists in the catalog. Build a minimal three-column footer: logo + tagline left, nav links center, theme toggle right. Matches the small-team, no-fuss personality |
| Overview stats | shadcn `card` + plain text row | shadcn `card` + plain text row | The idea explicitly specifies "stat row is plain text (10 employees · 4 departments · 2 new hires), not cards." Render as a muted-foreground inline text row inside the overview card, not metric cards with borders |
| Directory table | shadcn `table` + `avatar` + `badge` + `checkbox` | shadcn `table` + `avatar` + `badge` + `checkbox` | Structured department-grouped list with dotted dividers. `table` gives sortable columns and accessible row selection. `avatar` on every row satisfies the "people get avatars" design guideline. `badge` for department chips. `checkbox` for multi-select batch delete |
| Add/edit employee modal | shadcn `dialog` + `form` + `input` + `select` + `calendar` (date picker) | shadcn `dialog` + `form` + `input` + `select` + `calendar` | Two-group creation flow in an overlay. `dialog` keeps directory context visible behind the modal. `select` for the department enum. `calendar` popover for start_date and birthday pickers |
| Employee profile | shadcn `card` + `avatar` + `badge` + `separator` | shadcn `card` + `avatar` + `badge` + `separator` | Centered reading view (max-w-[600px]) with a large 128px circular avatar, role badge, tenure pill, and separated sections for contact and fun facts. No complex layout needed — the profile earns its own screen through content richness, not visual complexity |
| Birthday calendar | shadcn `calendar` | shadcn `calendar` | Month view with custom day renderers for birthday avatar dots. The idea names shadcn calendar explicitly. No Recharts needed here — this is a navigable calendar, not a chart |
| Settings tabs | shadcn `tabs` + `form` + `input` + `switch` + `dialog` | shadcn `tabs` + `form` + `input` + `switch` + `dialog` | Three-tab settings (Profile, Team, General) maps directly to shadcn `tabs`. `switch` for theme toggle. `dialog` for destructive confirmations (revoke, delete account) |
| Layout | `workspace-layout-02` | `workspace-layout-02` | Pill-tab topbar with logo left, four icon+label tabs center (Overview, Directory, Calendar, Settings), "+ New" button and avatar right. A directory with 4 screens doesn't need a permanent sidebar — the topbar keeps the full viewport width for the employee list and calendar. `workspace-layout-03` (sidebar) wastes 240px on 4 nav items. `workspace-layout-01` (peekable) is better for focus-mode apps. `workspace-layout-04` (icon-only tabs) loses the text labels that help new users orient. Breadcrumbs render inline at the top of the content area on detail pages (Home / Directory / Jamie Lin) |

* * *

## Plans

| # | Document | What it covers |
| --- | --- | --- |
| 00 | [00-breadboard.md](00-breadboard.md) | This doc — scope, breadboard, decisions |
| 00 | [00-screenboard.md](00-screenboard.md) | Per-screen wireframes, design system, mock data |
| 00 | [00-storyboard.md](00-storyboard.md) | Transitions between screens, copy decisions |