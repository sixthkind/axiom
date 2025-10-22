declare global {
  var $config: ReturnType<typeof useRuntimeConfig>
  var environment: string
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Make config globally available
  globalThis.environment = config.public.environment;
})