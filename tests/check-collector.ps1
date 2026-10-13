# Windows HTTP probe; uses system certificate validation. No private key is sent.
$taskConfig = Get-Content 'analytics-config.js' -Raw
$taskEndpoint = [regex]::Match($taskConfig, "endpoint:\s*'([^']+)'").Groups[1].Value
if (-not $taskEndpoint.StartsWith('https://')) { throw 'HTTPS collector endpoint is required.' }
$taskSession = [guid]::NewGuid().ToString()
$taskPayload = @{
    version = 1
    sessionId = $taskSession
    device = 'desktop'
    durations = @{ clinical = 35000; estimator = 10000 }
    views = @{ clinical = 2; estimator = 1 }
    actions = @{ case_requested = 1; planner_used = 1 }
} | ConvertTo-Json -Depth 4 -Compress
$taskResponse = Invoke-WebRequest $taskEndpoint -Method Post -Headers @{ Origin = 'https://cbcthelper.com' } -ContentType 'text/plain' -Body $taskPayload -SkipHttpErrorCheck -UseBasicParsing
@{ status = [int]$taskResponse.StatusCode; sessionId = $taskSession } | ConvertTo-Json -Compress
