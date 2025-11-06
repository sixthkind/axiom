<script setup>
definePageMeta({
  middleware: 'auth'
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <CommonEdit />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
