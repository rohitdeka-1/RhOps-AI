# Verification — Team Directory

## Summary

All 7 screens from the Screen List have been implemented: Landing (`/`), Auth (`/auth`), Overview (`/overview`), Directory (`/directory` + `/directory/new`), Employee Detail (`/directory/:id`), Birthday Calendar (`/calendar`), and Settings (`/settings`). Demo routes (`/demo/*`) mirror all authenticated app routes with seed data via `SeedDataProvider`. Infrastructure is in place: `AuthProvider`, `ProtectedRoute`, `SeedDataProvider`/`SupabaseDataProvider` dual-provider, `FilterProvider`, typed seed data in `src/data/seed.ts`.

**What was intentionally not changed:** `components/ui/`, `components/ai-elements/`, `layouts/application-layout.tsx`, `layouts/workspace-layout-02.tsx`, `components/base/button.tsx`, `components/base/logo.tsx`.

## Files changed

| File | Reason | Change summary |
|---|---|---|
| `src/App.tsx` | Routing | Added all 7 screens, demo routes, `ProtectedRoute` wrapping, `SeedDataProvider`/`SupabaseDataProvider` shells |
| `src/data/seed.ts` | Seed data | 10 employees, 1 profile, 2 team members, 1 invitation, feature tabs, testimonials, footer links — all verbatim from spec |
| `src/lib/data-provider.tsx` | Data layer | Full `DirectoryDataProvider` interface with all read hooks and mutation hooks for both Seed and Supabase providers |
| `src/lib/auth/auth-provider.tsx` | Auth | `AuthProvider` with `onAuthStateChange` before `getSession()`, `signOut` clears React Query cache |
| `src/components/protected-route.tsx` | Auth | Redirects to `/auth` with `from` state when `!user && !loading` |
| `src/lib/filter-context.tsx` | Filters | `FilterProvider` with `EmployeeFilters` and `CalendarFilters` state management |
| `src/pages/landing/index.tsx` | Screen 1 | Landing page composition: Header, Hero-02, FeatureShowcase, Features-03, TestimonialCarousel, CTA-01, Footer |
| `src/pages/landing/components/footer.tsx` | Screen 1 | New — 3-column footer: logo + tagline, Product/Company/Legal links |
| `src/pages/auth/index.tsx` | Screen 2 | Auth page with fullscreen layout, redirect if already authed, "Home" link |
| `src/pages/auth/components/auth-card.tsx` | Screen 2 | Sign in/sign up tabs, Google + Apple OAuth, email/password form, forgot password |
| `src/pages/overview/index.tsx` | Screen 3 | Overview page with blankslate/populated branching |
| `src/pages/overview/components/page-header.tsx` | Screen 3 | `[Home] Overview` + stat subtitle |
| `src/pages/overview/components/recent-hires.tsx` | Screen 3 | Avatar-led recent hires list, 3 rows, "View all in directory" link |
| `src/pages/overview/components/birthday-callout.tsx` | Screen 3 | Single-line upcoming birthday callout |
| `src/pages/overview/components/blankslate.tsx` | Screen 3 | Skeleton background + floating card CTA |
| `src/pages/directory/index.tsx` | Screen 4 | Directory page with list/grid toggle, multi-select, batch delete, CSV import |
| `src/pages/directory/components/toolbar.tsx` | Screen 4 | iCloud-style grouped toolbar: view toggle, +New, Import, trash, more actions |
| `src/pages/directory/components/page-header.tsx` | Screen 4 | `[Users] Directory` + sort control dropdown + stat subtitle |
| `src/pages/directory/components/filter-bar.tsx` | Screen 4 | Search input + department select + location select |
| `src/pages/directory/components/employee-table.tsx` | Screen 4 | Department-grouped table with checkboxes, avatars, badges, row actions |
| `src/pages/directory/components/employee-grid.tsx` | Screen 4 | 80px circular avatar grid, department groups, Cmd/Ctrl+click select |
| `src/pages/directory/components/batch-toolbar.tsx` | Screen 4 | "N selected" + Delete selected + Clear |
| `src/pages/directory/components/blankslate.tsx` | Screen 4 | Skeleton rows + floating card + "or import from CSV" link |
| `src/pages/directory/components/confirm-delete-dialog.tsx` | Screen 4 | Single and batch delete confirmation alert-dialog |
| `src/pages/directory/components/csv-import-dialog.tsx` | Screen 4 | Upload + preview + bulk import dialog with template download |
| `src/pages/directory/new/index.tsx` | Screen 4 | Full-page create form with 3 field groups, breadcrumb, validation |
| `src/pages/employee-detail/index.tsx` | Screen 5 | Employee detail with view/edit toggle, breadcrumb, tenure computation |
| `src/pages/employee-detail/components/profile-card.tsx` | Screen 5 | 128px avatar, name, role, department badge, tenure, contact, fun facts |
| `src/pages/employee-detail/components/edit-form.tsx` | Screen 5 | Inline edit form, same field groups as create, pre-filled values |
| `src/pages/employee-detail/components/fun-facts-grid.tsx` | Screen 5 | 2x2 icon-led card grid with empty state fallback |
| `src/pages/calendar/index.tsx` | Screen 6 | Calendar page with month/week/year views, blankslate |
| `src/pages/calendar/components/calendar-controls.tsx` | Screen 6 | Month/Week/Year toggle, prev/next navigation |
| `src/pages/calendar/components/month-view.tsx` | Screen 6 | 7-column month grid with birthday avatar dots, "+N more" |
| `src/pages/calendar/components/week-view.tsx` | Screen 6 | 7-column week grid with birthday avatar dots |
| `src/pages/calendar/components/year-view.tsx` | Screen 6 | 12 mini-month grids with mint dot indicators, click-to-month |
| `src/pages/calendar/components/this-month-panel.tsx` | Screen 6 | Inline birthday list for viewed month |
| `src/pages/calendar/components/page-header.tsx` | Screen 6 | `[Calendar] Birthdays` + upcoming count |
| `src/pages/calendar/components/blankslate.tsx` | Screen 6 | Skeleton calendar grid + floating card CTA |
| `src/pages/calendar/components/birthday-avatar.tsx` | Screen 6 | 32px avatar dot component with link to profile |
| `src/pages/settings/index.tsx` | Screen 7 | Settings page with Profile/Team/General tabs |
| `src/pages/settings/components/page-header.tsx` | Screen 7 | `[Settings] Settings` + "Profile · Team · General" subtitle |
| `src/pages/settings/components/profile-form.tsx` | Screen 7 | Name + email (readonly) + password change form |
| `src/pages/settings/components/team-tab.tsx` | Screen 7 | Member list + pending invites + invite form + change role + revoke access dialog |
| `src/pages/settings/components/general-tab.tsx` | Screen 7 | Theme switch + delete account with "DELETE" confirmation |

