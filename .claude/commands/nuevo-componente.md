# Nuevo componente Vue

Cuando crees un componente o vista nueva en `dev.front-admin`, seguí estas reglas del proyecto:

## Estructura base

```vue
<template>
  <!-- DaisyUI + Tailwind -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
// Pinia: import { useXxxStore } from '@/stores/xxx'
// TanStack Query: import { useQuery, useMutation } from '@tanstack/vue-query'
</script>
```

## Reglas obligatorias

1. **`<script setup lang="ts">`** siempre
2. **Tipos genéricos con union** → extraer tipo antes de usarlo en `ref<>`:
   ```ts
   type Estado = 'activo' | 'inactivo'
   const estado = ref<Estado>('activo')
   ```
3. **Input file dinámico** — NO usar `ref<HTMLInputElement | null>` en template:
   ```ts
   const abrirArchivo = () => {
     const input = document.createElement('input')
     input.type = 'file'
     input.onchange = (e: Event) => manejar(e)
     input.click()
   }
   ```
4. **Handlers de eventos** → función nombrada, no inline con `$event`:
   ```ts
   // ✅
   const onCambio = (val: number) => { ... }
   // ❌ @change="algo = $event" causa error Volar
   ```
5. **Paginación** → usar `<PaginationControl>` de `@/components/PaginationControl.vue`
6. **Teléfonos AR** → normalizar: `t.replace(/\D/g,'')` → si 10 dígitos → `'54' + t`
7. **Variables de entorno** → `import.meta.env.VITE_XXX` con fallback: `?? 'default'`
