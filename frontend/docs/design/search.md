# Search

Text input that narrows visible data by matching against string fields.
Debounce the input to avoid re-rendering on every keystroke.

---

## Inline search input

**Components**: `Input` with `Search` icon prefix

```
┌──────────────────────────────────┐
│  [Search] Search orders…         │
└──────────────────────────────────┘
```

**State shape**: `search: string` in FilterContext, debounced 300ms

```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// Pass debounced value to the hook
const { data } = provider.useOrders({
  ...filters,
  search: debouncedSearch,
});
```

**SeedDataProvider filtering**:
```typescript
useOrders: (filters) => {
  let result = seed.orders;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(o =>
      o.customer_name.toLowerCase().includes(q) ||
      o.product_name.toLowerCase().includes(q)
    );
  }
  return { data: result, isLoading: false };
},
```

**SupabaseDataProvider filtering**:
```typescript
let query = supabase.from('orders').select('*');
if (filters.search) {
  query = query.or(`customer_name.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%`);
}
```

---

## Command palette search

**Components**: `Command` + `CommandInput` + `CommandList`

For searching across entities (goals, members, documents) with grouped results
and keyboard navigation. Use when the search is a primary action, not a filter
on a visible list.

```
┌──────────────────────────────────────┐
│  [Search] Search goals…              │
│  ─────────────────────────────────── │
│  Goals                               │
│    Grow customer acquisition         │
│    Reduce churn                      │
│  Members                             │
│    Marco Alvarez                     │
│    Dana Rivera                       │
└──────────────────────────────────────┘
```

The `cmdk` library handles fuzzy matching against `CommandItem` values.

---

## useDebounce hook

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

---

## Anti-patterns

```typescript
// ❌ Search input exists but doesn't pass the value to the hook
<Input onChange={(e) => setSearch(e.target.value)} />
// search state lives in component but never reaches the DataProvider

// ❌ No debounce — re-queries on every keystroke
const { data } = provider.useOrders({ search }); // fires on every character

// ❌ Search only works on one screen but the screenboard says it filters globally
// If the search is in FilterContext, it should filter on every screen that shows data
```
