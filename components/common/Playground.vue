<template>
  <div class="k-container animate fadeInUp">
    <div class="p-6">
      <h1 class="text-2xl font-bold">Welcome to the <span class="text-primary">Playground</span> 🛝</h1>
    </div>

    <div v-if="!isLoading" class="k-item">
      <h2 class="font-bold text-slate-500 text-lg pb-4">🤖&nbsp;Client</h2>
      <Vueform @submit="handleSubmit" v-model="data">
        <SelectElement
          name="client"
          :native="false"
          :items="clients"
        />

        <h2 class="font-bold text-slate-300 text-lg">🤨&nbsp;Question</h2>
        <TextElement name="question" disabled />

        <ButtonElement name="button" :submits="true" class="pt-4">
          Make Request
        </ButtonElement>
      </Vueform>

      <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <div class="mt-4">
          <div 
            class="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 justify-end"
            @click="isInfoExpanded = !isInfoExpanded"
          >
            <span class="text-sm">Information</span>
            <span class="text-xs">{{ isInfoExpanded ? '▼' : '▶' }}</span>
          </div>
          
          <div v-if="isInfoExpanded" class="mt-2 p-4 text-sm text-slate-400 animated fadeInDown">
            <p class="mb-2">This playground allows you to:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Roleplay as an external system accessing your data</li>
              <li>View how your personal agent responds on your behalf</li>
              <li>Test cases to see minimize data access</li>
            </ul>
            <br/>
            <p><span class="font-bold">API</span>  endpoint: <span class="k-tag">https://{name}.tansy.me/api/agent</span></p>
            <p><span class="font-bold">MCP</span> server: <span class="k-tag">https://{name}.tansy.me/api/mcp</span></p>
          </div>
        </div>
    </div>

    <div v-if="isResults" class="k-item">
      <h2 class="font-bold text-primary text-lg text-center">Results</h2>
      <hr class="pb-2 border-slate-200">

      <h2 class="font-bold text-slate-500 text-lg pb-2">🤖 Client</h2>
      <p><span class="font-bold text-slate-400">{{ data.client.name }}</span></p>
      <p><span class="font-bold text-slate-400 text-sm">{{ data.client.id }}</span></p>
      <p>
        <span v-for="tag in data.client.expand.tags" :key="tag.id">
          <span class="k-tag">#{{ tag.name }}&nbsp;</span>
        </span>
      </p>

      <hr class="mt-4 mb-2 border-slate-200">
      <h2 class="font-bold text-slate-500 text-lg pb-2">📋 Data</h2>
      <div 
       v-for="result in results" 
       :key="result.id"
       class="border-b border-dashed border-slate-200">
        <p class="flex justify-between items-center">
          <span class="font-bold text-slate-400 text-sm">{{ result.name }}</span>
          <span class="flex gap-2">
            <span v-for="tag in result.expand.tags" :key="tag.id" class="k-tag">
              #{{ tag.name }}
            </span>
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { pb } from "#imports";
  const isLoading = ref(true);
  const clients = ref([]);
  const data = ref({});
  const errorMessage = ref('');
  const results = ref([]);
  const isResults = ref(false);
  const isInfoExpanded = ref(false);

  onMounted(async () => {
    await init();
  });

  watch(data, () => {
    isResults.value = false;
  });

  const init = async () => {
    let res = await pb.collection("clients").getFullList({
      expand: "tags"
    });
    clients.value = res.map((item) => ({
      label: item.name,
      value: item,
    }));
    clients.value.unshift({
      label: "Anonymous",
      value: {name: "anonymous", id: "anonymous", expand: {tags: []}},
    });
    isLoading.value = false;
  }

  const handleSubmit = async () => {
    errorMessage.value = ''; // Clear any previous errors
    console.log(data.value);
    
    if (!data.value.client) {
      errorMessage.value = 'Error: Select a client';
      return;
    }

    try {
      let res = await pb.collection("items").getFullList({
        expand: "tags"
      });
      results.value = res;
      isResults.value = true;
    } catch (error) {
      errorMessage.value = error.message || 'An error occurred while submitting the request';
    }
  };


</script>
