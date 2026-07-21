# CRUD

Create, read, update, delete — the four operations on any entity. Each uses
specific shadcn components and follows the DataProvider mutation pattern.

---

## Create

**Components**: `Dialog` + `Form` (for modal creation) or `Sheet` (for side panel)

```
┌──────────────────────────────────────────┐
│  Create Goal                      [✕]    │
│  ─────────────────────────────────────── │
│                                          │
│  Title                                   │
│  [Enter goal title…                   ]  │
│                                          │
│  Team                                    │
│  [Select team ▾                       ]  │
│                                          │
│  Owner                                   │
│  [Select owner ▾                      ]  │
│                                          │
│                          [Cancel] [Save] │
└──────────────────────────────────────────┘
```

**Mutation hook**:
```typescript
useCreateGoal: () => {
  const mutation = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const { data } = await supabase
        .from('goals')
        .insert({ user_id: user.id, ...input })
        .select()
        .single();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created');
    },
  });
  return { mutate: mutation.mutate, isPending: mutation.isPending };
},
```

**Form validation**: Use zod schemas with shadcn `Form` component. Show errors
inline below each field, keep submit button enabled, disable only during submission.

---

## Read

All data reads go through DataProvider hooks. See `data-provider.md`.

---

## Update — inline edit

**Components**: `Popover` + `Select` or `Input` (for cell-level edits)

```
┌─────────────────────────────────────────┐
│  Name          │ Team        │ Status   │
├─────────────────────────────────────────┤
│  Reduce churn  │ [Operations]│ On track │
│                │      │      │          │
│                │      ▼      │          │
│                │ ┌─────────┐ │          │
│                │ │Marketing│ │          │
│                │ │Operatons│ │  ← click │
│                │ │HR       │ │    cell  │
│                │ └─────────┘ │          │
└─────────────────────────────────────────┘
```

**Pattern**: Click the cell → `Popover` opens with options → select → close popover →
optimistic update in React Query cache → Supabase update in background.

```typescript
function TeamCell({ goalId, currentTeamId }: Props) {
  const data = useDataProvider();
  const { data: teams } = data.useTeams();
  const { mutate } = data.useUpdateGoal();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button>{currentTeamName}</button>
      </PopoverTrigger>
      <PopoverContent>
        {teams.map(team => (
          <button key={team.id} onClick={() => mutate({ id: goalId, teamId: team.id })}>
            {team.name}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
```

**Stop propagation**: If the row click opens a detail sheet, the cell click must
call `e.stopPropagation()` so it opens the popover instead of the sheet.

---

## Update — form edit

**Components**: `Sheet` (side=right) or `Dialog` with form fields

For full entity editing (description, multiple fields, rich text). Same mutation
hook as inline edit, but with more fields.

---

## Delete

**Components**: `AlertDialog` for confirmation

```
┌──────────────────────────────────────────┐
│  Delete goal                             │
│                                          │
│  Are you sure? This will also remove     │
│  all key results under this goal.        │
│                                          │
│                     [Cancel] [Delete]    │
└──────────────────────────────────────────┘
```

**Pattern**: Action triggers `AlertDialog` → user confirms → delete mutation →
optimistic remove from cache → Supabase delete in background.

```typescript
const { mutate: deleteGoal } = data.useDeleteGoal();

<AlertDialog>
  <AlertDialogTrigger asChild>
    <DropdownMenuItem variant="destructive">
      <Trash2 /> Delete
    </DropdownMenuItem>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete goal</AlertDialogTitle>
      <AlertDialogDescription>
        This will also remove all key results under this goal.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => deleteGoal({ id: goalId })}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Delete button placement**: In `DropdownMenu` overflow menu, last item, after a
`DropdownMenuSeparator`, with `variant="destructive"`. Never as a standalone
button on the page.

---

## Optimistic updates

All mutations should update the React Query cache immediately, then sync to
Supabase in the background. Roll back on error.

```typescript
useMutation({
  mutationFn: async (input) => { /* supabase call */ },
  onMutate: async (input) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['goals'] });
    // Snapshot previous value
    const previous = queryClient.getQueryData(['goals']);
    // Optimistic update
    queryClient.setQueryData(['goals'], (old) => /* apply change */);
    return { previous };
  },
  onError: (_err, _input, context) => {
    // Roll back
    queryClient.setQueryData(['goals'], context?.previous);
    toast.error('Failed to save changes');
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['goals'] });
  },
});
```

---

## Anti-patterns

```typescript
// ❌ Delete without confirmation dialog
onClick={() => deleteGoal({ id })} // one click destroys data

// ❌ Mutation with no optimistic update — UI freezes until server responds
mutationFn: async (input) => {
  await supabase.from('goals').update(input); // user waits 500ms+ for visual feedback
}

// ❌ No cache invalidation after mutation — stale data in the list
onSuccess: () => { toast.success('Saved'); } // forgot invalidateQueries

// ❌ Auth simulated with setTimeout instead of real Supabase call
mutate: () => setTimeout(() => navigate('/goals'), 800)
```
