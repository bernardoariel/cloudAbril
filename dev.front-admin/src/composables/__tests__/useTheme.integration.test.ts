import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTheme } from '../useTheme';

describe('useTheme Integration', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset document theme
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should persist theme selection across composable instances', () => {
    // First instance - set theme
    const { setTheme: setTheme1 } = useTheme();
    setTheme1('warm-orange');

    // Second instance - should load persisted theme
    const { currentTheme: currentTheme2 } = useTheme();
    expect(currentTheme2.value).toBe('warm-orange');
    expect(document.documentElement.getAttribute('data-theme')).toBe('warm-orange');
  });

  it('should apply theme to document element', () => {
    const { setTheme } = useTheme();

    setTheme('bright-orange');
    expect(document.documentElement.getAttribute('data-theme')).toBe('bright-orange');

    setTheme('classic-orange');
    expect(document.documentElement.getAttribute('data-theme')).toBe('classic-orange');
  });

  it('should handle localStorage being unavailable', () => {
    // Mock localStorage to throw errors
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('Storage not available');
    };

    const { setTheme, currentTheme } = useTheme();

    // Should still work without localStorage
    expect(() => setTheme('warm-orange')).not.toThrow();
    expect(currentTheme.value).toBe('warm-orange');
    expect(document.documentElement.getAttribute('data-theme')).toBe('warm-orange');

    // Restore localStorage
    localStorage.setItem = originalSetItem;
  });

  it('should validate all theme definitions have required properties', () => {
    const { availableThemes } = useTheme();

    expect(availableThemes.value).toHaveLength(3);

    const themeNames = availableThemes.value.map((t) => t.name);
    expect(themeNames).toContain('classic-orange');
    expect(themeNames).toContain('warm-orange');
    expect(themeNames).toContain('bright-orange');

    // Verify each theme has proper structure
    availableThemes.value.forEach((theme) => {
      expect(theme.displayName).toBeTruthy();
      expect(theme.colors.primary).toMatch(/^oklch\(/);
      expect(theme.colors['primary-content']).toMatch(/^oklch\(/);
      expect(theme.colors['base-100']).toMatch(/^oklch\(/);
    });
  });
});
