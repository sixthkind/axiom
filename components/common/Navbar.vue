<template>
  <div class="sticky-top translucent pt-2">
    <CommonContainer>
      <header class="flex w-full flex-col lg:flex-row justify-between items-center pb-3 mb-5">
        <div class="flex w-full items-center justify-between">

          <div class="flex items-center gap-3">
            <div class="bg-white bg-opacity-90 hover:bg-opacity-70 flex backdrop-blur mt-3 rounded-2xl border p-2">
              <a href="/">
                <span class="font-bold text-primary">_</span><span class="font-bold text-slate-500">{{ sitename }}</span><span class="font-bold text-slate-500 opacity-80">{{ sitename2 }}</span>
              </a>
            </div>

          </div>

          <div class="flex items-center gap-3">
            <a href="/playground" class="text-slate-500 hover:text-primary font-bold text-sm mt-4">
              Playground
            </a>

            <div v-if="pb.authStore.isValid" class="hidden md:flex bg-white bg-opacity-70 backdrop-blur mt-3 rounded-2xl border p-2 flex items-center">
              <a href="/profile">
                <span class="font-bold text-primary">{{ emailUsername }}</span>
                <span class="font-bold text-slate-500">@</span><span class="font-bold text-slate-400">{{ emailDomain }}</span>
              </a>
            </div>

            <div v-if="pb.authStore.isValid" class="block md:hidden bg-white bg-opacity-70 backdrop-blur mt-3 rounded-2xl border p-2">
            <button @click="open = !open" class="text-gray-800 pr-1 pl-0.5">
              <svg
                fill="currentColor"
                class="w-4 h-4"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Menu</title>
                <path
                  v-show="open"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M18.278 16.864a1 1 0 01-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 01-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 011.414-1.414l4.829 4.828 4.828-4.828a1 1 0 111.414 1.414l-4.828 4.829 4.828 4.828z"
                ></path>
                <path
                  v-show="!open"
                  fill-rule="evenodd"
                  d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
                ></path>
              </svg>
            </button>
          </div>
          </div>

        </div>

        <nav
            v-if="open"
            class="w-full lg:w-auto mt-3 md:hidden lg:mt-3 bg-white bg-opacity-70 backdrop-blur mt-3 rounded-2xl border"
            :class="{ block: open, hidden: !open }"
          >
          <ul class="flex flex-col lg:flex-row lg:gap-3">
              <li v-for="item of menuitems" :key="item.link" class="text-center">
                <a
                  :href="item.path"
                  class="flex justify-center items-center lg:px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                  {{ item.title }}
                </a>
              </li>
            </ul>
          </nav>
      </header>
    </CommonContainer>
  </div>
</template>

<script setup>
  import { pb } from "#imports";
  const config = useRuntimeConfig();
  const sitename = ref(String(config.public.sitename));
  const sitename2 = ref(String(config.public.sitename2));
  if (sitename.value == '') {
    sitename.value = 'ax';
    sitename2.value = 'iom';
  }

  const email = ref(pb.authStore.record?.email || '');

  const emailUsername = computed(() => email.value.split('@')[0]);
  const emailDomain = computed(() => email.value.split('@')[1]);

  const open = ref(false);

  const menuitems = [
  {
    title: "Dashboard",
    path: "/",
  },
  {
    title: "Profile",
    path: "/profile",
  }
];
</script>

<style scoped>
  .sticky-top {
    position: sticky;
    top: 0;
    z-index: 1000; /* Optional: Ensures the element stays on top of other content */
  }
</style>