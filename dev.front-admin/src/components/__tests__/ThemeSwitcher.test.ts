import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ThemeSwitcher from '../ThemeSwitcher.vue';

// Mock the useTheme composable
const mockSetTheme = vi.fn();
const mockCurrentTheme = { value: 'classic-orange' };
const mockAvailableThemes = {
  value: [
    {
      name: 'classic-orange',
      displayName: 'Classic Orange',
      colors: { primary: 'oklch(68.5% 0.15 45)' },
    },
    {
      name: 'warm-orange',
      displayName: 'Warm Orange',
      colors: { primary: 'oklch(65% 0.18 35)' },
    },
    {
      name: 'bright-orange',
      displayName: 'Bright Orange',
      colors: { primary: 'oklch(72% 0.16 55)' },
    },
  ],
};

vi.mock('../composables/useTheme', () => ({
  useTheme: () => ({
    currentTheme: mockCurrentTheme,
    availableThemes: mockAvailableThemes,
    setTheme: mockSetTheme,
  }),
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render theme switcher button', () => {
    const wrapper = mount(ThemeSwitcher);

    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.text()).toContain('Classic Orange');
  });

  it('should show dropdown when button is clicked', async () => {
    const wrapper = mount(ThemeSwitcher);

    // Initially dropdown should be closed
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);

    // Click button to open dropdown
    await wrapper.find('button').trigger('click');

    // Dropdown should now be visible
    expect(wrapper.find('.absolute').exists()).toBe(true);
    expect(wrapper.text()).toContain('Temas Disponibles');
  });

  it('should display all available themes in dropdown', async () => {
    const wrapper = mount(ThemeSwitcher);

    // Open dropdown
    await wrapper.find('button').trigger('click');

    // Check that all themes are displayed
    expect(wrapper.text()).toContain('Classic Orange');
    expect(wrapper.text()).toContain('Warm Orange');
    expect(wrapper.text()).toContain('Bright Orange');
  });

  it('should call setTheme when theme is selected', async () => {
    const wrapper = mount(ThemeSwitcher);

    // Open dropdown
    await wrapper.find('button').trigger('click');

    // Find and click on warm orange theme
    const themeButtons = wrapper.findAll('button');
    const warmOrangeButton = themeButtons.find((button) => button.text().includes('Warm Orange'));

    expect(warmOrangeButton).toBeDefined();
    await warmOrangeButton!.trigger('click');

    // Verify setTheme was called with correct theme
    expect(mockSetTheme).toHaveBeenCalledWith('warm-orange');
  });

  it('should show current theme indicator', async () => {
    const wrapper = mount(ThemeSwitcher);

    // Open dropdown
    await wrapper.find('button').trigger('click');

    // Find the current theme button (classic-orange)
    const themeButtons = wrapper.findAll('button');
    const currentThemeButton = themeButtons.find((button) =>
      button.text().includes('Classic Orange'),
    );

    expect(currentThemeButton).toBeDefined();
    // Should have the selected styling class
    expect(currentThemeButton!.classes()).toContain('bg-primary/10');
  });

  it('should hide labels when showLabels is false', () => {
    const wrapper = mount(ThemeSwitcher, {
      props: { showLabels: false },
    });

    // The current theme display should be hidden on small screens
    const themeDisplay = wrapper.find('.hidden.sm\\:inline');
    expect(themeDisplay.exists()).toBe(true);
  });

  it('should render with dropdown variant by default', () => {
    const wrapper = mount(ThemeSwitcher);

    // Should have dropdown structure
    expect(wrapper.find('.relative.inline-block').exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(true);
  });
});
