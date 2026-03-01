# ============================================
# Script de Build y Deploy a Produccion
# ============================================
# Este script compila los 3 servicios y los copia a server-abril-prod/
#
# Archivos de configuracion usados:
# - dev.front-admin: .env.production
# - dev.backend:     .env.prod  
# - dev.ws:          .env
# ============================================

param(
    [switch]$SkipFrontend,
    [switch]$SkipBackend,
    [switch]$SkipWs,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Uso: .\build-and-deploy-prod.ps1 [opciones]

Opciones:
    -SkipFrontend   Omitir compilacion del frontend
    -SkipBackend    Omitir compilacion del backend
    -SkipWs         Omitir compilacion del servicio WS
    -Help           Mostrar esta ayuda

Ejemplos:
    .\build-and-deploy-prod.ps1                    # Compilar todo
    .\build-and-deploy-prod.ps1 -SkipFrontend      # Solo backend y ws
    .\build-and-deploy-prod.ps1 -SkipBackend -SkipWs  # Solo frontend
"@
    exit 0
}

$ErrorActionPreference = "Stop"
$ROOT_DIR = $PSScriptRoot
$PROD_DIR = Join-Path $ROOT_DIR "server-abril-prod"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Build y Deploy a Produccion - cloudAbril" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Funcion para mostrar errores y salir
function Exit-WithError {
    param([string]$Message)
    Write-Host ""
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Funcion para mostrar exito
function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

# Funcion para mostrar info
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Yellow
}

