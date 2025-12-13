<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title?: string | null;              // ej: teléfono
  subtitle?: string | null;           // ej: en línea / Seleccione...
  message?: string | null;            // texto a mostrar
  isEmpty?: boolean;                  // si no hay item seleccionado
  placeholderMessage?: string;        // mensaje cuando es null
}>();

const headerTitle = computed(() => props.title || 'Cliente');
const headerSubtitle = computed(() =>
  props.subtitle || (props.isEmpty ? 'Seleccione un item' : 'en línea'),
);

const bubbleText = computed(() => {
  if (!props.isEmpty && props.message) return props.message;
  return props.placeholderMessage || 'Seleccione un item para visualizar el mensaje';
});

const bubbleClass = computed(() =>
  props.isEmpty ? 'bg-gray-200 text-gray-600' : 'bg-green-500 text-white',
);
</script>

<template>
  <div class="mockup-phone">
    <div class="camera"></div>

    <div class="display">
      <div class="artboard artboard-demo phone-1 bg-green-50">
        <!-- Header -->
        <div class="bg-green-600 text-white p-3 rounded-t-lg">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div>
              <div class="font-semibold text-sm">{{ headerTitle }}</div>
              <div class="text-xs opacity-80">{{ headerSubtitle }}</div>
            </div>
          </div>
        </div>

        <!-- Bubble -->
        <div class="p-3">
          <div class="chat chat-end">
            <div class="chat-bubble text-sm max-w-none" :class="bubbleClass">
              {{ bubbleText }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mockup-phone .display .artboard {
  min-height: 600px;
  height: auto;
  overflow-y: auto;
}

.chat {
  align-items: flex-end;
}

.chat-bubble {
  position: relative;
  padding: 0.75rem;
  border-radius: 1rem;
  max-width: 95%;
  min-width: 60%;
  width: fit-content;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.35;
}

.chat-end .chat-bubble {
  border-bottom-right-radius: 0.25rem;
}

.mockup-phone .camera {
  background: #1f2937;
}

.mockup-phone {
  transform: scale(1.05);
}

.mockup-phone .display {
  height: 560px;
}

</style>
