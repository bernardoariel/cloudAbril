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

    <h1 class="text-xl font-bold text-center flex-grow text-primary-content">{{ title }}</h1>

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
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/useAuth';
import { ejecutarTarea } from '../modules/Auth/services/actions';
import ThemeSwitcher from './ThemeSwitcher.vue';
import { useTheme } from '../composables/useTheme';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { currentTheme } = useTheme();

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
// Lista de emails de administradores
const administradoresEmails = ['mario@abrilamoblamientos.com.ar'];
const isAdmin = computed(() => administradoresEmails.includes(authStore.user));

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
  router.push({ name: 'login' }); // Redirigir al login
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
</script>
