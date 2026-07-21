# Landing Page Layout

## Breakpoints

| | Breakpoint | Tailwind |
|---|-----------|----------|
| Mobile | < 1024px | default |
| Desktop | >= 1024px | `lg:` |

## Page container

| | Desktop | Mobile | Tailwind |
|---|---------|--------|----------|
| Max width | 1440px | fluid | `max-w-page` |
| Page margin | 32px | 24px | `px-6 lg:px-8` |

```tsx
<div className="mx-auto max-w-page px-6 lg:px-8">
```

## Sections

| | Value | Tailwind |
|---|-------|----------|
| Vertical padding | 40px | `py-10` |

## Grid

| | Desktop | Mobile | Tailwind |
|---|---------|--------|----------|
| Columns | 12 | 1 | `grid-cols-1 lg:grid-cols-12` |
| Gutter | 32px | 32px | `gap-8` |