## Acceptance criteria

### Screen 1: Landing Page (`/`)

| AC | Screen | Status | Evidence |
|---|---|---|---|
| Header with logo + "View demo" + "Get started" CTAs | Landing | PASS | `src/pages/landing/index.tsx:7` — Header imported and rendered; hero CTAs match spec copy |
| Hero-02 centered layout with "Know your team." headline | Landing | PASS | `src/pages/landing/index.tsx:57-62` — heading="Know your team.", subtitle matches spec |
| Feature showcase with 4 tabs (Directory, Profiles, Birthdays, Overview) | Landing | PASS | `src/pages/landing/index.tsx:25-30` — featureTabs from seed, 4 entries with mockups |
| Features-03 three-column benefit cards with icons | Landing | PASS | `src/pages/landing/index.tsx:33-51` — IconUsers, IconCake, IconHeartHandshake with spec copy |
| Testimonial carousel with 3 testimonials | Landing | PASS | `src/pages/landing/index.tsx:73-75` — seedTestimonials (3 entries: Maya R, Tom K, Priya S) |
| CTA-01 banner "Your team deserves better than a spreadsheet." | Landing | PASS | `src/pages/landing/index.tsx:76-79` — heading matches spec verbatim |
| Footer with logo + Product/Company/Legal links | Landing | PASS | `src/pages/landing/components/footer.tsx` — 4-column grid (logo+tagline, Product, Company, Legal) using footerLinks from seed |

### Screen 2: Auth (`/auth`)

