<script setup>
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <ion-page>
    <ion-content>
      <CommonContainer>
        <AuthSignin />
      </CommonContainer>
    </ion-content>
  </ion-page>
</template>
