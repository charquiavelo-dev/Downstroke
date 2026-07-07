# Story 021: Git Provider Repo Import And Clone Support

## Status

Draft

## Context

Downstroke should support developers who install the framework first and then want to bring in an existing project from GitHub, GitLab, Bitbucket or a raw Git URL. The framework should help clone the repository safely, detect auth problems, avoid nested-repo mistakes, run preflight and initialize Downstroke inside the cloned project.

GitHub officially supports repository cloning with Git, and GitHub CLI exposes `gh repo clone <repository> [<directory>] [-- <gitflags>...]`. GitLab CLI exposes `glab repo clone` with Git flag pass-through. Downstroke should use provider CLIs when available and authenticated, but fall back to plain Git.

## User Story

As a developer starting from an existing hosted Git project,
I want Downstroke to clone/import the repo safely and initialize the framework,
so that I can start AI-assisted project work without manually handling auth, target folders, workspace risk and preflight setup.

## Scope

Implement:

- `@downstroke/git-provider`;
- `downstroke init --from <repo>`;
- `downstroke repo clone <repo>`;
- `downstroke repo doctor`;
- provider aliases for GitHub, GitLab and Bitbucket;
- branch/tag/commit/depth/submodule/LFS options;
- private repo auth guidance;
- workspace import for multiple repos.

## Functional Requirements

1. Accept `owner/repo`, `github:owner/repo`, `gitlab:group/project`, `bitbucket:workspace/repo`, HTTPS and SSH inputs.
2. Detect Git installation.
3. Detect GitHub CLI and GitLab CLI installation/auth status.
4. Prefer provider CLI clone when available and authenticated.
5. Fall back to `git clone`.
6. Support `--into`, `--branch`, `--tag`, `--commit`, `--depth`, `--submodules`, `--lfs`, `--no-install`, `--preset` and `--workspace`.
7. Refuse unsafe non-empty destinations.
8. Warn when cloning inside a parent Git repo unless workspace mode is explicit.
9. Run `downstroke preflight` after clone.
10. Run `downstroke init --preset <preset>` after clone unless `--no-install` is set.
11. Support multi-repo workspace import.

## Non-Functional Requirements

- Never log tokens.
- Never put tokens in clone URLs.
- Never mutate global Git config automatically.
- Never run destructive Git commands.
- Work with GitHub.com, GitHub Enterprise, GitLab.com, GitLab self-managed, Bitbucket Cloud and raw Git URLs.
- Keep clone/import dry-run friendly.

## Acceptance Criteria

- [ ] `downstroke init --from owner/repo --preset lite` clones and initializes safely.
- [ ] GitHub, GitLab and Bitbucket provider prefixes are supported.
- [ ] Private repo failures explain auth choices.
- [ ] `--dry-run` prints clone plan without network mutation.
- [ ] Existing non-empty target folder blocks the operation.
- [ ] Parent `.git` warning appears for nested repo risk.
- [ ] `--submodules` uses recursive clone behavior.
- [ ] `--lfs` only runs when Git LFS is installed.
- [ ] Workspace import creates isolated repo entries.
- [ ] Git provider doctor reports Git, provider CLI, auth, protocol, LFS and destination safety.

## Suggested CLI

```bash
downstroke init --from owner/repo --preset lite
downstroke init --from https://github.com/owner/repo.git --branch develop
downstroke repo clone github:owner/repo --into clients/acme --preset frontend-react-ux
downstroke repo clone gitlab:group/project --into clients/acme
downstroke repo clone bitbucket:workspace/repo --into clients/acme
downstroke repo doctor
downstroke workspace import owner/api owner/web owner/mobile --into clients/acme
```
