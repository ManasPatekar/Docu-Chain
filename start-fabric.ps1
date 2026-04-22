# DocuChain Fabric Launcher for Windows
# This script runs the Fabric Test Network via a Docker bridge.

Write-Host "🛡️  Initializing DocuChain Enterprise Ledger..." -ForegroundColor Cyan

# 1. Ensure directories exist
if (-not (Test-Path "fabric-samples/bin")) {
    Write-Host "⚠️  Fabric binaries not found in expected location. Attempting to fix..." -ForegroundColor Yellow
    if (Test-Path "bin") {
        cp -r bin fabric-samples/
        cp -r config fabric-samples/
    }
}

# 2. Run the Network Setup via Docker (Ubuntu bridge for glibc compatibility)
Write-Host "⛓️  Launching Fabric Nodes (this may take a few minutes)..." -ForegroundColor Cyan

docker run --rm `
    -v /var/run/docker.sock:/var/run/docker.sock `
    -v "${PWD}:/network" `
    -w /network/fabric-samples/test-network `
    ubuntu sh -c "apt-get update && apt-get install -y docker.io curl git && ./network.sh up createChannel -c docuchain-channel"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅  DocuChain Ledger is LIVE on 'docuchain-channel'!" -ForegroundColor Green
    Write-Host "📂  Connection profiles generated in fabric-samples/test-network/organizations" -ForegroundColor Gray
} else {
    Write-Host "❌  Failed to start Fabric network. Please ensure Docker Desktop is running." -ForegroundColor Red
}
