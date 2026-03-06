<template>
  <!-- Botón flotante 🎨 -->
  <div class="palette-fab-wrap">
    <button class="palette-fab" @click="open = !open" title="Personalizar colores del portal">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.09-.705-.17-1.787.035-2.558.181-.692 1.198-5.082 1.198-5.082s-.307-.61-.307-1.514c0-1.42.824-2.482 1.848-2.482.872 0 1.294.655 1.294 1.44 0 .878-.56 2.19-.849 3.408-.242 1.016.509 1.843 1.509 1.843 1.811 0 3.204-1.909 3.204-4.665 0-2.44-1.753-4.148-4.255-4.148-2.898 0-4.6 2.173-4.6 4.42 0 .875.336 1.813.756 2.325.083.1.095.188.07.29l-.282 1.15c-.044.18-.148.218-.341.131C5.5 18.54 4.5 16.386 4.5 12 4.5 7.306 8.082 4 12 4c3.861 0 7.5 2.796 7.5 7.5 0 5.198-3.271 9.376-7.807 9.376-1.526 0-2.96-.793-3.45-1.728l-.937 3.5c-.34 1.307-1.258 2.944-1.873 3.943C7.17 21.95 9.567 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
      </svg>
    </button>

    <!-- Panel -->
    <transition name="panel-slide">
      <div v-if="open" class="palette-panel">
        <div class="palette-panel-header">
          <span class="font-bold text-sm">🎨 Paleta del portal</span>
          <button @click="open = false" class="palette-close">✕</button>
        </div>

        <div class="palette-fields">
          <label v-for="field in fields" :key="field.key" class="palette-field">
            <span class="palette-field-label">{{ field.label }}</span>
            <div class="palette-field-row">
              <input
                type="color"
                :value="local[field.key]"
                @input="(e) => local[field.key] = (e.target as HTMLInputElement).value"
                class="palette-color-input"
              />
              <span class="palette-field-hex">{{ local[field.key] }}</span>
            </div>
          </label>
        </div>

        <!-- Preview chips -->
        <div class="palette-preview">
          <span :style="{ background: `linear-gradient(90deg, ${local.dark}, ${local.primary}, ${local.light})` }" class="palette-chip">Navbar / Footer</span>
          <span :style="{ background: local.cta }" class="palette-chip">CTA / Precio</span>
        </div>

        <div class="palette-actions">
          <button class="palette-btn-save" @click="save">💾 Guardar</button>
          <button class="palette-btn-auto" @click="autoVibrant">🤖 Auto</button>
          <button class="palette-btn-reset" @click="reset">✕ Reset</button>
        </div>

        <p class="palette-hint">
          <strong>Guardar</strong>: usa estos colores.<br>
          <strong>Auto</strong>: extrae colores de la portada.<br>
          <strong>Reset</strong>: vuelve al morado original.
        </p>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

export interface PaletteColors {
  dark: string;
  primary: string;
  light: string;
  cta: string;
}

const props = defineProps<{ palette: PaletteColors }>();
const emit = defineEmits<{
  (e: 'apply', colors: PaletteColors): void;
  (e: 'reset'): void;
  (e: 'auto'): void;
}>();

const open = ref(false);

const local = reactive<PaletteColors>({ ...props.palette });

// Sync local when prop changes (e.g. after Vibrant updates)
watch(() => props.palette, (val) => {
  Object.assign(local, val);
}, { deep: true });

const fields = [
  { key: 'dark' as const,    label: 'Oscuro (navbar izq / footer izq)' },
  { key: 'primary' as const, label: 'Principal (centro)' },
  { key: 'light' as const,   label: 'Claro (acento derecha)' },
  { key: 'cta' as const,     label: 'CTA — botones y precios' },
];

const save = () => {
  emit('apply', { ...local });
  open.value = false;
};

const autoVibrant = () => {
  emit('auto');
  open.value = false;
};

const reset = () => {
  emit('reset');
  open.value = false;
};
</script>

<style scoped>
.palette-fab-wrap {
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  z-index: 9999;
}
.palette-fab {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #9B30FF, #C850C0);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(155,48,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.palette-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(155,48,255,0.55);
}

.palette-panel {
  position: absolute;
  bottom: 3.25rem;
  right: 0;
  width: 280px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 1rem;
  border: 1px solid #f0e8ff;
}
.palette-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.palette-close {
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
}
.palette-close:hover { color: #374151; }

.palette-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.palette-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.palette-field-label {
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 500;
}
.palette-field-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.palette-color-input {
  width: 2.5rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  padding: 0;
  background: none;
}
.palette-field-hex {
  font-size: 0.75rem;
  font-family: monospace;
  color: #374151;
}

.palette-preview {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.palette-chip {
  flex: 1;
  text-align: center;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.palette-actions {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}
.palette-btn-save {
  flex: 1;
  padding: 0.45rem;
  border-radius: 0.5rem;
  border: none;
  background: #9B30FF;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.palette-btn-save:hover { background: #7B2D8E; }
.palette-btn-auto {
  flex: 1;
  padding: 0.45rem;
  border-radius: 0.5rem;
  border: 1.5px solid #9B30FF;
  background: white;
  color: #9B30FF;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.palette-btn-auto:hover { background: #f3e8ff; }
.palette-btn-reset {
  padding: 0.45rem 0.6rem;
  border-radius: 0.5rem;
  border: 1.5px solid #e5e7eb;
  background: white;
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.palette-btn-reset:hover { border-color: #ef4444; color: #ef4444; }

.palette-hint {
  font-size: 0.65rem;
  color: #9ca3af;
  line-height: 1.5;
}

/* Animación del panel */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}
</style>
