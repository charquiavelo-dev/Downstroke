# Downstroke Git Provider Import

This package defines Downstroke support for cloning/importing hosted Git repositories after installing the framework.

## Providers

- GitHub via `gh repo clone` when available, otherwise `git clone`.
- GitLab via `glab repo clone` when available, otherwise `git clone`.
- Bitbucket via `git clone` with SSH or credential-manager/token-backed HTTPS.
- Raw Git HTTPS/SSH URLs as fallback.

## Main Commands

```bash
downstroke init --from github:owner/repo --preset lite
downstroke init --from gitlab:group/project --preset lite
downstroke init --from bitbucket:workspace/repo --preset lite
downstroke repo clone github:owner/repo --into clients/acme
downstroke repo clone gitlab:group/project --into clients/acme
downstroke repo clone bitbucket:workspace/repo --into clients/acme
downstroke repo doctor
```

Provider aliases may exist for convenience:

```bash
downstroke github clone owner/repo
downstroke gitlab clone group/project
downstroke bitbucket clone workspace/repo
```

## Contents

- `docs/01-git-provider-repo-import.md`
- `docs/02-git-provider-doctor-and-safety.md`
- `_bmad-output/story-021-git-provider-repo-import.md`

## Core Rule

Downstroke must never log tokens, never put tokens into clone URLs, never delete target folders, and never clone into risky nested Git contexts without making workspace mode explicit.

