import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTheme } from '../useTheme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock document
const documentMock = {
  documentElement: {
    setAttribute: vi.fn(),
  },
};

// Mock performance
const performanceMock = {
  now: vi.fn(() => 100),
};

describe('useTheme', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup global mocks
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    Object.defineProperty(global, 'document', {
      value: documentMock,
      writable: true,
    });

    Object.defineProperty(global, 'performance', {
      value: performanceMock,
      writable: true,
    });

    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default theme when no stored preference', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { currentTheme, availableThemes } = useTheme();

    expect(currentTheme.value).toBe('classic-orange');
    expect(availableThemes.value).toHaveLength(3);
    expect(availableThemes.value.map((t) => t.name)).toEqual([
      'classic-orange',
      'warm-orange',
      'bright-orange',
    ]);
  });

  it('should load stored theme preference', () => {
    const storedTheme = {
      selectedTheme: 'warm-orange',
      timestamp: Date.now(),
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTheme));

    const { currentTheme } = useTheme();

    expect(currentTheme.value).toBe('warm-orange');
    expect(documentMock.documentElement.setAttribute).toHaveBeenCalledWith(
      'data-theme',
      'warm-orange',
    );
  });

  it('should set theme and update document attribute', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { setTheme, currentTheme } = useTheme();

    setTheme('bright-orange');

    expect(currentTheme.value).toBe('bright-orange');
    expect(documentMock.documentElement.setAttribute).toHaveBeenCalledWith(
      'data-theme',
      'bright-orange',
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'theme-preference',
      expect.stringContaining('"selectedTheme":"bright-orange"'),
    );
  });

  it('should handle invalid theme gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { setTheme, currentTheme } = useTheme();
    const initialTheme = currentTheme.value;

    setTheme('invalid-theme');

    // Should remain on the initial theme
    expect(currentTheme.value).toBe(initialTheme);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Theme "invalid-theme" not found'),
    );
  });

  it('should handle corrupted localStorage data', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');

    const { currentTheme } = useTheme();

    expect(currentTheme.value).toBe('classic-orange');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load theme preference'),
      expect.any(Error),
    );
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const { setTheme } = useTheme();

    // Should not throw error
    expect(() => setTheme('warm-orange')).not.toThrow();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save theme preference'),
      expect.any(Error),
    );
  });

  it('should validate theme definitions structure', () => {
    const { availableThemes } = useTheme();

    availableThemes.value.forEach((theme) => {
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('displayName');
      expect(theme).toHaveProperty('colors');

      // Check required DaisyUI color properties
      const requiredColors = [
        'primary',
        'primary-content',
        'secondary',
        'secondary-content',
        'accent',
        'accent-content',
        'neutral',
        'neutral-content',
        'base-100',
        'base-200',
        'base-300',
        'base-content',
        'info',
        'info-content',
        'success',
        'success-content',
        'warning',
        'warning-content',
        'error',
        'error-content',
      ];

      requiredColors.forEach((colorKey) => {
        expect(theme.colors).toHaveProperty(colorKey);
        expect(theme.colors[colorKey as keyof typeof theme.colors]).toMatch(/^oklch\(/);
      });
    });
  });
});
