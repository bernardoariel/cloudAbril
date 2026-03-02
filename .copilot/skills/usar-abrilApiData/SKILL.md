---
name: usar-abrilApiData
description: Regla crítica del frontend: SIEMPRE usar la instancia centralizada `abrilApiData` (Axios configurado con baseURL, interceptors de auth y headers). NUNCA usar `axios.get`, `axios.post` ni `fetch` directamente. Aplicar cada vez que el usuario escribe una llamada HTTP en el frontend.
---

# Regla: Siempre usar `abrilApiData`

## Cuándo aplicar este skill

- El usuario escribe `axios.get(...)`, `axios.post(...)`, `fetch(...)` en cualquier archivo del frontend
- Se crea un nuevo `actions.ts` o cualquier función que llame al backend
- Se revisa o refactoriza código de servicios en `dev.front-admin`

---

## ¿Por qué existe `abrilApiData`?

`abrilApiData` es la instancia de Axios **centralizada y configurada** del proyecto. Incluye:

- `baseURL` apuntando al backend correcto según el entorno (dev / prod)
- **Interceptors de autenticación**: agrega el token JWT en cada request automáticamente
- **Manejo centralizado de errores**: errores 401 redirigen al login
- **Headers predefinidos**: `Content-Type: application/json`

Usar `axios` directamente **rompe** la autenticación y el manejo de entornos.

---

## ❌ MAL – Nunca hacer esto

```typescript
import axios from 'axios';

// ❌ axios directo: sin auth, sin baseURL correcta, sin interceptors
const { data } = await axios.get('http://localhost:3000/productos');

// ❌ fetch nativo: igual de malo
const res = await fetch('/api/productos');
const data = await res.json();

// ❌ crear una instancia ad-hoc
const api = axios.create({ baseURL: 'http://...' });
```

---

## ✅ BIEN – Siempre hacer esto

```typescript
import { abrilApiData } from '@/api/abrilApiData';

// ✅ GET
const { data } = await abrilApiData.get<{ result: Producto[] }>('productos');

// ✅ GET por ID
const { data } = await abrilApiData.get<Producto>(`productos/${id}`);

// ✅ POST
const { data } = await abrilApiData.post<Producto>('productos', payload);

// ✅ PUT
const { data } = await abrilApiData.put<Producto>(`productos/${id}`, payload);

// ✅ DELETE
await abrilApiData.delete(`productos/${id}`);
```

---

## Ubicación del archivo base

```
dev.front-admin/src/api/abrilApiData.ts
```

Este es el único archivo del proyecto donde se instancia Axios. **No crear instancias nuevas en ningún otro lugar.**

---

## Plantilla estándar de `actions.ts`

Todo servicio debe seguir esta plantilla:

```typescript
import { abrilApiData } from '@/api/abrilApiData';
import axios from 'axios';                           // solo para isAxiosError()
import type { MiEntidad } from '@/interfaces/mi-entidad.interface';

export const getMiEntidades = async (): Promise<MiEntidad[]> => {
  try {
    const { data } = await abrilApiData.get<{ result: MiEntidad[] }>('mi-endpoint');
    return data.result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error al obtener datos:', error.response?.data || error.message);
    }
    throw new Error('No se pudieron obtener los registros.');
  }
};

export const getMiEntidadById = async (id: number): Promise<MiEntidad> => {
  try {
    const { data } = await abrilApiData.get<MiEntidad>(`mi-endpoint/${id}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error al obtener registro:', error.response?.data || error.message);
    }
    throw error;
  }
};

export const createMiEntidad = async (payload: Partial<MiEntidad>): Promise<MiEntidad> => {
  try {
    const { data } = await abrilApiData.post<MiEntidad>('mi-endpoint', payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error al crear:', error.response?.data || error.message);
    }
    throw error;
  }
};

export const updateMiEntidad = async (id: number, payload: Partial<MiEntidad>): Promise<MiEntidad> => {
  try {
    const { data } = await abrilApiData.put<MiEntidad>(`mi-endpoint/${id}`, payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error al actualizar:', error.response?.data || error.message);
    }
    throw error;
  }
};

export const deleteMiEntidad = async (id: number): Promise<void> => {
  try {
    await abrilApiData.delete(`mi-endpoint/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error al eliminar:', error.response?.data || error.message);
    }
    throw error;
  }
};
```

---

## Reglas de oro

| Regla | Descripción |
|---|---|
| ✅ `abrilApiData` | Única instancia permitida para HTTP |
| ✅ `axios` importado solo para `axios.isAxiosError()` | Solo para detectar errores Axios en el catch |
| ❌ `axios.get/post/put/delete` | Prohibido |
| ❌ `fetch(...)` | Prohibido |
| ❌ `axios.create(...)` fuera de `abrilApiData.ts` | Prohibido |

---

## Checklist al crear un `actions.ts`

- [ ] Import: `import { abrilApiData } from '@/api/abrilApiData'`
- [ ] Import: `import axios from 'axios'` (solo para `isAxiosError`)
- [ ] Cada función tiene bloque `try/catch`
- [ ] El `catch` usa `axios.isAxiosError(error)` para loguear
- [ ] El `catch` siempre hace `throw` para que TanStack Query maneje el error
- [ ] Ninguna función usa `axios.get`, `axios.post`, `fetch`, ni instancias ad-hoc
