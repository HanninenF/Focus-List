param(
  [string]$ProjectKey = "throllv_lugn-lista",
  [int]$PageSize = 500
)

$sonarToken = $env:SONAR_TOKEN
if ([string]::IsNullOrWhiteSpace($sonarToken)) {
  throw "SONAR_TOKEN saknas. Sätt miljövariabeln innan scriptet körs."
}

$sonarHeaders = @{ Authorization = "Bearer $sonarToken" }
$encodedProjectKey = [Uri]::EscapeDataString($ProjectKey)
$issuesUrl = "https://sonarcloud.io/api/issues/search?componentKeys=$encodedProjectKey&types=CODE_SMELL&resolved=false&ps=$PageSize"
$issuesResponse = Invoke-RestMethod -Uri $issuesUrl -Headers $sonarHeaders -Method Get

Write-Output "Code smells för ${ProjectKey}: $($issuesResponse.total)"
if ($issuesResponse.issues.Count -eq 0) {
  Write-Output "Inga öppna code smells hittades."
  exit 0
}

$issuesResponse.issues |
  Select-Object rule, severity, message, component, line |
  Format-Table -AutoSize -Wrap