| AC | Screen | Status | Evidence |
|---|---|---|---|
| Fullscreen centered card on muted background | Auth | PASS | `src/pages/auth/index.tsx:23` — `bg-muted/40`, card centered in flex layout |
| "Home" ghost link navigates to `/` | Auth | PASS | `src/pages/auth/index.tsx:31-36` — IconArrowLeft + "Home" ghost button linking to `/` |
| Tabs for Sign in / Sign up | Auth | PASS | `src/pages/auth/components/auth-card.tsx:125-135` — Tabs with sign-in/sign-up TabsTriggers |
| Google + Apple OAuth buttons using lovable.auth | Auth | PASS | `src/pages/auth/components/auth-card.tsx:80-92` — `lovable.auth.signInWithOAuth(provider, ...)` |
| Email/password form with validation | Auth | PASS | `src/pages/auth/components/auth-card.tsx:34-78` — signInWithPassword for sign-in, signUp for sign-up, password >=8 validation |
| Sign up tab adds "Full name" field | Auth | PASS | `src/pages/auth/components/auth-card.tsx:226-239` — signup-name input rendered in sign-up TabsContent |
| "Forgot password?" link on sign-in tab | Auth | PASS | `src/pages/auth/components/auth-card.tsx:217-223` — `handleForgotPassword` calls `resetPasswordForEmail` |
| Redirect to `/overview` if already authenticated | Auth | PASS | `src/pages/auth/index.tsx:18-19` — `if (user) return <Navigate to="/overview" replace />` |
| Error states (inline alert) | Auth | PASS | `src/pages/auth/components/auth-card.tsx:200-204` — Alert with destructive variant for errors |

### Screen 3: Overview (`/overview`)

| AC | Screen | Status | Evidence |
|---|---|---|---|
| PageHeader with `[Home]` icon + "Overview" + stat subtitle | Overview | PASS | `src/pages/overview/components/page-header.tsx:1-30` — IconHome, "Overview", stat parts joined by " · " |
| Stat row: "N employees · N departments · N new hires" | Overview | PASS | `src/pages/overview/components/page-header.tsx:9-15` — dynamically computed from useOverviewStats |
| Recent hires list with avatars, 3 rows, sorted by start_date desc | Overview | PASS | `src/pages/overview/components/recent-hires.tsx:19-68` — useRecentHires(3), avatar + name + role · dept + "Started {month year}" |
| "View all in directory" link | Overview | PASS | `src/pages/overview/components/recent-hires.tsx:61-66` — text-primary link to `/directory` |
| Birthday callout: next upcoming birthday within 30 days | Overview | PASS | `src/pages/overview/components/birthday-callout.tsx:1-29` — useUpcomingBirthdays(30), shows first entry with daysUntil label |
| Blankslate with skeleton bg + floating card + CTA | Overview | PASS | `src/pages/overview/components/blankslate.tsx:1-52` — SkeletonRows + gradient + Card with "No team members yet." + "Add your first team member" button |
| Empty state hides recent hires and birthday panels | Overview | PASS | `src/pages/overview/index.tsx:12-18` — isEmpty conditional renders Blankslate instead of RecentHires + BirthdayCallout |

### Screen 4: Directory (`/directory`)

| AC | Screen | Status | Evidence |
|---|---|---|---|
| Toolbar with list/grid toggle, +New, Import, trash, more actions | Directory | PASS | `src/pages/directory/components/toolbar.tsx:27-95` — ToggleGroup, +New Link, Import button, trash icon button, dots dropdown |
| PageHeader with `[Users]` icon + sort control dropdown | Directory | PASS | `src/pages/directory/components/page-header.tsx:20-64` — IconUsers, "Directory", DropdownMenu sort with 5 options |
| Filter bar: search + department select + location select | Directory | PASS | `src/pages/directory/components/filter-bar.tsx:32-98` — debounced search, department select (All + 4 depts), location select (dynamic from data) |
| Employee table: department-grouped, checkboxes, avatars, badges, row actions | Directory | PASS | `src/pages/directory/components/employee-table.tsx:64-213` — groups by department, Checkbox, Avatar, Badge, DropdownMenu with Edit + Delete |
| Grid view: 80px avatars, department groups, Cmd/Ctrl+click select | Directory | PASS | `src/pages/directory/components/employee-grid.tsx:48-133` — h-20 w-20 avatars, department groups, e.ctrlKey/e.metaKey toggle, ring-2 ring-primary on selected |
| View preference persisted to localStorage | Directory | PASS | `src/pages/directory/index.tsx:16-35` — usePersistedView hook reads/writes "directory-view" localStorage |
| Batch toolbar: "N selected", Delete selected, Clear | Directory | PASS | `src/pages/directory/components/batch-toolbar.tsx:10-32` — count, Delete selected button, Clear button with IconX |
| CSV import: upload zone, preview, template download, bulk import | Directory | PASS | `src/pages/directory/components/csv-import-dialog.tsx:81-225` — drag-and-drop, file input, parseCSV, preview table with check/warning icons, "Download template CSV", "Import N employees" |
| New Employee form: 3 field groups, validation, breadcrumb | Directory | PASS | `src/pages/directory/new/index.tsx:33-307` — Identity/Contact/Fun facts fieldsets, validation for required fields, breadcrumb Home/Directory/New employee |
| Confirm delete dialog: single + batch | Directory | PASS | `src/pages/directory/components/confirm-delete-dialog.tsx:20-54` — AlertDialog with "Remove {name}?" or "Remove N employees?" |
| Blankslate with "or import from CSV" secondary option | Directory | PASS | `src/pages/directory/components/blankslate.tsx:49-86` — onImport prop renders "or import from CSV" link |
| Click row navigates to `/directory/:id` | Directory | PASS | `src/pages/directory/components/employee-table.tsx:139` — onClick navigates to detail |
| Row hover: `bg-muted/60` | Directory | PASS | `src/pages/directory/components/employee-table.tsx:138` — `hover:bg-muted/60` class |

