$appDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$logFile = Join-Path $appDirectory "data\launcher.log"
$localUrl = "http://localhost:58321"

function Test-AppIsRunning {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $localUrl -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (-not (Test-AppIsRunning)) {
  $serverCommand = "Set-Location -LiteralPath '$appDirectory'; npm run dev *> '$logFile'"
  Start-Process -FilePath "powershell.exe" -WindowStyle Hidden -ArgumentList @(
    "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $serverCommand
  )

  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 500
    if (Test-AppIsRunning) { break }
  }
}

Start-Process $localUrl
