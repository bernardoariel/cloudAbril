<template>
  <div role="tablist" class="tabs tabs-boxed">
    <input
      type="radio"
      name="whatsTabs"
      role="tab"
      aria-label="Ventas"
      class="tab tab-ventas"
      :class="route.name === 'ventasWs' ? 'tab-active' : ''"
      :checked="route.name === 'ventasWs'"
      @change="go('/ventasws')"
    />
    <input
      type="radio"
      name="whatsTabs"
      role="tab"
      aria-label="Pagos"
      class="tab tab-pagos"
      :class="route.name === 'pagosWs' ? 'tab-active' : ''"
      :checked="route.name === 'pagosWs'"
      @change="go('/pagosws')"
    />
    <input
      type="radio"
      name="whatsTabs"
      role="tab"
      aria-label="📱 Historial"
      class="tab tab-historial"
      :class="route.name === 'whatsappHistorial' ? 'tab-active' : ''"
      :checked="route.name === 'whatsappHistorial'"
      @change="go('/whatsapp/historial')"
    />
    <input
      type="radio"
      name="whatsTabs"
      role="tab"
      aria-label="✍️ Personalizado"
      class="tab tab-personalizado"
      :class="route.name === 'whatsappPersonalizado' ? 'tab-active' : ''"
      :checked="route.name === 'whatsappPersonalizado'"
      @change="go('/whatsapp/personalizado')"
    />
    <!-- <input
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
    /> -->
    <!-- <input
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
    /> -->
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();
function go(path: string) {
  if (route.path !== path) {
    router.push(path);
  }
}
</script>

<style scoped>
/* Estilos base para los tabs */
.tab {
  color: var(--bc) !important;
  background-color: transparent !important;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 0.75rem;
  font-weight: 500;
}

.tab:hover {
  background-color: var(--b3) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Estilos específicos para Ventas - Verde */
.tab-ventas.tab-active {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.tab-ventas:hover:not(.tab-active) {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)) !important;
  color: #059669 !important;
}

/* Estilos específicos para Pagos - Azul */
.tab-pagos.tab-active {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.tab-pagos:hover:not(.tab-active) {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1)) !important;
  color: #2563eb !important;
}

/* Estilos específicos para Historial - Púrpura */
.tab-historial.tab-active {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.tab-historial:hover:not(.tab-active) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1)) !important;
  color: #7c3aed !important;
}

/* Estilos específicos para Personalizado - Naranja */
.tab-personalizado.tab-active {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.tab-personalizado:hover:not(.tab-active) {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)) !important;
  color: #d97706 !important;
}

/* Contenedor de tabs */
.tabs-boxed {
  background: linear-gradient(135deg, var(--b1), var(--b2)) !important;
  padding: 0.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border: 1px solid var(--b3);
}

/* Efectos adicionales para mejor UX */
.tab-active {
  transform: translateY(-2px) !important;
}

.tab-active::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: currentColor;
  border-radius: 0 0 1rem 1rem;
  opacity: 0.7;
}

/* Animación de entrada */
.tab {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
