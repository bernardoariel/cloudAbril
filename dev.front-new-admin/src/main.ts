import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'
import 'simplebar-vue/dist/simplebar.min.css'

import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import { createPinia } from 'pinia'

const pinia = createPinia()
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
app.use(pinia)
app.use(VueQueryPlugin, { queryClient })


app.use(router)
app.use(VueApexCharts)

app.mount('#app')
