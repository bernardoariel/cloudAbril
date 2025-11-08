<template>
  <div role="tablist" class="tabs tabs-boxed">
    <input
      type="radio"
      name="whatsTabs"
      role="tab"
      aria-label="Ventas"
      class="tab"
      :class="
        route.name === 'ventasWs' ? 'tab-active bg-primary text-primary-content' : ''
      "
      :checked="route.name === 'ventasWs'"
      @change="go('/ventasws')"
    />
    <input
      type="radio"
      name="whatsTabs"
      role="tab"
      aria-label="Pagos"
      class="tab"
      :class="
        route.name === 'pagosWs' ? 'tab-active bg-primary text-primary-content' : ''
      "
      :checked="route.name === 'pagosWs'"
      @change="go('/pagosws')"
    />
    <input
      type="radio"
      name="whatsTabs"
      role="tab"
      aria-label="Clientes en Mora"
      class="tab"
      :class="
        route.name === 'clientesMora' ? 'tab-active bg-primary text-primary-content' : ''
      "
      :checked="route.name === 'clientesMoraWs'"
      @change="go('/clientesMora')"
    />
    <input
      type="radio"
      name="whatsTabs"
      role="tab"
      aria-label="Personalizado"
      class="tab"
      :class="
        route.name === 'personalizadoWs'
          ? 'tab-active bg-primary text-primary-content'
          : ''
      "
      :checked="route.name === 'personalizadoWs'"
      @change="go('/personalizadows')"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
function go(path: string) {
  if (route.path !== path) {
    router.push(path);
  }
}
</script>
