<template>
  <ion-app>
    <CommonNavbar />
    <ion-router-outlet />
  </ion-app>
</template>

<script setup>
  onMounted(() => {
    // Set nuxt color mode to light
    localStorage.setItem('nuxt-color-mode', 'light');

    // Disables ionic dark theme (prefer-color-scheme)
    document.documentElement.style.colorScheme = 'light';
  });
</script>

<style>
  body {
    height: 100%;
    background: #F7F6F2;
    background-attachment: fixed;
  }
</style>