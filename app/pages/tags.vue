<script setup>
definePageMeta({
  middleware: "auth"
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <TableTags />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
