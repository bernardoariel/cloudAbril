---
name: componentes-solo-composables
description: Regla crítica del frontend: los componentes Vue SOLO hablan con composables. NUNCA importan desde `../services/actions`, NUNCA llaman a `useXxxStore()` directamente, NUNCA usan `abrilApiData` directamente. Aplicar cada vez que se crea o revisa un componente `.vue` o una vista `View.vue`.
---

# Regla: Componentes Solo Hablan con Composables

## Cuándo aplicar este skill

- Se crea o modifica un archivo `.vue` (componente o vista)
- Se revisa código de un componente y se detecta que importa servicios o stores
- El usuario pregunta "¿cómo accedo a datos en mi componente?"

---

## La regla en una línea

> **Un componente `.vue` tiene UN SOLO punto de entrada al mundo exterior: el composable (`useXxx`).**

---

## ❌ MAL – Cosas prohibidas dentro de un `.vue`

```vue
<script setup lang="ts">
// ❌ PROHIBIDO: importar servicios directamente
import { getProductos } from '../services/actions';

// ❌ PROHIBIDO: usar el store de Pinia directamente
import { useProductStore } from '../store/useProductStore';
const store = useProductStore();

// ❌ PROHIBIDO: llamar a abrilApiData directamente
import { abrilApiData } from '@/api/abrilApiData';
const { data } = await abrilApiData.get('productos');

// ❌ PROHIBIDO: usar ref/reactive para manejar datos del servidor
import { ref, onMounted } from 'vue';
const productos = ref([]);
onMounted(async () => {
  productos.value = await getProductos();  // ← esto es doble error
});
</script>
```

---

## ✅ BIEN – Cómo debe verse un componente correcto

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

    <!-- Contenido -->
    <div v-else class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
// ✅ El componente SOLO importa su composable
import { useItems } from '../composable/useItems';

// ✅ Recibe todo lo que necesita del composable
const { items, isLoading, isError } = useItems();
</script>
```

---

## ✅ Componente con mutación (crear/editar/eliminar)

```vue
<script setup lang="ts">
// ✅ Un composable para leer, otro para mutar
import { useItems } from '../composable/useItems';
import { useCreateItem } from '../composable/useCreateItem';

const { items, isLoading, isError } = useItems();
const { crearItem, isPending } = useCreateItem();

const handleSubmit = (form: Partial<Item>) => {
  crearItem(form);   // ← el composable se encarga de todo
};
</script>
```

---

## ✅ Vista (`NombreView.vue`) – solo orquesta componentes

```vue
<template>
  <div class="p-4 pb-16">
    <!-- La vista SOLO ensambla componentes, no llama servicios ni stores -->
    <ItemList />
    <ItemCreateModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ItemList from '@/modules/sqlserver/items/components/ItemList.vue';
import ItemCreateModal from '@/modules/sqlserver/items/components/ItemCreateModal.vue';

// ✅ Solo estado UI local (mostrar/ocultar modal, etc.)
const showModal = ref(false);
</script>
```

> Una Vista puede usar composables SOLO para estado de UI o navegación (ej: leer parámetros de la ruta), **nunca** para llamar al backend directamente.

---

## Tabla de responsabilidades

| Capa | Qué puede hacer | Qué está prohibido |
|---|---|---|
| **Componente / Vista** | Usar composables, manejar estado UI local (`ref` para `showModal`, etc.) | Importar `actions.ts`, llamar a stores de Pinia, usar `abrilApiData` |
| **Composable** | Usar `useQuery`, `useMutation`, escribir en Pinia vía `watch(data, ...)` | Renderizar UI, acceder al DOM |
| **Service (`actions.ts`)** | Llamar a `abrilApiData`, manejar errores HTTP | Conocer el store, renderizar UI |
| **Store Pinia** | Almacenar estado global reactivo | Hacer llamadas HTTP |

---

## Señales de alarma – si ves esto en un `.vue`, corrígelo

```typescript
// 🚨 Señal 1: import desde services dentro de un .vue
import { getClientes } from '../services/actions';

// 🚨 Señal 2: useXxxStore() directo en el componente
const clienteStore = useClienteStore();
clienteStore.clientes;  // ← esto debe venir del composable

// 🚨 Señal 3: onMounted con llamada HTTP
onMounted(async () => {
  const data = await abrilApiData.get('clientes');
});

// 🚨 Señal 4: ref<T[]> para datos del servidor (sin useQuery)
const clientes = ref<Cliente[]>([]);
// ← si esto se llena con una llamada HTTP, falta el composable
```

---

## Refactorización rápida

Si encuentras código malo, el proceso de corrección es:

1. **Identificar** qué datos necesita el componente
2. **Verificar** si existe un composable para esos datos
3. **Si no existe**: crear el composable con `useQuery` o `useMutation` siguiendo el skill `arquitectura-frontend-abril`
4. **Reemplazar** el código prohibido por el import del composable
5. **Eliminar** imports de `actions.ts`, del store, de `abrilApiData` del `.vue`

---

## Checklist para revisión de un componente

- [ ] No hay ningún `import` desde `../services/actions`
- [ ] No hay ningún `useXxxStore()` directo
- [ ] No hay ningún `import { abrilApiData }` 
- [ ] No hay `onMounted` con llamadas HTTP internas
- [ ] No hay `ref<T[]>` poblado con fetch manual
- [ ] Todos los datos del servidor vienen de composables (`useXxx()`)
- [ ] El estado local (`ref`) solo se usa para UI (modales, pestañas, etc.)
