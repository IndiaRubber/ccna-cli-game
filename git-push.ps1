# git-push.ps1
# Adds all changes, prompts for a commit message, commits, and pushes.

Write-Host ""
Write-Host "Checking Git status..." -ForegroundColor Cyan
git status

Write-Host ""
$commitMessage = Read-Host "Enter commit message"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    Write-Host "Commit cancelled. No message entered." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Adding changes..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Commit failed or there was nothing to commit. Push cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "Done." -ForegroundColor Green
pause