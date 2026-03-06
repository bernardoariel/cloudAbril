<template>
  <div class="portal-config-view max-w-3xl mx-auto px-4 py-8">
    
    <!-- Título -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-base-content flex items-center gap-3">
        <span class="text-3xl">🎨</span>
        Colores del Portal Público
      </h2>
      <p class="text-base-content/60 text-sm mt-1">
        Los cambios se aplican para <strong>todos los visitantes</strong> del portal en tiempo real.
      </p>
    </div>

    <!-- Estado -->
    <div v-if="saveStatus" 
         class="alert mb-6 text-sm"
         :class="saveStatus === 'ok' ? ['alert-success'] : ['alert-error']">
      {{ saveStatus === 'ok' ? '✅ Paleta guardada correctamente para todos los usuarios.' : '❌ Error al guardar. Intentá de nuevo.' }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- ── Panel de pickers ── -->
      <div class="card bg-base-100 shadow-lg border border-base-300">
        <div class="card-body p-6">
          <h3 class="font-bold text-base-content mb-4">Colores de la paleta</h3>

          <div class="space-y-4">
            <label v-for="field in fields" :key="field.key" class="block">
              <span class="text-sm font-medium text-base-content/70 mb-1 block">{{ field.label }}</span>
              <div class="flex items-center gap-3">
                <input
                  type="color"
                  :value="local[field.key]"
                  @input="(e) => { local[field.key] = (e.target as HTMLInputElement).value; }"
                  class="color-swatch cursor-pointer rounded-lg border-2 border-base-300 focus:outline-none focus:border-primary"
                  style="width: 48px; height: 40px; padding: 2px;"
                />
                <span class="font-mono text-sm text-base-content/60">{{ local[field.key] }}</span>
                <div class="flex-1 rounded-lg h-8" :style="{ background: local[field.key] }"></div>
              </div>
            </label>
          </div>

          <!-- Preview gradiente -->
          <div class="mt-5">
            <span class="text-xs text-base-content/50 uppercase tracking-wider">Preview navbar / footer</span>
            <div class="rounded-xl h-10 mt-1" :style="previewGradient"></div>
          </div>

          <!-- Botones -->
          <div class="mt-6 flex flex-col gap-2">
            <button
              @click="extractFromCover"
              :disabled="extractingVibrant"
              class="btn btn-outline btn-sm gap-2"
            >
              <span v-if="extractingVibrant" class="loading loading-spinner loading-xs"></span>
              🤖 Extraer de la portada actual
            </button>
            <button
              @click="savePalette"
              :disabled="saving"
              class="btn btn-primary gap-2"
            >
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              💾 Guardar para todos
            </button>
            <button @click="resetToFallback" class="btn btn-ghost btn-sm text-error">
              ↩ Restaurar colores por defecto
            </button>
          </div>
        </div>
      </div>

      <!-- ── Preview de la portada ── -->
      <div class="card bg-base-100 shadow-lg border border-base-300 overflow-hidden">
        <div class="card-body p-0">
          <div class="relative">
            <img
              ref="coverRef"
              :src="coverSrc"
              alt="Portada del mes"
              class="w-full object-cover"
              style="max-height: 260px;"
              crossorigin="anonymous"
            />
            <!-- Overlay degradado con los colores actuales -->
            <div
              class="absolute inset-x-0 bottom-0 h-16"
              :style="previewGradient + '; opacity: 0.85;'"
            ></div>
          </div>
          <div class="p-4">
            <p class="text-xs text-base-content/50">Portada del mes actual</p>
            <p class="text-xs text-base-content/40 mt-1">
              Usá "Extraer de la portada" para que Vibrant.js detecte los colores principales de esta imagen automáticamente.
            </p>
          </div>
        </div>
      </div>

    </div>

    <!-- Imagen oculta para Vibrant (carga la portada con crossOrigin) -->
    <canvas ref="hiddenCanvas" class="hidden"></canvas>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { abrilApiData } from '@/api/abrilApiData';
import coverImg from '@/assets/img/cover-facebook.png';

interface PaletteColors {
  dark: string;
  primary: string;
  light: string;
  cta: string;
}

const FALLBACK: PaletteColors = {
  dark:    '#7B2D8E',
  primary: '#9B30FF',
  light:   '#C850C0',
  cta:     '#EF7E00',
};

const local = reactive<PaletteColors>({ ...FALLBACK });
const saving = ref(false);
const saveStatus = ref<'ok' | 'error' | null>(null);
const extractingVibrant = ref(false);
const coverRef = ref<HTMLImageElement | null>(null);
const coverSrc = coverImg;

const fields = [
  { key: 'dark' as keyof PaletteColors,    label: 'Oscuro (fondo principio)'         },
  { key: 'primary' as keyof PaletteColors, label: 'Principal (fondo centro)'          },
  { key: 'light' as keyof PaletteColors,   label: 'Claro (fondo final)'               },
  { key: 'cta' as keyof PaletteColors,     label: 'CTA · Naranja (botones / precios)' },
];

const previewGradient = computed(() =>
  `background: linear-gradient(90deg, ${local.dark} 0%, ${local.primary} 50%, ${local.light} 100%)`
);

// ─── Cargar paleta guardada ────────────────────────────────────────────────
onMounted(async () => {
  try {
    const { data } = await abrilApiData.get<PaletteColors>('/portal-config/palette');
    Object.assign(local, data);
  } catch {
    Object.assign(local, FALLBACK);
  }
});

// ─── Guardar paleta en el backend ──────────────────────────────────────────
async function savePalette() {
  saving.value = true;
  saveStatus.value = null;
  try {
    await abrilApiData.put('/portal-config/palette', { ...local });
    saveStatus.value = 'ok';
  } catch {
    saveStatus.value = 'error';
  } finally {
    saving.value = false;
    setTimeout(() => { saveStatus.value = null; }, 4000);
  }
}

// ─── Extraer colores con Vibrant.js (browser-side, desde el panel admin) ──
// Para n8n la extracción se hace server-side via POST /api/portal-config/extract
async function extractFromCover() {
  extractingVibrant.value = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Vibrant } = (await import('node-vibrant/browser')) as any;
    const palette = await Vibrant.from(coverSrc).getPalette();
    local.dark    = palette.DarkVibrant?.hex  ?? FALLBACK.dark;
    local.primary = palette.Vibrant?.hex      ?? FALLBACK.primary;
    local.light   = palette.LightVibrant?.hex ?? FALLBACK.light;
    local.cta     = FALLBACK.cta; // CTA siempre naranja Abril
  } catch (e) {
    console.error('Vibrant error:', e);
  } finally {
    extractingVibrant.value = false;
  }
}

// ─── Restaurar fallback (llama al backend para afectar a todos) ───────────
async function resetToFallback() {
  try {
    const { data } = await abrilApiData.post<PaletteColors>('/portal-config/reset');
    Object.assign(local, data);
    saveStatus.value = 'ok';
    setTimeout(() => { saveStatus.value = null; }, 3000);
  } catch {
    Object.assign(local, FALLBACK);
  }
}
</script>

<style scoped>
.portal-config-view {
  min-height: 100vh;
  padding-bottom: 4rem;
}
</style>
