param(
  [string]$ProjectRoot = (Get-Location).Path,
  [string]$PonytailInstallCommand = $env:PONYTAIL_INSTALL_COMMAND
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ProjectRoot).Path
$boilerplateRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path

Push-Location $root
try {
  if (-not (Test-Path -LiteralPath '.codegraph')) {
    npx.cmd @colbymchenry/codegraph init -i
  } else {
    npx.cmd @colbymchenry/codegraph sync
  }

  if (-not (Test-Path -LiteralPath '_bmad')) {
    npx.cmd bmad-method install --directory . --modules bmm --tools codex `
      --communication-language Spanish --document-output-language Spanish `
      --set bmm.project_knowledge=docs --set bmm.user_skill_level=expert --yes
  }

  $cavemanSource = Join-Path $boilerplateRoot 'skills\caveman\SKILL.md'
  $cavemanTargetDir = Join-Path $root '.agents\skills\caveman'
  New-Item -ItemType Directory -Force -Path $cavemanTargetDir | Out-Null
  Copy-Item -LiteralPath $cavemanSource -Destination (Join-Path $cavemanTargetDir 'SKILL.md') -Force

  if (-not $PonytailInstallCommand) {
    throw 'Ponytail source is not configured. Set PONYTAIL_INSTALL_COMMAND to the canonical install command.'
  }

  & ([scriptblock]::Create($PonytailInstallCommand))
  if ($LASTEXITCODE -ne 0) {
    throw "Ponytail install failed with exit code $LASTEXITCODE."
  }

  npx.cmd @colbymchenry/codegraph status
  npx.cmd bmad-method status
  Write-Host 'Agent bootstrap complete: CodeGraph, BMAD, Caveman, Ponytail.'
} finally {
  Pop-Location
}
