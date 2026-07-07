# Discovery Questions

Use these questions to shape a UI before generating code. Do not ask all questions every time. Pick the smallest set that will change the result.

## Scope

| Question | Why it matters | Default if skipped |
| --- | --- | --- |
| Is this for the whole product/site, one page, one flow, or one component? | Prevents overdesign or underdesign. | Current requested surface only. |
| Is this a new design, redesign, polish pass, or component-system extraction? | Changes how much existing UI to preserve. | New design if no existing UI is provided. |
| Should the design be global, per page, or per component? | Allows different styles by product area. | Global style with local page exceptions. |
| Should components be documented in Storybook? | Makes variants and states reusable. | Recommend Storybook when components repeat. |
| What stack is this: Next, Vite, React Native, Blazor, plain HTML, other? | Controls libraries, routing, styling, and QA. | Detect from repo. |
| Is there a design source? | Determines whether to follow Figma/Artifact/screenshots or create direction from scratch. | Existing code and user answers. |
| What styling strategy should be used? | Determines implementation approach without leaking technical details into the UI. | Detect existing stack; otherwise recommend a known option. |

## Mood And Brand

Ask:

- Should this feel serious, fun, premium, playful, dark, calm, corporate, editorial, futuristic, brutal, soft, game-like, or operational?
- Should the UI feel more like a product dashboard, marketing site, mobile app, creator tool, game menu, admin panel, or e-commerce flow?
- Are there brands/sites/apps you like or hate for this?
- Should I search current examples online before deciding the direction?
- Is there a Figma file, Claude Artifact, Framer page, v0 draft, Lovable project, or screenshot I should treat as source/inspiration?

Defaults:

- Business tools: serious, clear, restrained, dense enough to scan.
- Consumer apps: warmer, more memorable, stronger empty states, more personality.
- Dashboards: compact, high signal, low decoration.
- Games/creative tools: expressive, animated, more visual identity.

## Geometry

Ask:

- Border radius: sharp, slightly rounded, rounded, pill, or mixed?
- Should buttons and inputs use the same radius as panels?
- Do you want a mix like pill buttons with square cards, or sharp buttons with soft panels?
- Should cards feel flat, bordered, elevated, glassy, solid, or material-like?

Useful presets:

| Preset | Radius | Use |
| --- | --- | --- |
| Sharp Editorial | 0-4px | Serious, print-like, brutal, technical. |
| Modern Balanced | 6-10px | Most SaaS/apps. |
| Soft Premium | 12-18px | Wellness, luxury, creator tools. |
| Pill Controls | 999px controls + 6-10px panels | Friendly apps with clear actions. |
| Mixed Utility | 4-6px panels + pill chips/buttons | Operational tools with approachable actions. |

## Color And Theme

Ask:

- Light, dark, dual-mode, OLED dark, high contrast, or brand-specific?
- Should the palette be neutral with one accent, expressive with multiple accents, or monochrome?
- Any colors to avoid?
- Should status colors be conventional or brand-adapted?

Defaults:

- Dual-mode for reusable design systems.
- Neutral surfaces + one primary accent.
- Avoid purple gradient SaaS look unless explicitly requested.
- Use semantic tokens, not raw colors scattered across components.

## Typography

Ask:

- Should fonts be free/open-source only, or can paid fonts be considered?
- Do you want Google Fonts suggestions?
- Should the font feel geometric, humanist, editorial, technical, playful, condensed, or monospace-heavy?
- Do headings and body need separate families?

Defaults:

- Use Google Fonts/open-source first.
- Do not use paid/proprietary fonts unless the user approves license cost.
- For premium SaaS: `Inter`, `Geist`, `Manrope`, `Satoshi-like alternatives`, `Plus Jakarta Sans`.
- For editorial: `DM Serif Display` + `Inter`/`Source Sans 3`.
- For technical: `IBM Plex Sans` + `IBM Plex Mono`, `Geist` + `Geist Mono`.
- For playful: `Nunito Sans`, `Fredoka`, `Space Grotesk` with restraint.

## Icons

Ask:

- Lucide, React Icons, Hugeicons, Heroicons, Tabler, Phosphor, or existing icon system?
- Line icons, filled icons, duotone, rounded stroke, sharp stroke, or playful?
- Should icons be decorative, navigational, status-based, or product metaphors?

Defaults:

- Lucide for clean React UI.
- React Icons when a specific icon family is requested.
- Hugeicons free pack when the user wants a more premium rounded-stroke look.
- Hugeicons Pro only after explicit approval because it is paid.

## Styling Strategy

Ask:

- Should I use the existing styling system or recommend one?
- Preferred approach: plain CSS, CSS Modules, SCSS/Sass, Less, Tailwind, NativeWind, Bootstrap, Material UI/MUI, shadcn/Radix, Chakra, Mantine, or another library?
- Is the choice open so the active LLM can research what fits this project?
- Is this web, React Native/NativeWind, Blazor, or another frontend target?
- Should the UI be custom-built over primitives or use a component library?

Defaults:

- Reuse the existing styling system if it is already coherent.
- Recommend Tailwind/shadcn/Radix for modern React apps when component ownership and custom visuals matter.
- Recommend NativeWind for React Native projects that want Tailwind-like consistency.
- Recommend Material UI/MUI when enterprise density, ready-made complex components, accessibility and speed matter more than unique brand expression.
- Recommend Bootstrap only when the project already uses it, needs classic fast layout, or team familiarity matters.
- Plain CSS/CSS Modules/SCSS remain valid when the project is small, brand-specific, framework-light, or avoiding dependencies.
- Keep the final user-facing UI free from technical labels like "built with Tailwind" unless explicitly requested.

Open decision:

```txt
styling_strategy: open-research
candidate_options: Tailwind, CSS Modules, SCSS, MUI, Bootstrap, existing system
decision_owner: active LLM + user confirmation for dependency changes
visible_in_ui: false
```

## Motion

Ask:

- No motion, subtle motion, expressive motion, playful motion, or cinematic motion?
- Should motion be product feedback, delight, onboarding, page transitions, or micro-interactions?
- Should reduced-motion support be mandatory?

Defaults:

- Subtle motion for serious tools.
- Stronger motion only for brand/marketing/game/creative surfaces.
- Always respect reduced-motion.

## State Model

Ask:

- What are the loading, empty, error, offline, disabled, success, and destructive states?
- Are there permissions/roles?
- What does the user do first, second, and when blocked?

Default:

- Every user-facing surface needs normal, loading, empty, error, disabled, and success states unless truly static.

## Figma And Claude

Ask:

- Is Figma the source of truth or only inspiration?
- Is Figma MCP/Dev Mode/Code Connect available?
- Should the agent write back to Figma or only read from it?
- Do you want a Claude Artifact prototype before production implementation?
- Should this be exported as a Claude-compatible skill or prompt?

Defaults:

- Read Figma as source of truth when provided.
- Prefer structured MCP/Dev Mode data over screenshots.
- Use Claude Artifacts for exploration only unless the user explicitly wants a shareable artifact.
- Port approved ideas back into repo components and Storybook.
