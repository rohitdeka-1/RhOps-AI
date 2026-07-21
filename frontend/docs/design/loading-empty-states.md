# Loading & Empty States

What the user sees before data arrives and when there's no data at all.

---

## Loading — skeleton bars

**Components**: `Skeleton` (static bars, no pulse animation)

Show a ghost preview matching the final content shape. Static bars — no
pulsing. This is the Vercel pattern: the skeleton IS the layout, frozen.

```
┌────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░  ← h-4 w-3/4     │
│  ░░░░░░░░░░░░        ← h-4 w-1/2     │
│  ░░░░░░░░░░░░░░      ← h-4 w-2/3     │
└────────────────────────────────────────┘
```

```typescript
function OrdersSkeleton() {
  const bar = 'rounded bg-accent h-4';
  return (
    <div className="space-y-3 p-6">
      <div className={`${bar} w-3/4`} />
      <div className={`${bar} w-1/2`} />
      <div className={`${bar} w-2/3`} />
      <div className={`${bar} w-1/2`} />
    </div>
  );
}
```

Match the shape of the actual content — if the screen shows a table, skeleton
should look like table rows. If it shows cards, skeleton should look like cards.

---

## Loading — spinner

**Components**: `Loader2` from Lucide with `animate-spin`

Monochromatic, `text-muted-foreground`. Never colorful.

```typescript
// Inline with text
<Loader2 className="size-4 animate-spin text-muted-foreground" />
<span>Loading…</span>

// Button loading state — keep the label visible
<Button disabled>
  <Loader2 className="animate-spin" />
  Saving…
</Button>
```

**Show-delay**: Wait 150–300ms before showing a spinner. If the operation
completes in that window, the user never sees loading — it feels instant.

---

## Empty state — no data yet

When a section has zero content (first visit, no items created).
Skeleton background with a floating card overlay.

```
┌──────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░                       │
│  ░░░░░░░░░░░░                            │
│       ┌─────────────────────┐            │
│       │     [Target]        │            │
│       │  No goals yet       │  ← card   │
│       │  Create your first  │    overlay │
│       │  objective.         │            │
│       │  [+ New goal]       │            │
│       └─────────────────────┘            │
│  ░░░░░░░░░░                              │
│  ░░░░░░░░░░░░░  ← gradient fades out    │
└──────────────────────────────────────────┘
```

**Pattern**:
- Static skeleton bars as background (`pointer-events-none`, `aria-hidden`)
- Bottom gradient: `bg-gradient-to-t from-background to-transparent`
- Floating card: `shadow-lg max-w-sm`, centered with `pt-[10%]`
- Card contains: icon, title, description, primary CTA button

---

## Empty state — filtered to zero

When filters are applied but no items match. Different from "no data yet" —
the data exists, the filter is too narrow.

```
┌──────────────────────────────────────────┐
│  No goals match your filters.            │
│  [Clear filters]                         │
└──────────────────────────────────────────┘
```

Use a simple centered message with a "Clear filters" button that resets
FilterContext to defaults. No skeleton background — the page isn't empty,
the filter just excluded everything.

---

## Empty state — empty search

```
┌──────────────────────────────────────────┐
│  No results for "xyz".                   │
│  Try a different search term.            │
└──────────────────────────────────────────┘
```

---

## Conditional rendering

```typescript
function GoalsList({ filters }: Props) {
  const data = useDataProvider();
  const { data: goals, isLoading } = data.useGoals(filters);

  if (isLoading) return <GoalsSkeleton />;
  if (goals.length === 0 && hasActiveFilters(filters)) return <EmptyFilterResult />;
  if (goals.length === 0) return <GoalsBlankslate />;
  return <GoalsTable goals={goals} />;
}
```

Order matters: loading → empty filter → empty → populated.

---

## Anti-patterns

```typescript
// ❌ Pulsing skeleton animation
<Skeleton className="animate-pulse" /> // too distracting — use static bars

// ❌ Colorful spinner
<Loader2 className="text-blue-500 animate-spin" /> // use text-muted-foreground

// ❌ No loading state — component renders with undefined data
const { data } = provider.useGoals(filters);
return <Table data={data} />; // data could be undefined, causing runtime error

// ❌ Same empty state for "no data" and "filtered to zero"
// "No goals yet" when the user has 50 goals but the filter excluded all of them

// ❌ Generic "Loading..." text without matching the content shape
// A table should show skeleton rows, not a centered spinner
```
