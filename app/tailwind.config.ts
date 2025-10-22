import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    './vueform.config.ts',
    './node_modules/@vueform/vueform/themes/tailwind/**/*.vue',
    './node_modules/@vueform/vueform/themes/tailwind/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['quicksand', 'sans-serif']
      },
      colors: {
        success: '#3ecd64',
        completed: '#3ea4cd',
        canceled: '#959595',
        warning: '#edae56',
        danger: '#d03931',
        error: '#d03931',
      },
    },
  },
  darkMode: 'class', // Disable automatic dark mode
  plugins: [
    require("@tailwindcss/typography"),
    require('@vueform/vueform/tailwind')
  ],
};