# ============================================
# 1. BUILD FRONTEND (dev.front-admin)
# ============================================
if (-not $SkipFrontend) {
    Write-Host ""
    Write-Host "--------------------------------------------" -ForegroundColor Magenta
    Write-Host "  1/3 - Compilando FRONTEND (dev.front-admin)" -ForegroundColor Magenta
    Write-Host "  Usando: .env.production" -ForegroundColor Gray
    Write-Host "--------------------------------------------" -ForegroundColor Magenta
    
    $frontendDir = Join-Path $ROOT_DIR "dev.front-admin"
    $frontendDest = Join-Path $PROD_DIR "frontend"
    
    # Verificar que existe el directorio
    if (-not (Test-Path $frontendDir)) {
        Exit-WithError "No se encontro el directorio dev.front-admin"
    }
    
    # Verificar que existe .env.production
    if (-not (Test-Path (Join-Path $frontendDir ".env.production"))) {
        Exit-WithError "No se encontro .env.production en dev.front-admin"
    }
    
    Push-Location $frontendDir
    try {
        Write-Info "Instalando dependencias..."
        npm install --silent
        
        Write-Info "Compilando frontend (modo production)..."
        npm run build
        
        if (-not (Test-Path "dist")) {
            Exit-WithError "No se genero el directorio dist en dev.front-admin"
        }
        
        Write-Info "Copiando a $frontendDest..."
        
        # Limpiar destino (excepto archivos de configuracion)
        if (Test-Path $frontendDest) {
            Get-ChildItem $frontendDest -Exclude "*.conf", "Dockerfile" | Remove-Item -Recurse -Force
        }
        
        # Copiar carpeta dist completa al destino
        Copy-Item -Path "dist" -Destination $frontendDest -Recurse -Force
        
        Write-Success "Frontend compilado y copiado correctamente"
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "[SKIP] Omitiendo frontend (-SkipFrontend)" -ForegroundColor Gray
}

# ============================================
# 2. BUILD BACKEND (dev.backend)
# ============================================
if (-not $SkipBackend) {
    Write-Host ""
    Write-Host "--------------------------------------------" -ForegroundColor Magenta
    Write-Host "  2/3 - Compilando BACKEND (dev.backend)" -ForegroundColor Magenta
    Write-Host "  Usando: .env.prod" -ForegroundColor Gray
    Write-Host "--------------------------------------------" -ForegroundColor Magenta
    
    $backendDir = Join-Path $ROOT_DIR "dev.backend"
    $backendDest = Join-Path $PROD_DIR "backend"
    
    # Verificar que existe el directorio
    if (-not (Test-Path $backendDir)) {
        Exit-WithError "No se encontro el directorio dev.backend"
    }
    
    Push-Location $backendDir
    try {
        Write-Info "Instalando dependencias..."
        npm install --silent
        
        Write-Info "Compilando backend..."
        npm run build
        
        if (-not (Test-Path "dist")) {
            Exit-WithError "No se genero el directorio dist en dev.backend"
        }
        
        Write-Info "Copiando a $backendDest..."
        
        # Limpiar destino (excepto archivos de configuracion)
        if (Test-Path $backendDest) {
            Get-ChildItem $backendDest -Exclude "*.conf", "Dockerfile", ".env*", "node_modules" | Remove-Item -Recurse -Force
        }
        
        # Copiar dist
        if (Test-Path (Join-Path $backendDest "dist")) {
            Remove-Item -Path (Join-Path $backendDest "dist") -Recurse -Force
        }
        Copy-Item -Path "dist" -Destination $backendDest -Recurse -Force
        
        # Copiar package.json y package-lock.json para instalar deps en prod
        Copy-Item -Path "package.json" -Destination $backendDest -Force
        if (Test-Path "package-lock.json") {
            Copy-Item -Path "package-lock.json" -Destination $backendDest -Force
        }
        
        # Copiar .env.prod como .env en destino
        if (Test-Path ".env.prod") {
            Copy-Item -Path ".env.prod" -Destination (Join-Path $backendDest ".env") -Force
            Write-Info "Copiado .env.prod como .env"
        }
        
        Write-Success "Backend compilado y copiado correctamente"
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "[SKIP] Omitiendo backend (-SkipBackend)" -ForegroundColor Gray
}

# ============================================
# 3. BUILD WS (dev.ws)
# ============================================
if (-not $SkipWs) {
    Write-Host ""
    Write-Host "--------------------------------------------" -ForegroundColor Magenta
    Write-Host "  3/3 - Compilando WS (dev.ws)" -ForegroundColor Magenta
    Write-Host "  Usando: .env" -ForegroundColor Gray
    Write-Host "--------------------------------------------" -ForegroundColor Magenta
    
    $wsDir = Join-Path $ROOT_DIR "dev.ws"
    $wsDest = Join-Path $PROD_DIR "ws"
    
    # Verificar que existe el directorio
    if (-not (Test-Path $wsDir)) {
        Exit-WithError "No se encontro el directorio dev.ws"
    }
    
    Push-Location $wsDir
    try {
        Write-Info "Instalando dependencias..."
        npm install --silent
        
        Write-Info "Compilando servicio WS..."
        npm run build
        
        if (-not (Test-Path "dist")) {
            Exit-WithError "No se genero el directorio dist en dev.ws"
        }
        
        Write-Info "Copiando a $wsDest..."
        
        # Limpiar destino (excepto archivos de configuracion)
        if (Test-Path $wsDest) {
            Get-ChildItem $wsDest -Exclude "*.conf", "Dockerfile", ".env*", "node_modules" | Remove-Item -Recurse -Force
        }
        
        # Copiar dist
        if (Test-Path (Join-Path $wsDest "dist")) {
            Remove-Item -Path (Join-Path $wsDest "dist") -Recurse -Force
        }
        Copy-Item -Path "dist" -Destination $wsDest -Recurse -Force
        
        # Copiar package.json y package-lock.json
        Copy-Item -Path "package.json" -Destination $wsDest -Force
        if (Test-Path "package-lock.json") {
            Copy-Item -Path "package-lock.json" -Destination $wsDest -Force
        }
        
        # Copiar .env
        if (Test-Path ".env") {
            Copy-Item -Path ".env" -Destination $wsDest -Force
            Write-Info "Copiado .env"
        }
        
        Write-Success "Servicio WS compilado y copiado correctamente"
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "[SKIP] Omitiendo WS (-SkipWs)" -ForegroundColor Gray
}

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETADO" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos generados en: $PROD_DIR" -ForegroundColor Cyan
Write-Host ""
Write-Host "Estructura:" -ForegroundColor White
Write-Host "  server-abril-prod/"
if (-not $SkipFrontend) {
    Write-Host "     frontend/dist/     <- dev.front-admin (carpeta dist completa)" -ForegroundColor Green
}
if (-not $SkipBackend) {
    Write-Host "     backend/dist/      <- dev.backend (dist + .env)" -ForegroundColor Green
}
if (-not $SkipWs) {
    Write-Host "     ws/           <- dev.ws (dist + .env)" -ForegroundColor Green
}
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Revisar los archivos .env en server-abril-prod/"
Write-Host "  2. Subir a produccion con: docker-compose -f docker-compose.prod.yml up -d"
Write-Host ""
