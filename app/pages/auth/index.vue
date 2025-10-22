<script setup>
definePageMeta({
  layout: "common",
  middleware: "auth",
});
</script>

<template>
  <CommonContainer>
    <AuthSignin />
  </CommonContainer>
</template>