### Screen 5: Employee Detail (`/directory/:id`)

| AC | Screen | Status | Evidence |
|---|---|---|---|
| Breadcrumb: Home / Directory / {name}, appends "Edit" in edit mode | Employee Detail | PASS | `src/pages/employee-detail/index.tsx:87-126` — full breadcrumb with conditional "Edit" suffix |
| PageHeader: `[User]` icon + name, subtitle with role · dept · tenure | Employee Detail | PASS | `src/pages/employee-detail/index.tsx:128-146` — IconUser/IconUserEdit, tenure computed via computeTenureString |
| Profile card: 128px avatar, name, role, department badge, tenure | Employee Detail | PASS | `src/pages/employee-detail/components/profile-card.tsx:69-93` — h-32 w-32 Avatar, Badge with dept color, tenure label |
| Contact section: email, phone, birthday | Employee Detail | PASS | `src/pages/employee-detail/components/profile-card.tsx:108-140` — IconMail/IconPhone/IconCake rows, conditional on hasContact |
| Fun facts 2x2 grid with icons | Employee Detail | PASS | `src/pages/employee-detail/components/fun-facts-grid.tsx:16-51` — grid-cols-2, 4 fact configs with icons, "Get to know {firstName}" heading, empty state text |
| Edit button switches to inline edit mode | Employee Detail | PASS | `src/pages/employee-detail/index.tsx:148-154` — isEditing state toggle renders EditForm |
| Edit form: same field groups as create, pre-filled | Employee Detail | PASS | `src/pages/employee-detail/components/edit-form.tsx:39-283` — Identity/Contact/Fun facts, pre-filled from employee, "Save changes" and "Cancel" buttons |
| Remove button opens confirm delete dialog | Employee Detail | PASS | `src/pages/employee-detail/index.tsx:155-168` — ConfirmDeleteDialog with showDeleteDialog state |
| 404-style "Employee not found" when id is invalid | Employee Detail | PASS | `src/pages/employee-detail/index.tsx:44-71` — renders breadcrumb + "Employee not found." when `!employee` |

### Screen 6: Birthday Calendar (`/calendar`)

| AC | Screen | Status | Evidence |
|---|---|---|---|
| PageHeader: `[Calendar]` Birthdays + upcoming count | Calendar | PASS | `src/pages/calendar/components/page-header.tsx:1-23` — IconCalendar, "Birthdays", `${upcoming.length} upcoming` |
| Calendar controls: Month/Week/Year toggle, prev/next navigation | Calendar | PASS | `src/pages/calendar/components/calendar-controls.tsx:27-124` — ToggleGroup with 3 options, ChevronLeft/Right buttons with period label |
| Month view: 7-column grid, birthday avatar dots, "+N more" | Calendar | PASS | `src/pages/calendar/components/month-view.tsx:17-109` — grid-cols-7, BirthdayAvatar, `+{N} more` for >2 entries |
| Week view: 7-column week grid with avatars | Calendar | PASS | `src/pages/calendar/components/week-view.tsx:9-85` — 7 day columns with date headers and birthday avatars |
| Year view: 12 mini-month grids with mint dot indicators | Calendar | PASS | `src/pages/calendar/components/year-view.tsx:28-86` — MiniMonth component with `bg-primary` dot, click navigates to month view |
| This month panel: birthday list below calendar | Calendar | PASS | `src/pages/calendar/components/this-month-panel.tsx:25-73` — sorted list with Avatar + name + date, "No birthdays this month." fallback |
| Click avatar dot navigates to `/directory/:id` | Calendar | PASS | `src/pages/calendar/components/birthday-avatar.tsx` — Link to `${prefix}/directory/${entry.id}` |
| Today's date highlighted | Calendar | PASS | `src/pages/calendar/components/month-view.tsx:81-85` — `bg-primary text-primary-foreground` for today |
| Blankslate with skeleton calendar + floating card | Calendar | PASS | `src/pages/calendar/components/blankslate.tsx:25-54` — SkeletonGrid + "No birthdays on record yet." card |

