import PocketBase from 'pocketbase';
const config = useRuntimeConfig()
const pocketbaseURL = String(config.public.pocketbaseURL);
const pb = new PocketBase(pocketbaseURL);
pb.autoCancellation(false);
export { pb };