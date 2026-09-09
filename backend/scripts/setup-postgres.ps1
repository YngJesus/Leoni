$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path (Split-Path -Parent $scriptDir) ".env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $name = $Matches[1].Trim()
      $value = $Matches[2].Trim().Trim('"').Trim("'")
      if (-not [string]::IsNullOrWhiteSpace($name) -and -not (Test-Path "Env:$name")) {
        Set-Item -Path "Env:$name" -Value $value
      }
    }
  }
}

$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "leoni" }
$user = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "postgres" }
$password = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
$hostName = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$port = if ($env:DB_PORT) { $env:DB_PORT } else { "5433" }

$psqlPath = $null
$cmd = Get-Command psql -ErrorAction SilentlyContinue
if ($cmd) {
  $psqlPath = $cmd.Path
  if (-not $psqlPath) { $psqlPath = $cmd.Source }
}

if (-not $psqlPath) {
  $pgRoot = "C:\Program Files\PostgreSQL"
  if (Test-Path $pgRoot) {
    $found = @(
      Get-ChildItem $pgRoot -Directory -ErrorAction SilentlyContinue |
        Sort-Object { [int]($_.Name -replace '\D', '0') } -Descending |
        ForEach-Object { Join-Path $_.FullName "bin\psql.exe" } |
        Where-Object { Test-Path $_ }
    )
    if ($found.Count -gt 0) {
      $psqlPath = [string]$found[0]
    }
  }
}

if (-not $psqlPath -or -not (Test-Path -LiteralPath $psqlPath)) {
  Write-Host "PostgreSQL (psql) was not found."
  Write-Host "1. Install PostgreSQL: https://www.postgresql.org/download/windows/"
  Write-Host "2. Install pgAdmin 4 desktop: https://www.pgadmin.org/download/pgadmin-4-windows/"
  Write-Host "3. Re-run this script, or create database '$dbName' in pgAdmin."
  exit 1
}

$env:PGPASSWORD = $password
Write-Host "Using $psqlPath"

function Invoke-Psql([string[]]$SqlArgs) {
  $output = & "$psqlPath" @SqlArgs 2>&1 | Out-String
  $code = $LASTEXITCODE
  return @{ Output = $output; Code = $code }
}

$check = Invoke-Psql @(
  "-h", $hostName, "-p", $port, "-U", $user, "-d", "postgres",
  "-tAc", "SELECT 1 FROM pg_database WHERE datname = '$dbName'"
)
if ($check.Code -ne 0) {
  Write-Host $check.Output
  Write-Host "Could not connect. Check DB_PASSWORD in backend/.env (the password you set in the PostgreSQL installer)."
  exit $check.Code
}

$exists = if ($check.Output) { $check.Output.Trim() } else { "" }
if ($exists -ne "1") {
  $create = Invoke-Psql @(
    "-h", $hostName, "-p", $port, "-U", $user, "-d", "postgres",
    "-v", "ON_ERROR_STOP=1", "-c", "CREATE DATABASE $dbName"
  )
  if ($create.Code -ne 0) {
    Write-Host $create.Output
    exit $create.Code
  }
  Write-Host "Created database '$dbName'."
} else {
  Write-Host "Database '$dbName' already exists."
}

Write-Host "Ready on ${hostName}:${port}"
Write-Host "In pgAdmin, add a server: host=$hostName port=$port database=$dbName user=$user"
