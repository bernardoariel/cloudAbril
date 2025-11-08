import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import router from './router';
import { initializeAuthStore } from '@/api/abrilApiData.ts'; // Importar la inicialización del store

const app = createApp(App);

// Crear y usar Pinia
const pinia = createPinia();
app.use(pinia);

// Inicializar el store después de que Pinia esté configurado
initializeAuthStore();

app.use(router);
app.use(VueQueryPlugin);

app.mount('#app');
