# 🚀 Vercel Environment Setup Script
# Run this in PowerShell after navigating to alpha-eon-frontend folder

Write-Host "🔧 Setting up Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is available
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

Write-Host "📋 This script will set environment variables for:" -ForegroundColor Yellow
Write-Host "  1. Frontend (alpha-eon-frontend)" -ForegroundColor Yellow
Write-Host "  2. Backend (alpha-eon-backend)" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Continue? (Y/n)"
if ($continue -eq "n" -or $continue -eq "N") {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=== FRONTEND SETUP ===" -ForegroundColor Green
Write-Host "Setting frontend environment variables..." -ForegroundColor Cyan

# Frontend variables
$frontendVars = @{
    "VITE_ALPHAEON_API_URL" = "https://alpha-eon-backend.vercel.app"
    "VITE_ALPHAEON_CLIENT_ID" = "faB1X0qx8UgquO9hFlnmBP76orJRy7y3"
    "VITE_ALPHAEON_CLIENT_SECRET" = "d-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph"
    "VITE_ALPHAEON_LOCATION_ID" = "15470"
    "VITE_ALPHAEON_AUDIENCE" = "https://api.alphaeon.com/"
    "VITE_ALPHAEON_IFRAME_URL" = "https://iframe.go.sandbox.alphaeontest.com"
    "VITE_ADVITAL_ALLOWED_ORIGIN" = "https://adv-dev.vercel.app"
    "VITE_ADVITAL_PORTAL_BASE_URL" = "https://adv-dev.vercel.app"
    "VITE_ADVITAL_PUBLISHABLE_KEY" = "jYjfEW-aZG66e-w8a28d-Z6F5zB"
    "VITE_ADVITAL_LOCATION_ID" = "test123"
}

Write-Host ""
Write-Host "⚠️  For each variable, you'll be prompted to select environments." -ForegroundColor Yellow
Write-Host "    Select: Production, Preview, Development (use space to select, enter to confirm)" -ForegroundColor Yellow
Write-Host ""

foreach ($var in $frontendVars.GetEnumerator()) {
    Write-Host "Setting $($var.Key)..." -ForegroundColor Cyan
    echo $var.Value | vercel env add $var.Key production
}

Write-Host ""
Write-Host "✅ Frontend variables set!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Deploying frontend..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "=== COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Frontend deployed with new environment variables!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Now do the same for your BACKEND project:" -ForegroundColor Yellow
Write-Host "   1. Navigate to your backend folder" -ForegroundColor Yellow
Write-Host "   2. Run the backend setup commands from VERCEL_CLI_SETUP.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Backend variables needed:" -ForegroundColor Cyan
Write-Host "   CLIENT_ID, CLIENT_SECRET, ALPHAEON_AUTH_URL," -ForegroundColor Gray
Write-Host "   ALPHAEON_API_URL, ALPHAEON_AUDIENCE, ALPHAEON_MERCHANT_ID, NODE_ENV" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 Test your deployment:" -ForegroundColor Cyan
Write-Host "   https://alpha-eon-frontend.vercel.app/" -ForegroundColor Blue
