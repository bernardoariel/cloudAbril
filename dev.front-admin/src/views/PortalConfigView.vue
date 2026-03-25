<template>
  <div class="portal-config-view max-w-5xl mx-auto px-4 py-8">

    <!-- Título -->
    <div class="mb-6">
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
         class="alert mb-5 text-sm"
         :class="saveStatus === 'ok' ? ['alert-success'] : ['alert-error']">
      {{ saveStatus === 'ok' ? '✅ Paleta guardada correctamente.' : `❌ Error al guardar${saveErrorCode ? ` (${saveErrorCode})` : ''}. Intentá de nuevo.` }}
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- CARD ÚNICA unificada                                           -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="card bg-base-100 shadow-lg border border-base-300">
      <div class="card-body p-0">

        <!-- ── FILA 1: Portada + Paleta de colores (2 cols) ────────── -->
        <div class="grid grid-cols-1 md:grid-cols-2">

          <!-- Columna A: Cover + botón Extraer -->
          <div class="p-6 border-b md:border-b-0 md:border-r border-base-300">
            <h3 class="font-bold text-base-content mb-3 flex items-center gap-2">
              <span>📷</span> Portada del mes
            </h3>
            <div class="relative rounded-xl overflow-hidden mb-3">
              <img
                ref="coverRef"
                :src="coverSrc"
                alt="Portada"
                class="w-full object-cover"
                style="max-height: 200px;"
                crossorigin="anonymous"
              />
              <div class="absolute inset-x-0 bottom-0 h-10" :style="previewGradient + '; opacity: 0.75;'"></div>
            </div>
            <!-- Preview gradiente -->
            <div class="rounded-lg h-6 mb-3" :style="previewGradient"></div>
            <button
              @click="extractFromCover"
              :disabled="extractingVibrant"
              class="btn btn-outline btn-sm gap-2 w-full"
            >
              <span v-if="extractingVibrant" class="loading loading-spinner loading-xs"></span>
              🤖 Extraer colores de la portada
            </button>
          </div>

          <!-- Columna B: Paleta de 4 colores -->
          <div class="p-6 border-b border-base-300">
            <h3 class="font-bold text-base-content mb-3 flex items-center gap-2">
              <span>🎨</span> Paleta de colores
            </h3>
            <div class="space-y-3">
              <label v-for="field in fields" :key="field.key" class="block">
                <span class="text-xs font-medium text-base-content/60 mb-1 block">{{ field.label }}</span>
                <div class="flex items-center gap-3">
                  <input
                    type="color"
                    :value="local[field.key]"
                    @input="(e) => { local[field.key] = (e.target as HTMLInputElement).value; }"
                    class="cursor-pointer rounded-lg border-2 border-base-300 focus:outline-none focus:border-primary shrink-0"
                    style="width: 44px; height: 36px; padding: 2px;"
                  />
                  <span class="font-mono text-xs text-base-content/50 w-[5.5rem] shrink-0">{{ local[field.key] }}</span>
                  <div class="flex-1 rounded-lg h-7" :style="{ background: local[field.key] }"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- ── SECCIÓN: Navbar ──────────────────────────────────────── -->
        <div class="p-6 border-b border-base-300">
          <h3 class="font-bold text-base-content mb-1 flex items-center gap-2">
            <span>🔝</span> Navbar
          </h3>
          <p class="text-xs text-base-content/50 mb-4">Barra superior del portal público.</p>

          <!-- Preview navbar real -->
          <div class="rounded-xl mb-4 px-5 py-3 flex items-center justify-between relative" :style="previewGradient">
            <img src="@/assets/img/logo.png" alt="logo" class="h-8 object-contain" :style="logoStyle(local.navbarLogoColor)" />
            <span class="absolute left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider" :style="textColorStyle(local.navbarLinkColor)">VER PORTADA DEL MES</span>
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" :style="textColorStyle(local.navbarLinkColor)"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span class="text-xs" :style="textColorStyle(local.navbarButtonColor)">usuario@email.com</span>
              <span class="text-xs font-bold uppercase px-3 py-1 rounded-full" :style="{ color: textColorStyle(local.navbarButtonColor).color, background: 'rgba(255,255,255,0.2)' }">INGRESAR</span>
            </div>
          </div>

          <p class="text-xs font-medium text-base-content/60 mb-2">Color del logo</p>
          <div class="flex gap-2 flex-wrap mb-4">
            <button @click="local.navbarLogoColor = 'white'" class="btn btn-sm" :class="local.navbarLogoColor === 'white' ? 'btn-primary' : 'btn-outline'">⬜ Blanco</button>
            <button @click="local.navbarLogoColor = 'original'" class="btn btn-sm" :class="local.navbarLogoColor === 'original' ? 'btn-primary' : 'btn-outline'">🟠 Original</button>
            <label class="btn btn-sm gap-2" :class="isCustomColor(local.navbarLogoColor) ? 'btn-primary' : 'btn-outline'">
              🎨 Custom
              <input type="color" :value="isCustomColor(local.navbarLogoColor) ? local.navbarLogoColor : '#ffffff'" @input="(e) => { local.navbarLogoColor = (e.target as HTMLInputElement).value; }" class="w-6 h-6 cursor-pointer" />
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-medium text-base-content/60 mb-2">Color "Ver Portada del Mes" e ícono Facebook</p>
              <div class="flex gap-2 flex-wrap">
                <button @click="local.navbarLinkColor = 'white'" class="btn btn-sm" :class="local.navbarLinkColor === 'white' ? 'btn-primary' : 'btn-outline'">⬜ Blanco</button>
                <label class="btn btn-sm gap-2" :class="isCustomColor(local.navbarLinkColor) ? 'btn-primary' : 'btn-outline'">
                  🎨 Custom
                  <input type="color" :value="isCustomColor(local.navbarLinkColor) ? local.navbarLinkColor : '#ffffff'" @input="(e) => { local.navbarLinkColor = (e.target as HTMLInputElement).value; }" class="w-6 h-6 cursor-pointer" />
                </label>
              </div>
            </div>
            <div>
              <p class="text-xs font-medium text-base-content/60 mb-2">Color &quot;Ingresar&quot; / usuario logueado</p>
              <div class="flex gap-2 flex-wrap">
                <button @click="local.navbarButtonColor = 'white'" class="btn btn-sm" :class="local.navbarButtonColor === 'white' ? 'btn-primary' : 'btn-outline'">⬜ Blanco</button>
                <label class="btn btn-sm gap-2" :class="isCustomColor(local.navbarButtonColor) ? 'btn-primary' : 'btn-outline'">
                  🎨 Custom
                  <input type="color" :value="isCustomColor(local.navbarButtonColor) ? local.navbarButtonColor : '#ffffff'" @input="(e) => { local.navbarButtonColor = (e.target as HTMLInputElement).value; }" class="w-6 h-6 cursor-pointer" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- ── SECCIÓN: Hero ───────────────────────────────────────── -->
        <div class="p-6 border-b border-base-300">
          <h3 class="font-bold text-base-content mb-1 flex items-center gap-2">
            <span>🏠</span> Hero (sección de bienvenida)
          </h3>
          <p class="text-xs text-base-content/50 mb-4">Texto que ven los visitantes al entrar al portal.</p>

          <!-- Preview hero real -->
          <div class="rounded-xl mb-4 py-5 px-6 text-center" :style="previewGradient">
            <p class="text-xl font-extrabold drop-shadow mb-1" :style="textColorStyle(local.heroTitleColor)">{{ local.heroTitle || 'Encontrá lo que buscás' }}</p>
            <p class="text-sm" :style="textColorStyle(local.heroSubtitleColor)">{{ local.heroSubtitle || 'Los mejores productos...' }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs font-medium text-base-content/60">Título principal</label>
                <div class="flex gap-1">
                  <button @click="local.heroTitleColor = 'white'" class="btn btn-xs" :class="local.heroTitleColor === 'white' ? 'btn-primary' : 'btn-outline'">⬜</button>
                  <label class="btn btn-xs gap-1" :class="isCustomColor(local.heroTitleColor) ? 'btn-primary' : 'btn-outline'">
                    🎨
                    <input type="color" :value="isCustomColor(local.heroTitleColor) ? local.heroTitleColor : '#ffffff'" @input="(e) => { local.heroTitleColor = (e.target as HTMLInputElement).value; }" class="w-4 h-4 cursor-pointer" />
                  </label>
                </div>
              </div>
              <input v-model="local.heroTitle" type="text" class="input input-bordered input-sm w-full" placeholder="Encontrá lo que buscás" maxlength="80" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs font-medium text-base-content/60">Subtítulo</label>
                <div class="flex gap-1">
                  <button @click="local.heroSubtitleColor = 'white'" class="btn btn-xs" :class="local.heroSubtitleColor === 'white' ? 'btn-primary' : 'btn-outline'">⬜</button>
                  <label class="btn btn-xs gap-1" :class="isCustomColor(local.heroSubtitleColor) ? 'btn-primary' : 'btn-outline'">
                    🎨
                    <input type="color" :value="isCustomColor(local.heroSubtitleColor) ? local.heroSubtitleColor : '#ffffff'" @input="(e) => { local.heroSubtitleColor = (e.target as HTMLInputElement).value; }" class="w-4 h-4 cursor-pointer" />
                  </label>
                </div>
              </div>
              <input v-model="local.heroSubtitle" type="text" class="input input-bordered input-sm w-full" placeholder="Los mejores productos..." maxlength="120" />
            </div>
          </div>
        </div>

        <!-- ── SECCIÓN: Footer ─────────────────────────────────────── -->
        <div class="p-6 border-b border-base-300">
          <h3 class="font-bold text-base-content mb-1 flex items-center gap-2">
            <span>🦶</span> Footer
          </h3>
          <p class="text-xs text-base-content/50 mb-4">Pie de página del portal público.</p>

          <!-- Preview footer real -->
          <div class="rounded-xl mb-4 px-5 py-4 flex items-center justify-between" :style="previewGradient">
            <div class="flex items-center gap-3">
              <img src="@/assets/img/logo.png" alt="logo" class="h-9 object-contain" :style="logoStyle(local.footerLogoColor)" />
              <div>
                <p class="font-bold text-sm" :style="textColorStyle(local.footerCompanyColor)">{{ local.footerCompany }}</p>
                <p class="text-xs italic" :style="textColorStyle(local.footerTaglineColor)">{{ local.footerTagline }}</p>
              </div>
            </div>
            <div class="text-right text-xs">
              <p :style="textColorStyle(local.footerWebsiteColor)">{{ local.footerWebsite }}</p>
              <p class="text-white/60">© {{ new Date().getFullYear() }}</p>
            </div>
          </div>

          <!-- Color logo footer -->
          <p class="text-xs font-medium text-base-content/60 mb-2">Color del logo</p>
          <div class="flex gap-2 flex-wrap mb-4">
            <button @click="local.footerLogoColor = 'white'" class="btn btn-sm" :class="local.footerLogoColor === 'white' ? 'btn-primary' : 'btn-outline'">⬜ Blanco</button>
            <button @click="local.footerLogoColor = 'original'" class="btn btn-sm" :class="local.footerLogoColor === 'original' ? 'btn-primary' : 'btn-outline'">🟠 Original</button>
            <label class="btn btn-sm gap-2" :class="isCustomColor(local.footerLogoColor) ? 'btn-primary' : 'btn-outline'">
              🎨 Custom
              <input type="color" :value="isCustomColor(local.footerLogoColor) ? local.footerLogoColor : '#ffffff'" @input="(e) => { local.footerLogoColor = (e.target as HTMLInputElement).value; }" class="w-6 h-6 cursor-pointer" />
            </label>
          </div>

          <!-- Textos del footer -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs font-medium text-base-content/60">Nombre de empresa</label>
                <div class="flex gap-1">
                  <button @click="local.footerCompanyColor = 'white'" class="btn btn-xs" :class="local.footerCompanyColor === 'white' ? 'btn-primary' : 'btn-outline'">⬜</button>
                  <label class="btn btn-xs gap-1" :class="isCustomColor(local.footerCompanyColor) ? 'btn-primary' : 'btn-outline'">
                    🎨
                    <input type="color" :value="isCustomColor(local.footerCompanyColor) ? local.footerCompanyColor : '#ffffff'" @input="(e) => { local.footerCompanyColor = (e.target as HTMLInputElement).value; }" class="w-4 h-4 cursor-pointer" />
                  </label>
                </div>
              </div>
              <input v-model="local.footerCompany" type="text" class="input input-bordered input-sm w-full" placeholder="Abril Amoblamientos" maxlength="60" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs font-medium text-base-content/60">Slogan</label>
                <div class="flex gap-1">
                  <button @click="local.footerTaglineColor = 'white'" class="btn btn-xs" :class="local.footerTaglineColor === 'white' ? 'btn-primary' : 'btn-outline'">⬜</button>
                  <label class="btn btn-xs gap-1" :class="isCustomColor(local.footerTaglineColor) ? 'btn-primary' : 'btn-outline'">
                    🎨
                    <input type="color" :value="isCustomColor(local.footerTaglineColor) ? local.footerTaglineColor : '#ffffff'" @input="(e) => { local.footerTaglineColor = (e.target as HTMLInputElement).value; }" class="w-4 h-4 cursor-pointer" />
                  </label>
                </div>
              </div>
              <input v-model="local.footerTagline" type="text" class="input input-bordered input-sm w-full" placeholder="abril vive en vos" maxlength="60" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs font-medium text-base-content/60">Sitio web</label>
                <div class="flex gap-1">
                  <button @click="local.footerWebsiteColor = 'white'" class="btn btn-xs" :class="local.footerWebsiteColor === 'white' ? 'btn-primary' : 'btn-outline'">⬜</button>
                  <label class="btn btn-xs gap-1" :class="isCustomColor(local.footerWebsiteColor) ? 'btn-primary' : 'btn-outline'">
                    🎨
                    <input type="color" :value="isCustomColor(local.footerWebsiteColor) ? local.footerWebsiteColor : '#ffffff'" @input="(e) => { local.footerWebsiteColor = (e.target as HTMLInputElement).value; }" class="w-4 h-4 cursor-pointer" />
                  </label>
                </div>
              </div>
              <input v-model="local.footerWebsite" type="text" class="input input-bordered input-sm w-full" placeholder="abrilamoblamientos.com.ar" maxlength="80" />
            </div>
          </div>
        </div>

        <!-- ── SECCIÓN: Visibilidad ────────────────────────────────── -->
        <div class="p-6 border-b border-base-300">
          <h3 class="font-bold text-base-content mb-1 flex items-center gap-2">
            <span>👁</span> Visibilidad de productos
          </h3>
          <p class="text-xs text-base-content/50 mb-3">Cuando está activado, los visitantes solo ven productos con imagen. Los admins siempre ven todos.</p>
          <label class="flex items-center gap-4 cursor-pointer">
            <span class="text-sm text-base-content">Mostrar solo productos con imagen</span>
            <input type="checkbox" v-model="local.showOnlyWithImages" class="toggle toggle-primary" />
          </label>
        </div>

        <!-- ── BOTONES de acción ───────────────────────────────────── -->
        <div class="p-6 flex flex-wrap gap-3 items-center">
          <button
            @click="savePalette"
            :disabled="saving"
            class="btn btn-primary gap-2"
          >
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            💾 Guardar para todos
          </button>
          <button @click="resetToFallback" class="btn btn-ghost btn-sm text-error">
            ↩ Restaurar por defecto
          </button>
        </div>

      </div>
    </div>

    <canvas ref="hiddenCanvas" class="hidden"></canvas>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { abrilApiData } from '@/api/abrilApiData';
import coverImg from '@/assets/img/cover-facebook.png';

const router = useRouter();

interface PaletteColors {
  dark: string;
  primary: string;
  light: string;
  cta: string;
  showOnlyWithImages: boolean;
  navbarLogoColor: string;
  navbarLinkColor: string;
  navbarButtonColor: string;
  footerLogoColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTitleColor: string;
  heroSubtitleColor: string;
  footerCompany: string;
  footerTagline: string;
  footerWebsite: string;
  footerCompanyColor: string;
  footerTaglineColor: string;
  footerWebsiteColor: string;
}

const FALLBACK: PaletteColors = {
  dark:               '#7B2D8E',
  primary:            '#9B30FF',
  light:              '#C850C0',
  cta:                '#EF7E00',
  showOnlyWithImages: false,
  navbarLogoColor:    'white',
  navbarLinkColor:    'white',
  navbarButtonColor:  'white',
  footerLogoColor:    'white',
  heroTitle:          'Encontrá lo que buscás',
  heroSubtitle:       'Los mejores productos, las mejores opciones de pago',
  heroTitleColor:     'white',
  heroSubtitleColor:  'white',
  footerCompany:      'Abril Amoblamientos',
  footerTagline:      'abril vive en vos',
  footerWebsite:      'abrilamoblamientos.com.ar',
  footerCompanyColor: 'white',
  footerTaglineColor: 'white',
  footerWebsiteColor: 'white',
};

// Whitelist exacta de lo que acepta el backend (ValidationPipe whitelist:true)
const KNOWN_KEYS: (keyof PaletteColors)[] = [
  'dark', 'primary', 'light', 'cta', 'showOnlyWithImages',
  'navbarLogoColor', 'navbarLinkColor', 'navbarButtonColor', 'footerLogoColor',
  'heroTitle', 'heroSubtitle', 'heroTitleColor', 'heroSubtitleColor',
  'footerCompany', 'footerTagline', 'footerWebsite',
  'footerCompanyColor', 'footerTaglineColor', 'footerWebsiteColor',
];

const local = reactive<PaletteColors>({ ...FALLBACK });
const saving = ref(false);
const saveStatus = ref<'ok' | 'error' | null>(null);
const saveErrorCode = ref<number | null>(null);
const extractingVibrant = ref(false);
const coverRef = ref<HTMLImageElement | null>(null);
const coverSrc = coverImg;

const fields: { key: 'dark' | 'primary' | 'light' | 'cta'; label: string }[] = [
  { key: 'dark',    label: 'Oscuro (fondo principio)'         },
  { key: 'primary', label: 'Principal (fondo centro)'          },
  { key: 'light',   label: 'Claro (fondo final)'               },
  { key: 'cta',     label: 'CTA · Naranja (botones / precios)' },
];

const previewGradient = computed(() =>
  `background: linear-gradient(90deg, ${local.dark} 0%, ${local.primary} 50%, ${local.light} 100%)`
);

// ─── Helpers para el color del logo ───────────────────────────────────────
function isCustomColor(color: string): boolean {
  return color !== 'white' && color !== 'original';
}

function logoStyle(color: string): Record<string, string> {
  if (!color || color === 'original') return {};
  if (color === 'white') return { filter: 'brightness(0) invert(1)' };
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return {};
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const inv  = Math.round(l * 100);
  const sat  = Math.round(Math.max(s * 3000, 100));
  const hDeg = Math.round(h * 360);
  return { filter: `brightness(0) saturate(100%) invert(${inv}%) sepia(100%) saturate(${sat}%) hue-rotate(${hDeg}deg)` };
}

function textColorStyle(color: string): Record<string, string> {
  return { color: !color || color === 'white' ? '#ffffff' : color };
}

// ─── Validar token antes de mutar ─────────────────────────────────────────
function isTokenValid(): boolean {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

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
  if (!isTokenValid()) { router.push({ name: 'login' }); return; }
  saving.value = true;
  saveStatus.value = null;
  saveErrorCode.value = null;
  try {
    const payload = Object.fromEntries(KNOWN_KEYS.map(k => [k, local[k]]));
    await abrilApiData.put('/portal-config/palette', payload);
    saveStatus.value = 'ok';
  } catch (err: any) {
    saveStatus.value = 'error';
    saveErrorCode.value = err?.response?.status ?? null;
  } finally {
    saving.value = false;
    setTimeout(() => { saveStatus.value = null; }, 4000);
  }
}

// ─── Extraer colores con Vibrant.js (browser-side) ────────────────────────
function getRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

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
    // Ajustar color de logo según luminosidad del fondo nuevo
    local.navbarLogoColor = getRelativeLuminance(local.dark)  < 0.35 ? 'white' : 'original';
    local.footerLogoColor = getRelativeLuminance(local.light) < 0.35 ? 'white' : 'original';
  } catch (e) {
    console.error('Vibrant error:', e);
  } finally {
    extractingVibrant.value = false;
  }
}

// ─── Restaurar fallback (llama al backend para afectar a todos) ───────────
async function resetToFallback() {
  if (!isTokenValid()) { router.push({ name: 'login' }); return; }
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
