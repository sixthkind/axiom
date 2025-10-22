<script setup>
definePageMeta({
  layout: "common",
  middleware: "auth",
});
</script>

<template>
  <CommonContainer>
    <AuthReset />
  </CommonContainer>
</template>
