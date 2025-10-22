<template>
  <div class="flex items-center justify-center">
    <div class="p-8 rounded-lg bg-gray-50">
      <h1 class="font-bold mb-2">Account setup complete</h1>
      <p> 
        Thank you for signing up. We are currently reviewing your application.
      </p>
      <p> 
        You will receive an email once your account is approved.
      </p> 

      <button @click="verify" class="mt-6 px-4 py-2 bg-primary text-white rounded">
        Refresh Status
      </button>
      
      <p @click="authUtils.logout" class="mt-4 cursor-pointer text-primary font-bold">
        Logout
      </p>
    </div>
  </div>
</template>

<script setup>
  import { authUtils, pb } from '#imports';

  const verify = async () => {
    await pb.collection('users').authRefresh();
    window.location.href = '/';
  };
</script>