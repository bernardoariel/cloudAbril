<template>
  <div ref="layoutRef" class="public-layout min-h-screen flex flex-col" data-theme="classic-orange">
    
    <!-- PORTADA FACEBOOK -->
    <!-- Mobile (≤1024px): siempre visible completa | Desktop: peek de 15px cuando cerrada -->
    <div 
      class="w-full relative overflow-hidden transition-all duration-700 ease-in-out max-h-[1000px]"
      :class="isCoverVisible ? 'lg:max-h-[1000px]' : 'lg:max-h-[15px]'"
    >
      <div class="facebook-cover w-full">
        <img 
          :src="coverUrl || localCover"
          alt="Abril Amoblamientos - Portada"
          class="w-full h-auto object-cover facebook-cover-img"
          @error="handleCoverError"
        />
      </div>
    </div>

    <!-- OLA ANIMADA encima del navbar -->
    <div class="navbar-wave-top" aria-hidden="true">
      <svg class="wave wave1" viewBox="0 0 1440 22" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waveTopGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   :stop-color="palette.dark"/>
            <stop offset="50%"  :stop-color="palette.primary"/>
            <stop offset="100%" :stop-color="palette.light"/>
          </linearGradient>
        </defs>
        <path d="M0,22 L1440,22 L1440,8 C1200,0 960,18 720,8 C480,0 240,18 0,8 Z" fill="url(#waveTopGrad1)"/>
      </svg>
      <svg class="wave wave2" viewBox="0 0 1440 22" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waveTopGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   :stop-color="palette.light"/>
            <stop offset="50%"  :stop-color="palette.primary"/>
            <stop offset="100%" :stop-color="palette.dark"/>
          </linearGradient>
        </defs>
        <path d="M0,22 L1440,22 L1440,14 C1080,4 720,22 360,10 C180,4 90,16 0,12 Z" fill="url(#waveTopGrad2)"/>
      </svg>
    </div>

    <!-- HEADER STICKY (Navbar + Botón Portada) -->
    <div class="sticky top-0 z-50 w-full flex flex-col shadow-xl">
      <!-- NAVBAR con colores Abril -->
      <nav class="navbar-abril relative px-4 md:px-8 py-3 flex items-center justify-between">
        <div class="flex-none">
          <RouterLink to="/" class="flex items-center gap-3 group">
            <img src="@/assets/img/logo.png" alt="Abril" class="h-10 w-auto group-hover:scale-105 transition-transform" :style="logoFilter(palette.navbarLogoColor)" />
          </RouterLink>
        </div>

        <!-- Botón Mostrar/Ocultar Portada: solo en desktop ≥1024px -->
        <div class="absolute left-1/2 -translate-x-1/2 hidden lg:flex">
          <button 
            @click="toggleCover"
            class="group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
            :style="textColorStyle(palette.navbarLinkColor)"
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
          <a href="https://www.facebook.com/abrilamoblamientossrl/" target="_blank" class="btn btn-ghost btn-sm hover:bg-white/20" :style="textColorStyle(palette.navbarLinkColor)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <!-- Admin logueado: muestra email + botón panel admin -->
          <template v-if="isLoggedIn">
            <span class="text-xs hidden md:inline" :style="textColorStyle(palette.navbarButtonColor)">{{ authStore.user }}</span>
            <RouterLink :to="{ name: 'searchProduct' }" class="btn btn-ghost btn-sm gap-1.5" :style="textColorStyle(palette.navbarButtonColor)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Admin
            </RouterLink>
          </template>
          <!-- No logueado: botón Ingresar -->
          <RouterLink v-else to="/login" class="btn-ingresar flex items-center gap-2" :style="textColorStyle(palette.navbarButtonColor)">
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
          <img src="@/assets/img/logo.png" alt="Abril" class="h-12 w-auto transition-all" :style="logoFilter(palette.footerLogoColor)" />
          <div>
            <p class="font-bold text-lg" :style="textColorStyle(palette.footerCompanyColor)">{{ palette.footerCompany }}</p>
            <p class="text-sm italic" :style="textColorStyle(palette.footerTaglineColor)">{{ palette.footerTagline }}</p>
          </div>
        </div>
        <div class="text-center md:text-right text-sm">
          <p :style="textColorStyle(palette.footerWebsiteColor)">{{ palette.footerWebsite }}</p>
          <p :style="textColorStyle(palette.footerWebsiteColor)">© {{ new Date().getFullYear() }} - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, provide } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import { useAuthStore } from '@/store/useAuth';
import localCoverImg from '@/assets/img/cover-facebook.png';

interface PaletteColors {
  dark: string;
  primary: string;
  light: string;
  cta: string;
  showOnlyWithImages: boolean;
  navbarLogoColor: string;
  navbarLinkColor: string;
  navbarButtonColor: string;
  footerLogoColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTitleColor: string;
  heroSubtitleColor: string;
  footerCompany: string;
  footerTagline: string;
  footerWebsite: string;
  footerCompanyColor: string;
  footerTaglineColor: string;
  footerWebsiteColor: string;
}

