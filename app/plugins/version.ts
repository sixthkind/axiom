import { defineNuxtPlugin } from '#app';
import packageJson from '../package.json';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('version', packageJson.version);
});