# Cambios - 5 de marzo de 2026

## 1. Portal público — Ocultar productos solo en Servicio Técnico

**Problema:** Productos con stock únicamente en sucursales SERV* aparecían en el portal público y en el detalle mostraban el badge `SERV.ES: 1 un.`.

**Solución:** El cache de stock del backend ahora excluye las sucursales cuyo `NombreSuc` empiece con `SERV` antes de calcular totales.

### Archivos modificados

#### `dev.backend/src/prod-stock/prod-stock.service.ts`
- Inyectado `Repository<Sucursal>` para consultar la tabla `Sucursales`.
- `loadStockCache()` ahora:
  1. Consulta los `CodSucursal` de sucursales SERV* al arrancar.
  2. Excluye esos códigos del cálculo de `stockCache` (total por producto).
  3. Excluye esos códigos de `stockBySucursalCache` (detalle por sucursal).

#### `dev.backend/src/prod-stock/prod-stock.module.ts`
- Agregada la entidad `Sucursal` al `TypeOrmModule.forFeature([ProdStock, Sucursal], 'sqlserverConnection')`.

### Efecto
| Caso | Resultado |
|---|---|
| Producto solo en SERV* | No aparece en el portal ni en el admin |
| Producto en SERV* + otras sucursales | Aparece con el stock y sucursales reales (sin SERV*) |
| `GET /api/prod-stock/:codProducto` | Sin cambios (query directa a DB, no usa cache) |
| `GET /api/productos/:term` (búsqueda puntual) | Sin cambios (query directa a DB) |

> ⚠️ El listado general (`GET /api/productos`) también aplica el filtro → el panel admin tampoco muestra productos solo-en-SERV* en la grilla de búsqueda.

---

## 2. Sistema de colores dinámico del portal (sesiones anteriores)

### Nuevo módulo: `dev.backend/src/portal-config/`

| Archivo | Descripción |
|---|---|
| `portal-config.module.ts` | Módulo NestJS registrado en `app.module.ts` |
| `portal-config.service.ts` | Lee/escribe `portal-palette.json`; extrae colores con Vibrant |
| `portal-config.controller.ts` | 4 endpoints (ver abajo) |
| `portal-config.dto.ts` | `PortalPaletteDto` + `ExtractPaletteDto` |
| `portal-key-or-jwt.guard.ts` | Guard dual: acepta `x-portal-key` header **o** JWT |

### Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/portal-config/palette` | Público | Devuelve la paleta actual |
| `PUT` | `/api/portal-config/palette` | JWT | Guarda paleta desde panel admin |
| `POST` | `/api/portal-config/extract` | API Key o JWT | Extrae colores de una URL de imagen (para n8n) |
| `POST` | `/api/portal-config/reset` | API Key o JWT | Restaura colores por defecto |

### Variables de entorno a agregar

Agregar en `.env.qa` y `.env.prod` (ya están con valor placeholder):

```env
PORTAL_CONFIG_KEY=CAMBIAR-POR-UNA-CLAVE-SECRETA-SEGURA
```

### Dependencia nueva en backend

```bash
npm install node-vibrant --save --legacy-peer-deps
```

### Archivos frontend modificados

| Archivo | Cambio |
|---|---|
| `dev.front-admin/src/layouts/PublicLayout.vue` | Carga paleta desde `GET /api/portal-config/palette` al montar |
| `dev.front-admin/src/views/PortalConfigView.vue` | Panel admin: pickers + Vibrant browser-side + guardar/restaurar |
| `dev.front-admin/src/components/NavHeader.vue` | Link "Colores del Portal" en dropdown admin |
| `dev.front-admin/src/router/index.ts` | Ruta `/portal-config` bajo `DefaultLayout` |
| `dev.front-admin/src/views/PublicHomeView.vue` | Colores hardcodeados reemplazados por CSS vars |

### CSS custom properties usadas en el portal

```css
--brand-dark     /* fondo oscuro, gradientes */
--brand-primary  /* color principal, botones */
--brand-light    /* acentos claros */
--brand-cta      /* llamadas a la acción (naranja, no se extrae del flyer) */
```

### Flujo n8n (automático)

```
POST https://api.abrilviveenvos.com/api/portal-config/extract
Headers:
  x-portal-key: <PORTAL_CONFIG_KEY>
  Content-Type: application/json
Body:
  { "imageUrl": "https://url-publica-de-la-nueva-portada.jpg" }
```