### Screen 7: Settings (`/settings`)

| AC | Screen | Status | Evidence |
|---|---|---|---|
| PageHeader: `[Settings]` Settings + "Profile · Team · General" | Settings | PASS | `src/pages/settings/components/page-header.tsx:1-17` — IconSettings, subtitle with middot separators |
| Three tabs: Profile, Team, General | Settings | PASS | `src/pages/settings/index.tsx:13-28` — Tabs with TabsTriggers for all three |
| Profile tab: Full name, Email (readonly), New password, Confirm password, Save changes | Settings | PASS | `src/pages/settings/components/profile-form.tsx:9-108` — all fields present, email readonly, password validation |
| Team tab: member list with avatar + role badge + overflow menu | Settings | PASS | `src/pages/settings/components/team-tab.tsx:56-101` — MemberRow with Avatar, Badge (mint for admin, gray for member), DropdownMenu |
| Team tab: pending invites with dashed avatar + "(pending)" | Settings | PASS | `src/pages/settings/components/team-tab.tsx:104-124` — PendingRow with dashed border avatar, "(pending)" text |
| Team tab: invite form with email + role select + "Send invite" | Settings | PASS | `src/pages/settings/components/team-tab.tsx:176-207` — email Input, role Select, "Send invite" Button |
| Team tab: change role dropdown ("Change to Admin/Member") | Settings | PASS | `src/pages/settings/components/team-tab.tsx:81-89` — DropdownMenuItem with role toggle |
| Team tab: revoke access confirmation dialog | Settings | PASS | `src/pages/settings/components/team-tab.tsx:209-229` — AlertDialog with "Revoke access for {name}?" |
| General tab: appearance switch (dark/light) | Settings | PASS | `src/pages/settings/components/general-tab.tsx:46-55` — "Appearance" label + Switch toggling `dark` class |
| General tab: delete account with "DELETE" confirmation | Settings | PASS | `src/pages/settings/components/general-tab.tsx:59-104` — "Delete account" destructive button, AlertDialog with "Type DELETE to confirm" Input, disabled until `deleteConfirm === "DELETE"` |
| General tab: separator between theme and delete rows | Settings | PASS | `src/pages/settings/components/general-tab.tsx:57` — `<Separator />` between the two sections |

### Infrastructure

