# Implementation Map — Team Directory

Maps each screen from the Screen List to existing starter components and new components needed.

---

## Screen 1: Landing Page (`/`)

| Component | Strategy | Source | Notes |
|---|---|---|---|
| Header | **Reuse as-is** | `pages/landing/components/header.tsx` | Swap CTA labels: "View demo" + "Get started" |
| Hero | **Reuse + swap content** | `pages/landing/components/hero-02.tsx` | Replace headline/subtitle/CTAs with Team Directory copy |
| Feature showcase | **Reuse + swap content** | `pages/landing/components/feature-showcase-02.tsx` | 4 tabs: Directory, Profiles, Birthdays, Overview |
| Why teams love it | **Reuse + swap content** | `pages/landing/components/features-03.tsx` | 3 benefit cards with Tabler icons |
| Testimonials | **Reuse + swap content** | `pages/landing/components/testimonial-01.tsx` | 3 testimonials from seed data |
| CTA banner | **Reuse + swap content** | `pages/landing/components/cta-01.tsx` | "Your team deserves better than a spreadsheet." |
| Footer | **New component** | `pages/landing/components/footer.tsx` | 3-column footer: logo, nav links, legal |

---

## Screen 2: Auth (`/auth`)

| Component | Strategy | Source | Notes |
|---|---|---|---|
| Page shell | **Reuse as-is** | `layouts/application-layout.tsx` | Fullscreen, centered card |
| Auth card | **New component** | `pages/auth/index.tsx` | Tabs (sign in/sign up), OAuth buttons, email form |
| Auth provider | **New (infra)** | `lib/auth/auth-provider.tsx` | onAuthStateChange before getSession |
| Protected route | **New (infra)** | `components/protected-route.tsx` | Redirect to /auth when !user |

---

## Screen 3: Overview (`/overview`)

| Component | Strategy | Source | Notes |
|---|---|---|---|
| Layout | **Reuse as-is** | `layouts/workspace-layout-02.tsx` | Pill-tab topbar |
| Page header | **New component** | `pages/overview/components/page-header.tsx` | Shared pattern: icon + title + stat subtitle |
| Stat row | **New component** | `pages/overview/components/stat-row.tsx` | Plain text: "10 employees · 4 departments · 2 new hires" |
| Recent hires | **New component** | `pages/overview/components/recent-hires-card.tsx` | Avatar-led list, 3 rows |
| Birthday callout | **New component** | `pages/overview/components/birthday-callout.tsx` | Single-line upcoming birthday |
| Blankslate | **Adapt pattern** | uses shadcn card + skeleton bg | Skeleton rows + floating card CTA |

---

## Screen 4: Directory (`/directory`)

| Component | Strategy | Source | Notes |
|---|---|---|---|
| Layout | **Reuse as-is** | `layouts/workspace-layout-02.tsx` | Same topbar |
| Toolbar | **New component** | `pages/directory/components/toolbar.tsx` | View toggle, + New, Import, actions |
| Page header | **Reuse + swap content** | shared `PageHeader` from overview | [Users] Directory + sort control + stat subtitle |
| Filter bar | **New component** | `pages/directory/components/filter-bar.tsx` | Search input + department select + location select |
| Employee table | **New component** | `pages/directory/components/employee-table.tsx` | Department-grouped rows, checkboxes, avatars, badges |
| Employee grid | **New component** | `pages/directory/components/employee-grid.tsx` | 80px circular avatars, Apple Classroom style |
| Batch toolbar | **New component** | `pages/directory/components/batch-toolbar.tsx` | Sticky bottom bar on multi-select |
| New employee form | **New component** | `pages/directory/new/index.tsx` | Full-page form, 3 field groups |
| CSV import dialog | **New component** | `pages/directory/components/csv-import-dialog.tsx` | Upload + preview + bulk insert |
| Confirm delete | **New component** | `pages/directory/components/confirm-delete-dialog.tsx` | Single + batch delete confirmation |

---

## Screen 5: Employee Detail (`/directory/:id`)

| Component | Strategy | Source | Notes |
|---|---|---|---|
| Layout | **Reuse as-is** | `layouts/workspace-layout-02.tsx` | Same topbar |
| Profile card | **New component** | `pages/employee-detail/components/profile-card.tsx` | 128px avatar, name, role, dept badge, tenure |
| Contact section | **New component** | `pages/employee-detail/components/contact-section.tsx` | Email, phone, birthday rows |
| Fun facts grid | **New component** | `pages/employee-detail/components/fun-facts-grid.tsx` | 2x2 ice-breaker card grid |
| Edit mode | **New component** | `pages/employee-detail/components/edit-form.tsx` | Inline edit, same field groups as create |

---

## Screen 6: Birthday Calendar (`/calendar`)

| Component | Strategy | Source | Notes |
|---|---|---|---|
| Layout | **Reuse as-is** | `layouts/workspace-layout-02.tsx` | Same topbar |
| Calendar controls | **New component** | `pages/calendar/components/calendar-controls.tsx` | Month/week/year toggle, prev/next nav |
| Birthday calendar | **New component** | `pages/calendar/components/birthday-calendar.tsx` | shadcn calendar + custom avatar dot day cells |
| This month panel | **New component** | `pages/calendar/components/this-month-panel.tsx` | Inline list of month's birthdays |

---

## Screen 7: Settings (`/settings`)

| Component | Strategy | Source | Notes |
|---|---|---|---|
| Layout | **Reuse as-is** | `layouts/workspace-layout-02.tsx` | Same topbar |
| Profile form | **New component** | `pages/settings/components/profile-form.tsx` | Name + email (readonly) + password |
| Team tab | **New component** | `pages/settings/components/team-tab.tsx` | Member list + invite form |
| General tab | **New component** | `pages/settings/components/general-tab.tsx` | Theme switch + delete account |

---

## Shared Components (extract on 3rd use)

| Component | Used by | Notes |
|---|---|---|
| `PageHeader` | Overview, Directory, Employee Detail, Calendar, Settings | Icon + title + optional sort + stat subtitle. Extract after screen 3 (3rd use). |
| `Badge` (base) | Directory, Employee Detail | Color-variant wrapper in `components/base/badge.tsx` |
| `Blankslate` | Overview, Directory, Calendar | Skeleton bg + floating card. Evaluate for extraction after 3 screens. |

---

## Infrastructure (built first, before screens)

| File | What | Status |
|---|---|---|
| `src/data/seed.ts` | Typed seed fixtures for all entities | Done |
| `src/lib/data-provider.tsx` | DataProvider interface + SeedDataProvider + SupabaseDataProvider | Done |
| `src/lib/auth/auth-provider.tsx` | AuthProvider with onAuthStateChange before getSession | Done |
| `src/components/protected-route.tsx` | Redirect to /auth when !user && !loading | Done |
| `src/lib/filter-context.tsx` | Shared filter state for directory + calendar | Done |
| `src/components/base/badge.tsx` | Color-variant badge wrapper | Done |
| `src/integrations/supabase/client.ts` | Supabase client | Done |
| `src/integrations/lovable/index.ts` | Lovable auth shim (overwritten by cloud_apply) | Done |
| `src/App.tsx` | All routes: public, demo, protected | Done |
| Theme tint | Mint primary already in style-pack.css | Already set |
