<script setup>
definePageMeta({
  layout: "common",
  middleware: "auth"
});
</script>

<template>
  <CommonContainer>
    <TableTags />
  </CommonContainer>
</template>
