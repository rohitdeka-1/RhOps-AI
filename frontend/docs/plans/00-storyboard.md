# Storyboard — Team Directory

A sequential user journey. Read [00-screenboard.md](00-screenboard.md) for the UI inventory (every element on every screen).

* * *

## Act 1: First Visit (landing → sign-up)

A visitor arrives at the marketing page and decides to sign up.

### Step 1: Visitor lands on the marketing page

- **Action**: Navigate to `/`
- **Screen**: Landing page (`/`), populated
- **Result**: Hero loads with "Know your team." headline, two CTAs ("Get started →" and "View demo"), and a browser-chrome mockup of the directory list. Feature showcase tabs auto-cycle below.
- **See**: Landing page screen.

### Step 2: Visitor scrolls to features

- **Action**: Scroll past the hero
- **Screen**: Landing page (`/`), populated
- **Result**: Feature showcase auto-cycles through four tabs — Directory, Profiles, Birthdays, Overview — each showing a product screenshot. Below that: three icon-led benefit cards (Know your team, Never miss a birthday, Grow together). Testimonials carousel follows with Maya R's quote centered.
- **See**: Landing page screen.

### Step 3: Visitor clicks "Get started"

- **Action**: Click `[Get started →]` in the hero (or header)
- **Screen**: Landing page (`/`) → Auth (`/auth`)
- **Result**: Navigates to `/auth`. Auth card loads with Sign in tab active by default. Google + Apple OAuth buttons appear above the email/password form.
- **See**: Auth screen.
- **Copy**: `"Get started →"` (action-first, §3)

### Step 4: Visitor switches to the Sign up tab

- **Action**: Click `[Sign up]` tab on the auth card
- **Screen**: Auth (`/auth`), sign-up tab
- **Result**: Tab switches. "Full name" field appears above email. Submit button changes to "Create account →". "Forgot password?" link is hidden.
- **See**: Auth screen.

### Step 5: User completes sign-up

- **Action**: Fill Full name "Sarah Chen", Email "[sarah@acme.co](mailto:sarah@acme.co)", Password "••••••••" → click `[Create account →]`
- **Screen**: Auth (`/auth`), sign-up tab → Overview (`/overview`)
- **Result**: Account created. `handle_new_user()` trigger creates `profiles` and `user_roles` rows. Session established. Navigates to `/overview`. Overview loads in first-time (empty) state.
- **See**: Overview screen, first-time view.
- **Copy**: `"Create account →"` (action-first, §3)

* * *

## Act 2: First-Time Experience (empty → first creation)

The user just signed up. Every screen is empty. They take their first actions to populate the directory.

### Step 6: User sees the empty Overview

- **Action**: (arrived from sign-up)
- **Screen**: Overview (`/overview`), first-time view
- **Result**: Topbar renders with logo, four pill-tab nav items (Overview active, Directory, Calendar, Settings), "+ New" button, and Sarah's avatar. The content area shows a skeleton background of faded directory rows with a gradient fade, and a centered floating card: "No team members yet. Add your first team member to get started." with a primary `[+ Add your first team member]` button.
- **See**: Overview screen, first-time view.

### Step 7: User navigates to the Directory

- **Action**: Click `[Directory]` pill tab in topbar
- **Screen**: Overview (`/overview`) → Directory (`/directory`), first-time view
- **Result**: Navigates to `/directory`. Directory loads with the same blankslate pattern — skeleton background of faded department groups, floating card: "No team members yet. Add the first one to get started." Primary button `[+ Add your first team member]` and a secondary text link "or import from CSV" below it.
- **See**: Directory screen, first-time view.
- **Copy**: `"No team members yet. Add the first one to get started."` (direct, §1)

### Step 8: User navigates to the New Employee page

- **Action**: Click `[+ New]` in the topbar (or `[+ Add your first team member]` blankslate CTA)
- **Screen**: Directory (`/directory`) → New Employee (`/directory/new`)
- **Result**: Full-page form loads inside a centered card (`max-w-[600px]`). Breadcrumb: Home / Directory / New employee. PageHeader: `[UserPlus] New employee` + "Fill in the details to add a team member." Three field groups visible: Identity, Contact, Fun facts (optional).
- **See**: Directory screen (`/directory/new`), New Employee page wireframe.

### Step 9: User fills the Identity group

