<script setup>
definePageMeta({
  layout: "common",
  middleware: "auth"
});
</script>

<template>
  <CommonContainer>
    <TableItems />
  </CommonContainer>
</template>
