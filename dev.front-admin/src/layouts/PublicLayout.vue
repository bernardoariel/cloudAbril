<template>
  <div class="public-layout min-h-screen flex flex-col" data-theme="classic-orange">
    
    <!-- PORTADA FACEBOOK (Ocultable) -->
    <div 
      class="w-full relative overflow-hidden transition-all duration-700 ease-in-out"
      :class="isCoverVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="facebook-cover w-full">
        <!-- Portada actual -->
        <img 
          :src="coverUrl || localCover"
          alt="Abril Amoblamientos - Portada"
          class="w-full h-auto object-cover facebook-cover-img"
          @error="handleCoverError"
        />
      </div>
    </div>

    <!-- HEADER STICKY (Navbar + Botón Portada) -->
    <div class="sticky top-0 z-50 w-full flex flex-col shadow-xl">
      <!-- NAVBAR con colores Abril -->
      <nav class="navbar-abril px-4 md:px-8 py-3 flex items-center justify-between">
        <div class="flex-none">
          <RouterLink to="/" class="flex items-center gap-3 group">
            <img src="@/assets/img/logo.png" alt="Abril" class="h-10 w-auto group-hover:scale-105 transition-transform" />
          </RouterLink>
        </div>

        <!-- Botón Mostrar/Ocultar Portada integrado en el navbar -->
        <div class="flex-1 flex justify-center">
          <button 
            @click="toggleCover"
            class="group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all"
          >
            {{ isCoverVisible ? 'Ocultar Portada del Mes' : 'Ver Portada del Mes' }}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4 transition-transform duration-300"
              :class="isCoverVisible ? 'rotate-180' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        
        <div class="flex-none flex items-center gap-4">
          <a href="https://www.facebook.com/abrilamoblamientossrl/" target="_blank" class="btn btn-ghost btn-sm text-white hover:bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <RouterLink to="/login" class="btn-ingresar flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            Ingresar
          </RouterLink>
        </div>
      </nav>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="flex-grow bg-white">
      <RouterView />
    </main>
    
    <!-- FOOTER con colores Abril -->
    <footer class="footer-abril py-10 px-8">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <img src="@/assets/img/logo.png" alt="Abril" class="h-12 w-auto brightness-0 invert" />
          <div>
            <p class="font-bold text-white text-lg">Abril Amoblamientos</p>
            <p class="text-white/70 text-sm italic">abril vive en vos</p>
          </div>
        </div>
        <div class="text-center md:text-right text-white/60 text-sm">
          <p>abrilamoblamientos.com.ar</p>
          <p>© {{ new Date().getFullYear() }} - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import localCoverImg from '@/assets/img/cover-facebook.png';

// URL dinámica para cuando n8n actualice la portada automáticamente.
// Si tu backend tiene un endpoint tipo GET /api/public/cover-url que devuelve la URL actualizada,
// podés hacer un fetch acá y setear coverUrl.
// Por ahora usa la imagen local descargada.
const coverUrl = ref<string | null>(null);
const localCover = localCoverImg;
const isCoverVisible = ref(false); // Por defecto oculta

const toggleCover = () => {
  isCoverVisible.value = !isCoverVisible.value;
  if (!isCoverVisible.value) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const handleCoverError = () => {
  coverUrl.value = null;
};
</script>

<style scoped>
.public-layout {
  max-width: 100%;
  overflow-x: hidden;
}

/* Cover de Facebook - Imagen completa en todas las resoluciones */
.facebook-cover {
  background: #C83DAB; /* Color que coincide con los bordes de la portada */
}
.facebook-cover-img {
  width: 100%;
  height: auto;
  display: block;
}

/* Navbar Abril - Fondo púrpura/magenta como la portada de Facebook */
.navbar-abril {
  background: linear-gradient(90deg, #7B2D8E 0%, #9B30FF 50%, #C850C0 100%);
}

/* Botón INGRESAR con estilo naranja Abril */
.btn-ingresar {
  background-color: #EF7E00;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(239, 126, 0, 0.4);
}
.btn-ingresar:hover {
  background-color: #FF9320;
  box-shadow: 0 4px 16px rgba(239, 126, 0, 0.6);
  transform: translateY(-1px);
}

/* Footer con colores Abril */
.footer-abril {
  background: linear-gradient(90deg, #7B2D8E 0%, #9B30FF 50%, #C850C0 100%);
}
</style>
