<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <AuthReset />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
