<script setup>
definePageMeta({
  layout: "common",
  middleware: "auth",
});
</script>

<template>
  <CommonContainer>
    <AuthVerify />
  </CommonContainer>
</template>
