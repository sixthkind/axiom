<script setup>
definePageMeta({
  layout: "common",
  middleware: "auth"
});
</script>

<template>
  <CommonContainer>
    <TableClients />
  </CommonContainer>
</template>