- **Action**: Fill Full name "Jamie Lin" → fill Role "Senior Engineer" → click Department select → choose "Engineering" → click Start date → pick "June 14, 2021"
- **Screen**: New Employee (`/directory/new`), Identity group
- **Result**: Full name and role inputs show typed values. Department select shows "Engineering". Date picker popover opens on start date click; after picking Jun 14 2021 the field shows "Jun 14, 2021" and the popover closes.
- **Wireframe** (date picker popover — transient):```
┌──────────────────────────────────────┐
│  < June 2021 >                       │
│  Su  Mo  Tu  We  Th  Fr  Sa          │
│                  1   2   3   4   5   │
│   6   7   8   9  10  11  12          │
│  13  14  15  16  17  18  19          │
│       ●                              │
│  20  21  22  23  24  25  26          │
│  27  28  29  30                      │
└──────────────────────────────────────┘
```

### Step 10: User fills the Contact group

- **Action**: Fill Email "[jamie@acme.co](mailto:jamie@acme.co)" → fill Phone "+1 415 555 0101" → fill Location "SF" → fill Birthday "01-04"
- **Screen**: New Employee (`/directory/new`), Contact group
- **Result**: All four contact fields show typed values. Birthday field accepts the MM-DD format "01-04".

### Step 11: User fills the Fun facts group

- **Action**: Fill Desk snack "Trader Joe's Everything Bagel Seasoning" → fill Hidden talent "Can solve a Rubik's cube in under 2 minutes" → fill Karaoke song "Don't Stop Believin'" → fill Dream vacation "Japan during cherry blossom season"
- **Screen**: New Employee (`/directory/new`), Fun facts group
- **Result**: All four fun fact fields show typed values. Form is now complete.

### Step 12: User submits the new employee form

- **Action**: Click `[Add team member →]`
- **Screen**: New Employee (`/directory/new`) → Employee Detail (`/directory/emp-1`)
- **Result**: Form validates. Optimistic insert adds Jamie Lin to the local cache. Navigates to Jamie's new profile page. Toast "Jamie Lin added to Engineering." appears bottom-right, dismisses after 4 s (auto). The `['employees']`, `['overviewStats']`, `['recentHires']`, and `['upcomingBirthdays']` query caches are invalidated.
- **Wireframe** (toast — transient):```
┌─────────────────────────────────────┐
│  ✓  Jamie Lin added to Engineering  │
└─────────────────────────────────────┘
```
- **Copy**: `"Add team member →"` (action-first, §3); `"Jamie Lin added to Engineering"` (direct confirmation, §1)

### Step 13: User views Jamie's new profile

- **Action**: (arrived from form submission)
- **Screen**: Employee Detail (`/directory/emp-1`), populated
- **Result**: Breadcrumb: Home / Directory / Jamie Lin. PageHeader: `[User] Jamie Lin` + "Senior Engineer · Engineering · 3 yrs". Centered profile card shows 128px avatar (initials "JL"), department badge `[Engineering]`, location "SF", tenure "Joined Jun 2021 · 3 yrs". Contact section: [jamie@acme.co](mailto:jamie@acme.co), +1 415 555 0101, birthday January 4. Fun facts 2×2 grid: all four ice-breaker cards populated.
- **See**: Employee Detail screen.

### Step 14: User navigates back to the Directory

- **Action**: Click "Directory" in the breadcrumb (or click `[Directory]` pill tab in topbar)
- **Screen**: Employee Detail → Directory (`/directory`), one employee
- **Result**: Directory no longer shows the blankslate. iCloud-style page header renders: `[Users] Directory` + "by First name ▾" sort control + "1 employee · 1 department" subtitle. Filter bar visible. ENGINEERING group header + one row: Jamie Lin.
- **See**: Directory screen (with one employee).

### Step 15: User adds a second employee

- **Action**: Click `[+ New]` in topbar → fill Full name "Raj Patel", Role "Staff Engineer", Department "Engineering", Start date "Aug 2, 2021", Email "[raj@acme.co](mailto:raj@acme.co)", Phone "+1 212 555 0134", Location "NYC", Birthday "03-22" → click `[Add team member →]`
- **Screen**: Directory (`/directory`) → New Employee (`/directory/new`) → Employee Detail (`/directory/emp-2`)
- **Result**: Raj Patel's profile loads. Toast "Raj Patel added to Engineering." Directory cache now has 2 employees.
- **Copy**: `"Raj Patel added to Engineering"` (direct confirmation, §1)

### Step 16: User adds remaining employees to populate the directory

