import { describe, it, expect } from 'vitest';
import { fc } from 'fast-check';
import { useTheme, type ThemeDefinition, type DaisyUIThemeColors } from '../useTheme';

/**
 * **Feature: theme-management, Property 3: Theme definitions conform to DaisyUI structure**
 * **Validates: Requirements 2.1, 2.3**
 *
 * Property: For any theme definition, it should contain all required DaisyUI color
 * properties with valid oklch color values
 */
describe('Theme Definitions Structure Property Tests', () => {
  // Required DaisyUI color properties as per the specification
  const REQUIRED_DAISYUI_COLORS = [
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
  ] as const;

  // Generator for valid oklch color values
  const oklchColorArbitrary = fc
    .record({
      lightness: fc.float({ min: 0, max: 100 }),
      chroma: fc.float({ min: 0, max: 0.4 }),
      hue: fc.float({ min: 0, max: 360 }),
    })
    .map(
      ({ lightness, chroma, hue }) =>
        `oklch(${lightness.toFixed(1)}% ${chroma.toFixed(2)} ${hue.toFixed(0)})`,
    );

  // Generator for theme names (kebab-case with orange suffix)
  const themeNameArbitrary = fc.stringMatching(/^[a-z]+(-[a-z]+)*-orange$/);

  // Generator for display names
  const displayNameArbitrary = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((name) => name.trim().length > 0);

  // Generator for complete DaisyUI color objects
  const daisyUIColorsArbitrary = fc.record(
    Object.fromEntries(REQUIRED_DAISYUI_COLORS.map((colorKey) => [colorKey, oklchColorArbitrary])),
  ) as fc.Arbitrary<DaisyUIThemeColors>;

  // Generator for complete theme definitions
  const themeDefinitionArbitrary = fc.record({
    name: themeNameArbitrary,
    displayName: displayNameArbitrary,
    colors: daisyUIColorsArbitrary,
  }) as fc.Arbitrary<ThemeDefinition>;

  it('should validate that all actual theme definitions conform to DaisyUI structure', () => {
    const { availableThemes } = useTheme();

    // Property: For any theme definition in the system, it must conform to DaisyUI structure
    availableThemes.value.forEach((theme) => {
      // Validate theme has required top-level properties
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('displayName');
      expect(theme).toHaveProperty('colors');

      // Validate theme name is a non-empty string
      expect(typeof theme.name).toBe('string');
      expect(theme.name.length).toBeGreaterThan(0);

      // Validate display name is a non-empty string
      expect(typeof theme.displayName).toBe('string');
      expect(theme.displayName.length).toBeGreaterThan(0);

      // Validate colors object exists
      expect(typeof theme.colors).toBe('object');
      expect(theme.colors).not.toBeNull();

      // Validate all required DaisyUI color properties exist
      REQUIRED_DAISYUI_COLORS.forEach((colorKey) => {
        expect(theme.colors).toHaveProperty(colorKey);

        const colorValue = theme.colors[colorKey];
        expect(typeof colorValue).toBe('string');
        expect(colorValue.length).toBeGreaterThan(0);

        // Validate oklch format: oklch(L% C H) where L=0-100, C=0-0.4, H=0-360
        expect(colorValue).toMatch(/^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/);
      });
    });
  });

  it('property: any valid theme definition should conform to DaisyUI structure', () => {
    fc.assert(
      fc.property(themeDefinitionArbitrary, (themeDefinition) => {
        // Property: For any theme definition, it should contain all required properties

        // Check top-level structure
        expect(themeDefinition).toHaveProperty('name');
        expect(themeDefinition).toHaveProperty('displayName');
        expect(themeDefinition).toHaveProperty('colors');

        // Check name is valid
        expect(typeof themeDefinition.name).toBe('string');
        expect(themeDefinition.name.length).toBeGreaterThan(0);

        // Check display name is valid
        expect(typeof themeDefinition.displayName).toBe('string');
        expect(themeDefinition.displayName.trim().length).toBeGreaterThan(0);

        // Check colors object structure
        expect(typeof themeDefinition.colors).toBe('object');
        expect(themeDefinition.colors).not.toBeNull();

        // Check all required DaisyUI colors are present with valid oklch values
        REQUIRED_DAISYUI_COLORS.forEach((colorKey) => {
          expect(themeDefinition.colors).toHaveProperty(colorKey);

          const colorValue = themeDefinition.colors[colorKey];
          expect(typeof colorValue).toBe('string');
          expect(colorValue).toMatch(/^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/);
        });

        return true;
      }),
      { numRuns: 100 }, // Run 100 iterations as specified in design document
    );
  });

  it('property: oklch color values should have valid ranges', () => {
    fc.assert(
      fc.property(oklchColorArbitrary, (colorValue) => {
        // Property: For any oklch color value, it should have valid component ranges

        // Extract components from oklch(L% C H) format
        const match = colorValue.match(
          /^oklch\((\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)$/,
        );
        expect(match).not.toBeNull();

        if (match) {
          const lightness = parseFloat(match[1]);
          const chroma = parseFloat(match[2]);
          const hue = parseFloat(match[3]);

          // Validate ranges according to oklch specification
          expect(lightness).toBeGreaterThanOrEqual(0);
          expect(lightness).toBeLessThanOrEqual(100);

          expect(chroma).toBeGreaterThanOrEqual(0);
          expect(chroma).toBeLessThanOrEqual(0.4); // Reasonable chroma range for UI colors

          expect(hue).toBeGreaterThanOrEqual(0);
          expect(hue).toBeLessThanOrEqual(360);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('property: theme names should follow naming convention', () => {
    const { availableThemes } = useTheme();

    // Property: For any theme in the system, the name should follow kebab-case convention
    availableThemes.value.forEach((theme) => {
      // Should be kebab-case (lowercase with hyphens)
      expect(theme.name).toMatch(/^[a-z]+(-[a-z]+)*$/);

      // Should not start or end with hyphen
      expect(theme.name).not.toMatch(/^-|-$/);

      // Should not have consecutive hyphens
      expect(theme.name).not.toMatch(/--/);
    });
  });
});
