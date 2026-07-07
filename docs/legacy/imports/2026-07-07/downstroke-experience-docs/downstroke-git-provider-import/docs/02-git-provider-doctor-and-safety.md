# Git Provider Doctor And Clone Safety

`downstroke repo doctor` checks whether the current machine and workspace are ready to clone or import a project from GitHub, GitLab, Bitbucket or a raw Git URL safely.

## Command

```bash
downstroke repo doctor
downstroke repo doctor --json
downstroke doctor --git-provider
downstroke github doctor
downstroke gitlab doctor
downstroke bitbucket doctor
```

## Checks

| Check | Signal | Severity |
| --- | --- | --- |
| Git installed | `git --version` | fail |
| GitHub CLI installed | `gh --version` | info/warn |
| GitHub CLI auth | `gh auth status` | warn for private repos |
| GitLab CLI installed | `glab --version` | info/warn |
| GitLab CLI auth | `glab auth status` | warn for private repos |
| Git protocol | `gh config get git_protocol` | info |
| SSH available | `ssh -T git@github.com` optional | info/warn |
| GitLab SSH available | `ssh -T git@gitlab.com` optional | info/warn |
| Bitbucket SSH available | `ssh -T git@bitbucket.org` optional | info/warn |
| Credential helper | `git config credential.helper` | info |
| Git LFS installed | `git lfs version` | warn if repo uses LFS |
| Destination safe | parent exists, target absent/empty | fail |
| Parent git risk | parent `.git` with nested target | warn/fail |
| Network remote reachable | `git ls-remote` or `gh repo view` | fail |
| Repo privacy | public/private/unknown | info |

## Safety Rules

- Never print tokens.
- Never place tokens in clone URLs.
- Never mutate global Git config automatically.
- Never overwrite a non-empty destination.
- Never run `git clean`, `git reset --hard` or destructive commands.
- Never assume SSH is configured just because `git` exists.
- Never assume `gh` auth works for Git operations until tested.

## Private Repos

For private repositories, Downstroke should prefer:

1. Provider CLI auth when available: `gh auth login` or `glab auth login`.
2. SSH URL with configured keys.
3. Existing HTTPS credential helper.
4. Provider-scoped tokens in environment/credential helpers for CI only.

If the repo cannot be reached:

```txt
FAIL github.remote.reachable

The repository could not be read.
Possible causes:
- wrong owner/repo name;
- missing access to private repo;
- Provider CLI not authenticated;
- SSH key not authorized;
- enterprise/self-managed host not configured.
```

## Large Repos

If the repo appears large or uses LFS/submodules:

- offer `--depth 1` for fast onboarding;
- offer `--submodules` when `.gitmodules` exists or user requests it;
- offer `--lfs` when LFS pointers are detected;
- document that shallow clone may not be enough for release/version analysis.

## Workspace Mode

For freelancers or developers with several client repos in one folder:

```bash
downstroke workspace import owner/api owner/web owner/mobile --into clients/acme
```

Rules:

- each repo gets its own folder;
- each repo gets its own `.downstroke/state.json`;
- workspace metadata lives in `.downstroke-workspace/workspace.json`;
- LLM context is isolated per focused repo;
- parent `.git` is treated as risk unless explicitly intended.

## Doctor Output

```txt
Downstroke Git Provider Doctor

OK    git.installed              git 2.51.0
OK    gh.installed               gh 2.84.0
OK    gh.auth                    Logged in to github.com
INFO  glab.missing               GitLab CLI not installed; git clone fallback available
INFO  gh.protocol                ssh
WARN  git-lfs.missing            Repo may use LFS; install git-lfs before --lfs
OK    destination.safe           ./acme-web is available
WARN  parent.git                 Destination is inside a parent Git repo; use --workspace if intentional
```

## Acceptance Criteria

- [ ] Doctor detects Git, GitHub CLI, GitLab CLI, auth, protocol, SSH, LFS and destination safety.
- [ ] Doctor explains private repo failures clearly.
- [ ] Doctor never logs credentials.
- [ ] Doctor integrates with multi-repo workspace rules.
- [ ] Doctor recommends safe next commands.
