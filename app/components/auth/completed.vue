<template>
  <div>
    <h1>Complete</h1>
  </div>
</template>

<script setup>
  import { pb } from '#imports';

  await pb.collection('users').update(pb.authStore.record?.id, {
    'isOnboarded': true,
  });

  window.location.href = '/auth/pending';
</script>