// https://nuxt.com/docs/api/configuration/nuxt-config

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load .env from parent directory (monorepo structure)
const monorepoEnvPath = path.resolve(__dirname, '../.env');
// Fallback to .env in current directory (deployment structure)
const localEnvPath = path.resolve(__dirname, '.env');

if (fs.existsSync(monorepoEnvPath)) {
  dotenv.config({ path: monorepoEnvPath });
} else if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}
// If neither exists, dotenv will use process.env (deployment might set env vars directly)

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  css: [
    "~/assets/css/main.css",
    "~/assets/css/components.css",
    "~/assets/css/ionic.css",
    "@fontsource/quicksand/400.css", 
    "@fontsource/quicksand/700.css"
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    "@vueform/nuxt",
    "@nuxt/ui",
    "@nuxtjs/ionic"
  ],

  colorMode: {
    preference: 'light'
  },

  runtimeConfig: {
    public: {
      environment: process.env.VITE_ENVIRONMENT,
      pocketbaseURL: process.env.VITE_POCKETBASE_URL,
      openrouterAssetID: process.env.VITE_OPENROUTER_ASSET_ID,
      sitename: process.env.VITE_SITENAME,
      sitename2: process.env.VITE_SITENAME2
    }
  },

  ionic: {},

  compatibilityDate: "2024-10-16"
});