- **Action**: Repeat `[+ New]` flow for 8 more employees: Sora Tanaka (Engineer, engineering, Remote, 2023-03-15, 07-09), Devon Park (Engineer, engineering, Austin, 2024-01-08, 11-30), Aisha Okonkwo (Product Manager, product, Remote, 2024-04-22, 02-02 — with fun facts), Carlos Méndez (Product Lead, product, SF, 2022-11-01, 05-18), Marcus Webb (Product Designer, design, SF, 2024-05-06, 01-17 — with fun facts), Yuki Fernandez (UX Designer, design, Austin, 2022-07-18, 09-05), Lin Chen (Operations Lead, operations, NYC, 2024-03-11, 06-14), Noah Williams (Operations Coordinator, operations, Remote, 2021-12-20, 08-27 — with fun facts)
- **Screen**: `/directory/new` repeated, each time navigating to the new employee's profile
- **Result**: After all 10 employees added: Directory shows 4 department groups (Engineering ×4, Product ×2, Design ×2, Operations ×2). Stat row: "10 employees · 4 departments". Overview stat row updates to "10 employees · 4 departments · 2 new hires."

### Step 17: User checks the Overview after adding data

- **Action**: Click `[Overview]` pill tab in topbar
- **Screen**: Directory → Overview (`/overview`), populated
- **Result**: Overview now shows the populated state. Stat row: "10 employees · 4 departments · 2 new hires". Recent hires section: Marcus Webb (Product Designer · Design, Started May 2024), Aisha Okonkwo (Product Manager · Product, Started Apr 2024), Lin Chen (Operations Lead · Operations, Started Mar 2024). Birthday callout line: "🎂 Jamie Lin's birthday in N days" (computed from 01-04). "View all in directory →" text link visible.
- **See**: Overview screen.

### Step 18: User checks the Birthday Calendar

- **Action**: Click `[Calendar]` pill tab in topbar
- **Screen**: Overview → Birthday Calendar (`/calendar`), populated
- **Result**: Month view loads for the current month. Avatar dots (circular initials, 32px) appear on dates with birthdays. "This month" panel below the grid lists the current month's birthday employees with their names and dates. PageHeader: `[Calendar] Birthdays` + "Month ▾" view control + upcoming count subtitle.
- **See**: Birthday Calendar screen.

* * *

## Act 3: Using the Product (populated interactions)

The user now has 10 employees across 4 departments. They explore every distinct interaction.

### Step 19: User searches the Directory

- **Action**: Click `[Directory]` tab → type "engineer" in the search input
- **Screen**: Directory (`/directory`), search active
- **Result**: Table filters in real time as each character is typed. Only employees whose `full_name`, `role`, or `location` contains "engineer" remain visible — Jamie Lin (Senior Engineer), Raj Patel (Staff Engineer), Sora Tanaka (Engineer), Devon Park (Engineer). Department groups with no matches collapse. Subtitle updates to "4 employees · 1 department".
- **Copy**: `"Search by name, role, or location…"` (placeholder describes action, §5)

### Step 20: User filters by Department

- **Action**: Clear search input → click `[Department ▾]` select → choose "Product"
- **Screen**: Directory (`/directory`), department filtered
- **Result**: Only the PRODUCT group is visible with 2 rows: Aisha Okonkwo and Carlos Méndez. Engineering, Design, and Operations groups disappear. Subtitle updates to "2 employees · 1 department".

### Step 21: User filters by Location (stacked with department filter)

- **Action**: With Department "Product" still active → click `[Location ▾]` select → choose "Remote"
- **Screen**: Directory (`/directory`), department + location filtered
- **Result**: Both filters stack. Only Aisha Okonkwo (Remote) remains visible. Carlos Méndez (SF) is hidden. Subtitle updates to "1 employee · 1 department".

### Step 22: User clears filters and sorts the Directory

- **Action**: Reset Department to "All" and Location to "All" → click `[by First name ▾]` sort control in page header → choose "Start date (newest)"
- **Screen**: Directory (`/directory`), sorted by start date newest
- **Result**: All 10 employees visible. Rows within each department group re-order with newest start dates first. Marcus Webb (May 2024) appears first in Design, Devon Park (Jan 2024) first in Engineering, etc. Sort control label updates to "by Start date (newest) ▾".

### Step 23: User toggles to Grid view

