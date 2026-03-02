---
name: arquitectura-frontend-abril
description: Guía de arquitectura del frontend (Vue 3 + Pinia + TanStack Query + DaisyUI/Tailwind). Define el flujo obligatorio: Componente → Composable → Service (useQuery/useMutation) → Store Pinia → Componente. Usar cuando el usuario pide crear una nueva vista, componente, composable o módulo en el frontend de Abril.
---

# Arquitectura Frontend – Abril (cloudAbril)

## Cuándo usar este skill

- El usuario pide crear una nueva vista, pantalla o sección del frontend
- Necesita agregar un nuevo módulo en `dev.front-admin`
- Pregunta sobre cómo estructurar o nombrar archivos `.vue`, composables o stores
- Quiere crear un componente que consuma datos del backend

---

## Stack tecnológico

| Tecnología | Rol |
|---|---|
| Vue 3 (Composition API + `<script setup>`) | Framework UI |
| TypeScript | Tipado estricto |
| Pinia | Estado global |
| TanStack Vue Query (`@tanstack/vue-query`) | Cache / fetching / `useQuery` / `useMutation` |
| Axios (`abrilApiData`) | Cliente HTTP |
| DaisyUI + Tailwind CSS | Estilos y componentes UI |

---

## Regla de oro – Flujo de comunicación obligatorio

```
Componente / Vista
      ↓  (solo llama composables, NUNCA servicios directamente)
  Composable  (useXxx.ts)
      ↓  (llama al servicio vía useQuery o useMutation)
  Service – actions.ts  (llama a abrilApiData)
      ↓  (cuando llegan los datos, los escribe en Pinia con watch o onSuccess)
  Store Pinia  (useXxxStore.ts)
      ↑  (el componente lee el estado reactivo desde el composable vía storeToRefs)
Componente / Vista
```

> **NUNCA** un componente llama directamente a `actions.ts` ni al store de Pinia.  
> **NUNCA** un servicio conoce al store.

---

## Estructura de archivos por módulo

```
src/modules/sqlserver/<nombre-modulo>/
├── components/          ← Componentes Vue del módulo
│   └── NombreList.vue
├── composable/          ← Composables (useQuery / useMutation)
│   ├── useNombre.ts         (un solo registro)
│   └── useNombres.ts        (listado completo)
├── interfaces/          ← Tipos TypeScript de respuesta
│   └── nombre.response.ts
├── services/
│   └── actions.ts           ← Llamadas HTTP con abrilApiData
└── store/
    └── useNombreStore.ts    ← Store Pinia del módulo
```

Las vistas van en:

```
src/views/NombreView.vue   ← Solo orquesta composables y componentes
```

---

## Paso 1 – Interfaz TypeScript

**Archivo:** `src/interfaces/nombre.interface.ts`  
(Si es específica del módulo: `src/modules/sqlserver/<modulo>/interfaces/nombre.response.ts`)

```typescript
export interface Nombre {
  id: number;
  campo1: string;
  campo2: number;
  // ...
}
```

---

## Paso 2 – Service (actions.ts)

**Archivo:** `src/modules/sqlserver/<modulo>/services/actions.ts`

```typescript
import { abrilApiData } from '@/api/abrilApiData';
import axios from 'axios';
import type { Nombre } from '@/interfaces/nombre.interface';

// GET ALL
export const getNombres = async (): Promise<Nombre[]> => {
  try {
    const { data } = await abrilApiData.get<{ result: Nombre[] }>('nombre-endpoint');
    return data.result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error al obtener nombres:', error.response?.data || error.message);
    }
    throw new Error('No se pudieron obtener los registros.');
  }
};

// GET BY ID
export const getNombreById = async (id: number): Promise<Nombre> => {
  try {
    const { data } = await abrilApiData.get<Nombre>(`nombre-endpoint/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener registro por id:', error);
    throw error;
  }
};

// POST (para useMutation)
export const createNombre = async (payload: Partial<Nombre>): Promise<Nombre> => {
  try {
    const { data } = await abrilApiData.post<Nombre>('nombre-endpoint', payload);
    return data;
  } catch (error) {
    console.error('Error al crear registro:', error);
    throw error;
  }
};
```

---

## Paso 3 – Store Pinia

**Archivo:** `src/modules/sqlserver/<modulo>/store/useNombreStore.ts`

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Nombre } from '@/interfaces/nombre.interface';

export const useNombreStore = defineStore('useNombreStore', () => {
  const nombres = ref<Nombre[]>([]);
  const nombreSeleccionado = ref<Nombre | null>(null);

  return {
    //* Props
    nombres,
    nombreSeleccionado,

    //* Actions
    setNombres(data: Nombre[]) {
      nombres.value = data;
    },
    setNombreSeleccionado(data: Nombre) {
      nombreSeleccionado.value = data;
    },
  };
});
```

---

## Paso 4a – Composable con useQuery (GET listado)

**Archivo:** `src/modules/sqlserver/<modulo>/composable/useNombres.ts`

