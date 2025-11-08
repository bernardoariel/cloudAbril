/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
  content: [
    './index.html', 
    './src/**/*.{js,ts,jsx,tsx,vue}',
    './node_modules/vue-tailwind-datepicker/**/*.js'
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
    themes: ['retro'],
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

