<template>
  <div class="flex flex-col h-full justify-start items-center pt-10">
    <h1 class="text-3xl font-bold mb-4">{{ props.title }}</h1>
    <p class="mb-4">{{ props.message }}</p>
    <button @click="goBack" class="btn btn-primary">{{ props.buttonText }}</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
interface Props {
  title: string;
  message: string;
  buttonText: string;
  redirectUrl: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: '404 - Not Found',
  message: 'La página que buscas no existe.',
  buttonText: 'Ir al inicio',
  redirectUrl: '/',
});
const goBack = () => {
  router.replace({ name: 'searchProduct' });
};
</script>
