<template>
  <TableUI
    class="animated fadeInUp"
    :rows="tags" 
    type="tags"
    :loading="loading"
    :clickable="true"
    :edit="true"
    @refresh="refresh"
  />
</template>

<script setup>
  import { pb } from '#imports';

  const tags = ref([]);
  const loading = ref(true);
  // const activeTab = ref(false);
  // const tabs = [
  //   { label: 'Open', value: false },
  //   { label: 'Done', value: true }
  // ];

  // Fetch items for the counselor
  const fetchTags = async () => {
    try {
        const records = await pb.collection('tags').getFullList({
        sort: '-created',
        expand: 'items_via_tags,clients_via_tags'
      });
      tags.value = records;
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => {
    loading.value = true;
    fetchTags();
  }

  // watch(activeTab, () => {
  //   loading.value = true;
  //   fetchTags();
  // });

  // onMounted(() => {
  //   console.log('tags mounted');
  //   fetchTags();
  // });

  fetchTags();

</script>