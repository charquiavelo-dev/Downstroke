# Figma And Claude Design Adapters

Use this reference when the user mentions Figma AI, Figma MCP, Figma Dev Mode, Figma Make, Claude Design, Claude Artifacts, Claude Apps, Claude Code, or Claude Skills.

## Adapter Rule

Treat Figma and Claude as friendly adapters, not required dependencies. Downstroke must:

- use them when present;
- ask for permission/capability details when access is unclear;
- preserve source-of-truth ownership;
- avoid paid/beta features unless the user accepts the cost and constraints;
- keep the final implementation portable in the project repo.

## Figma Adapter

Figma can be:

- design source of truth;
- design-system library;
- Dev Mode handoff;
- MCP source for structured design context;
- Code Connect bridge between design components and code components;
- AI canvas where agents can write/update designs;
- prototype source from Figma Make or related AI tools.

### Ask First

- Do you have a Figma file/link, screenshot, or only a style reference?
- Is Figma the source of truth, or just inspiration?
- Is Dev Mode available?
- Is Figma MCP configured in the current agent/editor?
- Is Code Connect configured for production components?
- Are variables/tokens already defined in Figma?
- Should changes write back to Figma, or only read from it?
- Are paid seats/features approved?

### Preferred Flow

1. Read Figma context if available.
2. Identify components, variables, spacing, typography, color styles, variants, and annotations.
3. Map Figma components to code components.
4. If Code Connect exists, prefer connected production components over recreating UI.
5. If Storybook links exist, inspect the stories and match variants/states.
6. Implement using repo conventions.
7. Document any drift between Figma and code.
8. Suggest write-back or design update only when the user wants Figma kept in sync.

### Figma Compatibility Rules

- Prefer structured Figma MCP data over screenshots.
- Use screenshots only when MCP/Dev Mode is not available.
- Do not treat Figma-generated code as production-ready without review.
- Do not overwrite the design system with ad hoc code.
- Do not invent missing tokens; mark them as assumptions.
- If paid seat or beta capability is required, state it before relying on it.
- If Figma is unavailable, continue from screenshots, references, or user answers.

### Doctor Checks

Detect:

- Figma links in docs/issues.
- `figma` MCP references in agent configs.
- Code Connect references.
- Storybook design links.
- token drift between Figma variables and code tokens when data is available.
- components implemented without matching existing design-system component.

Example output:

```txt
INFO  figma.source          Figma link found in UX brief.
OK    figma.mcp             MCP design context available.
WARN  figma.code-connect    No Code Connect mapping found for shared Button.
WARN  figma.tokens.drift    Figma primary radius differs from code token.
```

## Claude Design Adapter

"Claude Design" should be treated as a family of Claude workflows unless the user names a specific product:

- Claude Artifacts for interactive prototypes, demos, visual explorations, and shareable mini apps.
- Claude Apps/Artifacts publishing for demos that users can interact with.
- Claude Code for editing the real project.
- Claude custom Skills for reusable frontend/design workflows.

### Ask First

- Do you want a quick Claude Artifact prototype or production repo changes?
- Should the result stay inside Claude, or be ported into the app?
- Is this for exploration, client preview, Storybook, or production?
- Are Claude Skills available in the user's environment?
- Should Downstroke export a Claude-compatible prompt or `SKILL.md`?

### Preferred Flow For Artifacts

1. Use Artifacts for fast interactive design exploration.
2. Keep the prototype self-contained.
3. Use real product states, not fake decoration.
4. When approved, port the idea into the repo using project components.
5. Run normal Downstroke UX QA after porting.

### Preferred Flow For Claude Code

1. Use `SKILL.md` portable instructions.
2. Keep references one level deep.
3. Avoid Claude-only file names unless the project already has Claude conventions.
4. Generate implementation in repo patterns.
5. Validate with build/typecheck/lint/screenshots.

### Claude Compatibility Rules

- Keep the skill name lowercase and hyphenated.
- Keep `SKILL.md` frontmatter with `name` and `description`.
- Do not rely on Claude Artifacts sandbox behavior for production.
- Do not assume outbound API calls work from Artifacts.
- Do not treat published artifacts as repo deployment.
- Do not duplicate design rules in both `CLAUDE.md` and `SKILL.md`; put reusable workflow in the skill and project conventions in the agent memory file.

## Combined Figma + Claude Flow

When both exist:

1. Figma is the source of design truth.
2. Claude Artifact can prototype interaction ideas.
3. Claude Code implements in the repo.
4. Storybook documents components/states.
5. Playwright/axe/Lighthouse verify.
6. Figma write-back happens only if requested and supported.

```txt
Figma source -> Claude/agent context -> repo components -> Storybook -> visual QA -> optional Figma sync
```

