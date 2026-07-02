param(
  [string]$ProjectRoot = (Get-Location).Path,
  [string]$PonytailInstallCommand = $env:PONYTAIL_INSTALL_COMMAND
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ProjectRoot).Path
$boilerplateRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path

Push-Location $root
try {
  if (Test-Path -LiteralPath '.codegraph\codegraph.db') {
    npx.cmd @colbymchenry/codegraph status
  } elseif (-not (Test-Path -LiteralPath '.codegraph')) {
    npx.cmd @colbymchenry/codegraph init -i
  } else {
    npx.cmd @colbymchenry/codegraph sync
  }

  if (-not (Test-Path -LiteralPath '_bmad')) {
    npx.cmd bmad-method@6.9.0 install --directory . --modules bmm --tools codex `
      --communication-language Spanish --document-output-language English `
      --set bmm.project_knowledge=docs --set bmm.user_skill_level=expert --yes
  } elseif (-not (Test-Path -LiteralPath '_bmad\bmm\config.yaml') -or
    -not (Select-String -LiteralPath '_bmad\bmm\config.yaml' -Pattern '^# Version:\s*6\.9\.0\s*$' -Quiet)) {
    throw 'Existing BMAD configuration is incomplete or malformed. Manual review is required.'
  }

  $cavemanSource = Join-Path $boilerplateRoot 'skills\caveman\SKILL.md'
  $cavemanTargetDir = Join-Path $root '.agents\skills\caveman'
  $cavemanTarget = Join-Path $cavemanTargetDir 'SKILL.md'
  if (-not (Test-Path -LiteralPath $cavemanTarget)) {
    New-Item -ItemType Directory -Force -Path $cavemanTargetDir | Out-Null
    Copy-Item -LiteralPath $cavemanSource -Destination $cavemanTarget
  } elseif (-not (Select-String -LiteralPath $cavemanTarget -Pattern '^name:\s*["'']?caveman["'']?\s*$' -Quiet)) {
    throw 'Existing Caveman skill is malformed. Manual review is required.'
  }

  $ponytailTarget = Join-Path $root '.agents\skills\ponytail\SKILL.md'
  if (-not (Test-Path -LiteralPath $ponytailTarget)) {
    if (-not $PonytailInstallCommand) {
      throw 'Ponytail source is not configured. Set PONYTAIL_INSTALL_COMMAND to the canonical install command.'
    }

    & ([scriptblock]::Create($PonytailInstallCommand))
    if ($LASTEXITCODE -ne 0) {
      throw "Ponytail install failed with exit code $LASTEXITCODE."
    }
  } elseif (-not (Select-String -LiteralPath $ponytailTarget -Pattern '^name:\s*["'']?ponytail["'']?\s*$' -Quiet)) {
    throw 'Existing Ponytail skill is malformed. Manual review is required.'
  }

  npx.cmd @colbymchenry/codegraph status
  npx.cmd bmad-method status
  Write-Host 'Agent bootstrap complete: CodeGraph, BMAD, Caveman, Ponytail.'
} finally {
  Pop-Location
}
