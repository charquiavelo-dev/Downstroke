# Component System, Atomic Design, And Storybook

This reference is used when the project has reusable UI, a design system, Storybook, or repeated page patterns.

## Recommendation Rule

Always recommend Storybook when any of these are true:

- More than one reusable component is being created.
- The project has shared UI across pages/apps.
- The user asks for a design system, component library, dashboard kit, or reusable template.
- Components have variants, states, roles, themes, or responsive behavior.
- There is a team/client handoff.
- Visual QA or regression testing matters.
- Figma components need to be mapped to code components.

Do not force Storybook for a tiny one-off static page. Instead, say it is optional and explain when it becomes worth it.

## Atomic Design Mapping

Use Atomic Design as a naming and documentation discipline, not as folder bureaucracy.

| Level | Downstroke meaning | Examples |
| --- | --- | --- |
| Tokens | Raw design decisions | color, spacing, radius, typography, motion. |
| Atoms | Single-purpose primitives | Button, Input, Badge, IconButton, Avatar. |
| Molecules | Small compositions | SearchField, StatCard, PriceInput, UserMenu. |
| Organisms | Large reusable sections | Header, Sidebar, DataTable, ProductGrid, CheckoutPanel. |
| Templates | Layout skeletons | DashboardShell, MarketingLayout, AuthLayout. |
| Pages | Real route/page with data | DashboardPage, PricingPage, ProfilePage. |

## Component Documentation Contract

Every reusable component should document:

- Purpose: what problem it solves.
- Ownership: shared/ui, feature component, or app-specific.
- Props/variants: size, tone, density, state, icon placement, layout.
- States: default, hover, focus, active, disabled, loading, error, empty, success.
- Accessibility: labels, roles, keyboard behavior, focus, contrast.
- Behavior: user interaction and side effects.
- Examples: common use and edge case.
- Composition: what children/slots are allowed.
- Do not use: cases where another component is better.

## Storybook Story Contract

Minimum useful stories:

- Default
- All variants
- Loading
- Disabled
- Error
- Empty
- With long text
- Mobile/narrow layout when relevant
- Dark mode when the app supports it
- Interaction story with `play` function when user behavior matters

For data components:

- Empty data
- Few rows/items
- Many rows/items
- Failed fetch
- Slow/loading
- Permission denied

For forms:

- Empty
- Filled
- Validation errors
- Disabled submit
- Submitting
- Success

## Storybook Docs Notes

Use Storybook autodocs as the baseline, then add MDX only when the component needs human explanation beyond props and examples.

Docs should answer:

- What is this?
- When should I use it?
- Which variant should I choose?
- What states must be implemented?
- What accessibility behavior is expected?
- What are examples of misuse?

## Figma Alignment

When Figma is present:

- Link component stories to Figma components when the team uses design links.
- Prefer existing design-system variants over creating new code-only variants.
- Document any implementation difference from the Figma source.
- If Code Connect exists, use it to map design components to repo components.
- If Dev Mode annotations define behavior or a11y notes, copy those expectations into component docs.

Recommended mapping table:

| Figma | Code | Storybook | Notes |
| --- | --- | --- | --- |
| Component name | Component path | Story path | Variant/state gaps |

## Folder Pattern

For React/Next/Vite:

```txt
src/
  shared/
    ui/
      button/
        Button.tsx
        Button.stories.tsx
        Button.test.tsx
        Button.docs.md
      tokens/
        tokens.css
  features/
    billing/
      components/
        PlanCard.tsx
        PlanCard.stories.tsx
```

For design-system packages:

```txt
packages/
  ui/
    src/
      tokens/
      atoms/
      molecules/
      organisms/
      templates/
```

## Implementation Rules

- Prefer composition over giant prop APIs.
- Prefer the existing styling system unless changing it is part of the task.
- Keep styling/framework decisions documented in component docs, not visible product UI.
- Use variants only when they are stable design choices.
- Use semantic tokens instead of hardcoded theme values.
- Keep feature-specific behavior out of shared primitives.
- Keep Storybook examples realistic; placeholder lorem ipsum hides layout bugs.
- Document functionality even when the visual design is obvious.
