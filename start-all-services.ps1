#!/usr/bin/env pwsh
# Script para iniciar todos los servicios necesarios para cloudAbril

$ErrorActionPreference = "Continue"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Iniciando Servicios cloudAbril    " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot

# Verificar si Windows Terminal está disponible
$wtAvailable = Get-Command wt -ErrorAction SilentlyContinue

if ($wtAvailable) {
    Write-Host "Usando Windows Terminal..." -ForegroundColor Green
    
    # Iniciar todos los servicios en pestañas de Windows Terminal
    wt `
        --title "cloudAbril - Servicios" `
        -d "$rootPath\dev.front-admin" powershell -NoExit -Command "npm run dev" `; `
        split-pane -H -d "$rootPath\dev.backend" powershell -NoExit -Command "npm run start:dev" `; `
        split-pane -V -d "$rootPath\dev.ws" powershell -NoExit -Command "npm run start:dev"
    
    Write-Host ""
    Write-Host "Todos los servicios iniciados en Windows Terminal" -ForegroundColor Green
} else {
    Write-Host "Windows Terminal no disponible. Usando ventanas separadas..." -ForegroundColor Yellow
    Write-Host ""
    
    # Frontend - Admin
    Write-Host "[1/3] Iniciando Frontend (Admin)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\dev.front-admin'; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 1
    
    # Backend - NestJS API
    Write-Host "[2/3] Iniciando Backend (NestJS)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\dev.backend'; npm run start:dev" -WindowStyle Normal
    Start-Sleep -Seconds 1
    
    # WebSocket Service
    Write-Host "[3/3] Iniciando WebSocket Service..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\dev.ws'; npm run start:dev" -WindowStyle Normal
    
    Write-Host ""
    Write-Host "Todos los servicios iniciados en ventanas separadas" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Servicios iniciados:" -ForegroundColor Cyan
Write-Host "- Frontend Admin: http://localhost:5173" -ForegroundColor White
Write-Host "- Backend API:    http://localhost:3000" -ForegroundColor White
Write-Host "- WebSocket:      http://localhost:3001" -ForegroundColor White
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C en cada ventana para detener los servicios" -ForegroundColor Yellow
