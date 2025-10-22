<template>
  <div class="flex items-center justify-center">
    <div class="p-8 rounded-lg bg-gray-50">
      <h1 class="font-bold">Unverified Email</h1>
      <p> 
        We have sent you an email with a verification link. Please click on the link to verify your email address.
      </p> 

      <p class="mt-4">
        After you verify your email, click the button below to refresh your account.
      </p>

      <button @click="verify" class="mt-2 px-4 py-2 bg-primary text-white rounded">
        I have verified my email!
      </button>

      <p @click="resendEmail" class="mt-4 cursor-pointer text-primary font-bold">
        Resend Email
      </p>
      
      <p @click="authUtils.logout" class="mt-2 cursor-pointer text-primary font-bold">
        Logout
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { authUtils, pb } from '#imports';

  const resendEmail = async () => {
    try {
      await authUtils.sendVerificationEmail(pb.authStore.record?.email);
      alert('Verification email resent successfully.');
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Failed to resend verification email.');
    }
  };

  const verify = async () => {
    await pb.collection('users').authRefresh();
    window.location.href = '/';
  };
</script>