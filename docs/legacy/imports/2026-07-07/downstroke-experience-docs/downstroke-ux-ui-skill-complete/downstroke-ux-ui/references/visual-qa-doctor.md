# Visual QA And Doctor

Use this reference when implementing UI or defining Downstroke doctor checks.

## Quality Gates

| Gate | Tool | Required when |
| --- | --- | --- |
| Build/typecheck | project scripts | Always when available. |
| Lint/format | Biome or project tool | Always when available. |
| Desktop screenshot | Playwright | User-facing web UI. |
| Mobile screenshot | Playwright | User-facing web UI. |
| Component stories | Storybook | Reusable components. |
| Interaction tests | Storybook/Vitest/Playwright | Interactive components. |
| Accessibility scan | axe/Storybook addon/Lighthouse | Public or important internal UI. |
| Performance scan | Lighthouse | Public pages, marketing, dashboards with heavy data. |
| Visual regression | Playwright snapshot/Chromatic | Component library or critical UI. |

## Doctor Checks

Downstroke UX/UI doctor should detect:

- `storybook` dependency or `.storybook/` folder.
- `playwright.config.*`.
- `@axe-core/*`, `axe-playwright`, Storybook a11y addon, or equivalent.
- `lighthouse` script or CI integration.
- icon libraries: `lucide-react`, `react-icons`, `@hugeicons/react`, `@heroicons/*`, `@phosphor-icons/*`.
- font loading strategy: framework font helper, local fonts, CSS import, remote CSS.
- Figma links, Figma MCP configuration, Code Connect references, and Storybook/Figma links.
- Claude Artifacts/Claude Code/Claude skill references when present in docs or agent files.
- Tailwind/shadcn/Radix/NativeWind/Blazor component libraries.
- CSS/styling systems: plain CSS, CSS Modules, SCSS/Sass, Less, Tailwind, NativeWind, Bootstrap, Material UI/MUI, Chakra, Mantine or existing UI kits.
- design token files: `tokens.css`, `theme.ts`, `tailwind.config.*`, `globals.css`, CSS variables.
- components without stories when Storybook exists.
- components without obvious disabled/loading/error states.
- hardcoded colors/radius/spacing in reusable components.
- repeated UI blocks that should become components.

## Doctor Output

Example:

```txt
Downstroke UX/UI Doctor

OK       ui.tokens.exists          Semantic design tokens found.
OK       icons.lucide              Lucide detected; good default for clean UI.
WARN     storybook.missing         Reusable components found but no Storybook setup.
WARN     states.missing            Button has no loading or disabled examples.
WARN     mobile.screenshot.missing No mobile visual QA evidence.
FAIL     a11y.labels               Icon-only actions need accessible labels.
INFO     font.google               Google Fonts detected; verify selected family license.
INFO     figma.source              Figma link found; treat as design source if current.
INFO     claude.artifact           Claude Artifact reference found; verify production code lives in repo.
INFO     styling.strategy          Styling stack detected; keep technical labels out of user-facing UI.
```

## Scoring Model

Use a clear score only as guidance, never as fake certainty.

| Area | Weight |
| --- | --- |
| UX clarity and task flow | 20 |
| Visual hierarchy and composition | 20 |
| Component reuse and documentation | 15 |
| Responsive behavior | 15 |
| Accessibility | 10 |
| State coverage | 10 |
| Performance and asset discipline | 5 |
| Brand personality/taste | 5 |

Minimum acceptable:

- 80+ for public/client-facing UI.
- 70+ for internal tools.
- No critical a11y failure.
- No broken mobile layout.
- No missing primary state for important flows.

## Screenshot Protocol

For web UI:

- Desktop: 1440x900 or project standard.
- Tablet: 768x1024 when layout changes.
- Mobile: 390x844 or 375x812.
- Capture first viewport and any critical interaction state.
- Inspect for overlap, clipping, unreadable text, hidden controls, broken focus, and blank canvases.

## Accessibility Rules

- Icon-only controls need accessible labels.
- Form inputs need labels and errors tied to fields.
- Color cannot be the only status indicator.
- Focus states must be visible.
- Keyboard path must reach meaningful controls.
- Motion must respect reduced-motion.
- Contrast must hold in light and dark modes.
