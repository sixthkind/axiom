import { App } from '@capacitor/app'
import type { URLOpenListenerEvent } from '@capacitor/app'

export default defineNuxtPlugin(() => {
  const router = useIonRouter();

  // Listen for deep links
  App.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
    // Example url: https://axiom.app/tabs/tabs2
    // slug = /tabs/tabs2
    const slug = event.url.split('.app').pop();
    console.log('slug', slug);
    
    // We only push to the route if there is a slug present
    if (slug) {
      router.push(slug);
    }
  });
});

