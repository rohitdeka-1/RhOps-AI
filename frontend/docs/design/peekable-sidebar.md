# Peekable Sidebar

The peekable sidebar (`workspace-layout-01`) has three states: **expanded**, **peeking**, and **collapsed**. It lives in `components/base/sidebar.tsx` and wraps shadcn's `ui/sidebar.tsx`.

## States

| State | Sidebar visible? | Content pushed? | How to enter | How to leave |
|-------|-----------------|-----------------|--------------|--------------|
| **Expanded** | Yes, pinned | Yes — `SidebarInset` shifts right | Click hamburger, or `actions.expand()` | Click hamburger or collapse trigger |
| **Peeking** | Yes, floating overlay | No — content stays full-width | Hover left edge slowly, or hover `SidebarHoverArea` | Move mouse past sidebar width |
| **Collapsed** | No | No | Default on mobile, or after collapsing | Hover left edge or click hamburger |

## The trigger problem

When the sidebar is collapsed, the **only** way to re-expand it is:

1. **Desktop:** hover the left edge of the screen (opens peek), then click inside the sidebar
2. **Desktop:** hover the `SidebarHoverArea` wrapper around the hamburger icon
3. **Mobile:** tap the mobile hamburger button

If a page removes the hamburger button or doesn't wrap it in `SidebarHoverArea`, the sidebar becomes unreachable on desktop. The left-edge hover still works but is not discoverable — users don't know to slowly approach the left edge.

## Rules

### Always render a hamburger trigger in the page header

Every page inside `workspace-layout-01` **must** render a sidebar trigger in its header. This is the contract:

```tsx
import { IconMenu2 } from "@tabler/icons-react";
import {
  SidebarMenuButton,
  SidebarHoverArea,
  usePeekable,
  useShadcnSidebar,
} from "@/components/base/sidebar";

function Header() {
  const { state, actions } = usePeekable();
  const { setOpenMobile } = useShadcnSidebar();

  return (
    <header className="relative z-20 flex h-11 shrink-0 items-center gap-2 px-4 pointer-events-auto">
      {/* Desktop: show when collapsed, wrapped in SidebarHoverArea */}
      {!state.isExpanded && (
        <SidebarHoverArea className="hidden md:block">
          <SidebarMenuButton size="sm" onClick={() => actions.expand("hamburger")}>
            <IconMenu2 />
          </SidebarMenuButton>
        </SidebarHoverArea>
      )}
      {/* Mobile: always visible, opens sheet */}
      <SidebarMenuButton
        size="sm"
        className="md:hidden"
        onClick={() => setOpenMobile(true)}
      >
        <IconMenu2 />
      </SidebarMenuButton>
      {/* ...rest of header */}
    </header>
  );
}
```

### Why both triggers exist

| Trigger | Platform | Visible when | Does what |
|---------|----------|-------------|-----------|
| `SidebarHoverArea` + hamburger | Desktop | Sidebar collapsed (`!state.isExpanded`) | Hover opens peek, click expands |
| Mobile hamburger | Mobile | Always | Opens mobile sheet drawer |

The desktop trigger **hides itself** when the sidebar is already expanded (no point showing a "show sidebar" button when it's already shown). The mobile trigger is always visible because mobile uses a sheet overlay, not inline expansion.

### SidebarHoverArea is required

The `SidebarHoverArea` wrapper is not optional. It does two things:

1. **Sets `mousePeekX`** — tells the mouse listener where the sidebar trigger is, so peek opens when hovering near it (not just at pixel 0)
2. **Opens peek on hover** — gives instant feedback before the user clicks

Without it, peek only triggers from the raw left screen edge with slow mouse movement — much less discoverable.

### Don'ts

1. **Don't hide the hamburger unconditionally.** `{!state.isExpanded && ...}` is the correct condition — it hides only when expanded. Never use `hidden` or remove it entirely.
2. **Don't put the trigger inside the sidebar itself.** When the sidebar is collapsed, its content is invisible. A collapse/expand button inside the sidebar body only works for collapsing, not expanding.
3. **Don't replace the hamburger with a custom toggle** that doesn't use `SidebarHoverArea`. The hover-to-peek behavior depends on it.
4. **Don't skip the mobile trigger.** Mobile has no hover — the sheet hamburger is the only way in.
5. **Don't render the desktop trigger without the `!state.isExpanded` guard.** Two hamburgers (one in the header, one implied by the sidebar being open) is confusing.

### Collapse trigger inside the sidebar

The sidebar itself should have a way to collapse. This goes in the sidebar header or footer:

```tsx
<SidebarMenuButton size="sm" onClick={() => actions.collapse("sidebar")}>
  <IconLayoutSidebarLeftCollapse />
</SidebarMenuButton>
```

This is the complement to the page header's expand trigger. Together they form the full cycle: **sidebar collapse button → sidebar collapses → page header hamburger appears → click or hover → sidebar expands → sidebar collapse button visible again**.

## Component hierarchy

```
workspace-layout-01.tsx
├── PeekableProvider          ← state machine
│   └── PeekableSidebarProvider ← bridges to shadcn
│       ├── AppSidebar        ← shadcn Sidebar (invisible gap spacer)
│       ├── PeekPane          ← visual sidebar card (always mounted)
│       │   └── PeekPaneBody  ← sidebar content (nav, footer, etc.)
│       ├── SidebarInset      ← main content area
│       │   └── <Outlet />    ← page renders here — MUST have header with trigger
│       └── MouseListener     ← left-edge hover detection
```

## Quick reference

| Import | From | Purpose |
|--------|------|---------|
| `usePeekable()` | `base/sidebar` | Access `state.isExpanded`, `actions.expand/collapse` |
| `useShadcnSidebar()` | `base/sidebar` | Access `setOpenMobile` for mobile sheet |
| `SidebarHoverArea` | `base/sidebar` | Wrap desktop hamburger — enables hover-to-peek |
| `SidebarMenuButton` | `base/sidebar` | Styled button for sidebar triggers |
| `IconMenu2` | `@tabler/icons-react` | Hamburger icon |