- **Action**: Click `[⊞]` grid view toggle in the directory toolbar
- **Screen**: Directory (`/directory`), grid view
- **Result**: Table rows replaced by Apple Classroom-style grid. Department group headers remain ("● ENGINEERING · 4"). Each cell: 80px circular avatar (initials), name below (centered, `text-sm font-medium`), role in muted-foreground. 4 columns visible at current viewport. View toggle shows grid icon as active. View preference is persisted to `localStorage`.
- **See**: Directory screen, grid view wireframe.

### Step 24: User multi-selects rows for batch delete

- **Action**: Click `[≡]` list view toggle to return to list → check the checkbox on Devon Park's row → check the checkbox on Aisha Okonkwo's row
- **Screen**: Directory (`/directory`), list view, 2 rows selected
- **Result**: Both checkboxes check. Batch delete toolbar fades in pinned to the bottom of the table: "2 selected [Delete selected] [✕ Clear]". The `[🗑]` icon in the main toolbar also becomes active.
- **Wireframe** (batch toolbar — transient):```
┌──────────────────────────────────────────────────┐
│  2 selected   [Delete selected]   [✕ Clear]      │
└──────────────────────────────────────────────────┘
```

### Step 25: User cancels the batch delete

- **Action**: Click `[✕ Clear]` in the batch toolbar
- **Screen**: Directory (`/directory`), list view
- **Result**: Both checkboxes uncheck. Batch toolbar fades out. Directory returns to normal browsing state.

### Step 26: User opens an employee profile from the Directory

- **Action**: Click Jamie Lin's row (not the checkbox)
- **Screen**: Directory (`/directory`) → Employee Detail (`/directory/emp-1`)
- **Result**: Navigates to Jamie's profile. View mode default — avatar, name, department badge, tenure, contact section, fun facts 2×2 grid all visible.
- **See**: Employee Detail screen.

### Step 27: User edits an employee

- **Action**: Click `[Edit]` button on Jamie Lin's profile card
- **Screen**: Employee Detail (`/directory/emp-1`), view mode → edit mode (in-place)
- **Result**: Page switches to edit mode. Breadcrumb appends "Edit": Home / Directory / Jamie Lin / Edit. PageHeader changes to `[UserPen] Editing Jamie Lin` + "Changes save when you click Save changes." All display values become editable inputs, pre-filled with current data. Three field groups: Identity, Contact, Fun facts.

### Step 28: User saves an edit

- **Action**: Change Role from "Senior Engineer" to "Lead Engineer" → click `[Save changes →]`
- **Screen**: Employee Detail (`/directory/emp-1`), edit mode → view mode
- **Result**: Edit mode exits. Page returns to view mode. Profile card now shows "Lead Engineer" as the role. Breadcrumb reverts to Home / Directory / Jamie Lin. Toast "Changes saved." Optimistic update applied immediately; `['employee', 'emp-1']` and `['employees']` caches invalidated.
- **Wireframe** (toast — transient):```
┌──────────────────────┐
│  ✓  Changes saved    │
└──────────────────────┘
```
- **Copy**: `"Save changes →"` (action-first, §3); `"Changes saved"` (direct confirmation, §1)

### Step 29: User deletes an employee

- **Action**: Click `[Remove]` button on Jamie Lin's profile card
- **Screen**: Employee Detail (`/directory/emp-1`), confirm delete dialog open
- **Result**: Alert dialog appears over the profile.
- **Wireframe** (confirm delete — transient):```
┌──────────────────────────────────────────────┐
│  Remove Jamie Lin?                           │
│                                              │
│  This will permanently remove them from      │
│  the directory.                              │
│                                              │
│  [Cancel]              [Remove]              │
└──────────────────────────────────────────────┘
```
- **Action**: Click `[Remove]` (destructive button)
- **Result**: Dialog closes. Optimistic delete removes Jamie from local cache. Navigates to `/directory` (auto). Toast "Jamie Lin removed." Directory now shows 9 employees. Engineering group shows 3 rows.
- **Copy**: `"Remove Jamie Lin?"` (direct, §1); `"Remove"` (action-first, §3); `"Jamie Lin removed"` (direct confirmation, §1)

### Step 30: User re-adds Jamie Lin (state continuity)

- **Action**: Click `[+ New]` → fill Full name "Jamie Lin", Role "Senior Engineer", Department "Engineering", Start date "Jun 14, 2021" → click `[Add team member →]`
- **Screen**: `/directory/new` → Employee Detail (new id)
- **Result**: Jamie Lin re-added. Directory returns to 10 employees. Fun facts are blank (new record).

