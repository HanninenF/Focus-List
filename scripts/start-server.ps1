$repoRoot = Split-Path $PSScriptRoot -Parent
$pidFilePath = Join-Path $repoRoot '.todo-threads-server.pid'
$buildIdPath = Join-Path $repoRoot '.next\BUILD_ID'
$logDirectory = Join-Path $repoRoot 'data'
$serverOutputLogPath = Join-Path $logDirectory 'server.log'
$serverErrorLogPath = Join-Path $logDirectory 'server-error.log'
$buildLogPath = Join-Path $logDirectory 'build.log'
$appUrl = 'http://localhost:58321'
$launchLockPath = Join-Path $repoRoot '.todo-threads-launch.lock'

function Test-AppIsRunning {
  try {
    $htmlResponse = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2
    if ($htmlResponse.StatusCode -ne 200) { return $false }

    $stylesheet = [regex]::Match($htmlResponse.Content, 'href="([^"]+\.css[^"]*)"')
    if (-not $stylesheet.Success) { return $false }

    $stylesheetUrl = [System.Uri]::new([System.Uri]$appUrl, $stylesheet.Groups[1].Value).AbsoluteUri
    $cssResponse = Invoke-WebRequest -Uri $stylesheetUrl -UseBasicParsing -TimeoutSec 2
    return $cssResponse.StatusCode -eq 200 -and $cssResponse.Headers['Content-Type'] -like 'text/css*'
  } catch {
    return $false
  }
}

function Get-AppListenerProcessId {
  $connection = Get-NetTCPConnection -LocalPort 58321 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($connection) { return [int]$connection.OwningProcess }

  $netstatLine = netstat -ano 2>$null |
    Select-String -Pattern '\sLISTENING\s+\d+\s*$' |
    Where-Object { $_.Line -match ':58321\s' } |
    Select-Object -First 1
  if ($netstatLine) {
    $parts = $netstatLine.Line.Trim() -split '\s+'
    return [int]$parts[-1]
  }
  return $null
}

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
        if (-not (Test-AppIsRunning)) { throw 'The running app is not healthy.' }
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

$listenerProcessId = Get-AppListenerProcessId
if ($listenerProcessId) {
  $listenerProcess = Get-Process -Id $listenerProcessId -ErrorAction SilentlyContinue
  if (-not $shouldBuild -and (Test-AppIsRunning)) {
    Set-Content -Path $pidFilePath -Value $listenerProcessId
    Remove-Item $launchLockPath -Recurse -Force -ErrorAction SilentlyContinue
    Start-Process $appUrl
    exit 0
  }
  if ($listenerProcess) {
    Stop-Process -Id $listenerProcess.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 300
  }
  Remove-Item $pidFilePath -ErrorAction SilentlyContinue
}

try {
  New-Item -ItemType Directory -Path $launchLockPath -ErrorAction Stop | Out-Null
} catch {
  Start-Process $appUrl
  exit 0
}

$existingPid = Get-Content $pidFilePath -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existingPid -and -not $shouldBuild) {
  try {
    $existingProcess = Get-Process -Id ([int]$existingPid) -ErrorAction Stop
    if ($existingProcess) {
      try {
        if (-not (Test-AppIsRunning)) {
          Stop-Process -Id $existingProcess.Id -Force -ErrorAction SilentlyContinue
          throw 'The running app is not healthy.'
        }
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
    if (-not (Test-AppIsRunning)) { throw 'The server is not ready.' }
    Remove-Item $launchLockPath -Recurse -Force -ErrorAction SilentlyContinue
    Start-Process $appUrl
    exit 0
  } catch {
    Start-Sleep -Seconds 1
  }
}

Remove-Item $launchLockPath -Recurse -Force -ErrorAction SilentlyContinue
Start-Process $appUrl
