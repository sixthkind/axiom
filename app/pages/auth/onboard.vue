<script setup>
definePageMeta({
  layout: "common",
  middleware: "auth",
});
</script>

<template>
  <CommonContainer>
    <AuthOnboard />
  </CommonContainer>
</template>
