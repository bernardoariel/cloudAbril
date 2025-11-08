<template>
  <div class="card lg:card-side bg-base-100 shadow-xl p-2">
    <h2 class="font-bold text-center">Error</h2>
    <p class="text-center">No se ha encontrado el producto solicitado</p>
    <button @click="goBack" class="mt-4 btn btn-primary py-2 px-4 rounded">Volver</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.replace({ name: 'searchProduct' });
};
</script>

<style scoped>
/* Aquí puedes agregar estilos personalizados si es necesario */
</style>
