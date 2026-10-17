$ErrorActionPreference = "Stop"

$javaCandidates = @(
  "C:\Program Files\Eclipse Adoptium\jre-21.0.1.12-hotspot",
  "C:\Program Files\Eclipse Adoptium\jdk-21.0.1.12-hotspot",
  $env:JAVA_HOME
)

$javaHome = $javaCandidates |
  Where-Object { $_ -and (Test-Path (Join-Path $_ "bin\java.exe")) } |
  Select-Object -First 1

if (-not $javaHome) {
  throw "Java 21 eller senare hittades inte. Installera Java 21 och försök igen."
}

$env:JAVA_HOME = $javaHome
$env:SONAR_SCANNER_OPTS = "$($env:SONAR_SCANNER_OPTS) -Djavax.net.ssl.trustStoreType=Windows-ROOT".Trim()

$scanner = Join-Path $PSScriptRoot "..\node_modules\.bin\sonar-scanner.cmd"
if (-not (Test-Path $scanner)) {
  throw "SonarScanner saknas. Kör npm install först."
}

& $scanner
exit $LASTEXITCODE
