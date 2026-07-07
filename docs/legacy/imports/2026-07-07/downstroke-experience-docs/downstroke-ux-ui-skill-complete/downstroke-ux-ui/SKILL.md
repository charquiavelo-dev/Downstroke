---
name: downstroke-ux-ui
description: "Downstroke UX/UI direction skill for designing, redesigning, or implementing modern, polished, reusable frontend interfaces. Use when Codex needs to create or improve a site, app screen, page, component library, Storybook story, design system, visual direction, motion system, icon/font choice, UI audit, or UX/UI quality gate. The skill asks targeted design questions first, researches references when useful, then implements with component documentation, Atomic Design discipline, Storybook recommendation, visual QA, accessibility, and anti-generic taste rules."
---

# Downstroke UX/UI

Use this skill to turn vague UI requests into a real design direction and production-minded implementation. The goal is not "pretty by default"; the goal is intentional UX/UI that can be cool, chiva, playful, premium, brutal, calm, serious, editorial, dense, minimal, dashboard-like, game-like, or brand-specific depending on the product.

## Core Rule

Ask design-shaping questions before creating the UI unless the user already provided a clear design brief. If the user wants speed, ask the smallest useful set and proceed with documented assumptions.

Read references only as needed:

- `references/discovery-questions.md`: question bank and defaults.
- `references/design-directions.md`: style recipes and anti-generic rules.
- `references/component-system-storybook.md`: Atomic Design, component docs, Storybook guidance.
- `references/visual-qa-doctor.md`: screenshots, a11y, Lighthouse, doctor checks.
- `references/external-research-notes.md`: Taste Skill, Framer, v0, Lovable, Figma, fonts, icons.
- `references/figma-claude-adapters.md`: Figma AI/MCP/Dev Mode and Claude Artifacts/Claude Code compatibility.

## Workflow

1. Clarify scope.
   - Whole product/site, one page, one flow, one component, or Storybook/component system.
   - New UI, redesign, polish pass, or design-system extraction.

2. Ask the design profile questions.
   - Mood: serious, fun, premium, playful, brutal, soft, editorial, futuristic, operational, game-like.
   - Geometry: rounded, squared, mixed, pill buttons with sharp panels, sharp buttons with soft cards, etc.
   - Density: airy, balanced, dense operational, mobile-first compact.
   - Typography: Google Fonts/open-source first, or paid/premium fonts only with explicit license note.
   - Icons: Lucide default, React Icons when a specific family is needed, Hugeicons free/pro only after license/cost decision.
   - Styling strategy: existing CSS stack, plain CSS, CSS Modules, SCSS/Sass, Less, Tailwind, NativeWind, Bootstrap, Material UI/MUI, shadcn/Radix, or open research.
   - Motion: none, subtle, expressive, playful, cinematic, or reduced-motion safe.
   - Theme: light, dark, dual-mode, OLED, brand color, neutral, high contrast.
   - Design source: no design source, Figma file, Figma MCP, screenshot, Claude Artifact, Framer, v0, Lovable, or existing code.

3. Research references when style matters.
   - If the user names a style, product, brand, or vibe, search current visual examples before implementing.
   - Use references to infer layout, rhythm, spacing, typography, motion, and affordances; do not clone protected brand assets.
   - Summarize the design direction in 3-7 bullets before implementation for substantial work.

4. Use design adapters when available.
   - If Figma is present, treat it as design source of truth: read components, variables, layout, annotations, Dev Mode links, Code Connect references, and Storybook links when available.
   - If Figma MCP is available, prefer structured design context over screenshots.
   - If Claude Artifacts are requested, use them for fast interactive prototypes or shareable UI experiments, then port production code back into the repo with normal QA.
   - If Claude Code/custom skills are used, keep this skill portable as `SKILL.md` and avoid Claude-only assumptions unless the user explicitly targets Claude.

5. Build with reusable components.
   - Prefer design tokens and semantic CSS variables.
   - Prefer the project's existing styling system when it is coherent.
   - Recommend a known styling/UI framework when it reduces real effort, but do not require one.
   - Keep technical framework choices out of the visible UI unless the user explicitly asks for docs, demos, or technical labels.
   - Prefer Atomic Design naming when the project has a component library or repeated UI.
   - Document every reusable component: purpose, props/variants, states, accessibility notes, examples, and behavior.
   - Recommend Storybook whenever there are reusable UI components, variants, states, visual QA needs, team collaboration, or a design system.

6. Avoid generic AI UI.
   - Do not default to centered hero + three icon cards + purple gradient + vague SaaS copy.
   - Do not use decorative blobs, random glassmorphism, empty feature grids, or icons without a product reason.
   - Make the first viewport useful for the actual product or workflow.
   - Give every screen a clear information hierarchy, primary action, secondary action, and state model.

7. Verify.
   - Run typecheck/build/lint when available.
   - For UI implementation, run or recommend Playwright screenshots for desktop and mobile.
   - Add or update Storybook stories for normal, loading, empty, error, disabled, hover/focus, and edge states when feasible.
   - Use axe/Lighthouse checks when the stack supports them.

## Output Expectations

For a UI implementation, deliver:

- Brief design direction.
- Files changed.
- Component/state documentation created or updated.
- Verification performed.
- Known tradeoffs or skipped QA if tooling is missing.

For a design-only answer, deliver:

- Suggested style direction.
- Token guidance: color, type, spacing, radius, elevation, motion.
- Component/page rules.
- Questions still worth answering before build.
