<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <AuthVerify />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
