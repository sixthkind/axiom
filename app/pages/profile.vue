<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <CommonProfile />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