### Step 31: User switches Calendar to Week view

- **Action**: Click `[Calendar]` tab → click `[Week]` toggle in the calendar control row
- **Screen**: Birthday Calendar (`/calendar`), week view
- **Result**: Calendar switches from month grid to a 7-column week view showing the current week (Sun–Sat). Any birthdays falling in the current week show avatar dots in the appropriate day column. "This month" panel still shows the full month's list below.
- **See**: Birthday Calendar screen (week view state).

### Step 32: User switches Calendar to Year view

- **Action**: Click `[Year]` toggle
- **Screen**: Birthday Calendar (`/calendar`), year view
- **Result**: Calendar switches to 12 compact monthly mini-grids. Dates with birthdays show small mint-colored dot indicators (no avatar — too small). Multiple months have dots: Jan (2 dots), Feb (1), Mar (1), May (1), Jun (1), Jul (1), Aug (1), Sep (1), Nov (1). Clicking a month navigates to that month's month view.
- **See**: Birthday Calendar screen (year view state).

### Step 33: User clicks a birthday dot to view a profile

- **Action**: Click `[Month]` toggle → navigate to January using `[→]` → click the avatar dot on Jan 17 (Marcus Webb)
- **Screen**: Birthday Calendar (`/calendar`) → Employee Detail (`/directory/emp-7`)
- **Result**: Navigates to Marcus Webb's profile. Breadcrumb: Home / Directory / Marcus Webb. Profile card shows his fun facts: Almonds, Amateur ceramicist, Fleetwood Mac – Dreams, A road trip through Patagonia.
- **See**: Employee Detail screen.

### Step 34: User navigates to Settings via topbar

- **Action**: Click `[Settings]` pill tab in topbar
- **Screen**: Employee Detail → Settings (`/settings`), Profile tab
- **Result**: Settings screen loads. PageHeader: `[Settings] Settings`. Three tabs: Profile (active), Team, General. Profile tab shows form with Full name "Sarah Chen" pre-filled, email "[sarah@acme.co](mailto:sarah@acme.co)" (read-only), and empty password fields.
- **See**: Settings screen, first-time wireframe.

### Step 35: User updates their profile name

- **Action**: Clear Full name → type "Sarah Chen-Lopez" → click `[Save changes]`
- **Screen**: Settings (`/settings`), Profile tab
- **Result**: Optimistic update fires. Topbar avatar tooltip and profile card update to "Sarah Chen-Lopez". Toast "Profile updated." `['profile']` cache invalidated.
- **Wireframe** (toast — transient):```
┌──────────────────────┐
│  ✓  Profile updated  │
└──────────────────────┘
```
- **Copy**: `"Save changes"` (action-first, §3); `"Profile updated"` (direct confirmation, §1)

### Step 36: User invites a teammate

- **Action**: Click `[Team]` tab → fill email "[colleague@company.com](mailto:colleague@company.com)" → role select shows "Member" (default) → click `[Send invite]`
- **Screen**: Settings (`/settings`), Team tab
- **Result**: Invite form clears. The pending invitations list gains a new row: dashed avatar placeholder, "[colleague@company.com](mailto:colleague@company.com)", "(pending)", `[Member]` badge. Toast "Invite sent to [colleague@company.com](mailto:colleague@company.com)." `['invitations']` cache invalidated.
- **Wireframe** (toast — transient):```
┌──────────────────────────────────────────────┐
│  ✓  Invite sent to colleague@company.com     │
└──────────────────────────────────────────────┘
```
- **Copy**: `"Send invite"` (action-first, §3); `"Invite sent to colleague@company.com"` (direct confirmation, §1)

### Step 37: User changes a team member's role

- **Action**: Click `[⋯]` on Marcus Webb's row in the team list → click "Change to Admin"
- **Screen**: Settings (`/settings`), Team tab
- **Result**: Marcus Webb's role badge updates from `[Member]` to `[Admin]` in-place. Optimistic update. `['teamMembers']` cache invalidated.

### Step 38: User revokes a team member's access