const FALLBACK: PaletteColors = {
  dark:               '#7B2D8E',
  primary:            '#9B30FF',
  light:              '#C850C0',
  cta:                '#EF7E00',
  showOnlyWithImages: false,
  navbarLogoColor:    'white',
  navbarLinkColor:    'white',
  navbarButtonColor:  'white',
  footerLogoColor:    'white',
  heroTitle:          'Encontrá lo que buscás',
  heroSubtitle:       'Los mejores productos, las mejores opciones de pago',
  heroTitleColor:     'white',
  heroSubtitleColor:  'white',
  footerCompany:      'Abril Amoblamientos',
  footerTagline:      'abril vive en vos',
  footerWebsite:      'abrilamoblamientos.com.ar',
  footerCompanyColor: 'white',
  footerTaglineColor: 'white',
  footerWebsiteColor: 'white',
};

const palette   = reactive<PaletteColors>({ ...FALLBACK });
const layoutRef = ref<HTMLElement | null>(null);

const authStore  = useAuthStore();
const isLoggedIn = computed(() => !!authStore.user);

// Proveer settings a los hijos (PublicHomeView los consume con inject)
provide('portalSettings', palette);

// ─── Cover / portada ─────────────────────────────────────────────────────────
const coverUrl   = ref<string | null>(null);
const localCover = localCoverImg;
const isCoverVisible = ref(false);

const toggleCover = () => {
  isCoverVisible.value = !isCoverVisible.value;
  if (!isCoverVisible.value) window.scrollTo({ top: 0, behavior: 'smooth' });
};
const handleCoverError = () => { coverUrl.value = null; };

// ─── Aplicar paleta al DOM ────────────────────────────────────────────────────
function applyPalette(colors: PaletteColors) {
  Object.assign(palette, colors);
  const el = layoutRef.value;
  if (el) {
    el.style.setProperty('--brand-dark',    colors.dark);
    el.style.setProperty('--brand-primary', colors.primary);
    el.style.setProperty('--brand-light',   colors.light);
    el.style.setProperty('--brand-cta',     colors.cta);
  }
}

// ─── Helpers de color ────────────────────────────────────────────────────────
function textColorStyle(color: string): Record<string, string> {
  return { color: !color || color === 'white' ? '#ffffff' : color };
}

// ─── CSS filter para el logo según el color configurado ──────────────────────
function logoFilter(color: string): Record<string, string> {
  if (!color || color === 'original') return {};
  if (color === 'white') return { filter: 'brightness(0) invert(1)' };
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return {};
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const inv  = Math.round(l * 100);
  const sat  = Math.round(Math.max(s * 3000, 100));
  const hDeg = Math.round(h * 360);
  return { filter: `brightness(0) saturate(100%) invert(${inv}%) sepia(100%) saturate(${sat}%) hue-rotate(${hDeg}deg)` };
}

// ─── Cargar paleta desde el backend al montar ─────────────────────────────────
onMounted(async () => {
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL as string;
    const res = await fetch(`${apiBase}/portal-config/palette`);
    if (res.ok) {
      const data: PaletteColors = await res.json();
      applyPalette(data);
      return;
    }
  } catch {
    // silencioso — usa fallback
  }
  applyPalette(FALLBACK);
});
</script>

<style scoped>
.public-layout {
  max-width: 100%;
  overflow-x: hidden;
  /* CSS vars con valores por defecto — sobreescritos dinámicamente por Vibrant o el panel */
  --brand-dark:    #7B2D8E;
  --brand-primary: #9B30FF;
  --brand-light:   #C850C0;
  --brand-cta:     #EF7E00;
}

/* Cover de Facebook */
.facebook-cover {
  background: var(--brand-light);
}
.facebook-cover-img {
  width: 100%;
  height: auto;
  display: block;
}

/* Navbar */
.navbar-abril {
  background: linear-gradient(90deg, var(--brand-dark) 0%, var(--brand-primary) 50%, var(--brand-light) 100%);
}

/* Botón INGRESAR */
.btn-ingresar {
  background-color: var(--brand-cta);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.btn-ingresar:hover {
  filter: brightness(1.15);
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  transform: translateY(-1px);
}

/* Footer */
.footer-abril {
  background: linear-gradient(90deg, var(--brand-dark) 0%, var(--brand-primary) 50%, var(--brand-light) 100%);
}

/* ──── OLA ANIMADA SOBRE EL NAVBAR ──── */
.navbar-wave-top {
  position: relative;
  width: 110%;
  left: -5%;
  height: 22px;
  margin-top: -18px;
  margin-bottom: -1px;
  pointer-events: none;
  z-index: 49;
  overflow: hidden;
}
.navbar-wave-top .wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.navbar-wave-top .wave1 {
  animation: wave-drift1 7s ease-in-out infinite;
}
.navbar-wave-top .wave2 {
  opacity: 0.55;
  animation: wave-drift2 4.5s ease-in-out infinite;
}
@keyframes wave-drift1 {
  0%   { transform: translateX(0); }
  50%  { transform: translateX(-4%); }
  100% { transform: translateX(0); }
}
@keyframes wave-drift2 {
  0%   { transform: translateX(0); }
  50%  { transform: translateX(4%); }
  100% { transform: translateX(0); }
}
</style>
