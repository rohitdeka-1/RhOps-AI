# Reorder

Drag-and-drop to change item position. Persisted via a `sort_order` integer
column. Optimistic — the UI reorders immediately, syncs to DB in background.

---

## Drag handle

**Components**: `GripVertical` icon, visible on row hover

```
┌─────────────────────────────────────────────┐
│  ⠿  Grow customer acquisition    68%       │  ← drag handle on hover
│     Reduce churn                  22%       │
│  ⠿  Hire 3 senior engineers      60%       │  ← hovering this row
└─────────────────────────────────────────────┘
```

The drag handle appears on hover via `opacity-0 group-hover:opacity-100`.
It's the leftmost element in the row, before the indent/chevron.

---

## HTML5 Drag and Drop

The simplest approach for reordering within a single list or sibling group.

```typescript
function DraggableRow({ item, onDrop }: Props) {
  return (
    <tr
      draggable
      className="group"
      onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        onDrop(draggedId, item.id);
      }}
    >
      <td className="opacity-0 group-hover:opacity-100">
        <GripVertical className="size-4 text-muted-foreground" />
      </td>
      <td>{item.name}</td>
    </tr>
  );
}
```

---

## Reorder mutation

Batch-update `sort_order` for all siblings after a drag.

```typescript
useReorderGoals: () => {
  const mutation = useMutation({
    mutationFn: async (input: { orderedIds: string[] }) => {
      for (let i = 0; i < input.orderedIds.length; i++) {
        await supabase
          .from('goals')
          .update({ sort_order: i })
          .eq('id', input.orderedIds[i])
          .eq('user_id', user.id);
      }
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] });
      const previous = queryClient.getQueryData(['goals']);
      // Optimistic: reorder in cache
      queryClient.setQueryData(['goals'], (old) =>
        reorderByIds(old, input.orderedIds)
      );
      return { previous };
    },
    onError: (_err, _input, context) => {
      queryClient.setQueryData(['goals'], context?.previous);
      toast.error('Failed to reorder');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
  return { mutate: mutation.mutate, isPending: mutation.isPending };
},
```

---

## Constraints

- Reorder only within the same parent level (siblings). Don't allow dragging
  a key result to become a company objective.
- The `sort_order` column is an integer. After reorder, siblings get values
  0, 1, 2, ... in their new order.

---

## Seed data requirement

Every sortable entity needs a `sort_order: number` field in the seed array.

```typescript
export const goals: Goal[] = [
  { id: '1', title: 'Grow acquisition', sort_order: 0, parent_id: 'co-1' },
  { id: '2', title: 'Reduce churn', sort_order: 1, parent_id: 'co-1' },
  { id: '3', title: 'Hire engineers', sort_order: 2, parent_id: 'co-2' },
];
```

---

## Anti-patterns

```typescript
// ❌ Drag UI exists but sort_order is never persisted
onDrop: (from, to) => {
  setItems(reorder(items, from, to)); // local state only — lost on refresh
}

// ❌ Reorder sends one update per item sequentially (slow)
// Better: batch in a single RPC or accept the sequential calls with optimistic UI

// ❌ No optimistic update — UI waits for all DB writes to complete before reordering

// ❌ Drag across different parent levels
// e.g. dragging a key result to become a sibling of a company objective
```