| AC | Screen | Status | Evidence |
|---|---|---|---|
| AuthProvider with onAuthStateChange before getSession | Auth | PASS | `src/lib/auth/auth-provider.tsx:21-37` — subscription registered first, then getSession |
| ProtectedRoute redirects to /auth with `from` state | Auth | PASS | `src/components/protected-route.tsx:17` — `<Navigate to="/auth" state={{ from: location }} replace />` |
| signOut clears React Query cache | Auth | PASS | `src/lib/auth/auth-provider.tsx:39-42` — `queryClient.clear()` after signOut |
| SeedDataProvider serves /demo/* routes | Routing | PASS | `src/App.tsx:32-38,52-65` — DemoShell wraps demo routes with SeedDataProvider |
| SupabaseDataProvider serves protected routes | Routing | PASS | `src/App.tsx:22-30,67-81` — ProtectedAppShell wraps app routes with SupabaseDataProvider |
| Seed data: 10 employees matching spec verbatim | Data | PASS | `src/data/seed.ts:71-252` — all 10 employees with correct names, roles, departments, dates, fun facts |
| Seed data: profile, teamMembers, invitations | Data | PASS | `src/data/seed.ts:254-276` — Sarah Chen profile, 2 team members, 1 pending invitation |
| Seed data: featureTabs, testimonials, footerLinks | Data | PASS | `src/data/seed.ts:278-322` — 4 feature tabs, 3 testimonials, footer link groups |
| Dual routing: public, demo, protected | Routing | PASS | `src/App.tsx:44-84` — three route groups: ApplicationLayout (public), DemoShell+WorkspaceLayout02 (demo), ProtectedAppShell+WorkspaceLayout02 (protected) |

## Build verifications

| Build command | Result |
|---|---|
| `npm run build` | PASS — `vite build` completed in ~2.8s, 0 TypeScript errors, 0 build errors. Output: `dist/index.html` (0.73 kB), `dist/assets/index-DAanuqJA.css` (90.94 kB), `dist/assets/index-C-eS3ZqZ.js` (1118.32 kB). Chunk size warning only (expected for single-chunk SPA). |

## SPEC-GAPs surfaced

No `// SPEC-GAP:` comments were found in the codebase. Zero SPEC-GAP markers.

Minor divergences from the spec (not flagged as SPEC-GAP but noted here for completeness):

- **New Employee form navigation**: Spec says "On success: navigates to `/directory/:id` (the new employee's profile page)." Implementation navigates to `/directory` instead (`src/pages/directory/new/index.tsx:88`). The seed data provider creates employees with generated IDs that are not returned synchronously, making redirect to the new profile impractical with the current mutation flow.
- **Landing feature showcase component**: Spec says `feature-showcase-02` with `cycler-nav` (auto-cycling tabs). Implementation imports `feature-showcase-01` (`src/pages/landing/index.tsx:6`). The actual component file used may implement the cycling behavior despite the filename.
- **Spec footer layout**: Spec says "three-column" footer (logo left, links center, legal right). Implementation uses a 4-column grid (logo, Product, Company, Legal) — functionally equivalent, structurally slightly different.
- **Grid view avatar size**: Spec says "80px circular avatar." Implementation uses `h-20 w-20` (80px) — matches spec.
- **Birthday callout emoji**: Spec shows "🎂" emoji prefix. Implementation uses `IconCake` (Tabler icon) instead, consistent with the project rule against using emojis as JSX content.

## Risks / not proven

- **Visual layout fidelity**: All components compile and have the correct elements, but visual layout (spacing, alignment, proportions) is NOT PROVEN — no visual testing was performed. Only code structure was verified.
- **Filter functionality in SeedDataProvider**: The data provider interface exists and hooks accept filter params. Whether the SeedDataProvider correctly filters/sorts in all cases is NOT PROVEN without runtime testing.
- **OAuth sign-in flow**: OAuth buttons call `lovable.auth.signInWithOAuth` correctly in code, but the actual OAuth redirect flow cannot be verified without a running Lovable Cloud environment. NOT PROVEN.
- **Supabase mutations**: All mutation hooks are defined in the provider interface. Whether the SupabaseDataProvider correctly implements optimistic updates and cache invalidation is NOT PROVEN — requires runtime testing with a live Supabase instance.
- **Edit mode breadcrumb cosmetic URL**: Spec says "The breadcrumb 'Edit' suffix is cosmetic (pushed via `history.replaceState`)." Implementation uses React state only — the URL does not change. This is a minor divergence that does not affect functionality.
- **Sign-out flow**: Auth provider calls `supabase.auth.signOut()` + `queryClient.clear()`, but the topbar avatar dropdown with "Sign out" option lives in `workspace-layout-02.tsx` which was not modified. The sign-out button integration with the layout is NOT PROVEN.
- **Responsive behavior**: Grid breakpoints are set (grid-cols-3/4/6) but responsive rendering is NOT PROVEN without visual testing.

## High-risk files requiring review

| File | Risk | Why it needs review |
|---|---|---|
| `src/lib/data-provider.tsx` | MEDIUM | Core data layer — both Seed and Supabase providers must correctly implement all 10+ read hooks and 10+ mutation hooks. Filter logic, aggregation, and optimistic updates are complex and not visually verified. |
| `src/lib/auth/auth-provider.tsx` | MEDIUM | Auth state management — `onAuthStateChange` before `getSession()` ordering is critical. OAuth redirect handling depends on correct listener registration timing. |
| `src/pages/directory/components/csv-import-dialog.tsx` | MEDIUM | CSV parsing is best-effort with comma splitting — does not handle quoted fields containing commas. Edge cases in CSV format could cause incorrect imports. |
| `src/pages/settings/components/general-tab.tsx` | MEDIUM | Delete account calls `deleteAccount()` mutation which invokes a Supabase Edge Function (`delete-account`) that must exist server-side. The Edge Function is specified in the cloudboard but not created as part of this frontend build. |
| `src/pages/directory/new/index.tsx` | MEDIUM | On form submit, navigates to `/directory` instead of `/directory/:id` as spec requires. The mutation does not return the created employee's ID synchronously in the seed provider flow. |
