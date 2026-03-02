# Instrucciones de Arquitectura – Frontend Abril (cloudAbril)

> Archivo de referencia rápida para el proyecto `dev.front-admin`.  
> Para la guía completa con plantillas de código usar el skill `arquitectura-frontend-abril`.

---

## Principio fundamental

```
Componente / Vista
      ↓
  Composable (useXxx.ts)        ← único punto de entrada al mundo exterior
      ↓
  Service – actions.ts          ← solo llamadas HTTP con abrilApiData
      ↓
  Store Pinia (useXxxStore.ts)  ← estado global reactivo
      ↑
Componente / Vista
```

**Los componentes SOLO hablan con composables. Nunca con servicios ni stores directamente.**

---

## Stack obligatorio

- **Vue 3** · Composition API · `<script setup lang="ts">`
- **TypeScript** · Tipado estricto en interfaces, props y retornos
- **Pinia** · Estado global; el composable escribe en el store vía `watch(data, ...)`
- **TanStack Vue Query** · `useQuery` para GET, `useMutation` para POST/PUT/DELETE
- **Axios** · Siempre mediante la instancia `abrilApiData` (interceptors de auth incluidos)
- **DaisyUI + Tailwind CSS** · Sin CSS custom cuando existe alternativa DaisyUI

---

## Estructura de un módulo

```
src/modules/sqlserver/<nombre>/
├── components/       ← .vue – usan composables, nunca servicios
├── composable/       ← useNombres.ts, useNombre.ts, useCreateNombre.ts
├── interfaces/       ← tipos de respuesta del backend
├── services/
│   └── actions.ts    ← funciones async con abrilApiData + manejo de errores
└── store/
    └── useNombreStore.ts
```

```
src/views/NombreView.vue   ← orquesta componentes, no llama servicios
```

---

## Patrón useQuery (GET)

```typescript
// composable/useNombres.ts
import { watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { getNombres } from '../services/actions'
import { useNombreStore } from '../store/useNombreStore'

export const useNombres = () => {
  const store = useNombreStore()
  const { nombres } = storeToRefs(store)

  const { isLoading, isError, data } = useQuery({
    queryKey: ['nombres'],
    queryFn: () => getNombres(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30,
    retry: false,
  })

  watch(data, (newData) => {
    if (newData) store.setNombres(newData)
  })

  return { nombres, isLoading, isError }
}
```

```vue
<!-- Componente: SOLO usa el composable -->
<script setup lang="ts">
import { useNombres } from '../composable/useNombres'
const { nombres, isLoading, isError } = useNombres()
</script>
```

---

## Patrón useMutation (POST/PUT/DELETE)

```typescript
// composable/useCreateNombre.ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createNombre } from '../services/actions'

export const useCreateNombre = () => {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (payload) => createNombre(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nombres'] }),
  })

  return { crearNombre: mutate, isPending, isError, isSuccess }
}
```

---

## DaisyUI – clases de referencia rápida

| Caso de uso | Clase |
|---|---|
| Botón primario | `btn btn-primary` |
| Botón outline | `btn btn-outline` |
| Loading spinner | `loading loading-spinner loading-lg` |
| Tabla | `table table-zebra w-full` |
| Alert error | `alert alert-error` |
| Input | `input input-bordered w-full` |
| Badge | `badge badge-ghost badge-outline` |
| Card | `card card-bordered bg-base-100 shadow-md` |

---

## Reglas que NO se rompen

1. El componente **nunca** importa desde `../services/actions`
2. El componente **nunca** llama directamente a `useNombreStore()`
3. El servicio **nunca** importa al store
4. Clave de caché (`queryKey`) debe ser **única por entidad**
5. Siempre usar la instancia **`abrilApiData`** (nunca `axios.get` directo)

---

## Módulos de referencia

El módulo `products` es el módulo modelo para seguir como ejemplo:

- Service: `src/modules/sqlserver/products/services/actions.ts`
- Store: `src/modules/sqlserver/products/store/useProductStore.ts`
- Composable (listado): `src/modules/sqlserver/products/composable/useProducts.ts`
- Composable (por id): `src/modules/sqlserver/products/composable/useProduct.ts`
- Componente: `src/modules/sqlserver/products/components/ProductList.vue`
- Vista: `src/views/ProductsView.vue`
