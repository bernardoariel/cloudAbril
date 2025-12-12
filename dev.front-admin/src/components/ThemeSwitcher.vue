<template>
  <div class="space-y-4">
    <!-- Current Theme Display -->
    <div
      v-if="showLabels"
      class="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20"
    >
      <div class="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-primary/60"></div>
      <div>
        <div class="text-xs font-semibold text-base-content/70 uppercase tracking-wide">
          Tema Actual
        </div>
        <div class="text-sm font-bold text-primary">{{ currentThemeDisplay }}</div>
      </div>
    </div>

    <!-- Orange Themes -->
    <div class="space-y-3">
      <div
        class="flex items-center gap-2 text-xs font-bold text-base-content/70 uppercase tracking-wider"
      >
        <div class="w-2 h-2 rounded-full bg-orange-500"></div>
        <span>Temas Naranja</span>
        <div class="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent"></div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="(theme, index) in orangeThemes"
          :key="theme.name"
          @click="selectTheme(theme.name)"
          class="group relative flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all duration-300 border backdrop-blur-sm"
          :class="[
            {
              'bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold border-primary/30 shadow-lg transform scale-105':
                currentTheme === theme.name,
              'bg-base-100/80 hover:bg-base-200/80 text-base-content border-base-300/50 hover:border-primary/40 hover:scale-102':
                currentTheme !== theme.name,
            }
          ]"
        >
          <!-- Theme Color Preview -->
          <div
            class="w-4 h-4 rounded-full border-2 border-white shadow-md flex-shrink-0 transition-transform group-hover:scale-110"
            :style="{ 
              backgroundColor: getThemePreviewColor(theme),
              boxShadow: currentTheme === theme.name ? '0 0 0 2px hsl(var(--primary))' : '0 2px 4px rgba(0,0,0,0.1)'
            }"
          ></div>
          <!-- Theme Name -->
          <span class="truncate font-medium">{{ theme.displayName }}</span>
          <!-- Selected Indicator -->
          <div 
            v-if="currentTheme === theme.name"
            class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-base-100 flex items-center justify-center"
          >
            <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Coffee Themes -->
    <div class="space-y-3">
      <div
        class="flex items-center gap-2 text-xs font-bold text-base-content/70 uppercase tracking-wider"
      >
        <div class="w-2 h-2 rounded-full bg-amber-700"></div>
        <span>Temas Coffee</span>
        <div class="flex-1 h-px bg-gradient-to-r from-amber-700/30 to-transparent"></div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="(theme, index) in coffeeThemes"
          :key="theme.name"
          @click="selectTheme(theme.name)"
          class="group relative flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all duration-300 border backdrop-blur-sm"
          :class="[
            {
              'bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold border-primary/30 shadow-lg transform scale-105':
                currentTheme === theme.name,
              'bg-base-100/80 hover:bg-base-200/80 text-base-content border-base-300/50 hover:border-primary/40 hover:scale-102':
                currentTheme !== theme.name,
            }
          ]"
        >
          <!-- Theme Color Preview -->
          <div
            class="w-4 h-4 rounded-full border-2 border-white shadow-md flex-shrink-0 transition-transform group-hover:scale-110"
            :style="{ 
              backgroundColor: getThemePreviewColor(theme),
              boxShadow: currentTheme === theme.name ? '0 0 0 2px hsl(var(--primary))' : '0 2px 4px rgba(0,0,0,0.1)'
            }"
          ></div>
          <!-- Theme Name -->
          <span class="truncate font-medium">{{ theme.displayName }}</span>
          <!-- Selected Indicator -->
          <div 
            v-if="currentTheme === theme.name"
            class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-base-100 flex items-center justify-center"
          >
            <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Dark Themes -->
    <div class="space-y-3">
      <div
        class="flex items-center gap-2 text-xs font-bold text-base-content/70 uppercase tracking-wider"
      >
        <div class="w-2 h-2 rounded-full bg-slate-700"></div>
        <span>Temas Oscuros</span>
        <div class="flex-1 h-px bg-gradient-to-r from-slate-700/30 to-transparent"></div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="(theme, index) in darkThemes"
          :key="theme.name"
          @click="selectTheme(theme.name)"
          class="group relative flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all duration-300 border backdrop-blur-sm"
          :class="[
            {
              'bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold border-primary/30 shadow-lg transform scale-105':
                currentTheme === theme.name,
              'bg-base-100/80 hover:bg-base-200/80 text-base-content border-base-300/50 hover:border-primary/40 hover:scale-102':
                currentTheme !== theme.name,
            }
          ]"
        >
          <!-- Theme Color Preview -->
          <div
            class="w-4 h-4 rounded-full border-2 border-white shadow-md flex-shrink-0 transition-transform group-hover:scale-110"
            :style="{ 
              backgroundColor: getThemePreviewColor(theme),
              boxShadow: currentTheme === theme.name ? '0 0 0 2px hsl(var(--primary))' : '0 2px 4px rgba(0,0,0,0.1)'
            }"
          ></div>
          <!-- Theme Name -->
          <span class="truncate font-medium">{{ theme.displayName }}</span>
          <!-- Selected Indicator -->
          <div 
            v-if="currentTheme === theme.name"
            class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-base-100 flex items-center justify-center"
          >
            <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Colorful Themes -->
    <div class="space-y-3">
      <div
        class="flex items-center gap-2 text-xs font-bold text-base-content/70 uppercase tracking-wider"
      >
        <div class="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <span>Temas Coloridos</span>
        <div class="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="(theme, index) in colorfulThemes"
          :key="theme.name"
          @click="selectTheme(theme.name)"
          class="group relative flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all duration-300 border backdrop-blur-sm"
          :class="[
            {
              'bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold border-primary/30 shadow-lg transform scale-105':
                currentTheme === theme.name,
              'bg-base-100/80 hover:bg-base-200/80 text-base-content border-base-300/50 hover:border-primary/40 hover:scale-102':
                currentTheme !== theme.name,
            }
          ]"
        >
          <!-- Theme Color Preview -->
          <div
            class="w-4 h-4 rounded-full border-2 border-white shadow-md flex-shrink-0 transition-transform group-hover:scale-110"
            :style="{ 
              backgroundColor: getThemePreviewColor(theme),
              boxShadow: currentTheme === theme.name ? '0 0 0 2px hsl(var(--primary))' : '0 2px 4px rgba(0,0,0,0.1)'
            }"
          ></div>
          <!-- Theme Name -->
          <span class="truncate font-medium">{{ theme.displayName }}</span>
          <!-- Selected Indicator -->
          <div 
            v-if="currentTheme === theme.name"
            class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-base-100 flex items-center justify-center"
          >
            <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme, type ThemeDefinition } from '../composables/useTheme';

