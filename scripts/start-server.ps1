$repoRoot = Split-Path $PSScriptRoot -Parent
$pidFilePath = Join-Path $repoRoot '.todo-threads-server.pid'
$buildIdPath = Join-Path $repoRoot '.next\BUILD_ID'
$logDirectory = Join-Path $repoRoot 'data'
$serverOutputLogPath = Join-Path $logDirectory 'server.log'
$serverErrorLogPath = Join-Path $logDirectory 'server-error.log'
$buildLogPath = Join-Path $logDirectory 'build.log'
$appUrl = 'http://localhost:58321'
$launchLockPath = Join-Path $repoRoot '.todo-threads-launch.lock'

# The managed desktop environment may expose a disabled localhost proxy
# (127.0.0.1:9). Do not let that proxy block the server-side LLM request.
# Node also needs to trust the Windows certificate store for HTTPS calls.
foreach ($proxyVariable in 'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'all_proxy', 'no_proxy') {
  [Environment]::SetEnvironmentVariable($proxyVariable, $null, 'Process')
}
$nodeOptions = @($env:NODE_OPTIONS, '--use-system-ca') | Where-Object { $_ } | Select-Object -Unique
$env:NODE_OPTIONS = ($nodeOptions -join ' ')

if (-not (Test-Path $logDirectory)) {
  New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
}

if (Test-Path $launchLockPath) {
  $lockInfo = Get-Item $launchLockPath -ErrorAction SilentlyContinue
  if ($lockInfo -and $lockInfo.LastWriteTime -lt (Get-Date).AddMinutes(-5)) {
    Remove-Item $launchLockPath -Recurse -Force -ErrorAction SilentlyContinue
  } else {
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
      try {
        Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2 | Out-Null
        Start-Process $appUrl
        exit 0
      } catch {
        Start-Sleep -Seconds 1
      }
    }
    Start-Process $appUrl
    exit 0
  }
}

try {
  New-Item -ItemType Directory -Path $launchLockPath -ErrorAction Stop | Out-Null
} catch {
  Start-Process $appUrl
  exit 0
}

$existingPid = Get-Content $pidFilePath -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existingPid) {
  try {
    $existingProcess = Get-Process -Id ([int]$existingPid) -ErrorAction Stop
    if ($existingProcess) {
      try {
        Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2 | Out-Null
        Remove-Item $launchLockPath -Recurse -Force -ErrorAction SilentlyContinue
        Start-Process $appUrl
        exit 0
      } catch {
        Remove-Item $pidFilePath -ErrorAction SilentlyContinue
      }
    }
  } catch {
    Remove-Item $pidFilePath -ErrorAction SilentlyContinue
  }
}

$shouldBuild = -not (Test-Path $buildIdPath)
if (-not $shouldBuild) {
  $sourceItems = @(
    Get-ChildItem -Path (Join-Path $repoRoot 'app') -Recurse -File
    Get-ChildItem -Path (Join-Path $repoRoot 'lib') -Recurse -File
    Get-ChildItem -Path (Join-Path $repoRoot 'src') -Recurse -File
    Get-Item (Join-Path $repoRoot 'package.json')
    Get-Item (Join-Path $repoRoot 'next.config.ts')
    Get-Item (Join-Path $repoRoot 'tsconfig.json')
  )
  $latestSource = $sourceItems | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  $build = Get-Item $buildIdPath
  if ($latestSource.LastWriteTime -gt $build.LastWriteTime) {
    $shouldBuild = $true
  }
}

if ($shouldBuild) {
  Push-Location $repoRoot
  try {
    npm run build *> $buildLogPath
    if ($LASTEXITCODE -ne 0) {
      Remove-Item $launchLockPath -Recurse -Force -ErrorAction SilentlyContinue
      Start-Process $buildLogPath
      exit $LASTEXITCODE
    }
  } finally {
    Pop-Location
  }
}

$nextCli = Join-Path $repoRoot 'node_modules\next\dist\bin\next'
$process = Start-Process -FilePath 'node' -ArgumentList @($nextCli, 'start', '-p', '58321') -WorkingDirectory $repoRoot -WindowStyle Hidden -RedirectStandardOutput $serverOutputLogPath -RedirectStandardError $serverErrorLogPath -PassThru
Set-Content -Path $pidFilePath -Value $process.Id

for ($attempt = 0; $attempt -lt 60; $attempt++) {
  try {
    Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2 | Out-Null
    Remove-Item $launchLockPath -Recurse -Force -ErrorAction SilentlyContinue
    Start-Process $appUrl
    exit 0
  } catch {
    Start-Sleep -Seconds 1
  }
}

Remove-Item $launchLockPath -Recurse -Force -ErrorAction SilentlyContinue
Start-Process $appUrl