```typescript
import { watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';

import { getNombres } from '../services/actions';
import { useNombreStore } from '../store/useNombreStore';
import type { Nombre } from '@/interfaces/nombre.interface';

export const useNombres = () => {
  const store = useNombreStore();
  const { nombres } = storeToRefs(store);

  const { isLoading, isError, data } = useQuery<Nombre[]>({
    queryKey: ['nombres'],
    queryFn: () => getNombres(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // 30 minutos en caché
    retry: false,
  });

  // Cuando llegan los datos, los escribimos en Pinia
  watch(data, (newData) => {
    if (newData) store.setNombres(newData);
  });

  return {
    nombres,   // ref reactivo desde el store
    isLoading,
    isError,
  };
};
```

---

## Paso 4b – Composable con useQuery (GET por ID)

**Archivo:** `src/modules/sqlserver/<modulo>/composable/useNombre.ts`

```typescript
import { useQuery } from '@tanstack/vue-query';
import { getNombreById } from '../services/actions';

interface Options {
  id: number;
}

export const useNombre = ({ id }: Options) => {
  const { isLoading, isError, error, data: nombre } = useQuery({
    queryKey: ['nombre', id],
    queryFn: () => getNombreById(id),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
    retry: false,
  });

  return {
    nombre,
    isLoading,
    isError,
    error,
  };
};
```

---

## Paso 4c – Composable con useMutation (POST / PUT / DELETE)

**Archivo:** `src/modules/sqlserver/<modulo>/composable/useCreateNombre.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createNombre } from '../services/actions';
import type { Nombre } from '@/interfaces/nombre.interface';

export const useCreateNombre = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (payload: Partial<Nombre>) => createNombre(payload),
    onSuccess: () => {
      // Invalida el caché para refrescar el listado
      queryClient.invalidateQueries({ queryKey: ['nombres'] });
    },
    onError: (error) => {
      console.error('Error al crear:', error);
    },
  });

  return {
    crearNombre: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
```

---

## Paso 5 – Componente

**Archivo:** `src/modules/sqlserver/<modulo>/components/NombreList.vue`

```vue
<template>
  <div>
    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center p-10">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error -->
    <div v-else-if="isError" class="alert alert-error">
      <span>No se pudieron cargar los datos.</span>
    </div>

    <!-- Lista -->
    <div v-else class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Campo 1</th>
            <th>Campo 2</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in nombres" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.campo1 }}</td>
            <td>{{ item.campo2 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
// ✅ El componente SOLO habla con el composable
import { useNombres } from '../composable/useNombres';

const { nombres, isLoading, isError } = useNombres();
</script>
```

---

## Paso 6 – Vista (View)

**Archivo:** `src/views/NombreView.vue`

```vue
<template>
  <div class="p-4 pb-16">
    <!-- La vista solo orquesta componentes -->
    <NombreList />
  </div>
</template>

<script setup lang="ts">
import NombreList from '@/modules/sqlserver/<modulo>/components/NombreList.vue';
</script>
```

> La vista **no** llama composables directamente si solo muestra un componente.
> Si la vista necesita datos propios (ej: título dinámico desde la ruta), puede usar composables pero NO servicios.

---

## Convenciones de DaisyUI + Tailwind

### Componentes DaisyUI más usados

| Necesidad | Clase DaisyUI |
|---|---|
| Botón primario | `btn btn-primary` |
| Botón outline | `btn btn-outline` |
| Loading spinner | `loading loading-spinner loading-lg` |
| Badge | `badge badge-ghost badge-outline` |
| Alert error | `alert alert-error` |
| Card | `card card-bordered bg-base-100 shadow-md` |
| Tabla | `table table-zebra w-full` |
| Modal | `modal modal-open` |
| Input | `input input-bordered w-full` |
| Select | `select select-bordered w-full` |

### Patrones comunes de layout

```html
<!-- Centrar contenido con padding -->
<div class="p-4 pb-16">

<!-- Flex espaciado entre elementos -->
<div class="flex items-center justify-between">

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

<!-- Contenedor máximo centrado -->
<div class="container mx-auto max-w-4xl">
```

---

## Checklist al crear un módulo nuevo

- [ ] Interfaz TypeScript creada (`nombre.interface.ts`)
- [ ] Service `actions.ts` con funciones async/await + manejo de errores
- [ ] Store Pinia con `ref`, acciones `setXxx` y `storeToRefs` para exposición
- [ ] Composable `useNombres.ts` con `useQuery` + `watch(data, ...)` que llama `store.setXxx`
- [ ] Componente `.vue` que **solo** importa composable (nunca servicios ni stores directamente)
- [ ] Vista en `src/views/` que **solo** orquesta componentes
- [ ] Estilos con clases DaisyUI + Tailwind (sin CSS custom cuando hay alternativa DaisyUI)
- [ ] Ruta agregada en el router

---

## Errores frecuentes a evitar

❌ `import { getNombres } from '../services/actions'` → dentro de un `.vue`  
✅ Usar siempre el composable: `const { nombres } = useNombres()`

❌ `useNombreStore()` dentro de un `.vue` directamente  
✅ El store lo maneja el composable; el componente recibe datos del composable

❌ CSS custom en `<style>` para cosas que DaisyUI ya tiene  
✅ `class="btn btn-primary"` en lugar de estilos manuales

❌ `queryKey` repetidos entre módulos (colisión de caché)  
✅ Siempre prefijo único: `['nombres']`, `['productos']`, `['cobradores']`
