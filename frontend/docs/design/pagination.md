# Pagination

Navigate through pages of data. Use when the dataset is too large to render at
once. Most template tables are small enough for client-side pagination; "load
more" is the pattern for feeds.

---

## Numbered pagination

**Components**: `Pagination` + `PaginationContent` + `PaginationItem`

```
┌──────────────────────────────────────────┐
│  Showing 1–20 of 223                     │
│  [◀ Prev]  1  2  3  ...  12  [Next ▶]   │
└──────────────────────────────────────────┘
```

**State shape**: `{ page: number, pageSize: number }`

```typescript
const [page, setPage] = useState(0);
const pageSize = 20;

// SeedDataProvider
const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
const totalPages = Math.ceil(filtered.length / pageSize);

// SupabaseDataProvider
const { data } = await supabase
  .from('orders')
  .select('*', { count: 'exact' })
  .range(page * pageSize, (page + 1) * pageSize - 1);
```

---

## Load more (infinite scroll)

**Components**: `Button` (outline) at the bottom of a feed

```
┌──────────────────────────────────────────┐
│  Check-in entry 1                        │
│  Check-in entry 2                        │
│  Check-in entry 3                        │
│  ...                                     │
│  Check-in entry 20                       │
│                                          │
│           [Load more]                    │
└──────────────────────────────────────────┘
```

**State shape**: React Query `useInfiniteQuery`

```typescript
const {
  data,
  isLoading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['check-ins', filters],
  queryFn: ({ pageParam = 0 }) =>
    supabase
      .from('check_ins')
      .select('*')
      .order('created_at', { ascending: false })
      .range(pageParam * 20, (pageParam + 1) * 20 - 1)
      .then(({ data }) => data ?? []),
  getNextPageParam: (lastPage, allPages) =>
    lastPage.length === 20 ? allPages.length : undefined,
});

// Flatten pages for rendering
const items = data?.pages.flat() ?? [];
```

**SeedDataProvider equivalent**:
```typescript
// Simulate infinite query with a page counter
const [loadedCount, setLoadedCount] = useState(20);
const items = seed.checkIns.slice(0, loadedCount);
const hasMore = loadedCount < seed.checkIns.length;
const loadMore = () => setLoadedCount(prev => prev + 20);
```

---

## Client-side vs server-side

| Dataset size | Approach |
|-------------|----------|
| < 100 rows | No pagination needed — render all |
| 100–500 rows | Client-side pagination (slice the array) |
| 500+ rows | Server-side pagination (Supabase `.range()`) |

Most template datasets are under 500 rows. Client-side pagination is fine.

---

## Anti-patterns

```typescript
// ❌ Fetching all rows then paginating client-side on a large dataset
const { data } = await supabase.from('orders').select('*'); // loads 10K rows
const page = data.slice(offset, offset + 20); // wasteful

// ❌ "Load more" that re-fetches everything including already-loaded items

// ❌ No loading state while fetching the next page
<Button onClick={fetchNextPage}>Load more</Button>
// Should show spinner: {isFetchingNextPage ? <Loader2 /> : 'Load more'}
```
