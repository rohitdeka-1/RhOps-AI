# Sort

Sort controls reorder visible data. Sorting happens client-side on the filtered
array — the hook returns data, the component sorts it. For server-side sort
(large datasets), pass sort params to the hook.

---

## Column header sort

**Components**: `Table` + `TableHead` with `Button` (ghost) + `ArrowUpDown` icon

```
┌──────────┬──────────┬───────────┐
│ Name [↕] │ Date [↕] │ Total [↕] │  ← click header to sort
├──────────┼──────────┼───────────┤
│ Item A   │ May 14   │ $89.00    │
│ Item B   │ May 12   │ $42.50    │
└──────────┴──────────┴───────────┘
```

**State shape** (TanStack Table):
```typescript
const [sorting, setSorting] = useState<SortingState>([]);

const table = useReactTable({
  data,
  columns,
  onSortingChange: setSorting,
  getSortedRowModel: getSortedRowModel(),
  state: { sorting },
});
```

**Without TanStack Table** (simple arrays):
```typescript
const [sortField, setSortField] = useState<string>('created_at');
const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

const sorted = [...data].sort((a, b) => {
  const cmp = a[sortField] > b[sortField] ? 1 : -1;
  return sortDir === 'asc' ? cmp : -cmp;
});
```

---

## Dropdown sort

**Components**: `Select` or `DropdownMenu`

```
┌────────────────────────────────┐
│  Sort by  [Progress ▾]         │
└────────────────────────────────┘
```

**State shape**: `{ sortBy: 'name' | 'progress' | 'status' | 'date' }`

Passed to the hook or applied client-side after the hook returns.

---

## Client-side vs server-side

| Scale | Approach | When |
|-------|----------|------|
| < 500 rows | Client-side sort after fetch | Most template tables |
| 500+ rows | Pass sort params to hook | Supabase `.order()` |

SeedDataProvider always sorts client-side. SupabaseDataProvider can use
`.order(field, { ascending })` in the Supabase query.

---

## Anti-patterns

```typescript
// ❌ Sort UI with no state — clicking does nothing
<TableHead>Name <ArrowUpDown /></TableHead>

// ❌ Sort happens on the seed array but not the Supabase query
// (demo sorts, authenticated doesn't)

// ❌ Mutating the original array instead of copying
data.sort(...) // mutates React state — causes bugs
[...data].sort(...) // correct — creates a new array
```
