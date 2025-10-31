<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <AuthPending />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
