# Try to run npm install by finding Node in common locations
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot

# MSI installer default; try first so fresh installs work
$paths = @(
    "C:\Program Files\nodejs",
    "$env:ProgramFiles\nodejs",
    "${env:ProgramFiles(x86)}\nodejs",
    "$env:APPDATA\npm",
    "$env:LOCALAPPDATA\Programs\nodejs"
)

$nodeDir = $null
foreach ($p in $paths) {
    if (Test-Path "$p\node.exe") { $nodeDir = $p; break }
    if (Test-Path "$p\npm.cmd")   { $nodeDir = $p; break }
}

if ($nodeDir) {
    $env:Path = "$nodeDir;$env:Path"
    & "$nodeDir\npm.cmd" install
    exit $LASTEXITCODE
}

Write-Host "Node.js not found in common paths. Please add Node to PATH or run npm install from a terminal where Node is available." -ForegroundColor Yellow
Write-Host "See docs/NODE_NPM_SETUP.md for steps." -ForegroundColor Cyan
exit 1