// Props interface
interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'buttons';
  showLabels?: boolean;
}

// Props with defaults
const props = withDefaults(defineProps<ThemeSwitcherProps>(), {
  variant: 'dropdown',
  showLabels: true,
});

// Theme service
const { currentTheme, availableThemes, setTheme } = useTheme();

// Component state - no longer needed for dropdown

// Computed properties
const currentThemeDisplay = computed(() => {
  const theme = availableThemes.value.find((t) => t.name === currentTheme.value);
  return theme?.displayName || 'Tema';
});

// Organize themes by category
const orangeThemes = computed(() => {
  return availableThemes.value.filter((theme) =>
    ['classic-orange', 'warm-orange', 'bright-orange'].includes(theme.name),
  );
});

const coffeeThemes = computed(() => {
  return availableThemes.value.filter((theme) =>
    ['coffee', 'coffee-warm', 'coffee-minimal'].includes(theme.name),
  );
});

const darkThemes = computed(() => {
  return availableThemes.value.filter((theme) =>
    ['dark-professional', 'midnight-blue', 'purple-dark'].includes(theme.name),
  );
});

const colorfulThemes = computed(() => {
  return availableThemes.value.filter((theme) =>
    ['forest-green', 'crimson-red'].includes(theme.name),
  );
});

// Methods
const selectTheme = (themeName: string) => {
  setTheme(themeName);
};

// Generate different rounded classes for variety
const getButtonRoundedClass = (index: number): string => {
  const roundedClasses = [
    'rounded-none', // 0: Sin redondeado
    'rounded-sm', // 1: Poco redondeado
    'rounded-md', // 2: Redondeado medio
    'rounded-lg', // 3: Más redondeado
    'rounded-xl', // 4: Muy redondeado
    'rounded-2xl', // 5: Super redondeado
    'rounded-full', // 6: Completamente redondo
    'rounded-tl-2xl rounded-br-2xl', // 7: Esquinas diagonales
    'rounded-tr-2xl rounded-bl-2xl', // 8: Esquinas diagonales opuestas
  ];
  return roundedClasses[index % roundedClasses.length];
};

// Generate different rounded classes for preview circles
const getPreviewRoundedClass = (index: number): string => {
  const previewClasses = [
    'rounded-none', // 0: Cuadrado
    'rounded-sm', // 1: Poco redondeado
    'rounded-md', // 2: Redondeado medio
    'rounded-full', // 3: Círculo
    'rounded-full', // 4: Círculo
    'rounded-lg', // 5: Redondeado
    'rounded-full', // 6: Círculo
    'rounded-sm', // 7: Poco redondeado
    'rounded-md', // 8: Redondeado medio
  ];
  return previewClasses[index % previewClasses.length];
};

const getThemePreviewColor = (theme: ThemeDefinition): string => {
  // Extract the primary color from oklch format and convert to a simple preview
  // For now, we'll use a mapping based on theme names for better visual feedback
  const colorMap: Record<string, string> = {
    'classic-orange': '#EF7E00',
    'warm-orange': '#E85D04',
    'bright-orange': '#F77F00',
    coffee: '#D2691E',
    'coffee-warm': '#D4A574',
    'coffee-minimal': '#B565A7',
    'dark-professional': '#1f2937',
    'midnight-blue': '#1e40af',
    'forest-green': '#166534',
    'purple-dark': '#7c3aed',
    'crimson-red': '#dc2626',
  };

  return colorMap[theme.name] || '#EF7E00';
};

// No lifecycle hooks needed for direct buttons
</script>

<style scoped>
/* Enhanced transitions for theme buttons */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Smooth hover effects */
.hover\:scale-102:hover {
  transform: scale(1.02);
}

.scale-105 {
  transform: scale(1.05);
}

/* Enhanced button effects */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

button:hover::before {
  left: 100%;
}

/* Focus states */
button:focus {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  box-shadow: 0 0 0 4px hsl(var(--primary) / 0.1);
}

/* Gradient animations */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Pulse animation for selected themes */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4); }
  50% { box-shadow: 0 0 0 8px hsl(var(--primary) / 0); }
}

.scale-105 {
  animation: pulse-glow 2s infinite;
}
</style>
