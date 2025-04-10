<template>
  <TableUI
    class="animated fadeInUp"
    :rows="items" 
    type="items"
    :loading="loading"
    :clickable="true"
    :edit="true"
    @refresh="refresh"
  />
</template>

<script setup>
  import { pb } from '#imports';

  const items = ref([]);
  const loading = ref(true);
  // const activeTab = ref(false);
  // const tabs = [
  //   { label: 'Open', value: false },
  //   { label: 'Done', value: true }
  // ];

  // Fetch items for the counselor
  const fetchItems = async () => {
    try {
        const records = await pb.collection('items').getFullList({
        sort: '-created',
        expand: 'tags'
      });
      items.value = records;
      console.log(items.value);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => {
    loading.value = true;
    fetchItems();
  }

  // watch(activeTab, () => {
  //   loading.value = true;
  //   fetchItems();
  // });

  onMounted(() => {
    fetchItems();
  });
</script>