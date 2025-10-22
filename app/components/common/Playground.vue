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

        <h2 class="font-bold text-slate-500 text-lg">🤨&nbsp;Question</h2>
        <TextElement name="question" />

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

      <h2 class="font-bold text-slate-500 text-lg pb-2">🗣️ Response</h2>
      <div>
        <div v-html="assistantMessage" class="prose text-sm text-slate-500 max-w-none"></div>
      </div>

      <hr class="mt-4 mb-2 border-slate-200">
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
       class="border-b border-dashed border-slate-200"
      >
        <div 
          class="flex justify-between items-center cursor-pointer py-2"
          @click="result.isExpanded = !result.isExpanded"
        >
          <span class="font-bold text-slate-400 text-sm">{{ result.name }}</span>
          <div class="flex items-center gap-2">
            <span class="flex gap-2">
              <span v-for="tag in result.expand.tags" :key="tag.id" class="k-tag">
                #{{ tag.name }}
              </span>
            </span>
            <span class="text-xs text-slate-400">{{ result.isExpanded ? '▼' : '▶' }}</span>
          </div>
        </div>
        
        <div v-if="result.isExpanded" @click="result.isExpanded = !result.isExpanded" class="cursor-pointer animated fadeInDown">
          <div v-html="result.content" class="prose text-sm text-slate-500 max-w-none"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { pb } from "#imports";
  import prompt from "./prompt.ts";
  const isLoading = ref(true);
  const clients = ref([]);
  const data = ref({});
  const errorMessage = ref('');
  const results = ref([]);
  const isResults = ref(false);
  const isInfoExpanded = ref(false);

  const assistantMessage = ref('');
  const isTyping = ref(false);
  const config = useRuntimeConfig();
  const openrouterAssetID = String(config.public.openrouterAssetID);
  import OpenAI from 'openai';
  const API_KEY = (await pb.collection('_assets').getOne(openrouterAssetID)).title;

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      'HTTP-Referer': 'https://axiom.sixthkind.com', // Replace with your website URL
      'X-Title': 'Axiom', // Replace with your app name
    },
    defaultQuery: { },
    fetch: (url, init) => {
      delete init.headers['x-stainless-timeout'];
      delete init.headers['x-stainless-async'];
      return fetch(url, init);
    }
  })

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

      // TODO
      // Just filtering for now. This obviously needs to be done on the server side permissions.
      results.value = filterItemsByTags(res, data.value.client.expand.tags);
      isResults.value = true;

      answerQuestion();
    } catch (error) {
      errorMessage.value = error.message || 'An error occurred while submitting the request';
    }
  };

  async function answerQuestion() {
    isTyping.value = true

    let userDataPrompt = `
      User Data:
        ${results.value.map(result => `Title: ${result.name}\nContent: ${result.content}`).join('\n')}
      `;

    let messages = [
      { role: 'system', content: prompt },
      { role: 'system', content: userDataPrompt },
      { role: 'user', content: data.value.question }
    ];
    
    try {
      const stream = await openai.chat.completions.create({
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      })

      assistantMessage.value = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        assistantMessage.value += content;
      }
    } catch (error) {
      assistantMessage.value = 'I apologize, but I encountered an error. Please try again.';
    } finally {
      isTyping.value = false;
    }
  }


  const filterItemsByTags = (items, clientTags) => {
    // filter items by client access tags
    if (!clientTags || clientTags.length === 0) return [];
    return items.filter(item => {
      if (!item.expand?.tags) return false;
      const itemTagNames = item.expand.tags.map(tag => tag.name);
      const clientTagNames = clientTags.map(tag => tag.name);
      return itemTagNames.some(tagName => clientTagNames.includes(tagName));
    });
  }
</script>
