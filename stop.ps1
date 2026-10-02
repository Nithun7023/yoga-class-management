Write-Host "Stopping ZenFlow servers..." -ForegroundColor Yellow

# Ports used by the backend and frontend
$ports = @(5000, 5173, 5174)

foreach ($port in $ports) {
    # Find the connection listening on this port
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToKill = $conn.OwningProcess
            # Ensure the process is still running before killing
            $process = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Killing process $($process.Name) (PID: $pidToKill) on port $port..." -ForegroundColor Red
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "Servers stopped successfully." -ForegroundColor Green
