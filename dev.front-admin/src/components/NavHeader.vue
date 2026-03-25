<template>
  <div class="flex items-center justify-center p-4 bg-primary h-16">
    <!-- Botón Volver -->
    <button v-if="showBackButton" @click="goBack" class="btn btn-ghost mr-4">Volver</button>

    <!-- Botón Limpiar -->
    <button
      v-else-if="hasQueries"
      @click="clearQuery"
      class="btn btn-ghost text-red-600 font-semibold mr-4"
    >
      Limpiar
    </button>

    <h1 class="text-xl font-bold text-center flex-grow text-primary-content flex items-center justify-center gap-3">
      {{ title }}
      <!-- Badge del modo (solo se muestra si no es producción) -->
      <span v-if="currentMode && currentMode !== 'produccion'" 
            :class="modeBadgeClass"
            class="px-2 py-1 text-xs font-medium rounded-full">
        {{ currentMode.toUpperCase() }}
      </span>
      
      <!-- Campanita de notificaciones de WhatsApp (solo para admin) -->
      <div v-if="isAdmin" class="relative cursor-pointer" @click="goToWhatsappMessages">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6 text-primary-content hover:text-warning transition-colors" 
          :class="{ 'animate-pulse': hasNewMessages }"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        <!-- Badge con el número de mensajes no leídos -->
        <span 
          v-if="hasNewMessages"
          class="absolute -top-2 -right-2 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </div>
    </h1>

    <!-- Botón Portal (solo para admin) -->
    <RouterLink
      v-if="isAdmin"
      :to="{ name: 'publicHome' }"
      class="btn btn-ghost btn-sm text-primary-content gap-1.5"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      Portal
    </RouterLink>

    <!-- Botón de Elipsis con Dropdown -->
    <div class="relative inline-block text-left" ref="dropdownRef">
      <button
        @click="toggleDropdown"
        class="flex items-center justify-center w-10 h-10 text-primary-content rounded-full hover:bg-primary-focus focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M10 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 8a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
          />
        </svg>
      </button>

      <!-- Opciones del Dropdown -->
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 mt-3 w-80 bg-base-100 border border-base-300 rounded-2xl shadow-2xl z-50 backdrop-blur-sm"
        style="background: hsl(var(--b1) / 0.95)"
      >
        <div class="p-1">
          <!-- Theme Switcher Section -->
          <div class="p-5 border-b border-base-300/30">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 rounded-xl bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 18.5A6.5 6.5 0 1 1 5.5 12H2a10 10 0 1 0 20 0h-3.5A6.5 6.5 0 0 1 12 18.5Z"/>
                  <path d="M12 2a10 10 0 0 1 10 10h-3.5a6.5 6.5 0 1 0-13 0H2A10 10 0 0 1 12 2Z"/>
                </svg>
              </div>
              <div>
                <div class="text-sm font-bold text-base-content">
                  Personalización
                </div>
                <div class="text-xs text-base-content/60">
                  Elige tu tema favorito
                </div>
              </div>
            </div>
            <ThemeSwitcher :show-labels="false" />
          </div>

          <!-- Opciones exclusivas de administradores -->
          <div v-if="isAdmin" class="p-1">
            <!-- Configurar colores del portal -->
            <button
              @click="goToPortalConfig"
              class="flex items-center gap-3 w-full p-3 text-sm rounded-xl transition-all duration-300 hover:bg-base-200 group"
            >
              <div class="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 2.136.675 4.116 1.821 5.741L2.5 20.5l2.759-1.321A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16A8 8 0 0112 4zm-1 4a1 1 0 100 2 1 1 0 000-2zm3 0a1 1 0 100 2 1 1 0 000-2zm-5.5 4a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2zm2.5 0a1 1 0 100 2 1 1 0 000-2z"/>
                </svg>
              </div>
              <div class="text-left">
                <div class="font-semibold text-base-content">Colores del Portal</div>
                <div class="text-xs text-base-content/60">Paleta del portal público</div>
              </div>
            </button>

            <button
              @click="handleTaskExecution"
              class="flex items-center gap-3 w-full p-3 text-sm rounded-xl transition-all duration-300 hover:bg-base-200 group"
            >
              <div class="p-2 rounded-lg bg-info/10 group-hover:bg-info/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div class="text-left">
                <div class="font-semibold text-base-content">Actualizar Credenciales</div>
                <div class="text-xs text-base-content/60">Renovar configuración</div>
              </div>
            </button>
          </div>
          
          <!-- Opción Cerrar Sesión visible para todos -->
          <div class="p-1">
            <button
              @click="handleLogout"
              class="flex items-center gap-3 w-full p-3 text-sm rounded-xl transition-all duration-300 hover:bg-error/10 group"
            >
              <div class="p-2 rounded-lg bg-error/10 group-hover:bg-error/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div class="text-left">
                <div class="font-semibold text-base-content">Cerrar Sesión</div>
                <div class="text-xs text-base-content/60">Salir de la aplicación</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../store/useAuth';
