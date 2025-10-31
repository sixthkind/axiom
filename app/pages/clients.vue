<script setup>
definePageMeta({
  middleware: "auth"
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <TableClients />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
