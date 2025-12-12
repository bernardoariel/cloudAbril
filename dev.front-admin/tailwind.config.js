/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue}',
    './node_modules/vue-tailwind-datepicker/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        orangeCustom: '#EF7E00',
        orangeCustom2: '#EF7D00',
        orangeCustom3: '#FCB800',
        orangeCustom4: '#efae00',
        orangeCustom5: '#F27F00',
        orangeCustom3Translucent: 'rgba(252, 184, 0, 0.4)',
        'vtd-primary': colors.red,
        'vtd-secondary': colors.gray,
      },
    },
  },

  plugins: [require('daisyui')],

  daisyui: {
    themes: [
      {
        'classic-orange': {
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
        'warm-orange': {
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
        'bright-orange': {
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
        coffee: {
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

          // Esquinas cuadradas
          '--rounded-box': '0rem',
          '--rounded-btn': '0rem',
          '--rounded-badge': '0rem',
          '--animation-btn': '0s',
          '--animation-input': '0s',
          '--btn-focus-scale': '1',
        },
      },
      {
        'dark-professional': {
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
        'midnight-blue': {
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
        'forest-green': {
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
        'purple-dark': {
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
        'crimson-red': {
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
        'coffee-warm': {
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

          // Esquinas redondeadas
          '--rounded-box': '1rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '2rem',
        },
      },
      {
        'coffee-minimal': {
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

          // Esquinas cuadradas (minimalista)
          '--rounded-box': '0rem',
          '--rounded-btn': '0rem',
          '--rounded-badge': '2rem',
        },
      },
      'light', // Keep default light theme as fallback
    ],
  },
};

// @plugin "daisyui/theme" {
//   name: "light";
//   default: false;
//   prefersdark: false;
//   color-scheme: "light";
//   --color-base-100: oklch(98% 0.016 73.684);
//   --color-base-200: oklch(95% 0.038 75.164);
//   --color-base-300: oklch(90% 0.076 70.697);
//   --color-base-content: oklch(42% 0.095 57.708);
//   --color-primary: oklch(82% 0.189 84.429);
//   --color-primary-content: oklch(12% 0.042 264.695);
//   --color-secondary: oklch(87% 0.15 154.449);
//   --color-secondary-content: oklch(26% 0.065 152.934);
//   --color-accent: oklch(80% 0.105 251.813);
//   --color-accent-content: oklch(28% 0.091 267.935);
//   --color-neutral: oklch(44% 0.011 73.639);
//   --color-neutral-content: oklch(98% 0.001 106.423);
//   --color-info: oklch(78% 0.154 211.53);
//   --color-info-content: oklch(30% 0.056 229.695);
//   --color-success: oklch(84% 0.238 128.85);
//   --color-success-content: oklch(27% 0.072 132.109);
//   --color-warning: oklch(80% 0.114 19.571);
//   --color-warning-content: oklch(70% 0.191 22.216);
//   --color-error: oklch(71% 0.202 349.761);
//   --color-error-content: oklch(28% 0.109 3.907);
//   --radius-selector: 1rem;
//   --radius-field: 2rem;
//   --radius-box: 0.5rem;
//   --size-selector: 0.25rem;
//   --size-field: 0.25rem;
//   --border: 1px;
//   --depth: 1;
//   --noise: 0;
// }
