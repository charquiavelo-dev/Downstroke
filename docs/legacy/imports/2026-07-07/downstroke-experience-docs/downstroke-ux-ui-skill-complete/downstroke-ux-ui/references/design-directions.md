# Design Directions

Use these recipes as starting points, not templates to clone. Adjust to domain, audience, and existing design system.

## Anti-Generic Rules

- Avoid the common AI layout: centered gradient hero, three cards, floating blobs, vague icons, and generic copy.
- Avoid decorative complexity that does not explain the product.
- Do not make the whole page a stack of floating cards.
- Use imagery only when it shows the real subject: product, place, food, portfolio object, person, gameplay, dashboard state, or workflow.
- Prefer one strong layout idea per page over many weak decorations.
- First viewport must show the actual app, offer, product, workflow, or primary action.
- Use real states and affordances: selected, pressed, disabled, loading, empty, error, success, focus, hover.
- Do not display technical implementation notes, framework names, guide copy, demo labels, or "how this was built" text in the UI unless the user deliberately requested that content.

## Style Recipes

| Direction | Best for | Visual rules |
| --- | --- | --- |
| Serious Operational | Admins, trading, logistics, internal tools | Dense but readable, compact tables, strong hierarchy, restrained color, clear statuses. |
| Modern Premium | SaaS, AI tools, client portals | Neutral surfaces, crisp typography, careful whitespace, subtle depth, refined icons. |
| Fun Chiva | consumer apps, food, local brands, games | More color, playful copy, friendly controls, memorable empty states, expressive icons. |
| Editorial Minimal | portfolios, studios, reports | Strong type scale, sharp alignment, whitespace, fewer cards, restrained palette. |
| Dark OLED Technical | developer tools, cyber/security, music/creative | Near-black canvas, high contrast text, thin borders, glowing only for real active states. |
| Brutalist Clean | experimental brands, creative tools | Sharp geometry, visible grids, bold typography, minimal decoration, strong contrast. |
| Soft Calm | wellness, finance for consumers, coaching | Soft radius, warm neutrals, gentle motion, low aggression, readable content. |
| Game Menu Energy | games, gamified apps, community | Layered panels, chunky controls, progression cues, lively micro-interactions. |

## Layout Heuristics

- Use asymmetry when the page needs personality.
- Use grids when users compare many things.
- Use split panes when the workflow has source -> preview, input -> result, list -> detail.
- Use sidebars only when navigation depth justifies them.
- Use tabs for peer views, not for hiding unrelated pages.
- Use cards for repeated items, not as default wrappers for every section.
- Use accordions only when content is optional and secondary.
- Use drawers for contextual editing, not primary flows that deserve a page.
- Use modals sparingly for confirmation, focused creation, or destructive flows.

## Geometry Matrix

| Choice | Feels like | Risk |
| --- | --- | --- |
| All sharp | Technical, editorial, serious | Can feel cold or harsh. |
| All rounded | Friendly, modern, approachable | Can feel childish if overdone. |
| Pill buttons + square cards | Friendly actions, structured content | Needs consistent spacing. |
| Square buttons + rounded panels | Strong actions, softer reading areas | Can feel inconsistent if not intentional. |
| Mixed chips | Good filters/tags/status | Avoid chip soup. |

## Color Rules

- Define tokens: background, surface, surface-raised, border, text, muted, primary, accent, danger, warning, success.
- Use status color for status, not decoration.
- Pair color with text, icons, or shape for accessibility.
- Do not rely on one hue for the whole app unless the brand demands it.
- Keep gradients rare and purposeful.
- For dark mode, avoid pure black text-on-white inversions; tune surfaces and borders separately.

## Typography Rules

- Pick type for product personality, not because it is trendy.
- Use one family unless contrast matters.
- Use two families only when headings need brand personality or mono needs technical clarity.
- Do not use more than 2-3 weights in product UI.
- Body copy must stay readable before the heading gets stylish.
- Avoid oversized hero text unless the first viewport is truly marketing.
- Document type scale in tokens.

## Styling Framework Rules

- Styling frameworks are implementation choices, not visible product content.
- Use the existing CSS/UI stack if it is coherent.
- Recommend Tailwind, NativeWind, Bootstrap, Material UI/MUI, shadcn/Radix, CSS Modules, SCSS/Sass, Less or plain CSS based on project context.
- Keep the question open when the best option depends on stack, team, deadlines or brand direction.
- Do not install a UI framework just because it is popular.
- Do not force custom CSS when a known component library solves real accessibility or delivery risk.
- Never put framework names, implementation guides or demo explanations in the final UI unless the user asked for technical documentation.

## Motion Rules

- Motion must explain state, guide attention, or add brand delight.
- Use duration bands: 100-160ms for controls, 180-280ms for panels, 300-600ms for expressive transitions.
- Avoid animating layout in data-dense tools unless it improves comprehension.
- Use `prefers-reduced-motion`.
- Do not hide slow data behind long animations.

## Taste Skill Inspiration

Taste Skill's useful pattern is not a dependency; it is a discipline:

- infer design direction from the brief;
- avoid templated AI outputs;
- run an audit before redesigning existing UI;
- define typography, spacing, color, and motion as a system;
- run a hard preflight before shipping.

Downstroke should internalize those behaviors while keeping implementation native to the project.

## Framer Inspiration

Framer's useful pattern is the canvas mindset:

- page sections should feel intentionally composed;
- responsive behavior is part of design, not a cleanup task;
- selected layer/context should guide edits;
- motion and CMS/content structure should remain visible in the design process.

Downstroke should translate this into code reviewable layouts, component docs, and screenshots.
