$base = 'http://localhost:8080/api/v1'
$ErrorActionPreference = 'Stop'

function Login($email) {
  $body = @{ email = $email; password = 'demo1234' } | ConvertTo-Json
  $r = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body $body
  return @{ Authorization = "Bearer $($r.token)" }
}

Write-Host '=== Divorcio360 seed case #1 ==='
$h = Login 'abogado@demo.ec'
$ws1 = Invoke-RestMethod -Uri "$base/cases/1/workspace" -Headers $h
Write-Host "product=$($ws1.case.product) status=$($ws1.case.status)"
Write-Host "blockers=$($ws1.blockers -join ' | ')"
if ($ws1.blockers -match 'Minuta|firma') { throw 'Case1 should not show minuta/firma blockers at status 03' }

Write-Host '=== Traslado360 flow ==='
$hc = Login 'cliente@demo.ec'
$caseBody = @{
  result = 'apto'
  city = 'Quito'
  product = 'traslado360'
  questionnaire = @{ city = 'Quito'; plate = 'ABC-1234'; product = 'traslado360' }
} | ConvertTo-Json -Depth 5
$case = Invoke-RestMethod -Method Post -Uri "$base/cases" -Headers $hc -ContentType 'application/json' -Body $caseBody
$id = $case.id
Write-Host "created case #$id product=$($case.product)"
Invoke-RestMethod -Method Post -Uri "$base/cases/$id/payments/mock" -Headers $hc -ContentType 'application/json' -Body '{"card_last4":"4242"}' | Out-Null

$tmpdir = Join-Path $env:TEMP "d360-test-$id"
New-Item -ItemType Directory -Path $tmpdir -Force | Out-Null
Set-Content -Path "$tmpdir\mat.pdf" -Value 'matricula demo'
Set-Content -Path "$tmpdir\acu.pdf" -Value 'acuerdo demo'
curl.exe -s -H "Authorization: Bearer $($hc.Authorization.Split(' ')[1])" -F "doc_type=matricula" -F "file=@$tmpdir\mat.pdf" "$base/cases/$id/documents" | Out-Null
curl.exe -s -H "Authorization: Bearer $($hc.Authorization.Split(' ')[1])" -F "doc_type=acuerdo" -F "file=@$tmpdir\acu.pdf" "$base/cases/$id/documents" | Out-Null

$ws = Invoke-RestMethod -Uri "$base/cases/$id/workspace" -Headers $h
Write-Host "status=$($ws.case.status) blockers=$($ws.blockers -join ' | ')"
if ($ws.blockers -match 'Cédula|Partida') { throw 'Traslado case must not show divorcio doc blockers' }
if ($ws.blockers -notmatch 'Matrícula|Acuerdo') { throw 'Expected matricula/acuerdo pending blockers' }

try {
  Invoke-RestMethod -Method Post -Uri "$base/cases/$id/generate-minuta" -Headers $h | Out-Null
  throw 'GenerateMinuta should be blocked without approved docs'
} catch {
  $err = $_.ErrorDetails.Message | ConvertFrom-Json
  if ($err.error -ne 'documentos incompletos') { throw "Unexpected minuta gate: $($err.error)" }
  Write-Host "minuta gate OK: $($err.blockers -join ' | ')"
}

foreach ($d in $ws.documents) {
  Invoke-RestMethod -Method Post -Uri "$base/cases/$id/documents/$($d.id)/review" -Headers $h -ContentType 'application/json' -Body '{"status":"approved","note":""}' | Out-Null
}
Invoke-RestMethod -Method Post -Uri "$base/cases/$id/actions" -Headers $h -ContentType 'application/json' -Body '{"action":"approve_and_prepare"}' | Out-Null
Invoke-RestMethod -Method Post -Uri "$base/cases/$id/generate-minuta" -Headers $h | Out-Null
$wsFinal = Invoke-RestMethod -Uri "$base/cases/$id/workspace" -Headers $h
Write-Host "final status=$($wsFinal.case.status) blockers=$($wsFinal.blockers -join ' | ')"
if ($wsFinal.case.status -ne '04') { throw 'Expected status 04 after minuta' }
if ($wsFinal.blockers.Count -gt 0) { throw 'Expected no blockers at 04 with minuta' }

Write-Host 'ALL CHECKS PASSED'
