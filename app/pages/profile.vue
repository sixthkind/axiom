<script setup>
definePageMeta({
  layout: "common",
  middleware: "auth",
});
</script>

<template>
  <CommonContainer>
    <CommonProfile />
  </CommonContainer>
</template>
