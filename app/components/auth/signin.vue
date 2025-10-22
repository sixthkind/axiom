<template>
  <div class="flex items-center justify-center">
    <div class="p-8 rounded-lg bg-gray-50">
      <h1 class="text-3xl font-bold mb-6 text-center">{{ isSignIn ? 'Sign In' : 'Sign Up' }}</h1>
      <form @submit.prevent="isSignIn ? signIn() : signUp()">

        <div v-if="isEnableGoogleAuth">
          <div class="mb-4 flex items-center justify-center">
            <button 
              type="button" 
              @click="signInWithGoogle" 
              class="w-full md:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.1 0 5.6 1.1 7.5 2.9l5.6-5.6C33.4 3.2 28.9 1 24 1 14.9 1 7.4 6.9 4.5 15.1l6.9 5.4C12.8 14.1 17 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.2-2.4 5.9-5 7.7l7.6 5.9c4.4-4.1 7.2-10.1 7.2-17.1z"/>
                <path fill="#FBBC05" d="M10.4 28.5c-1.1-3.2-1.1-6.8 0-10l-6.9-5.4C1.1 17.1 0 20.4 0 24s1.1 6.9 3.5 10.9l6.9-5.4z"/>
                <path fill="#34A853" d="M24 46c6.5 0 12-2.1 16-5.7l-7.6-5.9c-2.2 1.5-5 2.4-8.4 2.4-7 0-12.9-4.7-15-11.1l-6.9 5.4C7.4 41.1 14.9 46 24 46z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              {{ isSignIn ? 'Sign In' : 'Sign Up' }} with Google
            </button>
          </div>

          <div class="flex items-center my-4">
            <hr class="flex-grow border-t border-gray-300">
            <span class="mx-4 text-gray-500">or</span>
            <hr class="flex-grow border-t border-gray-300">
          </div>
        </div>

        <div class="mb-4">
          <label for="email" class="block text-gray-500 text-sm font-bold mb-2">Email:</label>
          <input type="email" v-model="email" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div class="">
          <label for="password" class="block text-gray-500 text-sm font-bold mb-2">Password:</label>
          <input type="password" v-model="password" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <p v-if="isSignIn" class="cursor-pointer font-bold text-primary" @click="reset">Forgot Password?</p>
        <div class="mt-6 text-center">
          <button type="submit" class="w-full md:w-auto px-6 py-3 bg-black text-white rounded-lg">{{ isSignIn ? 'Sign In' : 'Sign Up' }}</button>
          <div v-if="errorMessage" class="mt-2 text-red-500 text-sm">
            {{ errorMessage }}
          </div>
        </div>
      </form>
      <p class="mt-4 text-gray-600 text-center">
        {{ isSignIn ? "Don't have an account?" : "Already have an account?" }}
        <a @click="toggleAuthMode" class="text-purple-500 hover:text-purple-700 cursor-pointer">{{ isSignIn ? 'Sign Up' : 'Sign In' }}</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { authUtils, pb } from '#imports';

const isSignIn = ref(true);
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isEnableGoogleAuth = ref(false);
// const environment = useRuntimeConfig().public.environment;

function toggleAuthMode() {
  isSignIn.value = !isSignIn.value;
  errorMessage.value = ''; // Clear error message when switching modes
}

async function signIn() {
  if (validatePassword()) {
    try {
      await authUtils.authenticate(email.value, password.value);
      window.location.href = '/';
    } catch (err) {
      errorMessage.value = err.message || 'An error occurred during sign in';
    }
  }
}

function validatePassword() {
  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.';
    return false;
  }
  errorMessage.value = '';
  return true;
}


async function signUp() {
  if (validatePassword()) {
    try {
      let message = await authUtils.register({
        email: email.value, 
        password: password.value
      });
      window.location.href = '/';
    } catch (err) {
      errorMessage.value = err.message || 'An error occurred during sign up';
    }
  }
}

function reset() {
  window.location.href = '/auth/reset';
}

function signInWithGoogle() {
  authUtils.oauth("google");
}
</script>