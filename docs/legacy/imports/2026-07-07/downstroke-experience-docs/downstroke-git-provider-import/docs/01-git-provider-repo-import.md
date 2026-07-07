# Git Provider Repo Import And Clone Support

Downstroke should support a common starting flow: install the framework first, then bring an existing project from a Git hosting provider and initialize Downstroke inside it safely.

The goal is not to replace Git. The goal is to make project onboarding safer, clearer and friendlier for AI-assisted development.

## Use Cases

| Use case | Example |
| --- | --- |
| Start from GitHub | `downstroke init --from github:owner/repo` |
| Start from GitLab | `downstroke init --from gitlab:group/project` |
| Start from Bitbucket | `downstroke init --from bitbucket:workspace/repo` |
| Clone then install Downstroke | `downstroke github clone owner/repo --preset lite` |
| Import private project | `downstroke init --from git@github.com:org/app.git` |
| Import branch/tag | `downstroke init --from owner/repo --branch develop` |
| Import into workspace folder | `downstroke github clone owner/repo --into clients/acme` |
| Multi-repo workspace | `downstroke workspace import owner/api owner/web owner/mobile` |

## Commands

```bash
downstroke init --from github:owner/repo
downstroke init --from gitlab:group/project
downstroke init --from bitbucket:workspace/repo
downstroke init --from https://github.com/owner/repo.git
downstroke init --from git@github.com:owner/repo.git
downstroke repo clone github:owner/repo
downstroke repo clone gitlab:group/project
downstroke repo clone bitbucket:workspace/repo
downstroke github clone owner/repo
downstroke gitlab clone group/project
downstroke bitbucket clone workspace/repo
downstroke github doctor
downstroke repo doctor
downstroke workspace import owner/api owner/web owner/mobile
```

## Recommended Flow

1. Validate Git and workspace safety.
2. Detect authentication method.
3. Resolve repository URL.
4. Preview clone destination.
5. Clone using provider CLI when available and authenticated, otherwise Git.
6. Detect branch, submodules, Git LFS and monorepo/workspace shape.
7. Run `downstroke preflight`.
8. Ask or infer preset.
9. Run `downstroke init --preset <preset>` inside the cloned repo.
10. Run `downstroke doctor`.

## URL Inputs

Downstroke should accept:

| Input | Meaning |
| --- | --- |
| `owner/repo` | Provider shorthand when provider is already selected. |
| `github:owner/repo` | Explicit GitHub shorthand. |
| `gitlab:group/project` | Explicit GitLab shorthand. |
| `bitbucket:workspace/repo` | Explicit Bitbucket shorthand. |
| `https://github.com/owner/repo.git` | HTTPS Git URL. |
| `git@github.com:owner/repo.git` | SSH Git URL. |
| `https://gitlab.com/group/project.git` | GitLab HTTPS URL. |
| `git@gitlab.com:group/project.git` | GitLab SSH URL. |
| `https://bitbucket.org/workspace/repo.git` | Bitbucket HTTPS URL. |
| `git@bitbucket.org:workspace/repo.git` | Bitbucket SSH URL. |
| `https://github.enterprise.local/owner/repo.git` | Enterprise host. |

## Clone Engine Priority

| Engine | When to use |
| --- | --- |
| `gh repo clone` | Preferred when GitHub CLI is installed and authenticated. |
| `glab repo clone` | Preferred when GitLab CLI is installed and authenticated for GitLab repos. |
| `git clone` | Fallback and universal path. |
| `git clone --recurse-submodules` | When user enables submodules or repo has known submodules. |
| `git clone --depth 1` | Fast onboarding when full history is not needed. |
| `git sparse-checkout` | Later optimization for huge monorepos, not MVP default. |

GitHub documents `gh repo clone <repository> [<directory>] [-- <gitflags>...]`, including passing extra Git flags after `--`. GitLab documents `glab repo clone [<repo>] [<dir>] [-- <gitflags>...]` with a similar pass-through pattern. Bitbucket Cloud should use plain `git clone` unless an approved Bitbucket CLI adapter is added later.

## Authentication

Downstroke should never ask the user to paste a token into a command line that will be stored in shell history.

Supported auth paths:

| Method | Recommended for | Notes |
| --- | --- | --- |
| GitHub CLI | Most users | Use `gh auth status` and `gh repo clone`. |
| GitLab CLI | GitLab users | Use `glab auth status`/configured auth and `glab repo clone`. |
| SSH | Developers with SSH keys | Use `git@github.com:owner/repo.git`. |
| HTTPS credential manager | Workstations with credential helpers | Do not store credentials in Downstroke. |
| Token env var | CI or automation | Read from environment only; never log it. |
| Bitbucket API/scoped token | Bitbucket automation | Do not paste tokens into clone URLs or logs. |

If auth is missing:

```txt
Git provider auth is not ready.

Choose one:
1. Run provider auth: gh auth login or glab auth login
2. Use SSH: git@github.com:owner/repo.git, git@gitlab.com:group/project.git or git@bitbucket.org:workspace/repo.git
3. Configure your Git credential manager
```

## Options

```bash
--into <directory>
--branch <name>
--tag <name>
--commit <sha>
--depth <n>
--full-history
--submodules
--lfs
--no-install
--preset <name>
--workspace
--provider github|gitlab|bitbucket|auto
--host <host>
--dry-run
```

Rules:

- `--branch`, `--tag` and `--commit` are mutually exclusive.
- `--depth 1` should be allowed but not default for unknown projects.
- `--submodules` should add `--recurse-submodules`.
- `--lfs` should run `git lfs pull` only if Git LFS is installed and the repo uses LFS.
- `--no-install` clones only and skips Downstroke init.

## Destination Safety

Before cloning:

- refuse to clone into a non-empty directory unless `--into` is explicit and safe;
- refuse to clone inside another Git repo unless workspace mode is explicit;
- warn if the destination parent has a `.git` and the target will become a nested repo;
- create a clear plan in `--dry-run`;
- never delete an existing folder to retry.

## Forks And Upstream

When using GitHub CLI, fork behavior can add an `upstream` remote. Downstroke should detect remotes after clone and report:

```txt
origin    git@github.com:user/repo.git
upstream  git@github.com:parent/repo.git
```

Do not rewrite remotes unless the user asks.

## Output

```txt
Downstroke GitHub Import

Provider:    github
Repo:        owner/repo
Engine:      gh repo clone
Auth:        GitHub CLI
Destination: ./repo
Branch:      default
Submodules:  not requested
LFS:         detected, git-lfs available

Next:
  cd repo
  downstroke preflight
  downstroke init --preset lite
```

## Acceptance Criteria

- [ ] Supports GitHub, GitLab and Bitbucket inputs.
- [ ] Supports `owner/repo`, provider prefixes, HTTPS and SSH inputs.
- [ ] Uses `gh repo clone` or `glab repo clone` when available and authenticated.
- [ ] Falls back to `git clone`.
- [ ] Does not log tokens or secrets.
- [ ] Refuses unsafe destination overwrites.
- [ ] Supports branch/tag/commit selection.
- [ ] Supports optional submodules and Git LFS.
- [ ] Runs preflight after clone.
- [ ] Can initialize Downstroke after clone.
- [ ] Works with multi-repo workspace mode.
