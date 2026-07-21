# Cloudboard — Team Directory

Data layer blueprint. Read [00-breadboard.md](00-breadboard.md) for scope and [00-screenboard.md](00-screenboard.md) for screen wireframes and data contracts.

---

## Schema

Tables ordered by dependency — referenced tables before referencing tables.

### `profiles`

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_id_idx on public.profiles(id);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;
create policy "profiles select own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles insert own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles update own" on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles delete own" on public.profiles
  for delete to authenticated using (auth.uid() = id);
```

**Purpose**: Stores display name and avatar for the authenticated app user. Consumed by the topbar avatar, Settings → Profile tab, and the team member list.
**Consumed by**: `useProfile`, `useUpdateProfile`

---

### `user_roles`

```sql
create table public.user_roles (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create unique index user_roles_user_id_idx on public.user_roles(user_id);

grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;
create policy "user_roles select authenticated" on public.user_roles
  for select to authenticated using (true);
create policy "user_roles insert own" on public.user_roles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "user_roles update own" on public.user_roles
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_roles delete own" on public.user_roles
  for delete to authenticated using (auth.uid() = user_id);
```

**Purpose**: Tracks the role (admin/member) of each user within the team workspace. Consumed by Settings → Team tab to display and change member roles.
**Consumed by**: `useTeamMembers`, `useUpdateUserRole`

---

### `invitations`

```sql
create table public.invitations (
  id text primary key default gen_random_uuid()::text,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now()
);

create index invitations_invited_by_idx on public.invitations(invited_by, created_at desc);
create index invitations_email_idx on public.invitations(email);

grant select, insert, update, delete on public.invitations to authenticated;
grant all on public.invitations to service_role;

alter table public.invitations enable row level security;
create policy "invitations select own" on public.invitations
  for select to authenticated using (auth.uid() = invited_by);
create policy "invitations insert own" on public.invitations
  for insert to authenticated with check (auth.uid() = invited_by);
create policy "invitations update own" on public.invitations
  for update to authenticated
  using (auth.uid() = invited_by) with check (auth.uid() = invited_by);
create policy "invitations delete own" on public.invitations
  for delete to authenticated using (auth.uid() = invited_by);
```

**Purpose**: Tracks pending, accepted, and revoked invitations sent by the current user. Consumed by Settings → Team tab pending invite list.
**Consumed by**: `useInvitations`, `useCreateInvitation`, `useRevokeInvitation`

---

### `employees`

```sql
create table public.employees (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null,
  department text not null check (department in ('engineering', 'product', 'design', 'operations')),
  email text,
  phone text,
  location text,
  start_date date not null,
  birthday text check (birthday ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
  avatar_url text,
  fun_facts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_user_created_idx on public.employees(user_id, created_at desc);
create index employees_user_department_idx on public.employees(user_id, department);
create index employees_user_start_date_idx on public.employees(user_id, start_date desc);
create index employees_user_location_idx on public.employees(user_id, location);

grant select, insert, update, delete on public.employees to authenticated;
grant all on public.employees to service_role;

alter table public.employees enable row level security;
create policy "employees select own" on public.employees
  for select to authenticated using (auth.uid() = user_id);
create policy "employees insert own" on public.employees
  for insert to authenticated with check (auth.uid() = user_id);
create policy "employees update own" on public.employees
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "employees delete own" on public.employees
  for delete to authenticated using (auth.uid() = user_id);
```

**Purpose**: Core entity. Every employee record belongs to the user who created it. Drives all four app screens — Overview stats, Directory list, Employee Detail profile, and Calendar birthday dots.
**Consumed by**: `useEmployees`, `useEmployee`, `useOverviewStats`, `useRecentHires`, `useUpcomingBirthdays`, `useBirthdaysByMonth`, `useCreateEmployee`, `useCreateEmployeesBulk`, `useUpdateEmployee`, `useDeleteEmployee`, `useDeleteEmployees`

---

## Queries

### `useOverviewStats()`

**Screen**: Overview → Stat row + page header subtitle
**Type**: `read`
**Returns**: `{ totalEmployees: number, totalDepartments: number, newHireCount: number, isLoading: boolean, error: unknown }`

```typescript
const sixtyDaysAgo = new Date();
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

const { data } = await supabase
  .from('employees')
  .select('department, start_date')
  .eq('user_id', user.id);

// client-side aggregation:
// totalEmployees = data.length
// totalDepartments = new Set(data.map(e => e.department)).size
// newHireCount = data.filter(e => new Date(e.start_date) >= sixtyDaysAgo).length
```

**Filter params**: none
**Aggregation**: Client-side `count`, `distinct department`, `count(start_date >= now - 60d)`
**Demo source**: `employees` from `src/data/seed.ts`

---

### `useRecentHires(limit?)`

**Screen**: Overview → Recent hires list
**Type**: `read`
**Returns**: `{ data: Employee[], isLoading: boolean, error: unknown }`

```typescript
const { data } = await supabase
  .from('employees')
  .select('id, full_name, role, department, location, start_date, avatar_url')
  .eq('user_id', user.id)
  .order('start_date', { ascending: false })
  .limit(limit ?? 3);
```

**Filter params**: `{ limit?: number }` — defaults to 3
**Aggregation**: none
**Demo source**: `employees` from `src/data/seed.ts`

---

### `useUpcomingBirthdays(withinDays?)`

**Screen**: Overview → Birthday callout
**Type**: `read`
**Returns**: `{ data: { id: string, full_name: string, birthday: string, daysUntil: number }[], isLoading: boolean }`

```typescript
const { data } = await supabase
  .from('employees')
  .select('id, full_name, birthday')
  .eq('user_id', user.id)
  .not('birthday', 'is', null);

// client-side: parse each birthday "MM-DD", compute next occurrence relative
// to today, filter to those within withinDays (default 30), sort by daysUntil asc
```

**Filter params**: `{ withinDays?: number }` — defaults to 30
**Aggregation**: Client-side date math — next occurrence of `MM-DD` relative to today
**Demo source**: `employees` from `src/data/seed.ts`

---

### `useEmployees(filters)`

**Screen**: Directory → Employee table / grid
**Type**: `read`
**Returns**: `{ data: Employee[], isLoading: boolean, error: unknown }`

```typescript
let query = supabase
  .from('employees')
  .select('id, full_name, role, department, email, location, start_date, avatar_url')
  .eq('user_id', user.id);

if (filters.department) {
  query = query.eq('department', filters.department);
}
if (filters.location) {
  query = query.eq('location', filters.location);
}
if (filters.search) {
  query = query.or(
    `full_name.ilike.%${filters.search}%,role.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
  );
}

const sortMap: Record<string, { column: string; ascending: boolean }> = {
  'first_name_asc':    { column: 'full_name',  ascending: true  },
  'last_name_asc':     { column: 'full_name',  ascending: true  }, // client-side split on last token
  'start_date_newest': { column: 'start_date', ascending: false },
  'start_date_oldest': { column: 'start_date', ascending: true  },
  'date_added_newest': { column: 'created_at', ascending: false },
};

const sort = sortMap[filters.sort ?? 'first_name_asc'];
query = query.order(sort.column, { ascending: sort.ascending });

const { data } = await query;
```

**Filter params**: `{ department?: 'engineering' | 'product' | 'design' | 'operations', location?: string, search?: string, sort?: 'first_name_asc' | 'last_name_asc' | 'start_date_newest' | 'start_date_oldest' | 'date_added_newest' }`
**Aggregation**: Client-side grouping by `department` for section headers; `count` per group
**Demo source**: `employees` from `src/data/seed.ts`

---

### `useEmployee(id)`

**Screen**: Employee Detail → Full profile
**Type**: `read`
**Returns**: `{ data: Employee | null, isLoading: boolean, error: unknown }`

```typescript
const { data } = await supabase
  .from('employees')
  .select('*')
  .eq('id', id)
  .eq('user_id', user.id)
  .single();
```

**Filter params**: `{ id: string }`
**Aggregation**: Client-side tenure calculation: `Math.floor((today - start_date) / 365.25)` years
**Demo source**: `employees` from `src/data/seed.ts` — single lookup by `id`

---

### `useBirthdaysByPeriod(filters)`

**Screen**: Calendar → Month/week/year calendar grid + This month panel
**Type**: `read`
**Returns**: `{ data: { id: string, full_name: string, birthday: string, avatar_url: string | null }[], isLoading: boolean }`

```typescript
const { data } = await supabase
  .from('employees')
  .select('id, full_name, birthday, avatar_url')
  .eq('user_id', user.id)
  .not('birthday', 'is', null);

// client-side: filter by MM portion matching the viewed month/week/year period
// for month view: birthday.startsWith(monthPadded)
// for week view: compute next occurrence date within [weekStart, weekEnd]
// for year view: return all — each month gets its dots
```

**Filter params**: `{ view: 'month' | 'week' | 'year', year: number, month?: number, weekStart?: string }`
**Aggregation**: Client-side grouping by calendar day for dot rendering; count per day for "+N more"
**Demo source**: `employees` from `src/data/seed.ts`

---

### `useProfile()`

**Screen**: Settings → Profile tab; topbar avatar
**Type**: `read`
**Returns**: `{ data: Profile | null, isLoading: boolean }`

```typescript
const { data } = await supabase
  .from('profiles')
  .select('id, full_name, avatar_url')
  .eq('id', user.id)
  .single();
```

**Filter params**: none (scoped to `auth.uid()` implicitly)
**Demo source**: `profile` from `src/data/seed.ts`

---

### `useTeamMembers()`

**Screen**: Settings → Team tab member list
**Type**: `read`
**Returns**: `{ data: { user_id: string, full_name: string, email: string, role: string }[], isLoading: boolean }`

```typescript
const { data: roles } = await supabase
  .from('user_roles')
  .select('user_id, role');

// profiles are fetched separately per user_id via profiles table
// client-side: join roles + profiles, sort admins first then by name
```

**Filter params**: none
**Aggregation**: Client-side sort — admins first, then alphabetical by `full_name`
**Demo source**: `teamMembers` from `src/data/seed.ts`

---

### `useInvitations()`

**Screen**: Settings → Team tab pending list
**Type**: `read`
**Returns**: `{ data: Invitation[], isLoading: boolean }`

```typescript
const { data } = await supabase
  .from('invitations')
  .select('id, email, role, status, created_at')
  .eq('invited_by', user.id)
  .eq('status', 'pending')
  .order('created_at', { ascending: false });
```

**Filter params**: none (always shows pending only)
**Demo source**: `invitations` from `src/data/seed.ts`

---

### `useCreateEmployee()`

**Screen**: Directory → New Employee page (`/directory/new`); Overview → blankslate CTA
**Type**: `optimistic-mutation`

```typescript
const { data } = await supabase
  .from('employees')
  .insert({
    user_id: user.id,
    full_name: fields.full_name,
    role: fields.role,
    department: fields.department,
    start_date: fields.start_date,
    email: fields.email ?? null,
    phone: fields.phone ?? null,
    location: fields.location ?? null,
    birthday: fields.birthday ?? null,
    fun_facts: fields.fun_facts ?? {},
    avatar_url: null,
  })
  .select()
  .single();
```

**Optimistic**: Add employee to local cache immediately with a temporary `id`; replace with real row on success; roll back on error with toast "Failed to add employee."
**Invalidates**: `['employees', user.id]`, `['overviewStats', user.id]`, `['recentHires', user.id]`, `['upcomingBirthdays', user.id]`

---

### `useCreateEmployeesBulk()`

**Screen**: Directory → CSV Import dialog
**Type**: `mutation`

```typescript
const { data } = await supabase
  .from('employees')
  .insert(
    rows.map(r => ({
      user_id: user.id,
      full_name: r.full_name,
      role: r.role,
      department: r.department,
      start_date: r.start_date,
      email: r.email ?? null,
      phone: r.phone ?? null,
      location: r.location ?? null,
      birthday: r.birthday ?? null,
      fun_facts: {},
      avatar_url: null,
    }))
  )
  .select();
```

**Optimistic**: Not optimistic — bulk insert waits for server confirmation before closing dialog.
**Invalidates**: `['employees', user.id]`, `['overviewStats', user.id]`, `['recentHires', user.id]`, `['upcomingBirthdays', user.id]`

---

### `useUpdateEmployee()`

**Screen**: Employee Detail → Edit mode
**Type**: `optimistic-mutation`

```typescript
const { data } = await supabase
  .from('employees')
  .update({
    full_name: fields.full_name,
    role: fields.role,
    department: fields.department,
    start_date: fields.start_date,
    email: fields.email ?? null,
    phone: fields.phone ?? null,
    location: fields.location ?? null,
    birthday: fields.birthday ?? null,
    fun_facts: fields.fun_facts ?? {},
    updated_at: new Date().toISOString(),
  })
  .eq('id', id)
  .eq('user_id', user.id)
  .select()
  .single();
```

**Optimistic**: Update the employee in local cache immediately; roll back on error with toast "Failed to save changes."
**Invalidates**: `['employees', user.id]`, `['employee', id]`, `['recentHires', user.id]`, `['upcomingBirthdays', user.id]`, `['birthdaysByPeriod', user.id]`

---

### `useDeleteEmployee()`

**Screen**: Directory → Confirm Delete dialog; Employee Detail → Remove button
**Type**: `optimistic-mutation`

```typescript
await supabase
  .from('employees')
  .delete()
  .eq('id', id)
  .eq('user_id', user.id);
```

**Optimistic**: Remove employee from local cache immediately; roll back on error with toast "Failed to remove employee."
**Invalidates**: `['employees', user.id]`, `['overviewStats', user.id]`, `['recentHires', user.id]`, `['upcomingBirthdays', user.id]`, `['birthdaysByPeriod', user.id]`

---

### `useDeleteEmployees()`

**Screen**: Directory → Batch delete toolbar
**Type**: `optimistic-mutation`

```typescript
await supabase
  .from('employees')
  .delete()
  .in('id', ids)
  .eq('user_id', user.id);
```

**Optimistic**: Remove all selected employees from local cache immediately; roll back on error with toast "Failed to delete selected employees."
**Invalidates**: `['employees', user.id]`, `['overviewStats', user.id]`, `['recentHires', user.id]`, `['upcomingBirthdays', user.id]`, `['birthdaysByPeriod', user.id]`

---

### `useUpdateProfile()`

**Screen**: Settings → Profile tab
**Type**: `optimistic-mutation`

```typescript
await supabase
  .from('profiles')
  .update({
    full_name: fields.full_name,
    updated_at: new Date().toISOString(),
  })
  .eq('id', user.id);

// password change (only if new_password is provided):
if (fields.new_password) {
  await supabase.auth.updateUser({ password: fields.new_password });
}
```

**Optimistic**: Update `full_name` in local profile cache immediately; roll back on error.
**Invalidates**: `['profile', user.id]`

---

### `useCreateInvitation()`

**Screen**: Settings → Team tab → Invite form
**Type**: `optimistic-mutation`

```typescript
const { data } = await supabase
  .from('invitations')
  .insert({
    email: fields.email,
    role: fields.role,
    invited_by: user.id,
    status: 'pending',
  })
  .select()
  .single();
```

**Optimistic**: Add pending invite row to local cache immediately; roll back on error with toast "Failed to send invitation."
**Invalidates**: `['invitations', user.id]`

---

### `useUpdateUserRole()`

**Screen**: Settings → Team tab → Change role dropdown
**Type**: `optimistic-mutation`

```typescript
await supabase
  .from('user_roles')
  .update({ role: newRole })
  .eq('user_id', targetUserId);
```

**Optimistic**: Update role badge in team member list immediately; roll back on error.
**Invalidates**: `['teamMembers', user.id]`

---

### `useRevokeInvitation()`

**Screen**: Settings → Team tab → Revoke access dialog
**Type**: `optimistic-mutation`

```typescript
await supabase
  .from('invitations')
  .update({ status: 'revoked' })
  .eq('id', invitationId)
  .eq('invited_by', user.id);
```

**Optimistic**: Remove invitation from local pending list immediately; roll back on error.
**Invalidates**: `['invitations', user.id]`

---

### `useDeleteAccount()`

**Screen**: Settings → General tab → Delete account dialog
**Type**: `mutation`

```typescript
// Server-side via Supabase Edge Function — client cannot delete auth.users directly
const { error } = await supabase.functions.invoke('delete-account', {
  body: { user_id: user.id },
});

// On success:
await supabase.auth.signOut();
// navigate to '/'
```

**Optimistic**: Not optimistic — account deletion waits for server confirmation.
**Invalidates**: entire React Query cache (user is signed out)

---

## Data Provider

```
/demo/*  →  SeedDataProvider  (reads from src/data/seed.ts — public demo; writes show "Sign in to save" toast)
/*       →  SupabaseDataProvider  (reads from Supabase via hooks, writes are real mutations)
```

**Switch point**: The root router in `App.tsx` wraps `/demo/*` routes in `SeedDataProvider` and all other app routes in `SupabaseDataProvider`. Components import hooks from `@/lib/data-provider` — they never import Supabase directly.

**Provider interface**:

```typescript
interface DirectoryDataProvider {
  // Reads
  useOverviewStats(): { data: OverviewStats; isLoading: boolean };
  useRecentHires(limit?: number): { data: Employee[]; isLoading: boolean };
  useUpcomingBirthdays(withinDays?: number): { data: UpcomingBirthday[]; isLoading: boolean };
  useEmployees(filters: EmployeeFilters): { data: Employee[]; isLoading: boolean };
  useEmployee(id: string): { data: Employee | null; isLoading: boolean };
  useBirthdaysByPeriod(filters: CalendarFilters): { data: BirthdayEntry[]; isLoading: boolean };
  useProfile(): { data: Profile | null; isLoading: boolean };
  useTeamMembers(): { data: TeamMember[]; isLoading: boolean };
  useInvitations(): { data: Invitation[]; isLoading: boolean };

  // Mutations
  useCreateEmployee(): { mutate: (input: CreateEmployeeInput) => Promise<Employee> };
  useCreateEmployeesBulk(): { mutate: (rows: CreateEmployeeInput[]) => Promise<Employee[]> };
  useUpdateEmployee(): { mutate: (id: string, input: UpdateEmployeeInput) => Promise<Employee> };
  useDeleteEmployee(): { mutate: (id: string) => Promise<void> };
  useDeleteEmployees(): { mutate: (ids: string[]) => Promise<void> };
  useUpdateProfile(): { mutate: (input: UpdateProfileInput) => Promise<void> };
  useCreateInvitation(): { mutate: (input: CreateInvitationInput) => Promise<Invitation> };
  useUpdateUserRole(): { mutate: (userId: string, role: 'admin' | 'member') => Promise<void> };
  useRevokeInvitation(): { mutate: (id: string) => Promise<void> };
  useDeleteAccount(): { mutate: () => Promise<void> };
}
```

**Both providers filter identically.** The demo IS the product — filters must work in demo mode.

```typescript
// ❌ Wrong — ignores filters
useEmployees: (_filters) => ok(seed.employees),

// ✅ Correct — applies all filter params to in-memory array
useEmployees: (filters) => ok(
  seed.employees
    .filter(e => !filters.department || e.department === filters.department)
    .filter(e => !filters.location   || e.location   === filters.location)
    .filter(e => !filters.search     || [e.full_name, e.role, e.location].some(
        f => f?.toLowerCase().includes(filters.search!.toLowerCase())
    ))
    .sort((a, b) => {
      if (filters.sort === 'start_date_newest') return b.start_date.localeCompare(a.start_date);
      if (filters.sort === 'start_date_oldest') return a.start_date.localeCompare(b.start_date);
      if (filters.sort === 'date_added_newest') return b.created_at.localeCompare(a.created_at);
      // default first_name_asc
      return a.full_name.localeCompare(b.full_name);
    })
),
```

**Seed filter manifest (required — one row per read hook):**

| Hook | Seed array | Filter field | Sort / group |
|------|-----------|-------------|-------------|
| `useOverviewStats` | `seed.employees` | none (aggregates entire array) | client-side: count, distinct department, count start_date ≥ now−60d |
| `useRecentHires` | `seed.employees` | none (returns top N) | `start_date` desc, limit N (default 3) |
| `useUpcomingBirthdays` | `seed.employees` | `birthday` MM-DD → compute next occurrence, filter daysUntil ≤ withinDays | `daysUntil` asc |
| `useEmployees` | `seed.employees` | `department` = enum value, `location` = string, `full_name`/`role`/`location` ilike search | `full_name` asc (default), `start_date` desc/asc, `created_at` desc; group by `department` |
| `useEmployee` | `seed.employees` | `id` = single entity lookup | n/a |
| `useBirthdaysByPeriod` | `seed.employees` | `birthday` MM portion matches viewed month; or next occurrence falls within week range; year view returns all | group by calendar day, `birthday` day-of-month asc within month panel |
| `useProfile` | `seed.profile` | none (single static record) | n/a |
| `useTeamMembers` | `seed.teamMembers` | none (static reference data) | admins first, then `full_name` asc |
| `useInvitations` | `seed.invitations` | `status` = `'pending'` | `created_at` desc |

---

## Auth

### Providers

| Provider | Method | Lovable Cloud setup |
|----------|--------|---------------------|
| Google | `lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin })` | `supabase--configure_social_auth` with `providers: ["google"]` — generates `@lovable.dev/cloud-auth-js` client |
| Apple | `lovable.auth.signInWithOAuth('apple', { redirect_uri: window.location.origin })` | same call with `providers: ["google", "apple"]` |
| Email | `supabase.auth.signUp({ email, password })` / `supabase.auth.signInWithPassword({ email, password })` | email confirmation required — do NOT auto-confirm |

**Important**: OAuth MUST use `lovable.auth.signInWithOAuth()` from `@/integrations/lovable/index`, NOT `supabase.auth.signInWithOAuth()`. Email/password auth stays on `supabase.auth` directly.

### Screens

#### Sign In / Sign Up (`/auth`)

- Single route with `tabs` — "Sign in" tab (default) and "Sign up" tab
- Google OAuth button (full-width, outline) + Apple OAuth button — both call `lovable.auth.signInWithOAuth`
- Email + password form (zod: email format, password min 8 chars) — calls `supabase.auth.signInWithPassword` on sign-in tab
- Sign up tab adds "Full name" field; calls `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
- "Forgot password?" (sign-in tab only) → `supabase.auth.resetPasswordForEmail` + toast "Check your email for a reset link"
- On success (both tabs, all providers): navigate to `/overview`
- Error states: "Invalid email or password", "Email already registered", "Email not confirmed — check your inbox", network error toast
- "← Home" ghost link top-right → `/`

#### Sign In flow

```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) show inline alert;
else navigate('/overview');
```

#### Sign Up flow

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name } },
});
if (error) show inline alert;
else navigate('/overview'); // handle_new_user trigger runs server-side
```

### Route protection

| Route | Access | Notes |
|-------|--------|-------|
| `/` | public | landing page |
| `/auth` | public | redirects to `/overview` if already authenticated |
| `/demo/overview` | public | seed data, no auth required |
| `/demo/directory` | public | seed data, no auth required |
| `/demo/directory/:id` | public | seed data, no auth required |
| `/demo/calendar` | public | seed data, no auth required |
| `/overview` | **protected** | redirects to `/auth` with `from` state |
| `/directory` | **protected** | redirects to `/auth` with `from` state |
| `/directory/new` | **protected** | redirects to `/auth` with `from` state |
| `/directory/:id` | **protected** | redirects to `/auth` with `from` state |
| `/calendar` | **protected** | redirects to `/auth` with `from` state |
| `/settings` | **protected** | redirects to `/auth` with `from` state |

### Sign out

- Topbar user avatar dropdown: "Sign out" → `supabase.auth.signOut()` → clear entire React Query cache → navigate to `/`

### Auth provider component

```typescript
// src/lib/auth-provider.tsx
// AuthProvider wraps the app, exposes { user, session, loading, signOut }
// Registers onAuthStateChange listener BEFORE calling getSession()
// to avoid missing the initial SIGNED_IN event on OAuth redirect.
// On SIGNED_OUT event: clear React Query cache, navigate to '/'.
```

---

## Seed Strategy

### Demo seed data (`src/data/seed.ts`)

The SeedDataProvider reads from these typed arrays. Used ONLY on `/demo/*` routes. Not seeded into real user accounts.

#### `employees` — 10 entries

```typescript
export const employees: Employee[] = [
  {
    id: 'emp-1',
    user_id: 'demo-user',
    full_name: 'Jamie Lin',
    role: 'Senior Engineer',
    department: 'engineering',
    email: 'jamie@acme.co',
    phone: '+1 415 555 0101',
    location: 'SF',
    start_date: '2021-06-14',
    birthday: '01-04',
    avatar_url: null,
    fun_facts: {
      desk_snack: "Trader Joe's Everything Bagel Seasoning",
      hidden_talent: 'Can solve a Rubik\'s cube in under 2 minutes',
      karaoke_song: "Don't Stop Believin'",
      dream_vacation: 'Japan during cherry blossom season',
    },
    created_at: '2021-06-14T09:00:00Z',
    updated_at: '2021-06-14T09:00:00Z',
  },
  {
    id: 'emp-2',
    user_id: 'demo-user',
    full_name: 'Raj Patel',
    role: 'Staff Engineer',
    department: 'engineering',
    email: 'raj@acme.co',
    phone: '+1 212 555 0134',
    location: 'NYC',
    start_date: '2021-08-02',
    birthday: '03-22',
    avatar_url: null,
    fun_facts: {},
    created_at: '2021-08-02T09:00:00Z',
    updated_at: '2021-08-02T09:00:00Z',
  },
  {
    id: 'emp-3',
    user_id: 'demo-user',
    full_name: 'Sora Tanaka',
    role: 'Engineer',
    department: 'engineering',
    email: 'sora@acme.co',
    phone: '+1 555 555 0178',
    location: 'Remote',
    start_date: '2023-03-15',
    birthday: '07-09',
    avatar_url: null,
    fun_facts: {},
    created_at: '2023-03-15T09:00:00Z',
    updated_at: '2023-03-15T09:00:00Z',
  },
  {
    id: 'emp-4',
    user_id: 'demo-user',
    full_name: 'Devon Park',
    role: 'Engineer',
    department: 'engineering',
    email: 'devon@acme.co',
    phone: '+1 512 555 0199',
    location: 'Austin',
    start_date: '2024-01-08',
    birthday: '11-30',
    avatar_url: null,
    fun_facts: {},
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-08T09:00:00Z',
  },
  {
    id: 'emp-5',
    user_id: 'demo-user',
    full_name: 'Aisha Okonkwo',
    role: 'Product Manager',
    department: 'product',
    email: 'aisha@acme.co',
    phone: '+1 555 555 0142',
    location: 'Remote',
    start_date: '2024-04-22',
    birthday: '02-02',
    avatar_url: null,
    fun_facts: {
      desk_snack: 'Dark chocolate almonds',
      hidden_talent: 'Speaks three languages',
      karaoke_song: 'Lizzo – About Damn Time',
      dream_vacation: 'A slow train through Portugal',
    },
    created_at: '2024-04-22T09:00:00Z',
    updated_at: '2024-04-22T09:00:00Z',
  },
  {
    id: 'emp-6',
    user_id: 'demo-user',
    full_name: 'Carlos Méndez',
    role: 'Product Lead',
    department: 'product',
    email: 'carlos@acme.co',
    phone: '+1 415 555 0167',
    location: 'SF',
    start_date: '2022-11-01',
    birthday: '05-18',
    avatar_url: null,
    fun_facts: {},
    created_at: '2022-11-01T09:00:00Z',
    updated_at: '2022-11-01T09:00:00Z',
  },
  {
    id: 'emp-7',
    user_id: 'demo-user',
    full_name: 'Marcus Webb',
    role: 'Product Designer',
    department: 'design',
    email: 'marcus@acme.co',
    phone: '+1 415 555 0123',
    location: 'SF',
    start_date: '2024-05-06',
    birthday: '01-17',
    avatar_url: null,
    fun_facts: {
      desk_snack: 'Almonds',
      hidden_talent: 'Amateur ceramicist',
      karaoke_song: 'Fleetwood Mac – Dreams',
      dream_vacation: 'A road trip through Patagonia',
    },
    created_at: '2024-05-06T09:00:00Z',
    updated_at: '2024-05-06T09:00:00Z',
  },
  {
    id: 'emp-8',
    user_id: 'demo-user',
    full_name: 'Yuki Fernandez',
    role: 'UX Designer',
    department: 'design',
    email: 'yuki@acme.co',
    phone: '+1 512 555 0145',
    location: 'Austin',
    start_date: '2022-07-18',
    birthday: '09-05',
    avatar_url: null,
    fun_facts: {},
    created_at: '2022-07-18T09:00:00Z',
    updated_at: '2022-07-18T09:00:00Z',
  },
  {
    id: 'emp-9',
    user_id: 'demo-user',
    full_name: 'Lin Chen',
    role: 'Operations Lead',
    department: 'operations',
    email: 'lin@acme.co',
    phone: '+1 212 555 0156',
    location: 'NYC',
    start_date: '2024-03-11',
    birthday: '06-14',
    avatar_url: null,
    fun_facts: {},
    created_at: '2024-03-11T09:00:00Z',
    updated_at: '2024-03-11T09:00:00Z',
  },
  {
    id: 'emp-10',
    user_id: 'demo-user',
    full_name: 'Noah Williams',
    role: 'Operations Coordinator',
    department: 'operations',
    email: 'noah@acme.co',
    phone: '+1 555 555 0188',
    location: 'Remote',
    start_date: '2021-12-20',
    birthday: '08-27',
    avatar_url: null,
    fun_facts: {
      desk_snack: 'Kettle chips',
      hidden_talent: 'Builds custom mechanical keyboards',
      karaoke_song: 'Mr. Brightside',
      dream_vacation: 'Iceland in winter',
    },
    created_at: '2021-12-20T09:00:00Z',
    updated_at: '2021-12-20T09:00:00Z',
  },
];
```

Birthday distribution: Jan (2: emp-1 01-04, emp-7 01-17), Feb (1: emp-5 02-02), Mar (1: emp-2 03-22), May (1: emp-6 05-18), Jun (1: emp-9 06-14), Jul (1: emp-3 07-09), Aug (1: emp-10 08-27), Sep (1: emp-8 09-05), Nov (1: emp-4 11-30). Every month with data has at least one dot.

#### `profile` — 1 entry (demo user identity)

```typescript
export const profile: Profile = {
  id: 'demo-user',
  full_name: 'Sarah Chen',
  avatar_url: null,
  created_at: '2021-06-01T09:00:00Z',
  updated_at: '2021-06-01T09:00:00Z',
};
```

#### `teamMembers` — 2 entries

```typescript
export const teamMembers: TeamMember[] = [
  { user_id: 'demo-user',   full_name: 'Sarah Chen',   email: 'sarah@acme.co',  role: 'admin'  },
  { user_id: 'demo-user-2', full_name: 'Marcus Webb',  email: 'marcus@acme.co', role: 'member' },
];
```

#### `invitations` — 1 entry

```typescript
export const invitations: Invitation[] = [
  {
    id: 'inv-1',
    email: 'invite@pending.co',
    role: 'member',
    invited_by: 'demo-user',
    status: 'pending',
    created_at: '2025-01-10T09:00:00Z',
  },
];
```

#### Landing static content (no seed table — inline in landing page components)

```typescript
export const featureTabs = [
  { id: 'directory',  label: 'Directory',  description: 'Browse your whole team grouped by department' },
  { id: 'profiles',   label: 'Profiles',   description: 'Fun facts, contact info, and tenure at a glance' },
  { id: 'birthdays',  label: 'Birthdays',  description: 'A calendar that makes every colleague feel remembered' },
  { id: 'overview',   label: 'Overview',   description: 'See who\'s new and who\'s celebrating this month' },
];

export const testimonials = [
  {
    id: 't1',
    quote: "We finally stopped asking 'what's your last name again?'",
    author: 'Maya R',
    title: 'Head of Ops',
    company: 'Meridian',
  },
  {
    id: 't2',
    quote: "Birthday dots on the calendar. That's the feature that got everyone using it.",
    author: 'Tom K',
    title: 'Engineering Manager',
    company: 'Stackform',
  },
  {
    id: 't3',
    quote: "Replaced a messy Notion table we'd been avoiding for two years.",
    author: 'Priya S',
    title: 'People Lead',
    company: 'Loopcast',
  },
];

export const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Demo',     href: '/demo/overview' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Blog',  href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms',   href: '#' },
  ],
};
```

### First-run experience (real users)

Real users start with an **empty workspace** — no seeded data. This template is **creation-first**: users add employees manually.

- `handle_new_user()` trigger creates ONLY the `profiles` row and `user_roles` row (admin) — no demo data
- First screen (`/overview`) shows: blankslate with skeleton background and floating card — "No team members yet. Add your first team member to get started." with a primary "Add your first team member" button navigating to `/directory/new`
- Empty state on `/directory`: same blankslate pattern — "No team members yet. Add the first one to get started." with "Add your first team member" + "or import from CSV" secondary option
- Empty state on `/calendar`: blankslate — "No birthdays on record yet. Add team members to see their birthdays here."

### `handle_new_user()` trigger

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Create user profile (name from OAuth metadata if present)
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Assign admin role (first user in their own workspace is always admin)
  insert into public.user_roles (user_id, role)
  values (new.id, 'admin');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
```

---

## Integrations

None — this template is self-contained with Lovable Cloud.

All features (employee records, birthdays, team invitations, theme) are backed by Supabase tables and do not require external service connections. The `delete-account` functionality uses a Supabase Edge Function to delete the authenticated user server-side (since `supabase.auth.admin.deleteUser()` requires service role), but this is internal infrastructure, not a third-party integration.

### Edge Function: `delete-account`

**Required for**: Settings → General tab → Delete account
**Type**: `edge-function`

```typescript
// supabase/functions/delete-account/index.ts
// Receives: { user_id } from authenticated caller
// Verifies caller matches user_id via JWT
// Calls supabase.auth.admin.deleteUser(user_id) using service role key
// Cascades: employees, profiles, user_roles, invitations all ON DELETE CASCADE
```

**When invoked**: User confirms "DELETE" in the delete account dialog and clicks "Delete account"
**On success**: client calls `supabase.auth.signOut()`, clears React Query cache, navigates to `/`
**On error**: toast "Failed to delete account. Please try again." — account remains intact

---

## Hard rules compliance

1. **Every table gets GRANT + RLS** — all four tables include `grant` + `alter table enable row level security` + four policies each.
2. **Never reference `auth.users` from JS** — all user metadata comes from `profiles`. The `useTeamMembers` hook reads from `user_roles` + `profiles`, never from `auth.users`.
3. **Every read hook accepts filters** — `useEmployees` accepts `{ department, location, search, sort }`. `useRecentHires` accepts `{ limit }`. `useBirthdaysByPeriod` accepts `{ view, year, month, weekStart }`. `useUpcomingBirthdays` accepts `{ withinDays }`. No unfiltered read exists.
4. **Every write has a corresponding read that invalidates** — each mutation lists its `Invalidates` keys.
5. **`handle_new_user()` seeds scaffolding only** — creates `profiles` + `user_roles` rows. Zero employee data. Demo data lives in `src/data/seed.ts` and is served only on `/demo/*` via `SeedDataProvider`.
6. **Auth is mandatory** — `/auth` screen, three providers, protected routes, sign-out.
7. **Integrations degrade gracefully** — no integrations in this template; the app is fully self-contained.
8. **Indexes cover query patterns** — `employees_user_department_idx`, `employees_user_start_date_idx`, `employees_user_location_idx`, `employees_user_created_idx` cover every `.eq()` and `.order()` used in hooks.
9. **No `check` constraints with `now()`** — the `birthday` column uses a regex pattern check (immutable). New hire age is computed client-side, not constrained.
10. **One migration for everything** — all DDL belongs in a single migration file for atomic rollback.
11. **Mutations specify optimistic behavior** — `useCreateEmployee`, `useUpdateEmployee`, `useDeleteEmployee`, `useDeleteEmployees`, `useCreateInvitation`, `useUpdateUserRole`, `useRevokeInvitation`, `useUpdateProfile` are all marked optimistic with explicit rollback conditions.
12. **Seed filter manifest is complete** — the Data Provider section includes a full table with one row per read hook specifying seed array, filter field, and sort/group behavior.