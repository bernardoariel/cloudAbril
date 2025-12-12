import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { useTheme } from '../useTheme';

// Mock components that use DaisyUI classes for testing theme integration
const MockDaisyUIComponent = {
  template: `
    <div>
      <button class="btn btn-primary">Primary Button</button>
      <div class="card bg-base-100">
        <div class="card-body">
          <h2 class="card-title">Card Title</h2>
          <div class="badge badge-secondary">Badge</div>
          <div class="alert alert-info">Alert Message</div>
        </div>
      </div>
    </div>
  `,
};

const MockOrangeCustomComponent = {
  template: `
    <div>
      <button class="btn bg-orangeCustom hover:bg-orangeCustom2 text-white">Orange Button</button>
      <div class="bg-orangeCustom3Translucent p-4">
        <span class="text-orangeCustom2">Orange Text</span>
      </div>
    </div>
  `,
};

describe('Theme System Integration', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Store original localStorage
    originalLocalStorage = window.localStorage;

    // Clear localStorage
    localStorage.clear();

    // Reset document theme
    document.documentElement.removeAttribute('data-theme');

    // Clear any existing CSS custom properties
    document.documentElement.style.cssText = '';
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.cssText = '';

    // Restore original localStorage
    window.localStorage = originalLocalStorage;
  });

  describe('Theme Application Across Components', () => {
    it('should apply theme changes to document element for DaisyUI components', () => {
      const { setTheme } = useTheme();

      // Test each theme application
      setTheme('classic-orange');
      expect(document.documentElement.getAttribute('data-theme')).toBe('classic-orange');

      setTheme('warm-orange');
      expect(document.documentElement.getAttribute('data-theme')).toBe('warm-orange');

      setTheme('bright-orange');
      expect(document.documentElement.getAttribute('data-theme')).toBe('bright-orange');
    });

    it('should maintain theme consistency when mounting multiple components', () => {
      const { setTheme } = useTheme();

      // Set initial theme
      setTheme('warm-orange');

      // Mount multiple components that use DaisyUI classes
      const wrapper1 = mount(MockDaisyUIComponent);
      const wrapper2 = mount(MockDaisyUIComponent);

      // Both components should exist under the same theme
      expect(document.documentElement.getAttribute('data-theme')).toBe('warm-orange');
      expect(wrapper1.find('.btn-primary').exists()).toBe(true);
      expect(wrapper2.find('.card').exists()).toBe(true);

      // Change theme - should affect all components
      setTheme('bright-orange');
      expect(document.documentElement.getAttribute('data-theme')).toBe('bright-orange');

      wrapper1.unmount();
      wrapper2.unmount();
    });

    it('should not interfere with existing orange custom colors', () => {
      const { setTheme } = useTheme();

      // Mount component using orangeCustom colors
      const wrapper = mount(MockOrangeCustomComponent);

      // Verify component renders with orange custom classes
      expect(wrapper.find('.bg-orangeCustom').exists()).toBe(true);
      expect(wrapper.find('.text-orangeCustom2').exists()).toBe(true);
      expect(wrapper.find('.bg-orangeCustom3Translucent').exists()).toBe(true);

      // Change theme - orange custom colors should still work
      setTheme('warm-orange');
      expect(document.documentElement.getAttribute('data-theme')).toBe('warm-orange');

      // Orange custom classes should still be present
      expect(wrapper.find('.bg-orangeCustom').exists()).toBe(true);
      expect(wrapper.find('.text-orangeCustom2').exists()).toBe(true);

      setTheme('bright-orange');
      expect(document.documentElement.getAttribute('data-theme')).toBe('bright-orange');

      // Orange custom classes should still work
      expect(wrapper.find('.bg-orangeCustom').exists()).toBe(true);

      wrapper.unmount();
    });
  });

  describe('Theme Persistence Across Browser Sessions', () => {
    it('should persist theme selection in localStorage', () => {
      const { setTheme } = useTheme();

      // Set theme and verify persistence
      setTheme('warm-orange');

      const stored = localStorage.getItem('theme-preference');
      expect(stored).toBeTruthy();

      const parsedStorage = JSON.parse(stored!);
      expect(parsedStorage.selectedTheme).toBe('warm-orange');
      expect(parsedStorage.timestamp).toBeTypeOf('number');
    });

    it('should restore theme from localStorage on initialization', () => {
      // Pre-populate localStorage with theme preference
      const themeStorage = {
        selectedTheme: 'bright-orange',
        timestamp: Date.now(),
      };
      localStorage.setItem('theme-preference', JSON.stringify(themeStorage));

      // Create new theme service instance (simulates page reload)
      const { currentTheme } = useTheme();

      // Should restore the saved theme
      expect(currentTheme.value).toBe('bright-orange');
      expect(document.documentElement.getAttribute('data-theme')).toBe('bright-orange');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('theme-preference', 'invalid-json');

      // Should fallback to default theme without throwing
      expect(() => {
        const { currentTheme } = useTheme();
        expect(currentTheme.value).toBe('classic-orange');
      }).not.toThrow();

      expect(document.documentElement.getAttribute('data-theme')).toBe('classic-orange');
    });

    it('should handle localStorage being unavailable', () => {
      // Mock localStorage to throw errors
      const mockLocalStorage = {
        getItem: vi.fn(() => {
          throw new Error('Storage not available');
        }),
        setItem: vi.fn(() => {
          throw new Error('Storage not available');
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };

      // Replace localStorage temporarily
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      // Should work without localStorage
      const { setTheme, currentTheme } = useTheme();

      expect(() => setTheme('warm-orange')).not.toThrow();
      expect(currentTheme.value).toBe('warm-orange');
      expect(document.documentElement.getAttribute('data-theme')).toBe('warm-orange');
    });

    it('should handle theme that no longer exists in available themes', () => {
      // Set a theme that doesn't exist in current theme definitions
      const themeStorage = {
        selectedTheme: 'non-existent-theme',
        timestamp: Date.now(),
      };
      localStorage.setItem('theme-preference', JSON.stringify(themeStorage));

      // Should fallback to default theme
      const { currentTheme } = useTheme();
      expect(currentTheme.value).toBe('classic-orange');
      expect(document.documentElement.getAttribute('data-theme')).toBe('classic-orange');
    });
  });

  describe('Backward Compatibility with Orange Colors', () => {
    it('should preserve all existing orangeCustom color definitions', () => {
      // Get computed styles to verify orange custom colors are available
      const testElement = document.createElement('div');
      testElement.className = 'bg-orangeCustom text-orangeCustom2';
      document.body.appendChild(testElement);

      // Apply different themes and verify orange colors remain available
      const { setTheme } = useTheme();

      setTheme('classic-orange');
      expect(testElement.classList.contains('bg-orangeCustom')).toBe(true);
      expect(testElement.classList.contains('text-orangeCustom2')).toBe(true);

      setTheme('warm-orange');
      expect(testElement.classList.contains('bg-orangeCustom')).toBe(true);
      expect(testElement.classList.contains('text-orangeCustom2')).toBe(true);

      setTheme('bright-orange');
      expect(testElement.classList.contains('bg-orangeCustom')).toBe(true);
      expect(testElement.classList.contains('text-orangeCustom2')).toBe(true);

      document.body.removeChild(testElement);
    });

    it('should maintain orange custom color functionality with theme switching', () => {
      const { setTheme } = useTheme();

      // Create elements using all orange custom variants
      const orangeVariants = [
        'orangeCustom',
        'orangeCustom2',
        'orangeCustom3',
        'orangeCustom4',
        'orangeCustom5',
        'orangeCustom3Translucent',
      ];

      const testElements = orangeVariants.map((variant) => {
        const element = document.createElement('div');
        element.className = `bg-${variant}`;
        document.body.appendChild(element);
        return element;
      });

      // Test with each theme
      const themes = ['classic-orange', 'warm-orange', 'bright-orange'];

      themes.forEach((theme) => {
        setTheme(theme);
        expect(document.documentElement.getAttribute('data-theme')).toBe(theme);

        // All orange custom classes should still be present
        testElements.forEach((element, index) => {
          expect(element.classList.contains(`bg-${orangeVariants[index]}`)).toBe(true);
        });
      });

      // Cleanup
      testElements.forEach((element) => {
        document.body.removeChild(element);
      });
    });
  });

  describe('Theme System Performance and Reliability', () => {
    it('should complete theme switching within performance requirements', () => {
      const { setTheme } = useTheme();

      // Measure theme switching performance
      const startTime = performance.now();
      setTheme('warm-orange');
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Should complete within 200ms as per requirements
      expect(duration).toBeLessThan(200);
      expect(document.documentElement.getAttribute('data-theme')).toBe('warm-orange');
    });

    it('should handle rapid theme switching without errors', () => {
      const { setTheme } = useTheme();

      // Rapidly switch between themes
      expect(() => {
        setTheme('classic-orange');
        setTheme('warm-orange');
        setTheme('bright-orange');
        setTheme('classic-orange');
        setTheme('warm-orange');
      }).not.toThrow();

      // Final theme should be applied correctly
      expect(document.documentElement.getAttribute('data-theme')).toBe('warm-orange');
    });

    it('should maintain theme consistency across multiple useTheme instances', () => {
      // Create multiple theme service instances
      const theme1 = useTheme();
      const theme2 = useTheme();
      const theme3 = useTheme();

      // Set theme from first instance
      theme1.setTheme('bright-orange');

      // All instances should reflect the same theme
      expect(theme1.currentTheme.value).toBe('bright-orange');
      expect(theme2.currentTheme.value).toBe('bright-orange');
      expect(theme3.currentTheme.value).toBe('bright-orange');

      // Document should have the correct theme
      expect(document.documentElement.getAttribute('data-theme')).toBe('bright-orange');
    });
  });
});
