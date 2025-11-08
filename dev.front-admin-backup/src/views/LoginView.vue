<template>
  <div class="flex flex-col items-center justify-center h-screen bg-orangeCustom3Translucent">
    <!-- Imagen en la parte superior del formulario -->
    <div class="w-full max-w-xs mb-4">
      <img src="@/assets/img/logo2.png" alt="Login" class="w-50 h-auto mx-auto rounded-lg" />
    </div>

    <div class="w-full max-w-xs">
      <h1 class="text-2xl font-bold mb-4 text-center">Login</h1>
      <input
        v-model="email"
        type="text"
        placeholder="Email"
        class="input input-bordered w-full mb-4"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="input input-bordered w-full mb-4"
      />
      <button
        @click="handleLogin"
        class="w-full bg-orangeCustom text-white py-2 px-4 rounded hover:bg-orangeCustom1"
      >
        Conectarse
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { abrilApiData } from '@/api/abrilApiData';
import { useRouter } from 'vue-router';
import { login } from '../modules/Auth/services/actions';
import { useAuthStore } from '../store/useAuth';

const router = useRouter();
// Definir variables reactivas para email y password
const authStore = useAuthStore();
const email = ref(''); //mario@abrilamoblamientos.com.ar
const password = ref(''); //appmario125

// Función para manejar el login
const handleLogin = async () => {
  const result = await login(email.value, password.value); // Usar la función login desde actions.ts

  if (result.success) {
    authStore.setUser(email.value);
    router.push({ name: 'searchProduct' }); // Redirigir después del login
  } else {
    console.error('Error al iniciar sesión:', result.error);
    alert('Error al iniciar sesión. Revisa tus credenciales.');
  }
};
</script>
