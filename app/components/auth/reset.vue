<template>
  <div class="flex items-center justify-center">
    <div class="p-8 rounded-lg bg-gray-50">
      <div class="flex flex-col gap-3 mx-auto px-6">
        <h2 class="font-bold text-3xl text-gray-800">
          Reset Password
        </h2>  

        <div v-if="!isSent">
          <p class="text-lg leading-relaxed text-slate-500">
            <b>Email:</b>
            <br/>
            <input v-model="email" type="text" class="border rounded p-1 w-full" />
          </p>
      
          <p class="cursor-pointer font-bold py-3 text-primary" @click="send">Send Reset Email</p>
        </div>

        <div v-if="isSent">
          <p class="text-lg leading-relaxed text-slate-500">
            An email has been sent to {{ email }} with instructions to reset your password.
          </p>
          <a href="/auth" class="cursor-pointer font-bold py-3 text-primary">Back to Login</a>
        </div>

      </div>
    </div>
  </div>
  </template>
  
  <script setup>
    import { ref } from 'vue';
    import { authUtils, pb } from '#imports';

    const email = ref(pb.authStore.record?.email || '');
    const isSent = ref(false);
  
    const send = async () => {
      await authUtils.sendReset(email.value);
      isSent.value = true;
    }
  </script>
  
  
  