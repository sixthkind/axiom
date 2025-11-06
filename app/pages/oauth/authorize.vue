<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <Icon name="lucide:link" size="1.4em" class="text-indigo-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Connect to <span class="font-bold text-primary">_</span><span class="font-bold text-slate-500">{{ sitename }}</span><span class="font-bold text-slate-500 opacity-80">{{ sitename2 }}</span>
        </h1>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {{ error }}
      </div>

      <!-- Authorization Request Info -->
      <div v-if="isValidRequest && isAuthenticated" class="mb-8">
        <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <Icon name="lucide:info" size="16px" class="text-indigo-600" />
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm text-indigo-600">
                <strong class="font-semibold">{{ clientName }}</strong> is requesting access to your account information.
              </p>
            </div>
          </div>
        </div>

        <!-- User Info -->
        <div class="mb-6">
          <p class="text-sm text-gray-600 mb-2">Logged in as:</p>
          <p class="text-sm font-medium text-gray-900">{{ userRecord?.email || 'User' }}</p>
        </div>

        <!-- Permissions -->
        <div class="mb-6">
          <p class="text-sm font-semibold text-gray-900 mb-3">This application will be able to:</p>
          <ul class="space-y-2">
            <li class="flex items-start text-sm text-gray-700">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              View your profile information
            </li>
            <li class="flex items-start text-sm text-gray-700">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              View and create your items
            </li>
            <li class="flex items-start text-sm text-gray-700">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              View and create your clients
            </li>
            <li class="flex items-start text-sm text-gray-700">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              View and create your tags
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="handleAllow"
            :disabled="loading"
            class="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            <span v-if="loading">Authorizing...</span>
            <span v-else>Allow Access</span>
          </button>
          
          <button
            @click="handleDeny"
            :disabled="loading"
            class="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Deny
          </button>
        </div>
      </div>

      <!-- Not Authenticated - Redirecting to Login -->
      <div v-else-if="!isAuthenticated && isValidRequest" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Redirecting to login...</p>
      </div>

      <!-- Loading State -->
      <div v-else-if="!error && !isValidRequest" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { authUtils, pb } from '#imports';
const config = useRuntimeConfig();
const sitename = ref(String(config.public.sitename));
const sitename2 = ref(String(config.public.sitename2));

// Disable auth middleware for this page (we handle auth manually)
definePageMeta({
  middleware: []
});

const route = useRoute();

// OAuth parameters from query string - use computed for reactivity
const clientId = computed(() => route.query.client_id as string || '');
const redirectUri = computed(() => route.query.redirect_uri as string || '');
const state = computed(() => route.query.state as string || '');
const codeChallenge = computed(() => route.query.code_challenge as string || '');
const codeChallengeMethod = computed(() => route.query.code_challenge_method as string || '');
const scope = computed(() => route.query.scope as string || '');
const responseType = computed(() => route.query.response_type as string || '');

// UI state
const loading = ref(false);
const error = ref('');

// Use PocketBase auth store directly
const isAuthenticated = computed(() => pb.authStore.isValid);
const userRecord = computed(() => pb.authStore.record);

// Client info from database
const clientName = ref('Loading...');

// Fetch client name from secure API endpoint
async function fetchClientInfo() {
  if (!clientId.value) {
    clientName.value = 'Unknown Application';
    return;
  }
  
  const url = `${pb.baseUrl}/api/oauth/client-info/${encodeURIComponent(clientId.value)}`;
  
  try {
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      clientName.value = data.client_name || clientId.value;
    } else {
      console.error('[OAuth] Failed to fetch client info:', response.status);
      clientName.value = clientId.value || 'Unknown Application';
    }
  } catch (err) {
    console.error('[OAuth] Client info fetch error:', err);
    clientName.value = clientId.value || 'Unknown Application';
  }
}

// Validate OAuth parameters
const isValidRequest = computed(() => {
  return clientId.value && redirectUri.value && responseType.value === 'code';
});

// Watch for valid request and clear error when it becomes valid
watch(isValidRequest, (isValid) => {
  if (isValid) {
    error.value = '';
  } else if (clientId.value || redirectUri.value || responseType.value) {
    error.value = 'Invalid OAuth request. Missing required parameters.';
  }
}, { immediate: true });

// Watch for clientId changes and fetch client info
watch(clientId, (newClientId) => {
  if (newClientId) {
    fetchClientInfo();
  }
}, { immediate: true });

onMounted(() => {
  // Parse query params directly from URL as fallback
  const urlParams = new URLSearchParams(window.location.search);
  const hasValidParams = urlParams.has('client_id') && 
                         urlParams.has('redirect_uri') && 
                         urlParams.get('response_type') === 'code';
  
  console.log('[OAuth] Auth check:', {
    isAuthenticated: isAuthenticated.value,
    hasValidParams,
    url: window.location.href
  });
  
  // Check if user is authenticated - if not, redirect to login immediately
  if (!isAuthenticated.value && hasValidParams) {
    const returnUrl = window.location.pathname + window.location.search;
    const loginUrl = `/auth?return_to=${encodeURIComponent(returnUrl)}`;
    console.log('[OAuth] Not authenticated, redirecting to login');
    console.log('[OAuth] Return URL will be:', returnUrl);
    console.log('[OAuth] Login URL:', loginUrl);
    window.location.href = loginUrl;
  }
});

async function handleAllow() {
  if (!isAuthenticated.value) {
    error.value = 'You must be logged in to authorize this application.';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    // Get the auth token from PocketBase
    const authToken = pb.authStore.token;
    
    // Call PocketBase to generate authorization code
    const response = await fetch(`${pb.baseUrl}/oauth/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        client_id: clientId.value,
        redirect_uri: redirectUri.value,
        state: state.value,
        code_challenge: codeChallenge.value,
        code_challenge_method: codeChallengeMethod.value,
        scope: scope.value
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.redirect_url) {
      // Redirect back to ChatGPT with authorization code
      window.location.href = data.redirect_url;
    } else {
      error.value = data.error_description || data.error || 'Authorization failed';
      loading.value = false;
    }
  } catch (err: any) {
    console.error('Authorization error:', err);
    error.value = 'An error occurred during authorization. Please try again.';
    loading.value = false;
  }
}

function handleDeny() {
  // Build error redirect URL
  let errorUrl = redirectUri.value;
  if (errorUrl.includes('?')) {
    errorUrl += '&error=access_denied';
  } else {
    errorUrl += '?error=access_denied';
  }
  if (state.value) {
    errorUrl += `&state=${encodeURIComponent(state.value)}`;
  }
  
  // Redirect back to ChatGPT with error
  window.location.href = errorUrl;
}
</script>

