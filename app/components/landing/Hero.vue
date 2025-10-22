<template>
  <main class="flex items-center justify-center text-center">
    <div>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <h1 class="text-5xl lg:text-6xl xl:text-6xl font-bold">
        <span class="font-bold text-primary">_</span><span class="font-bold text-slate-700">template</span>
      </h1>
      <p class="text-lg mt-4 text-slate-600 max-w-xl">
        <b><span class="text-primary">All</span><span class="font-bold text-slate-400">-in-one</span></b> project template
      </p>
      <p><a href="https://nuxt.com" target="_blank" class="text-primary">Nuxt</a> + <a href="https://pocketbase.io" target="_blank" class="text-primary">Pocketbase</a></p>
    </div>
  </main>
</template>

<style scoped>
  /* Ensure the parent container takes the full height of the viewport */
  html, body, #app, main {
    height: 100%;
    margin: 0;
  }

  img {
    transition: transform 0.3s ease-in-out; /* Adjust the duration and timing function as needed */
  }

  .hoverrotate:hover {
    transform: scale(1.20) rotate(10deg);
  }
</style>