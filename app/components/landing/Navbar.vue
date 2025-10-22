<script setup>
const menuitems = [
  {
    title: "About",
    path: "/",
  },
  {
    title: "Team",
    path: "/team",
  },
  {
    title: "Waitlist",
    path: "/waitlist",
  },
];

const open = ref(false);
</script>

<template>
  <LandingContainer class="sticky-top">
    <header class="flex flex-col lg:flex-row justify-between items-center my-5">
      <div class="flex w-full lg:w-auto items-center justify-between">

        <div class="bg-white bg-opacity-50 backdrop-blur mt-3 rounded-2xl border p-2">
          <a href="/">
            <span class="font-bold text-primary">_</span><span class="font-bold text-slate-400">launchpad</span>
          </a>
        </div>
      </div>

    </header>
  </LandingContainer>
</template>

<style scoped>
  .sticky-top {
    position: sticky;
    top: 0;
    z-index: 1000; /* Optional: Ensures the element stays on top of other content */
  }
</style>