# Project Start Guides

## Universal First Hour

1. Create git and commit the initial baseline.
2. Fill the canonical `docs/SPEC.md`.
3. Initialize native Downstroke workflow, communication, simplicity and code-intelligence state.
4. Choose Downstroke review cadence: one-by-one, blocks of `X`, by sprint or final draft review.
5. Decide the smallest shippable slice.
6. Write the Downstroke brief/quick spec only as deep as the slice needs.
7. Build one verified path before adding secondary screens.

## Stack Support Model

Downstroke is optimized first for React, TypeScript, Node.js, React Native, Expo, backend services and .NET/Blazor. These stacks get stronger defaults and more specific guidance.

Other languages and frameworks are still valid Downstroke projects. Use the universal workflow, the project's real build/test/lint commands and repository-local evidence. Do not force an unsupported stack into a React, Node or .NET shape just to match these guides. Promote a new ecosystem only after repeated real projects prove the same rules, checks and scaffolding are useful.

## React / Next.js Start

Use this default when building a web app, dashboard, SaaS tool or public site.

Recommended baseline:

- TypeScript strict.
- Tailwind.
- Zod at API/form boundaries.
- TanStack Query for server state when client fetching exists.
- Server actions or route handlers only when they fit the app shape.
- PostgreSQL for real operational data.

Start with:

```txt
app/ or src/
  routes/pages
  components/
  lib/
  server/ or api/
  db/ or prisma/
docs/
```

Advice:

- Build the real first screen, not a marketing shell, unless the task is a landing page.
- Do not expose unfinished routes in navigation.
- Use icons from the chosen library, not emoji.
- Forms need validation, pending, success and error states.
- Keep server data out of random `useEffect` fetches when a server-state tool exists.

## React Native / Expo Start

Use this default for mobile apps.

Recommended baseline:

- Expo unless native requirements prove otherwise.
- TypeScript strict.
- Expo Router when file-based routing helps.
- NativeWind if the project wants Tailwind-style styling.
- TanStack Query for remote data.
- SecureStore/AsyncStorage only for the right data class.
- EAS profiles documented early.

Advice:

- Test small screens and long Spanish text early.
- Treat permissions as product states: denied, limited, granted and unavailable.
- Never hardcode private secrets in client env.
- Keep deep links, auth callback URLs and API base URLs documented.
- Use device features through Expo/native APIs, not custom wrappers until needed.

## Backend Start

Use this for Node backends paired with web or mobile.

Recommended baseline:

- NestJS for new production APIs.
- Express only for small services or existing code.
- PostgreSQL.
- Prisma or direct SQL, but keep migrations reviewed.
- Zod or framework validation at request boundaries.

Advice:

- `GET` stays read-only.
- Mutations validate auth, permission and ownership on the server.
- Use database constraints for invariants.
- Add logs that help incidents without leaking secrets.
- Make retry-prone mutations idempotent.

## Blazor / .NET Start

Use `docs/dotnet-bridge.md` first.

Recommended baseline:

- Current LTS .NET.
- ASP.NET Core.
- Blazor only when C# UI is an advantage.
- PostgreSQL + EF Core.
- xUnit/NUnit checks.

Advice:

- Start with one project if the app is small; split only when boundaries are real.
- Keep domain rules outside Razor components.
- Use server authorization, not UI hiding, as the real security boundary.
- Review EF migrations before applying.

## Native Capability Roadmap

Deliver native capabilities in this order:

1. Git.
2. Downstroke code intelligence.
3. Downstroke native workflows with the selected communication language.
4. Downstroke communication policy.
5. Downstroke simplicity gates.

Until each capability ships, development tools may assist migration but must not become generated-project or runtime dependencies.

## Framework Direction

This baseline is the source material for Downstroke. Framework modules should emerge only from repeated real projects:

- Shared docs and gates first.
- Repeated scripts second.
- Shared packages only after duplication hurts.
- Generator/CLI last.

Do not build framework machinery before two or three projects prove the same need.
