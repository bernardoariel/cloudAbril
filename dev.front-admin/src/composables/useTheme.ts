import { ref, watch, type Ref } from 'vue';

// Theme definitions interface
export interface ThemeDefinition {
  name: string;
  displayName: string;
  colors: DaisyUIThemeColors;
}

export interface DaisyUIThemeColors {
  primary: string;
  'primary-content': string;
  secondary: string;
  'secondary-content': string;
  accent: string;
  'accent-content': string;
  neutral: string;
  'neutral-content': string;
  'base-100': string;
  'base-200': string;
  'base-300': string;
  'base-content': string;
  info: string;
  'info-content': string;
  success: string;
  'success-content': string;
  warning: string;
  'warning-content': string;
  error: string;
  'error-content': string;
}

// Theme storage interface
interface ThemeStorage {
  selectedTheme: string;
  timestamp: number;
}

// Available theme definitions
const AVAILABLE_THEMES: ThemeDefinition[] = [
  {
    name: 'classic-orange',
    displayName: 'Classic Orange',
    colors: {
      primary: '#EF7E00',
      'primary-content': '#ffffff',
      secondary: '#FCB800',
      'secondary-content': '#000000',
      accent: '#F27F00',
      'accent-content': '#ffffff',
      neutral: '#efae00',
      'neutral-content': '#000000',
      'base-100': '#ffffff',
      'base-200': '#f5f5f5',
      'base-300': '#e5e5e5',
      'base-content': '#1f2937',
      info: '#3b82f6',
      'info-content': '#ffffff',
      success: '#10b981',
      'success-content': '#ffffff',
      warning: '#f59e0b',
      'warning-content': '#000000',
      error: '#ef4444',
      'error-content': '#ffffff',
    },
  },
  {
    name: 'warm-orange',
    displayName: 'Warm Orange',
    colors: {
      primary: '#E85D04',
      'primary-content': '#ffffff',
      secondary: '#F77F00',
      'secondary-content': '#000000',
      accent: '#DC2626',
      'accent-content': '#ffffff',
      neutral: '#D97706',
      'neutral-content': '#000000',
      'base-100': '#ffffff',
      'base-200': '#fef3f2',
      'base-300': '#fed7d7',
      'base-content': '#1f2937',
      info: '#3b82f6',
      'info-content': '#ffffff',
      success: '#10b981',
      'success-content': '#ffffff',
      warning: '#f59e0b',
      'warning-content': '#000000',
      error: '#ef4444',
      'error-content': '#ffffff',
    },
  },
  {
    name: 'bright-orange',
    displayName: 'Bright Orange',
    colors: {
      primary: '#F77F00',
      'primary-content': '#000000',
      secondary: '#FCBF49',
      'secondary-content': '#000000',
      accent: '#F9844A',
      'accent-content': '#000000',
      neutral: '#EE6C4D',
      'neutral-content': '#ffffff',
      'base-100': '#ffffff',
      'base-200': '#fffbeb',
      'base-300': '#fef3c7',
      'base-content': '#1f2937',
      info: '#3b82f6',
      'info-content': '#ffffff',
      success: '#10b981',
      'success-content': '#ffffff',
      warning: '#f59e0b',
      'warning-content': '#000000',
      error: '#ef4444',
      'error-content': '#ffffff',
    },
  },
  {
    name: 'coffee',
    displayName: 'Coffee',
    colors: {
      primary: '#D2691E',
      'primary-content': '#ffffff',
      secondary: '#8B4513',
      'secondary-content': '#ffffff',
      accent: '#A0522D',
      'accent-content': '#ffffff',
      neutral: '#654321',
      'neutral-content': '#ffffff',
      'base-100': '#F5F5DC',
      'base-200': '#F0E68C',
      'base-300': '#DEB887',
      'base-content': '#2F1B14',
      info: '#4682B4',
      'info-content': '#ffffff',
      success: '#228B22',
      'success-content': '#ffffff',
      warning: '#DAA520',
      'warning-content': '#000000',
      error: '#B22222',
      'error-content': '#ffffff',
    },
  },
  {
    name: 'dark-professional',
    displayName: 'Dark Professional',
    colors: {
      primary: '#1f2937',
      'primary-content': '#f9fafb',
      secondary: '#374151',
      'secondary-content': '#f3f4f6',
      accent: '#6366f1',
      'accent-content': '#ffffff',
      neutral: '#111827',
      'neutral-content': '#f9fafb',
      'base-100': '#0f172a',
      'base-200': '#1e293b',
      'base-300': '#334155',
      'base-content': '#f1f5f9',
      info: '#3b82f6',
      'info-content': '#ffffff',
      success: '#10b981',
      'success-content': '#ffffff',
      warning: '#f59e0b',
      'warning-content': '#000000',
      error: '#ef4444',
      'error-content': '#ffffff',
    },
  },
  {
    name: 'midnight-blue',
    displayName: 'Midnight Blue',
    colors: {
      primary: '#1e40af',
      'primary-content': '#ffffff',
      secondary: '#1e3a8a',
      'secondary-content': '#ffffff',
      accent: '#3b82f6',
      'accent-content': '#ffffff',
      neutral: '#0f172a',
      'neutral-content': '#f8fafc',
      'base-100': '#020617',
      'base-200': '#0f172a',
      'base-300': '#1e293b',
      'base-content': '#e2e8f0',
      info: '#06b6d4',
      'info-content': '#ffffff',
      success: '#059669',
      'success-content': '#ffffff',
      warning: '#d97706',
      'warning-content': '#ffffff',
      error: '#dc2626',
      'error-content': '#ffffff',
    },
  },
  {
    name: 'forest-green',
    displayName: 'Forest Green',
    colors: {
      primary: '#166534',
      'primary-content': '#ffffff',
      secondary: '#15803d',
      'secondary-content': '#ffffff',
      accent: '#22c55e',
      'accent-content': '#000000',
      neutral: '#0f172a',
      'neutral-content': '#f0fdf4',
      'base-100': '#f0fdf4',
      'base-200': '#dcfce7',
      'base-300': '#bbf7d0',
      'base-content': '#14532d',
      info: '#0891b2',
      'info-content': '#ffffff',
      success: '#16a34a',
      'success-content': '#ffffff',
      warning: '#ca8a04',
      'warning-content': '#ffffff',
      error: '#dc2626',
      'error-content': '#ffffff',
    },
  },
  {
    name: 'purple-dark',
    displayName: 'Purple Dark',
    colors: {
      primary: '#7c3aed',
      'primary-content': '#ffffff',
      secondary: '#8b5cf6',
      'secondary-content': '#ffffff',
      accent: '#a855f7',
      'accent-content': '#ffffff',
      neutral: '#1f1729',
      'neutral-content': '#faf7ff',
      'base-100': '#0c0a0f',
      'base-200': '#1f1729',
      'base-300': '#2d1b3d',
      'base-content': '#f3f0ff',
      info: '#3b82f6',
      'info-content': '#ffffff',
      success: '#10b981',
      'success-content': '#ffffff',
      warning: '#f59e0b',
      'warning-content': '#000000',
      error: '#ef4444',
      'error-content': '#ffffff',
    },
  },
  {
    name: 'crimson-red',
    displayName: 'Crimson Red',
    colors: {
      primary: '#dc2626',
      'primary-content': '#ffffff',
      secondary: '#b91c1c',
      'secondary-content': '#ffffff',
      accent: '#ef4444',
      'accent-content': '#ffffff',
      neutral: '#1f1717',
      'neutral-content': '#fef2f2',
      'base-100': '#fef2f2',
      'base-200': '#fecaca',
      'base-300': '#fca5a5',
      'base-content': '#7f1d1d',
      info: '#3b82f6',
      'info-content': '#ffffff',
      success: '#10b981',
      'success-content': '#ffffff',
      warning: '#f59e0b',
      'warning-content': '#000000',
      error: '#dc2626',
      'error-content': '#ffffff',
    },
  },
  {
    name: 'coffee-warm',
    displayName: 'Coffee Warm',
    colors: {
      primary: 'oklch(75% 0.183 55.934)',
      'primary-content': 'oklch(26% 0.079 36.259)',
      secondary: 'oklch(71% 0.203 305.504)',
      'secondary-content': 'oklch(29% 0.149 302.717)',
      accent: 'oklch(84% 0.238 128.85)',
      'accent-content': 'oklch(27% 0.072 132.109)',
      neutral: 'oklch(47% 0.137 46.201)',
      'neutral-content': 'oklch(98% 0.022 95.277)',
      'base-100': 'oklch(98% 0.022 95.277)',
      'base-200': 'oklch(96% 0.059 95.617)',
      'base-300': 'oklch(92% 0.12 95.746)',
      'base-content': 'oklch(41% 0.112 45.904)',
      info: 'oklch(60% 0.126 221.723)',
      'info-content': 'oklch(98% 0.019 200.873)',
      success: 'oklch(59% 0.145 163.225)',
      'success-content': 'oklch(97% 0.021 166.113)',
      warning: 'oklch(66% 0.179 58.318)',
      'warning-content': 'oklch(98% 0.022 95.277)',
      error: 'oklch(58% 0.253 17.585)',
      'error-content': 'oklch(96% 0.015 12.422)',
    },
  },
  {
    name: 'coffee-minimal',
    displayName: 'Coffee Minimal',
    colors: {
      primary: 'oklch(82% 0.119 306.383)',
      'primary-content': 'oklch(29% 0.149 302.717)',
      secondary: 'oklch(90% 0.182 98.111)',
      'secondary-content': 'oklch(28% 0.066 53.813)',
      accent: 'oklch(84% 0.143 164.978)',
      'accent-content': 'oklch(26% 0.051 172.552)',
      neutral: 'oklch(20% 0 0)',
      'neutral-content': 'oklch(98% 0 0)',
      'base-100': 'oklch(98% 0 0)',
      'base-200': 'oklch(97% 0 0)',
      'base-300': 'oklch(92% 0 0)',
      'base-content': 'oklch(20% 0 0)',
      info: 'oklch(54% 0.245 262.881)',
      'info-content': 'oklch(97% 0.014 254.604)',
      success: 'oklch(62% 0.194 149.214)',
      'success-content': 'oklch(98% 0.018 155.826)',
      warning: 'oklch(64% 0.222 41.116)',
      'warning-content': 'oklch(98% 0.016 73.684)',
      error: 'oklch(58% 0.253 17.585)',
      'error-content': 'oklch(96% 0.015 12.422)',
    },
  },
];