- **Action**: Click `[⋯]` on Marcus Webb's row → click "Revoke access"
- **Screen**: Settings (`/settings`), Team tab, confirm revoke dialog open
- **Result**: Alert dialog appears.
- **Wireframe** (confirm revoke — transient):```
┌──────────────────────────────────────────────┐
│  Revoke access for Marcus Webb?              │
│                                              │
│  Marcus will lose access to the team         │
│  directory immediately.                      │
│                                              │
│  [Cancel]        [Revoke access]             │
└──────────────────────────────────────────────┘
```
- **Action**: Click `[Cancel]`
- **Result**: Dialog closes. Marcus Webb's row unchanged.

### Step 39: User toggles dark mode

- **Action**: Click `[General]` tab → click the Appearance `switch` to toggle to Light (app launched in dark mode default — toggle flips to Light)
- **Screen**: Settings (`/settings`), General tab
- **Result**: `.dark` class removed from `<html>`. App switches from dark to light theme in-place. Switch shows Light state active. Token values flip from dark OKLCH set to light OKLCH set.

### Step 40: User toggles back to dark mode

- **Action**: Click the Appearance `switch` again
- **Screen**: Settings (`/settings`), General tab
- **Result**: `.dark` class re-applied. App returns to dark theme. Switch shows Dark state active.

* * *

## Act 4: Session End (sign out → return)

### Step 41: User signs out

- **Action**: Click the user `[avatar]` in the topbar → click "Sign out" in the dropdown
- **Screen**: Any authenticated screen → Landing page (`/`)
- **Result**: `supabase.auth.signOut()` is called. Entire React Query cache is cleared. Session cleared. Navigates to `/`. Landing page loads as a public visitor — no authenticated state visible in the header.
- **See**: Landing page screen.

### Step 42: Returning user navigates to the app

- **Action**: Navigate to `/overview` (or click `[Get started]` on the landing page)
- **Screen**: Landing → Auth (`/auth`)
- **Result**: `/overview` is a protected route. Auth guard detects no session. Navigates to `/auth` with `from: '/overview'` state. Auth card loads in Sign in tab (default).
- **See**: Auth screen.

### Step 43: User signs back in

- **Action**: Fill Email "[sarah@acme.co](mailto:sarah@acme.co)" → fill Password "••••••••" → click `[Sign in →]`
- **Screen**: Auth (`/auth`) → Overview (`/overview`)
- **Result**: `supabase.auth.signInWithPassword` succeeds. Session established. Navigates to `/overview`. Overview loads with all previously saved data intact — stat row shows "10 employees · 4 departments · 2 new hires", recent hires list populated, birthday callout visible. Data persisted across sessions via Supabase.
- **See**: Overview screen.
- **Copy**: `"Sign in →"` (action-first, §3)

* * *

## Copy Decisions

| Location | Copy | Rule applied |
| --- | --- | --- |
| Landing hero CTA | `"Get started →"` | action-first, §3 |
| Landing hero secondary | `"View demo"` | action-first, §3 |
| Auth sign-up submit | `"Create account →"` | action-first, §3 |
| Auth sign-in submit | `"Sign in →"` | action-first, §3 |
| Overview blankslate heading | `"No team members yet."` | direct, §1 |
| Overview blankslate CTA | `"Add your first team member"` | action-first, §3 |
| Directory blankslate body | `"No team members yet. Add the first one to get started."` | direct, §1 |
| New employee page subtitle | `"Fill in the details to add a team member."` | direct, §1 |
| New employee submit | `"Add team member →"` | action-first, §3 |
| Toast (create employee) | `"Jamie Lin added to Engineering"` | direct confirmation, §1 |
| Edit employee submit | `"Save changes →"` | action-first, §3 |
| Toast (edit employee) | `"Changes saved"` | direct confirmation, §1 |
| Confirm delete heading | `"Remove Jamie Lin?"` | direct, §1 |
| Confirm delete submit | `"Remove"` | action-first, §3 |
| Toast (delete employee) | `"Jamie Lin removed"` | direct confirmation, §1 |
| Settings profile save | `"Save changes"` | action-first, §3 |
| Toast (profile update) | `"Profile updated"` | direct confirmation, §1 |
| Settings invite submit | `"Send invite"` | action-first, §3 |
| Toast (invite sent) | `"Invite sent to colleague@company.com"` | direct confirmation, §1 |
| Confirm revoke heading | `"Revoke access for Marcus Webb?"` | direct, §1 |
| Confirm revoke submit | `"Revoke access"` | action-first, §3 |
| Directory search placeholder | `"Search by name, role, or location…"` | action descriptor, §5 |
| Calendar blankslate | `"No birthdays on record yet. Add team members to see their birthdays here."` | direct, §1 |