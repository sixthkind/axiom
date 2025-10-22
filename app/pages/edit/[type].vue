<script setup>
definePageMeta({
  layout: "common",
  middleware: 'auth'
});
</script>

<template>
  <CommonContainer>
    <CommonEdit />
  </CommonContainer>
</template>
