Write-Host "Starting ZenFlow Backend (API on port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

Write-Host "Starting ZenFlow Frontend (Vite)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"

Write-Host "Both servers are starting in new windows!" -ForegroundColor Cyan
Write-Host "Make sure MongoDB is running locally." -ForegroundColor Yellow
