# Drill Down

Progressive disclosure — show summary first, reveal detail on interaction.
The parent view (list, table, tree) stays visible while the detail opens
alongside it.

---

## Sheet detail panel

**Components**: `Sheet` (side="right")

The most common drill-down. Click a row in the table → sheet slides in from
the right showing the entity's full detail. The table stays visible on the left.

```
┌─────────────────────────┬──────────────────────────────┐
│  TABLE                  │  SHEET (detail)              │
│                         │                              │
│  Row A                  │  [✕]                         │
│  Row B  ← selected      │  Goal: Grow acquisition      │
│  Row C                  │  ████████░░ 68%  On track    │
│                         │                              │
│                         │  Progress over time           │
│                         │  ╭───────╮                   │
│                         │  │ chart │                   │
│                         │  ╰───────╯                   │
│                         │                              │
│                         │  Check-ins                    │
│                         │  • Marco: "Pipeline building" │
└─────────────────────────┴──────────────────────────────┘
```

**State**: `selectedId: string | null` in the parent page component.

```typescript
function GoalsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <GoalsTable onRowClick={(id) => setSelectedId(id)} />
      <Sheet open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <SheetContent side="right" className="w-[480px]">
          {selectedId && <GoalDetail goalId={selectedId} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Detail hook**: The sheet fetches its own data via `useGoal(selectedId)`.

**Close**: `[✕]` button or click outside. Closing resets `selectedId` to null.

---

## Expand / collapse tree rows

For hierarchical data (OKR cascades, folder trees, nested categories).
Not a sheet — rows expand inline to reveal children.

```
  ▼ ⚙️ Operational Excellence
      ▼ 🧭 Get billing to a new level    Operations  73%  Progressing
          • Reduce billing errors          Operations  25%  Off track
          • Achieve 95% invoice rate       Operations  65%  Progressing
      ► 🧭 Ensure compliance              Operations  81%  Progressing
  ► 🚀 Market Expansion & Growth
```

**State**: `expanded: Set<string>` tracks which parent IDs are open.

```typescript
const [expanded, setExpanded] = useState<Set<string>>(new Set(initialIds));

const toggle = (id: string) => {
  setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
};
```

**Rendering**: Flatten the tree, then only render rows whose parent chain is
fully expanded.

**Icons**: `ChevronDown` (expanded) / `ChevronRight` (collapsed) for parent
rows. Bullet dot `•` for leaf nodes (no chevron, can't expand).

---

## Click-through to detail route

For entities that deserve a full page (deal detail `/deals/:id`,
member profile `/members/:id`). Navigate away from the list.

Only use this when the detail view has enough content to fill a page.
For lighter details, use Sheet.

```typescript
<TableRow onClick={() => navigate(`/deals/${deal.id}`)}>
```

---

## Inline member panel

**Components**: `Collapsible` — expands below the clicked row, accordion-style.

```
│  Marco Alvarez    Marketing Lead    ● Marketing  │
│  ┌────────────────────────────────────────────┐  │
│  │  Active goals (2)                          │  │
│  │  → Grow customer acquisition   On track    │  │
│  │  → Launch brand campaign       Progressing │  │
│  │  Last check-in: May 14                     │  │
│  └────────────────────────────────────────────┘  │
│  Leila Khan       Growth Marketer   ● Marketing  │
```

Only one panel open at a time — expanding a second row collapses the first.

---

## Anti-patterns

```typescript
// ❌ Navigate away from the list for lightweight detail
navigate(`/goals/${id}`) // loses the cascade context — use Sheet instead

// ❌ Sheet that re-fetches the same data the table already has
// The table row has { id, name, progress, status }. The sheet should fetch
// ADDITIONAL data (chart, check-ins) not re-fetch the basics.

// ❌ Row click opens sheet AND triggers inline edit popover
// Use e.stopPropagation() on interactive cells (team picker, status picker)

// ❌ Tree rows that are always expanded with no collapse option
// The whole point is progressive disclosure — let users collapse branches
```
