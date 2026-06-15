# PowerShell script to generate and update product descriptions
# Run this from the project root directory

Write-Host "=== Product Description Generator & Updater ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Generate descriptions
Write-Host "Step 1: Generating product descriptions..." -ForegroundColor Yellow
npx tsx scripts/generate-product-descriptions-seo.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to generate descriptions" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Updating database..." -ForegroundColor Yellow
npx tsx scripts/update-product-descriptions.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to update database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Complete! ===" -ForegroundColor Green
Write-Host "Check the output above for any errors." -ForegroundColor Green

