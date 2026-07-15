# Downstroke

Native repository discipline for safe AI-assisted software delivery.

## Requirements

- Node.js 22 or newer
- npm

## Install

```bash
npm install --global downstroke
downstroke --help
```

Downstroke is preview-first. In a terminal, run `downstroke init` for guided onboarding. For automation, provide every decision explicitly: `downstroke init --preset lite --review-mode one-at-a-time --dry-run`, then repeat with `--yes` to authorize the exact write. Run consumer initialization from the target project, never from the Downstroke maintenance checkout.

See the [repository README](https://github.com/charquiavelo-dev/Downstroke#readme) for the complete command reference, safety model and troubleshooting guide.