import { ejecutarTarea } from '../modules/Auth/services/actions';
import ThemeSwitcher from './ThemeSwitcher.vue';
import { useTheme } from '../composables/useTheme';
import { useWhatsappNotifications } from '../composables/useWhatsappNotifications';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { currentTheme } = useTheme();
const { unreadCount, hasNewMessages, isAdmin, markAsRead } = useWhatsappNotifications();

// Debug info
const domTheme = ref('');
const storedTheme = ref('');

// Actualizar debug info
const updateDebugInfo = () => {
  domTheme.value = document.documentElement.getAttribute('data-theme') || 'ninguno';
  storedTheme.value = localStorage.getItem('theme-preference') || 'ninguno';
};

const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null); // 🔹 NUEVO: Referencia al dropdown

// Función para alternar el dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
const closeDropdownOnClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
};

// Obtener el modo actual desde las variables de entorno
const currentMode = ref(import.meta.env.VITE_MODE || '');

// Clases para el badge del modo
const modeBadgeClass = computed(() => {
  switch (currentMode.value) {
    case 'local':
      return 'bg-blue-500 text-white';
    case 'qa':
      return 'bg-yellow-500 text-black';
    default:
      return 'bg-gray-500 text-white';
  }
});

// Mostrar el botón de "Volver" basado en la ruta
const showBackButton = computed(() => {
  return !['login', 'searchProduct'].includes(route.name as string);
});

// Título dinámico basado en la metadata de la ruta
const title = computed(() => {
  return route.meta.title || 'Default Title';
});

// Verificar si hay queries activas
const hasQueries = computed(() => {
  const { search, marca, descripcion } = route.query;
  return Boolean(search || marca || descripcion);
});

// Función para ejecutar una tarea
const handleTaskExecution = async () => {
  isDropdownOpen.value = false; // Cerrar el dropdown
  const result = await ejecutarTarea();

  if (result.success) {
    console.log('Tarea ejecutada exitosamente:', result.data);
    alert('Tarea ejecutada exitosamente.');
  } else {
    console.error('Error al ejecutar la tarea:', result.error);
    alert('Error al ejecutar la tarea.');
  }
};

// Función para cerrar sesión
const handleLogout = () => {
  authStore.clearUser(); // Limpiar usuario del store
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
  isDropdownOpen.value = false; // Cerrar el dropdown
  router.push({ name: 'publicHome' }); // Redirigir al portal público
};

// Navegar a configuración del portal
const goToPortalConfig = () => {
  isDropdownOpen.value = false;
  router.push({ name: 'portalConfig' });
};

const goToPortal = () => {
  router.push({ name: 'publicHome' });
};

// Función para ir atrás
const goBack = () => {
  const previousRouteData = localStorage.getItem('previousRoute');
  const productListQueryData = localStorage.getItem('productListQuery');

  if (!previousRouteData) {
    router.replace({ name: 'searchProduct' });
    return;
  }

  try {
    const previousRoute = JSON.parse(previousRouteData);
    const productListQuery = productListQueryData ? JSON.parse(productListQueryData) : null;

    if (previousRoute.name === 'productList' && productListQuery) {
      if (route.name === 'productList') {
        router.replace({ name: 'searchProduct', query: productListQuery });
        return;
      }
      router.replace({ name: previousRoute.name, query: productListQuery });
    } else if (productListQuery && Object.keys(productListQuery).length >= 2) {
      router.replace({ name: previousRoute.name, query: productListQuery });
    } else {
      router.replace({ name: previousRoute.name });
    }
  } catch (error) {
    console.error('Error al parsear localStorage:', error);
    router.replace({ name: 'searchProduct' });
  }
};
onMounted(() => {
  document.addEventListener('click', closeDropdownOnClickOutside); // 🔹 Se activa al montar el componente
  updateDebugInfo();

  // Actualizar debug info cada segundo
  setInterval(updateDebugInfo, 1000);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnClickOutside); // 🔹 Se limpia al desmontar el componente
});

// Watch para actualizar debug cuando cambie el tema
watch(currentTheme, () => {
  updateDebugInfo();
});

// Función para limpiar las queries
const clearQuery = () => {
  router.replace({ name: route.name, query: {} }); // Limpia las queries de la URL
};

// Función para navegar a los mensajes de WhatsApp
const goToWhatsappMessages = () => {
  markAsRead();
  router.push({ name: 'whatsappWebhook' });
};
</script>
