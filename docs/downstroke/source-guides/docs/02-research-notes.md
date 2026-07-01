# Research Notes: How Downstroke Should Be Built

Este documento resume investigacion sobre frameworks, monorepos, paquetes, CLI, versionado, plugins y seguridad de supply chain. El objetivo es traducir buenas practicas actuales a la filosofia de Downstroke.

## Findings

### Monorepo And Modules

Los frameworks modulares suelen nacer como monorepos porque necesitan mantener multiples modulos coordinados. npm workspaces define el soporte para administrar multiples paquetes desde un root unico, y pnpm tiene soporte nativo para monorepos y catalogs para centralizar versiones de dependencias.

Decision para Downstroke:

```txt
Use pnpm workspaces for local development.
Keep modules independently installable.
```

Sources:

- [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/)
- [pnpm workspaces](https://pnpm.io/workspaces)
- [pnpm catalogs](https://pnpm.io/catalogs)

### Package API Boundaries

Node package docs define packages through `package.json`, and modern packages should expose APIs intentionally through `exports`.

Decision para Downstroke:

```txt
Every package must define explicit exports.
No deep imports into package internals.
```

Sources:

- [Node packages documentation](https://nodejs.org/api/packages.html)
- [npm package.json docs](https://docs.npmjs.com/files/package.json/)

### TypeScript Project Boundaries

TypeScript project references split TypeScript programs into smaller pieces, improve build times and enforce logical separation.

Decision para Downstroke:

```txt
Use TypeScript project references once package count grows.
```

Source:

- [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html)

### Build Orchestration

Turborepo focuses on task caching and scheduling. Nx focuses on monorepo build systems, generators and plugins. Downstroke does not need to become either. It can start with pnpm scripts and add Turbo or Nx only when package count or CI time justifies it.

Decision para Downstroke:

```txt
Start simple with pnpm scripts.
Add Turborepo if repeated package tasks become slow.
Avoid Nx until generators/executors become a core product need.
```

Sources:

- [Turborepo docs](https://turborepo.dev/docs)
- [Turborepo task configuration](https://turborepo.dev/docs/reference/configuration)
- [Nx intro](https://nx.dev/docs/getting-started/intro)
- [Nx plugins](https://nx.dev/docs/concepts/nx-plugins)

### CLI Architecture

oclif is a mature CLI framework with commands, flags and plugins. For a small MVP, a lighter CLI using `commander` or `cac` is enough. If Downstroke later needs third-party plugins, oclif becomes attractive.

Decision para Downstroke:

```txt
MVP: lightweight TypeScript CLI.
Later: evaluate oclif if external plugin ecosystem becomes real.
```

Source:

- [oclif introduction](https://oclif.github.io/docs/introduction/)
- [oclif plugins](https://oclif.github.io/docs/plugins/)

### Versioning And Releases

SemVer requires a declared versioned surface and says released package contents must not be modified. Changesets is designed for multi-package repositories and automates versions and changelogs.

Decision para Downstroke:

```txt
Use SemVer from day one.
Use Changesets before the first versioned release.
Treat docs/templates as versioned product surface.
```

Sources:

- [Semantic Versioning](https://semver.org/)
- [Changesets](https://github.com/changesets/changesets)

### Plugin Inspiration

Vite and ESLint show two useful patterns:

- plugins should be explicit extension points;
- shared configs are reusable packages that encode expertise.

Downstroke modules are closer to ESLint shareable configs plus generators than to runtime plugins.

Decision para Downstroke:

```txt
Downstroke module = content pack + installer behavior + doctor checks + optional commands.
```

Sources:

- [Vite Plugin API](https://vite.dev/guide/api-plugin)
- [ESLint shareable configs](https://eslint.org/docs/latest/extend/shareable-configs)
- [ESLint custom rules](https://eslint.org/docs/latest/extend/custom-rules)

### Supply Chain

Package release safety should avoid long-lived registry tokens where possible and keep build provenance verifiable when the release channel supports it.

Decision para Downstroke:

```txt
Use secure package release flows when releasing packages.
Avoid install scripts unless absolutely necessary.
```

## Main Research Conclusion

Downstroke should not begin as a huge framework. It should begin as:

1. independently installable modules;
2. content packs;
3. safe file installer;
4. doctor checks;
5. versioned docs;
6. presets;
7. release discipline.

Only after that should it grow into plugins, migrations, adapters and advanced generators.
