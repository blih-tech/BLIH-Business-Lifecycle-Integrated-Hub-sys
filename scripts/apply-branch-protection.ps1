[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Owner,

    [Parameter(Mandatory = $true)]
    [string]$Repo,

    [string[]]$Branches = @("main", "develop"),

    [switch]$RequireSignedCommits
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI ('gh') is required. Install it from https://cli.github.com/ and run 'gh auth login'."
}

$requiredChecks = @(
    "Monorepo Governance / commit-rules",
    "Monorepo Governance / quality-gates"
)

foreach ($branch in $Branches) {
    try {
        gh api "/repos/$Owner/$Repo/branches/$branch" | Out-Null
    }
    catch {
        Write-Warning "Branch '$branch' does not exist in '$Owner/$Repo'. Skipping."
        continue
    }

    Write-Host "Applying protection to '$branch'..."
    $payload = @{
        required_status_checks         = @{
            strict   = $true
            contexts = $requiredChecks
        }
        enforce_admins                = $true
        required_pull_request_reviews = @{
            dismiss_stale_reviews           = $true
            require_code_owner_reviews      = $false
            required_approving_review_count = 1
            require_last_push_approval      = $false
        }
        restrictions                  = $null
        required_linear_history       = $true
        allow_force_pushes            = $false
        allow_deletions               = $false
        block_creations               = $false
        required_conversation_resolution = $true
        lock_branch                   = $false
        allow_fork_syncing            = $true
    } | ConvertTo-Json -Depth 10

    $endpoint = "/repos/$Owner/$Repo/branches/$branch/protection"
    $payload | gh api --method PUT `
        -H "Accept: application/vnd.github+json" `
        $endpoint `
        --input - | Out-Null

    if ($RequireSignedCommits.IsPresent) {
        $signedEndpoint = "/repos/$Owner/$Repo/branches/$branch/protection/required_signatures"
        try {
            gh api --method POST `
                -H "Accept: application/vnd.github+json" `
                $signedEndpoint | Out-Null
        }
        catch {
            if ($_.Exception.Message -notmatch "already enabled") {
                throw
            }
        }
    }
}

Write-Host "Branch protection setup complete."
