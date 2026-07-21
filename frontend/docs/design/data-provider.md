# DataProvider

The dual-mode data layer that every template uses. Components call hooks from a
provider context — they never import `src/data/seed.ts` or `@/integrations/supabase/client`
directly. The provider decides where data comes from.

---

## Two providers, one interface

```
/demo/*  →  SeedDataProvider     reads from src/data/seed.ts
/*       →  SupabaseDataProvider  reads from Supabase via React Query
```

Both implement the same TypeScript interface. Components don't know which is active.

```
┌─────────────────────────────────────────────────────────┐
│  App.tsx                                                 │
│                                                          │
│  <Route path="/demo/*">                                  │
│    <SeedDataProvider>        ← seed arrays, filtered     │
│      <WorkspaceLayout />        in-memory                │
│    </SeedDataProvider>                                   │
│  </Route>                                                │
│                                                          │
│  <Route path="/*">                                       │
│    <ProtectedRoute>                                      │
│      <SupabaseDataProvider>  ← Supabase queries via      │
│        <WorkspaceLayout />      React Query              │
│      </SupabaseDataProvider>                             │
│    </ProtectedRoute>                                     │
│  </Route>                                                │
└─────────────────────────────────────────────────────────┘
```

---

## Provider interface

Define the interface in `src/lib/data-provider.tsx`. Every read hook accepts
filters. Every mutation returns `{ mutate, isPending }`.

```typescript
interface AppDataProvider {
  // Reads — always accept filters
  useOrders(filters: OrderFilters): { data: Order[]; isLoading: boolean };
  useKpis(filters: DateFilter): { data: Kpis; isLoading: boolean };

  // Mutations
  useCreateOrder(): { mutate: (input: CreateOrderInput) => void; isPending: boolean };
  useUpdateOrder(): { mutate: (input: UpdateOrderInput) => void; isPending: boolean };
  useDeleteOrder(): { mutate: (input: { id: string }) => void; isPending: boolean };
}
```

Expose it via React context:

```typescript
const DataProviderContext = createContext<AppDataProvider | null>(null);

export function useDataProvider(): AppDataProvider {
  const ctx = useContext(DataProviderContext);
  if (!ctx) throw new Error('useDataProvider must be inside a DataProvider');
  return ctx;
}
```

---

## SeedDataProvider

Reads from `src/data/seed.ts`. **Must filter the seed arrays** — never return
unfiltered data.

```typescript
export function SeedDataProvider({ children }: { children: ReactNode }) {
  const provider: AppDataProvider = {
    // ✅ Filters the seed array by the same fields Supabase would filter
    useOrders: (filters) => ({
      data: seed.orders.filter(o =>
        o.created_at >= filters.startDate &&
        o.created_at <= filters.endDate &&
        filters.categories.includes(o.product_category)
      ),
      isLoading: false,
    }),

    // ✅ Derives KPIs from filtered data, not from pre-computed totals
    useKpis: (filters) => {
      const filtered = seed.orders.filter(o =>
        o.created_at >= filters.startDate &&
        o.created_at <= filters.endDate
      );
      return {
        data: {
          totalRevenue: filtered.reduce((sum, o) => sum + o.total, 0),
          orderCount: filtered.length,
        },
        isLoading: false,
      };
    },

    // Mutations in demo mode show a toast and do nothing
    useCreateOrder: () => ({
      mutate: () => toast('Sign in to save changes'),
      isPending: false,
    }),
    useUpdateOrder: () => ({
      mutate: () => toast('Sign in to save changes'),
      isPending: false,
    }),
    useDeleteOrder: () => ({
      mutate: () => toast('Sign in to save changes'),
      isPending: false,
    }),
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}
```

---

## SupabaseDataProvider

Wraps React Query hooks that call Supabase. Each hook maps to a cloudboard
query entry.

```typescript
export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const provider: AppDataProvider = {
    useOrders: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ['orders', user?.id, filters],
        queryFn: async () => {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user!.id)
            .gte('created_at', filters.startDate)
            .lte('created_at', filters.endDate)
            .in('product_category', filters.categories)
            .order('created_at', { ascending: false });
          return data ?? [];
        },
        enabled: !!user,
      });
      return { data: data ?? [], isLoading };
    },

    useCreateOrder: () => {
      const mutation = useMutation({
        mutationFn: async (input: CreateOrderInput) => {
          const { data } = await supabase
            .from('orders')
            .insert({ user_id: user!.id, ...input })
            .select()
            .single();
          return data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
          toast.success('Order created');
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    // ... same pattern for other hooks
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}
```

---

## Consuming the provider

Components call `useDataProvider()` and destructure the hooks they need.
Never import from `seed.ts` or `supabase/client` in page components.

```typescript
// ✅ Correct — goes through the provider
function OrdersChart({ filters }: { filters: OrderFilters }) {
  const data = useDataProvider();
  const { data: orders, isLoading } = data.useOrders(filters);

  if (isLoading) return <Skeleton />;
  return <BarChart data={orders} />;
}

// ❌ Wrong — imports seed directly, bypasses provider, filters won't work
import { orders } from '@/data/seed';
function OrdersChart() {
  return <BarChart data={orders} />;
}
```

---

## Seed data shape

The cloudboard owns the seed data shape. Seed arrays must have raw fields
that can be filtered — not pre-aggregated totals.

```typescript
// ❌ Wrong — pre-aggregated, can't filter by date
export const kpis = { totalRevenue: 122862, orderCount: 4354 };

// ✅ Correct — raw rows with filterable fields
export const orders: Order[] = [
  { id: '1', created_at: '2024-01-15', product_category: 'Widget', total: 42.50, source: 'Google' },
  { id: '2', created_at: '2024-01-16', product_category: 'Gadget', total: 89.00, source: 'Organic' },
  // ...
];
// KPIs are derived at render time from the filtered array
```

Every seed array entry needs:
- A **date/timestamp field** if the screen has a date range filter
- A **category/type field** if the screen has a category filter
- A **status field** if the screen has a status filter
- An **owner/author field** if the screen has an owner filter
- A **sort_order field** if the screen supports drag-to-reorder

---

## Import rules

| File | Can import seed.ts? | Can import supabase/client? |
|------|:---:|:---:|
| `src/lib/data-provider.tsx` | ✅ | ✅ |
| `src/pages/**/*.tsx` | ❌ | ❌ |
| `src/components/**/*.tsx` | ❌ | ❌ |
| `src/lib/auth/*.tsx` | ❌ | ✅ (auth only) |

Only `data-provider.tsx` bridges between the data sources and the app.
Everything else goes through `useDataProvider()`.

---

## Anti-patterns

```typescript
// ❌ SeedDataProvider ignores filters
useOrders: (_filters) => ({ data: seed.orders, isLoading: false }),

// ❌ Component imports seed directly
import { orders } from '@/data/seed';

// ❌ Component imports Supabase directly
import { supabase } from '@/integrations/supabase/client';

// ❌ Pre-aggregated seed data that can't be filtered
export const revenueByMonth = [{ month: 'Jan', revenue: 15000 }];

// ❌ SupabaseDataProvider that just wraps SeedDataProvider
export function SupabaseDataProvider({ children }) {
  return <SeedDataProvider>{children}</SeedDataProvider>;
}
```
