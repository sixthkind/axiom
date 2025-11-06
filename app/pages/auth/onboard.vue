<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <AuthOnboard />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