const DEFAULT_THEME = 'classic-orange';
const STORAGE_KEY = 'theme-preference';

// Theme service interface
export interface ThemeService {
  currentTheme: Ref<string>;
  availableThemes: Ref<ThemeDefinition[]>;
  setTheme(themeName: string): void;
  initializeTheme(): void;
}

/**
 * Vue composable for theme management
 * Provides theme switching, persistence, and error handling
 */
export function useTheme(): ThemeService {
  const currentTheme = ref<string>(DEFAULT_THEME);
  const availableThemes = ref<ThemeDefinition[]>(AVAILABLE_THEMES);
  const previousTheme = ref<string>(DEFAULT_THEME);

  /**
   * Applies a theme by setting the data-theme attribute on the document element
   * This triggers DaisyUI's theme system to update CSS custom properties
   */
  const applyTheme = (themeName: string): boolean => {
    try {
      const startTime = performance.now();

      // Validate theme exists
      const themeExists = AVAILABLE_THEMES.some((theme) => theme.name === themeName);
      if (!themeExists) {
        console.error(`Theme "${themeName}" not found`);
        return false;
      }

      // Apply theme via data-theme attribute (DaisyUI standard)
      document.documentElement.setAttribute('data-theme', themeName);

      // Also set it on the body for better compatibility
      document.body.setAttribute('data-theme', themeName);

      // Force a style recalculation
      document.documentElement.style.display = 'none';
      document.documentElement.offsetHeight; // Trigger reflow
      document.documentElement.style.display = '';

      console.log(`Theme applied: ${themeName}`);

      // Check performance requirement (< 200ms)
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 200) {
        console.warn(`Theme application took ${duration}ms, exceeding 200ms requirement`);
      }

      return true;
    } catch (error) {
      console.error('Failed to apply theme:', error);
      return false;
    }
  };

  /**
   * Saves theme preference to localStorage
   */
  const saveThemePreference = (themeName: string): void => {
    try {
      const themeStorage: ThemeStorage = {
        selectedTheme: themeName,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themeStorage));
      console.log(`💾 Theme saved to localStorage: ${themeName}`);
    } catch (error) {
      console.warn('Failed to save theme preference to localStorage:', error);
      // Continue without persistence - not a critical failure
    }
  };

  /**
   * Loads theme preference from localStorage
   */
  const loadThemePreference = (): string => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log(`📂 No theme stored, using default: ${DEFAULT_THEME}`);
        return DEFAULT_THEME;
      }

      const themeStorage: ThemeStorage = JSON.parse(stored);

      // Validate stored theme still exists
      const themeExists = AVAILABLE_THEMES.some(
        (theme) => theme.name === themeStorage.selectedTheme,
      );
      if (!themeExists) {
        console.warn(
          `Stored theme "${themeStorage.selectedTheme}" no longer exists, using default`,
        );
        return DEFAULT_THEME;
      }

      console.log(`📂 Theme loaded from localStorage: ${themeStorage.selectedTheme}`);
      return themeStorage.selectedTheme;
    } catch (error) {
      console.warn('Failed to load theme preference from localStorage:', error);
      return DEFAULT_THEME;
    }
  };

  /**
   * Sets the current theme with error handling and fallback
   */
  const setTheme = (themeName: string): void => {
    console.log(`🎨 Setting theme to: ${themeName}`);

    // Store previous theme for potential rollback
    previousTheme.value = currentTheme.value;

    // Attempt to apply the new theme
    const success = applyTheme(themeName);

    if (success) {
      currentTheme.value = themeName;
      saveThemePreference(themeName);
      console.log(`✅ Theme successfully set to: ${themeName}`);
    } else {
      // Rollback to previous theme on failure
      console.error(`Failed to apply theme "${themeName}", reverting to "${previousTheme.value}"`);
      const rollbackSuccess = applyTheme(previousTheme.value);

      if (!rollbackSuccess) {
        // If rollback fails, force default theme
        console.error('Rollback failed, forcing default theme');
        applyTheme(DEFAULT_THEME);
        currentTheme.value = DEFAULT_THEME;
        saveThemePreference(DEFAULT_THEME);
      }
    }
  };

  /**
   * Initializes the theme system by loading saved preference and applying it
   */
  const initializeTheme = (): void => {
    const savedTheme = loadThemePreference();

    // Apply the theme without going through setTheme to avoid double persistence
    const success = applyTheme(savedTheme);

    if (success) {
      currentTheme.value = savedTheme;
      previousTheme.value = savedTheme;
    } else {
      // Fallback to default theme
      console.warn(`Failed to initialize with saved theme "${savedTheme}", using default`);
      applyTheme(DEFAULT_THEME);
      currentTheme.value = DEFAULT_THEME;
      previousTheme.value = DEFAULT_THEME;
      saveThemePreference(DEFAULT_THEME);
    }
  };

  // Watch for theme changes to ensure persistence
  watch(currentTheme, (newTheme) => {
    if (newTheme !== previousTheme.value) {
      saveThemePreference(newTheme);
    }
  });

  // Initialize theme immediately when composable is created
  // This ensures it works in both component and non-component contexts
  // Only initialize if we're in a browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Use nextTick to ensure DOM is ready
    if (typeof document.readyState !== 'undefined' && document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeTheme);
    } else {
      // DOM is already ready
      initializeTheme();
    }
  }

  return {
    currentTheme,
    availableThemes,
    setTheme,
    initializeTheme,
  };
}
