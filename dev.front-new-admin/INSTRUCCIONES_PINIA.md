### Instrucciones para instalar Pinia

Para que la funcionalidad de autenticación funcione correctamente, necesitas instalar Pinia en tu proyecto. Sigue estos pasos:

1. Instala Pinia usando npm:
```bash
npm install pinia
```

2. Luego, agrega Pinia a tu archivo main.ts:

```typescript
import { createPinia } from 'pinia'

// Después de crear la aplicación:
const pinia = createPinia()
app.use(pinia)
```

3. El archivo main.ts debería verse así (añade las líneas marcadas con "+"):

```typescript
import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'
import 'simplebar-vue/dist/simplebar.min.css'

import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
+ import { createPinia } from 'pinia'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 120, // guarda la data por dos minutos
            refetchOnReconnect: 'always', // se reconecta siempre
             staleTime: 1000 * 60, // considera los datos frescos durante 1 minuto
        }
    }
})
const app = createApp(App)
app.use(VueQueryPlugin, { queryClient })

+ const pinia = createPinia()
+ app.use(pinia)

app.use(router)
app.use(VueApexCharts)
```

Una vez instalado Pinia, la página de login funcionará correctamente.
