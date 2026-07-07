# External Research Notes

These notes summarize outside tools that can inspire or support the skill. They are adapters and references, not mandatory dependencies.

## Taste Skill

Taste Skill describes itself as an anti-slop frontend framework for AI agents. Useful lessons for Downstroke:

- ask for or infer a real design direction;
- avoid generic AI frontends;
- use preflight checks;
- support agent tools like Codex, Claude Code, Cursor, Gemini CLI, v0, and Lovable;
- separate style variants such as soft, redesign, image-to-code, and stricter Codex/GPT behavior.

Downstroke should use the idea, not depend on Taste Skill as a runtime requirement.

Reference: https://www.tasteskill.dev/

## Framer

Framer AI emphasizes canvas-based editing, responsive design, AI agents for layout/style/CMS/code, and visual control. Useful lessons:

- design must be refined visually, not only generated once;
- responsive breakpoints are part of design;
- motion and page composition are first-class;
- context selection helps focused edits.

Reference: https://www.framer.com/ai/

## v0

v0 is useful for quick UI drafts, templates, dashboards, components, design mode, design systems, and GitHub-connected iteration. Downstroke can produce prompts for v0 but should still require project-specific QA and component cleanup.

Reference: https://v0.app/

## Lovable

Lovable is useful for full-stack prototypes from prompts, screenshots, sketches, or Figma-like visual input. Downstroke can use it as inspiration for prompt structure and fast prototyping, while keeping production ownership inside the repo.

Reference: https://docs.lovable.dev/introduction/welcome

## Figma Dev Mode

Figma Dev Mode supports inspecting design files, comparing changes, marking work ready for development, linking Storybook/GitHub/Jira, and connecting design components to code components. Downstroke should recognize Figma as the design source of truth when present.

Reference: https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode

## Figma MCP, Code Connect And AI

Figma MCP gives AI agents structured design context from Figma files, including components, variables and layout data. Figma also documents write capabilities for creating/updating designs with native Figma primitives, with access depending on plan/seat and beta status. Code Connect maps Figma components to production code components, improving agent consistency.

Downstroke should prefer structured MCP/Dev Mode context over screenshots when available, but must not make paid/beta Figma capabilities mandatory.

References:

- https://www.figma.com/blog/introducing-figma-mcp-server/
- https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server
- https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect

## Claude Artifacts, Claude Code And Claude Skills

Claude Artifacts are useful for self-contained, interactive prototypes, apps, tools and shareable design explorations. Claude Code and custom Skills are useful for repo implementation and reusable workflows. Downstroke should support Claude by keeping `SKILL.md` portable and by exporting Claude-friendly prompts, but production code should still land in the repo and pass normal QA.

References:

- https://support.claude.com/en/articles/9547008-publish-and-share-artifacts
- https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
- https://claude.com/docs/skills/how-to

## Storybook

Storybook supports component stories, docs/autodocs, interaction tests, accessibility tests, visual tests, and design system documentation. Downstroke should recommend it whenever reusable component states matter.

References:

- https://storybook.js.org/docs/writing-docs
- https://storybook.js.org/docs/9/writing-tests/interaction-testing

## Atomic Design

Atomic Design gives a useful mental model for design systems: tokens/atoms/molecules/organisms/templates/pages. Downstroke should use it pragmatically, without turning every project into folder ceremony.

Reference: https://atomicdesign.bradfrost.com/

## Fonts

Google Fonts is the safe default for free/open-source web typography. If the user requests paid/proprietary fonts, Downstroke must ask who owns the license and whether web/app embedding is allowed.

Reference: https://fonts.google.com/

## Icons

| Library | Use | License/cost note |
| --- | --- | --- |
| Lucide | Clean default React icons | Open license; tree-shakable React package. |
| React Icons | Many icon families through one package | Package MIT; individual icon sets can have their own licenses. |
| Hugeicons Free | Premium rounded-stroke look | Free pack available via `@hugeicons/react` + `@hugeicons/core-free-icons`. |
| Hugeicons Pro | Large premium set | Paid; require explicit approval. |

References:

- https://lucide.dev/guide/react
- https://lucide.dev/license
- https://www.npmjs.com/package/react-icons
- https://hugeicons.com/docs/integrations/react/overview
- https://hugeicons.com/pricing
