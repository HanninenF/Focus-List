param(
  [string]$ProjectKey = "throllv_lugn-lista",
  [int]$PageSize = 500
)

$sonarToken = $env:SONAR_TOKEN
if ([string]::IsNullOrWhiteSpace($sonarToken)) {
  $sonarToken = [Environment]::GetEnvironmentVariable("SONAR_TOKEN", "User")
}
if ([string]::IsNullOrWhiteSpace($sonarToken)) {
  throw "SONAR_TOKEN saknas. Sätt miljövariabeln innan scriptet körs."
}

$sonarHeaders = @{ Authorization = "Bearer $sonarToken" }
$encodedProjectKey = [Uri]::EscapeDataString($ProjectKey)
$issuesUrl = "https://sonarcloud.io/api/issues/search?componentKeys=$encodedProjectKey&resolved=false&ps=$PageSize"
try {
  $issuesResponse = Invoke-RestMethod -Uri $issuesUrl -Headers $sonarHeaders -Method Get -ErrorAction Stop
} catch {
  throw "Kunde inte hämta öppna issues från SonarCloud: $($_.Exception.Message)"
}

Write-Output "Öppna issues för ${ProjectKey}: $($issuesResponse.total)"
if ($issuesResponse.issues.Count -eq 0) {
  Write-Output "Inga öppna issues hittades."
  exit 0
}

Write-Output "`nSammanfattning per typ:"
$issuesResponse.issues |
  Group-Object type |
  Select-Object Name, Count |
  Format-Table -AutoSize

Write-Output "Alla öppna issues:"
$issuesResponse.issues |
  Select-Object type, rule, severity, message, component, line |
  Format-Table -AutoSize -Wrap
