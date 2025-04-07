<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:justify-between gap-3 px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold">{{ props.type.charAt(0).toUpperCase() + props.type.slice(1) }}&nbsp;({{ filteredRows.length }})</h2>

      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div class="flex items-center gap-2">
          <UButton @click="items" :color="props.type === 'items' ? 'primary' : 'gray'" size="sm">items</UButton>
          <UButton @click="tags" :color="props.type === 'tags' ? 'primary' : 'gray'" size="sm">tags</UButton>
        </div>
        <UInput v-model="searchQuery" :placeholder="`Search ${props.type}`" class="w-full sm:w-auto"/>
        <div class="flex items-center gap-2">
          <USelectMenu v-model="selectedColumns" :options="columns" multiple placeholder="Columns" class="w-full sm:w-auto"/>
          <UButton @click="refresh" color="primary" size="sm"><Icon name="lucide:refresh-cw" /></UButton>
          <UButton @click="add" color="primary" size="sm"><Icon name="lucide:plus" /></UButton>
        </div>
      </div>
    </div>

    <UTable 
      :rows="filteredRows" 
      :columns="selectedColumns" 
      :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Nothing found' }"
      :loading="props.loading"
      @select="handleRowClick"
    />
  </div>
</template>

<script setup lang="ts">
  import { tableColumns, tableComputed } from '#imports';
  const props = defineProps(['rows', 'type', 'loading', 'clickable', 'edit']);
  const emit = defineEmits(['refresh']);
  // Loads the columns for the table
  const columns = tableColumns[props.type];
  const clickable = props.clickable || false;
  
  // This handles computed properties for the table
  const computedRows = computed(() => {
    return props.rows.map((row: Record<string, any>) => ({
      ...row,
      ...(tableComputed[props.type]?.(row) || {})
    }))
  })

  // This handles Selected Columns
  const selectedColumns = ref([...columns])


  // This handles search
  const searchQuery = ref('')
  const filteredRows = computed(() => {
    if (!searchQuery.value) {
      return computedRows.value
    }

    return computedRows.value.filter((row: any) => {
      return Object.values(row).some((value: any) => {
        return String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
      })
    })
  })

  // This handles row click
  const handleRowClick = (row: any) => {
    if (clickable) {
      if(props.edit) {
        window.location.href = `/edit/${props.type}/${row.id}`;
      } else {
        window.location.href = `/${props.type}/${row.id}`;
      }
    }
  }

  const refresh = () => {
    emit('refresh')
  }

  const add = () => {
    window.location.href = `/edit/${props.type}`;
  }

  const items = () => {
    window.location.href = `/`;
  }

  const tags = () => {
    window.location.href = `/tags`;
  }
</script>

