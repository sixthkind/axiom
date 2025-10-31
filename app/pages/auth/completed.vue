<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <AuthCompleted />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
