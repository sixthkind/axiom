import PocketBase from 'pocketbase';

let _pb: PocketBase | null = null;

function getPocketBase() {
  if (!_pb) {
    const config = useRuntimeConfig();
    const pocketbaseURL = String(config.public.pocketbaseURL);
    _pb = new PocketBase(pocketbaseURL);
    _pb.autoCancellation(false);
  }
  return _pb;
}

// Export a getter that returns the singleton instance
export const pb = new Proxy({} as PocketBase, {
  get(target, prop) {
    const instance = getPocketBase();
    const value = instance[prop as keyof PocketBase];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});