---
name: deploy-cloudAbril
description: Guía completa de build y deploy del proyecto cloudAbril. Tres servicios independientes: dev.front-admin (Vue 3), dev.backend (NestJS + SQL Server), dev.ws (NestJS - servicio WhatsApp/webhook). Script PowerShell `build-and-deploy-prod.ps1` compila y copia todo a `server-abril-prod/`.
---

# Deploy – cloudAbril

## Cuándo usar este skill

- El usuario quiere desplegar a producción o QA
- Pregunta cómo compilar uno o más servicios
- Necesita entender la estructura de entornos y archivos `.env`
- Quiere saber qué hace el script de build

---

## Arquitectura de servicios

```
cloudAbril/
├── dev.front-admin/   ← Frontend Vue 3 (panel admin)
├── dev.backend/       ← Backend NestJS (API REST + SQL Server + PostgreSQL)
├── dev.ws/            ← Servicio WhatsApp/Webhook (NestJS)
└── server-abril-prod/ ← Destino del build de producción
    ├── frontend/
    ├── backend/
    └── ws/
```

> **dev.ws** es el **servicio de WhatsApp/Webhook**, NO un WebSocket genérico.  
> Gestiona la integración con la API de WhatsApp Business y webhooks entrantes.

---

## Archivos `.env` por servicio y entorno

| Servicio | Desarrollo | Producción | QA |
|---|---|---|---|
| `dev.front-admin` | `.env.development` | `.env.production` | – |
| `dev.backend` | `.env.development` | `.env.prod` | `.env.qa` |
| `dev.ws` | `.env` | `.env` | – |

> El script de build toma automáticamente el archivo correcto de cada servicio.  
> El `.env.prod` del backend se copia como `.env` en el destino de producción.

---

## Comandos de desarrollo local

```bash
# Frontend (desde dev.front-admin/)
npm run dev

# Backend API (desde dev.backend/)
npm run start:dev

# Servicio WhatsApp (desde dev.ws/)
npm run start:dev

# Levantar PostgreSQL local (desde raíz)
docker-compose -f docker-compose.dev.yml up -d
```

O usar el script de inicio rápido desde PowerShell (raíz):

```powershell
.\start-all-services.ps1
```

---

## Script de build a producción

**Archivo:** `build-and-deploy-prod.ps1` (en la raíz del proyecto)

### Compilar TODO

```powershell
.\build-and-deploy-prod.ps1
```

### Compilar servicios individuales

```powershell
# Solo frontend
.\build-and-deploy-prod.ps1 -SkipBackend -SkipWs

# Solo backend
.\build-and-deploy-prod.ps1 -SkipFrontend -SkipWs

# Solo servicio WhatsApp
.\build-and-deploy-prod.ps1 -SkipFrontend -SkipBackend

# Frontend + Backend (sin WhatsApp)
.\build-and-deploy-prod.ps1 -SkipWs
```

### Ver ayuda del script

```powershell
.\build-and-deploy-prod.ps1 -Help
```

---

## Qué hace el script paso a paso

### 1. Frontend (`dev.front-admin`)
1. `npm install`
2. `npm run build` (usa `.env.production`)
3. Copia `dist/` → `server-abril-prod/frontend/dist/`

### 2. Backend (`dev.backend`)
1. `npm install`
2. `npm run build` (compila TypeScript → `dist/`)
3. Copia `dist/` + `package.json` + `package-lock.json` → `server-abril-prod/backend/`
4. Copia `.env.prod` como `.env` en el destino

### 3. Servicio WhatsApp (`dev.ws`)
1. `npm install`
2. `npm run build`
3. Copia `dist/` + `package.json` + `package-lock.json` → `server-abril-prod/ws/`
4. Copia `.env` al destino

---

## Deploy en el servidor de producción

Luego de correr el script de build:

```bash
# En el servidor (VPS / Docker host)
docker-compose -f docker-compose.prod.yml up -d --build
```

> Los archivos `.env` ya están copiados en `server-abril-prod/` por el script.  
> No commitear archivos `.env` al repositorio.

---

## Variables de entorno críticas del backend

```env
# SQL Server (base de datos principal)
DB_HOST_SQLSERVER=
DB_PORT_SQLSERVER=1435
DB_USERNAME_SQLSERVER=
DB_PASSWORD_SQLSERVER=
DB_DATABASE_SQLSERVER=

# PostgreSQL (solo para whatsapp-history)
DB_HOST_POSTGRES=
DB_PORT_POSTGRES=5432
DB_USERNAME_POSTGRES=
DB_PASSWORD_POSTGRES=
DB_DATABASE_POSTGRES=
```

---

## Checklist de deploy a producción

- [ ] Revisar que `.env.production` (frontend) está actualizado
- [ ] Revisar que `.env.prod` (backend) apunta al servidor correcto
- [ ] Revisar que `.env` (dev.ws) tiene las credenciales de WhatsApp Business correctas
- [ ] Correr `.\build-and-deploy-prod.ps1`
- [ ] Verificar que `server-abril-prod/backend/.env` tiene los valores de prod
- [ ] Subir al servidor y ejecutar `docker-compose up -d`
- [ ] Verificar logs: `docker-compose logs -f`

---

## Errores frecuentes

❌ Editar archivos `.env` en `server-abril-prod/` y luego correr el script de build  
✅ Siempre editar los `.env` en cada carpeta de servicio (`dev.backend/.env.prod`, etc.) ya que el script los sobreescribe en el destino

❌ Olvidar que SQL Server usa `synchronize: false` y PostgreSQL usa `synchronize: true`  
✅ Nunca activar `synchronize: true` en la conexión SQL Server (podría alterar tablas de producción)

❌ Hacer cambios directamente en `server-abril-prod/`  
✅ Siempre modificar el código fuente en `dev.backend/`, `dev.front-admin/` o `dev.ws/` y recompilar
