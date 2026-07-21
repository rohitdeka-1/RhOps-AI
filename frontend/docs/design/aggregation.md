# Aggregation

Derived values — KPI totals, chart groupings, counts, percentages. Aggregation
always happens AFTER filtering. Never pre-compute aggregates in seed data.

---

## KPI cards

**Components**: `Card` + `CardHeader` + `CardContent`

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Revenue      │  │ Orders       │  │ Avg Order    │
│ $122,862     │  │ 4,354        │  │ $28.22       │
│ +18.3% ↑    │  │ +12.1% ↑    │  │ -2.4% ↓     │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Data shape**: Derived from the filtered raw array, not from a separate seed export.

```typescript
// ✅ Correct — derives KPIs from filtered orders
useKpis: (filters) => {
  const filtered = filterOrders(seed.orders, filters);
  return {
    data: {
      revenue: filtered.reduce((sum, o) => sum + o.total, 0),
      orderCount: filtered.length,
      avgOrder: filtered.length > 0
        ? filtered.reduce((sum, o) => sum + o.total, 0) / filtered.length
        : 0,
    },
    isLoading: false,
  };
},

// ❌ Wrong — pre-computed, doesn't respond to filters
export const kpis = { revenue: 122862, orderCount: 4354, avgOrder: 28.22 };
```

**Delta/trend**: Compare current period vs previous period. Both periods use the
same filter logic with shifted dates.

---

## Chart data (Recharts)

**Components**: `ChartContainer` + Recharts (`BarChart`, `LineChart`, `PieChart`, etc.)

**Data shape**: Array of objects with a label key + value keys.

```typescript
// Chart expects this shape
const chartData = [
  { month: 'Jan', revenue: 15000, orders: 420 },
  { month: 'Feb', revenue: 18000, orders: 510 },
];

// Derived from filtered raw data
useRevenueByMonth: (filters) => {
  const filtered = filterOrders(seed.orders, filters);
  const grouped = groupBy(filtered, o => formatMonth(o.created_at));
  return {
    data: Object.entries(grouped).map(([month, rows]) => ({
      month,
      revenue: rows.reduce((sum, o) => sum + o.total, 0),
      orders: rows.length,
    })),
    isLoading: false,
  };
},
```

**ChartConfig**: Maps data keys to labels and colors.

```typescript
const chartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  orders: { label: 'Orders', color: 'var(--chart-2)' },
};
```

---

## Donut / pie charts

**Data shape**: Array of `{ name, value, fill? }`.

```typescript
useCategoryBreakdown: (filters) => {
  const filtered = filterOrders(seed.orders, filters);
  const grouped = groupBy(filtered, o => o.product_category);
  const total = filtered.length;
  return {
    data: Object.entries(grouped).map(([category, rows]) => ({
      name: category,
      value: rows.length,
      percentage: Math.round((rows.length / total) * 100),
    })),
    isLoading: false,
  };
},
```

---

## groupBy helper

Common utility for aggregation. Keep it in `src/lib/utils.ts`.

```typescript
function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}
```

---

## Anti-patterns

```typescript
// ❌ Pre-computed chart data in seed.ts
export const revenueByMonth = [
  { month: 'Jan', revenue: 15000 },
];
// Can't be re-derived when filters change

// ❌ KPI values as static constants
export const totalRevenue = 122862;
// Changing the date range filter doesn't change this

// ❌ Aggregation on the full array, ignoring filters
useKpis: (filters) => ({
  data: {
    revenue: seed.orders.reduce((sum, o) => sum + o.total, 0), // no filter applied
  },
}),

// ❌ Percentage calculated from unfiltered total
percentage: rows.length / seed.orders.length // denominator should be filtered.length
```
