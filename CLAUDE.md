# cloudAbril — Instrucciones para Claude Code

## Stack del proyecto

### Frontend (`dev.front-admin`)
- **Vue 3** con `<script setup>` y Composition API
- **Pinia** para estado global
- **TanStack Vue Query** (`@tanstack/vue-query`) para fetching/cache de datos del servidor
- **TailwindCSS** + **DaisyUI** para estilos y componentes UI
- **Vite** como bundler
- Variables de entorno: `VITE_*` en `.env`, `.env.development`, `.env.qa`, `.env.production`

### Backend (`dev.backend`)
- **NestJS** — puerto 3001
- Bases de datos: **SQL Server** + **PostgreSQL**

### WhatsApp service (`dev.ws`)
- **NestJS** — puerto 3010
- **Meta WhatsApp Business API** para envío de templates
- DTOs con `class-validator`

## Convenciones

### Componentes Vue
- Siempre usar `<script setup lang="ts">` con Composition API
- Para tipos genéricos en `ref<>` con unions (`|`), extraer el tipo antes: `type Foo = 'a' | 'b'` → `ref<Foo>`
- No usar `ref<HTMLInputElement | null>` en el template — crear inputs dinámicamente con `document.createElement`
- Para handlers de eventos en template, definir función nombrada en el script (evita error `$event: any` implícito de Volar)

### Paginación
- Usar el componente `src/components/PaginationControl.vue`
- Props: `currentPage`, `totalPages`, `recordsInfo` (string)
- Emit: `page-changed` (number) → manejar con función nombrada, no inline

### Estilos
- Preferir clases de DaisyUI (`btn`, `card`, `badge`, `table`, `modal`, etc.)
- Complementar con Tailwind para ajustes de layout/spacing

### WhatsApp
- Normalización de teléfonos argentinos: 10 dígitos → `'54' + número`
- Entre envíos usar `sleep(350)` para no saturar la API

## Rutas principales
- `/ventas` — ventas con WhatsApp
- `/pagos` — pagos
- `/historial` — historial de mensajes
- `/personalizado` — mensajes personalizados
- `/moroso` — gestión de morosos (moroso_1 / moroso_2 / moroso_3)
