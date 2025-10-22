<template>
  <TableUI
    class="animated fadeInUp"
    :rows="clients" 
    type="clients"
    :loading="loading"
    :clickable="true"
    :edit="true"
    @refresh="refresh"
  />
</template>

<script setup>
import { pb } from '#imports';

const clients = ref([]);
const loading = ref(true);
// const activeTab = ref(false);
// const tabs = [
//   { label: 'Open', value: false },
//   { label: 'Done', value: true }
// ];

// Fetch items for the counselor
const fetchClients = async () => {
  try {
      const records = await pb.collection('clients').getFullList({
      sort: '-created',
      expand: 'tags'
    });
    clients.value = records;
  } catch (error) {
    console.error('Error fetching clients:', error);
  } finally {
    loading.value = false;
  }
};

const refresh = () => {
  loading.value = true;
  fetchClients();
}

// watch(activeTab, () => {
//   loading.value = true;
//   fetchClients();
// });

onMounted(() => {
  fetchClients();
});
</script>