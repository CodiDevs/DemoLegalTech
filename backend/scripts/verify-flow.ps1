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
Set-Content -Path "$tmpdir\minuta.pdf" -Value 'minuta notario demo'
$token = $hc.Authorization.Split(' ')[1]
$lawyerToken = $h.Authorization.Split(' ')[1]
curl.exe -s -H "Authorization: Bearer $token" -F "doc_type=matricula" -F "file=@$tmpdir\mat.pdf" "$base/cases/$id/documents" | Out-Null
curl.exe -s -H "Authorization: Bearer $token" -F "doc_type=acuerdo" -F "file=@$tmpdir\acu.pdf" "$base/cases/$id/documents" | Out-Null

$ws = Invoke-RestMethod -Uri "$base/cases/$id/workspace" -Headers $h
Write-Host "status=$($ws.case.status) blockers=$($ws.blockers -join ' | ')"
if ($ws.blockers -match 'Cédula|Partida') { throw 'Traslado case must not show divorcio doc blockers' }
if ($ws.blockers -notmatch 'Matrícula|Acuerdo') { throw 'Expected matricula/acuerdo pending blockers' }

$minutaResp = curl.exe -s -w "`n%{http_code}" -H "Authorization: Bearer $lawyerToken" -F "file=@$tmpdir\minuta.pdf" "$base/cases/$id/minuta/upload"
$minutaLines = $minutaResp -split "`n"
$minutaCode = $minutaLines[-1]
if ($minutaCode -ne '409') { throw "UploadMinuta should return 409 without approved docs, got $minutaCode" }
Write-Host "minuta upload gate OK (HTTP $minutaCode)"

foreach ($d in $ws.documents) {
  Invoke-RestMethod -Method Post -Uri "$base/cases/$id/documents/$($d.id)/review" -Headers $h -ContentType 'application/json' -Body '{"status":"approved","note":""}' | Out-Null
}
$wsMid = Invoke-RestMethod -Uri "$base/cases/$id/workspace" -Headers $h
Write-Host "after reviews status=$($wsMid.case.status)"
if ($wsMid.case.status -ne '04') { throw 'Expected auto status 04 after last doc approved' }

curl.exe -s -H "Authorization: Bearer $lawyerToken" -F "file=@$tmpdir\minuta.pdf" "$base/cases/$id/minuta/upload" | Out-Null
$wsFinal = Invoke-RestMethod -Uri "$base/cases/$id/workspace" -Headers $h
Write-Host "final status=$($wsFinal.case.status) blockers=$($wsFinal.blockers -join ' | ')"
if ($wsFinal.case.status -ne '04') { throw 'Expected status 04 after minuta upload' }
if ($wsFinal.blockers.Count -gt 0) { throw 'Expected no blockers at 04 with minuta' }
if (-not ($wsFinal.outputs | Where-Object { $_.output_type -eq 'minuta' })) { throw 'Expected minuta output' }

Write-Host 'ALL CHECKS PASSED'
