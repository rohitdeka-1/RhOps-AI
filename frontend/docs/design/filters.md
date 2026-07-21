# Filters

Filter controls narrow visible data without navigating away. Every filter
change triggers the DataProvider hook to re-evaluate — both SeedDataProvider
(client-side `.filter()`) and SupabaseDataProvider (new query with `.gte()`, `.in()`).

---

## Date range filter

**Components**: `Calendar` + `Popover` + `Button`

```
┌──────────────────────────────────────────┐
│  [CalendarDays] Apr 1 – May 31  [▾]     │
└──────────────────────────────────────────┘
         │ click
         ▼
┌──────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐     │
│  │  April 2026  │  │  May 2026    │     │
│  │  S M T W T F S│  │  S M T W T F S│  │
│  │  ...         │  │  ...         │     │
│  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────┘
```

**State shape**: `{ startDate: string, endDate: string }` (ISO date strings)

**FilterContext wiring**:
```typescript
const [dateRange, setDateRange] = useState<DateRange>({
  from: startOfMonth(subMonths(new Date(), 1)),
  to: endOfMonth(new Date()),
});

// Pass to hooks
const { data } = provider.useOrders({
  startDate: dateRange.from.toISOString(),
  endDate: dateRange.to.toISOString(),
});
```

**Seed data requirement**: Every seed array entry needs a date field (`created_at`,
`snapshot_date`, `send_date`). Without it, the filter has nothing to filter on.

---

## Category / single select filter

**Components**: `Select` or `ToggleGroup`

```
┌──────────────────────────┐
│  Category  [All ▾]       │
└──────────────────────────┘
         │ click
         ▼
┌──────────────────────────┐
│  All                     │
│  Doohickey               │
│  Gadget                  │
│  Gizmo                   │
│  Widget                  │
└──────────────────────────┘
```

**State shape**: `value: string` with `onValueChange`

**Seed data requirement**: Entries need the category field (`product_category`,
`type`, `status`). The select options are derived from the seed data's unique values.

---

## Multi-select filter (chips)

**Components**: `Popover` + `Command` (combobox pattern) or `ToggleGroup`

```
┌──────────────────────────────────────────┐
│  [● Marketing] [● Operations] [+ Team]   │
└──────────────────────────────────────────┘
```

**State shape**: `selected: string[]`, toggle items in/out

```typescript
const [categories, setCategories] = useState<string[]>(['Doohickey', 'Gadget', 'Gizmo', 'Widget']);

// Toggle a category
const toggle = (cat: string) =>
  setCategories(prev =>
    prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
  );
```

**Seed data requirement**: Same as single select — entries need the filterable field.
The hook receives the array: `.in('product_category', filters.categories)`.

---

## Quarter / cycle selector

**Components**: `Button` (ghost) + text label

```
┌──────────────────────────────────┐
│  [◀]  Q2 2026  [▶]              │
└──────────────────────────────────┘
```

**State shape**: `{ year: number, quarter: number }` or `cycle: string` ("Q2 2026")

Derives `startDate` / `endDate` from the cycle. The hook receives dates, not the
cycle string — keeps the hook reusable.

---

## FilterContext pattern

All filter state lives in a shared context so multiple screens share the same
filter values when navigating between them.

```typescript
// src/lib/filter-context.tsx
interface FilterState {
  startDate: string;
  endDate: string;
  categories: string[];
  search: string;
}

const FilterContext = createContext<{
  filters: FilterState;
  setFilters: (updates: Partial<FilterState>) => void;
} | null>(null);

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be inside FilterProvider');
  return ctx;
}
```

Components read `useFilters()` and pass the values to DataProvider hooks.
Changing a filter triggers a re-render → new hook call → new data.

---

## Anti-patterns

```typescript
// ❌ Filter UI exists but doesn't pass values to the hook
const { data } = provider.useOrders({}); // empty filters — ignores user selection

// ❌ Hook ignores the filter param
useOrders: (_filters) => ({ data: seed.orders, isLoading: false }),

// ❌ Pre-aggregated seed data that can't be filtered
export const revenueByMonth = [{ month: 'Jan', revenue: 15000 }];
// Should be raw orders with created_at so they can be grouped by month AFTER filtering

// ❌ Filter state in the component instead of FilterContext
// (doesn't persist across screen navigation)
const [dateRange, setDateRange] = useState(...); // lives and dies with the component
```
