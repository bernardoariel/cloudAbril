<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Eliminación de Datos</h1>
        
        <div class="prose max-w-none">
          <p class="text-gray-600 mb-4">
            <strong>Última actualización:</strong> 13 de diciembre de 2025
          </p>
          
          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Tu derecho a la eliminación de datos</h2>
          <p class="mb-4">
            En CloudAbril respetamos tu privacidad y tu derecho a controlar tu información personal. Puedes solicitar la eliminación de tus datos personales en cualquier momento.
          </p>
          
          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">¿Qué datos podemos eliminar?</h2>
          <p class="mb-4">
            Podemos eliminar la siguiente información asociada a tu cuenta:
          </p>
          <ul class="list-disc pl-6 mb-4">
            <li>Número de teléfono y datos de contacto</li>
            <li>Historial de conversaciones</li>
            <li>Información de pedidos (sujeto a obligaciones legales)</li>
            <li>Preferencias y configuraciones</li>
            <li>Datos de interacciones con nuestro servicio</li>
          </ul>
          
          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Cómo solicitar la eliminación</h2>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-medium text-blue-800 mb-2">Proceso de solicitud:</h3>
            <ol class="list-decimal pl-6 text-blue-700">
              <li class="mb-2">Envía un mensaje a nuestro WhatsApp oficial</li>
              <li class="mb-2">Indica claramente que deseas eliminar tus datos</li>
              <li class="mb-2">Proporciona tu número de teléfono para verificación</li>
              <li class="mb-2">Confirma tu identidad si es requerido</li>
              <li class="mb-2">Recibirás confirmación una vez procesada la solicitud</li>
            </ol>
          </div>
          
          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Tiempo de procesamiento</h2>
          <p class="mb-4">
            Tu solicitud será procesada en un plazo máximo de 30 días calendario. Te notificaremos una vez que la eliminación haya sido completada.
          </p>
          
          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Excepciones importantes</h2>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-medium text-yellow-800 mb-2">Datos que podríamos conservar:</h3>
            <ul class="list-disc pl-6 text-yellow-700">
              <li>Información requerida por obligaciones legales</li>
              <li>Datos necesarios para resolver disputas pendientes</li>
              <li>Información de transacciones para cumplir con regulaciones fiscales</li>
              <li>Registros de seguridad por el tiempo mínimo requerido</li>
            </ul>
          </div>
          
          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Consecuencias de la eliminación</h2>
          <p class="mb-4">
            Al solicitar la eliminación de tus datos:
          </p>
          <ul class="list-disc pl-6 mb-4">
            <li>Ya no podrás acceder a tu historial de conversaciones</li>
            <li>Perderás el acceso a información de pedidos anteriores</li>
            <li>Deberás proporcionarnos nuevamente tu información si decides usar nuestros servicios en el futuro</li>
            <li>Algunos servicios personalizados podrían no estar disponibles</li>
          </ul>
          
          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Contacto</h2>
          <p class="mb-4">
            Para solicitar la eliminación de tus datos o si tienes preguntas sobre este proceso, contáctanos a través de nuestro WhatsApp oficial.
          </p>
          
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <p class="text-sm text-gray-600">
              <strong>Nota:</strong> Esta página cumple con los requisitos de Meta/WhatsApp para negocios que procesan datos de usuarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Lógica del componente si es necesaria
</script>

<style scoped>
.prose h2 {
  @apply text-xl font-semibold text-gray-800 mt-6 mb-3;
}

.prose h3 {
  @apply text-lg font-medium mb-2;
}

.prose p {
  @apply mb-4 text-gray-600;
}

.prose ul {
  @apply list-disc pl-6 mb-4;
}

.prose ol {
  @apply list-decimal pl-6;
}

.prose li {
  @apply text-gray-600;
}
</style>