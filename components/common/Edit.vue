<template>
  <div>
    <div v-if="isLoaded" class="k-container animated fadeInUp">

      <div class="mb-4 flex justify-between">
        <div class="flex items-center gap-2">
          <button 
            @click="goBack" 
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-90 hover:bg-opacity-70 transition-all"
          >
            <Icon name="lucide:chevron-left" size="1.4em" class="text-slate-500" />
          </button>
          <h2 class="font-bold text-2xl text-slate-600">
            {{ id ? 'Edit' : 'Add' }} {{ Utils.capitalize(Utils.decamelize(Utils.singular(type))) }}
          </h2>
        </div>
        <div class="flex gap-2" v-if="id && isDeletionAllowed">
          <button 
            v-if="!isConfirm"
            @click="toggleConfirm" 
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-90 hover:bg-opacity-70 transition-all"
          >
            <Icon name="lucide:trash-2" size="1.4em" class="text-red-500" />
          </button>

          <button 
            v-if="isConfirm"
            @click="deleteItem" 
            class="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-all"
          >
            <Icon name="lucide:check" size="1.4em" class="text-white" />
          </button>

          <button 
            v-if="isConfirm"
            @click="toggleConfirm" 
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-90 hover:bg-opacity-70 transition-all"
          >
            <Icon name="lucide:x" size="1.4em" class="text-slate-500" />
          </button>
        </div>
      </div>

      <div class="k-item animated fadeInUp">
        <Vueform :schema="schema" v-model="data" @submit="handleSubmit" sync></Vueform>
      </div>
    </div>

    <div 
      v-if="isSuccess" 
      class="fixed bottom-4 left-4 bg-green-50 text-green-700 px-6 py-3 rounded-2xl flex items-center gap-2 animated fadeInUp shadow-lg z-50">
      <Icon name="lucide:check-circle" class="text-green-600" />
      <span>Successfully saved!</span>
    </div>

    <div 
      v-if="isError" 
      class="fixed bottom-4 left-4 bg-red-50 text-red-700 px-6 py-3 rounded-2xl flex items-center gap-2 animated fadeInUp shadow-lg z-50">
      <Icon name="lucide:alert-circle" class="text-red-600" />
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { pb, getSchema, Utils } from '#imports';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const isLoaded = ref(false);
  const isSuccess = ref(false);
  const isConfirm = ref(false);
  const schema = ref({});
  const data = ref({});

  const type = route.params.type;
  const id = route.params.id;

  // the following are used when creating a new item and the item is related to another item
  const field = route.query.field; // the field that this item is occupying
  const collection = route.query.collection; // the collection that this item is related to
  const relationid = route.query.relationid; // the id of the item that this item is related to
  let prefill = route.query.prefill; // the id of the item that this item is related to
  if(prefill) prefill = JSON.parse(decodeURIComponent(prefill));

  // the following is a query parameter to 'filter' the form to only show certain fields. This allows for more control over forms.
  const filter = route.query.filter;
  // Filter form fields by query params
  if(filter) {
    let filterArray = filter.split(",");
    const filteredForm = Object.fromEntries(
      Object.entries(formSchema).filter(([key]) => filterArray.includes(key))
    );
    formSchema = filteredForm;
  }

  // Check if the type is in the array of non-deletable types
  const isDeletionAllowed = !(await getSchema('notdeletable')).includes(type);
  let formSchema = await getSchema(type);
  const isError = ref(false);
  const errorMessage = ref('')

  const init = async () => {
    if (id) {
      // If there is an id, get the record
      const record = await pb.collection(type).getOne(id);
      // Set the data to the record using schema keys
      populateFormData(record); 
    }
    
    // add a button to the schema
    schema.value = {
      ...formSchema,
      button: { type: 'button', "button-label": `${id ? 'Save' : 'Add'}`, submits: true, class: 'ml-auto font-bold' }
    }
  }

  const goBack = () => {
    window.history.back();
  }

  const toggleConfirm = () => {
    isConfirm.value = !isConfirm.value;
  }

  const populateFormData = (record) => {
    Object.keys(formSchema).forEach(key => {
      if(record[key]) {
        if(formSchema[key]?.type == 'date' && 'timezone' in record) {
          // handle dates with timezone
          data.value[key] = Utils.reverseFormatDateWithTimezoneToISO(record[key], record['timezone']);
        } else {
          data.value[key] = record[key];
        }
      }
    });
  }

  const handleSubmit = async () => {
    try {
      if (id) {
        await updateItem();
      } else {
        await createItem();
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  const createSharedFormData = () => {
    // Create FormData for file uploads
    const formData = new FormData();

    // Append all non-file data
    Object.keys(data.value).forEach(key => {
      if (formSchema[key]?.type !== 'multifile' && formSchema[key]?.type !== 'file') {
        if(data.value[key]) {
          if(formSchema[key]?.type == 'date') {
            formData.append(key, formatDate(data.value[key]));
          } else if (Array.isArray(data.value[key])) {
            // Handle array fields
            data.value[key].forEach(value => {
              formData.append(`${key}`, value);
            });
          } else {
            formData.append(key, data.value[key]);
          }
        }
      }
    });

    Object.keys(formSchema).forEach(key => {
      // Handle file fields
      if (formSchema[key].type === 'file') {
        if(data.value[key]) {
          if (data.value[key] instanceof File) {
            formData.append(key, data.value[key]);
          }
        } else {
          formData.append(key, "");
        }
      }

      // Handle multifile fields
      if (formSchema[key].type === 'multifile') {
        if(data.value[key]) {
          if(Array.isArray(data.value[key])) {
            data.value[key].forEach(file => {
              formData.append(key, file);
            });
          }
        } else {
          formData.append(key, "");
        }
      }
    });

    // add prefill data
    if(prefill) {
      Object.keys(prefill).forEach(key => {
        formData.append(key, prefill[key]);
      });
    }

    return formData;
  }

  const formatDate = (item) => {
    let timezone = "UTC";
    if(data.value["timezone"]) {
      timezone = data.value["timezone"];
    }
    return Utils.formatDateWithTimezoneToISO(item, timezone);
  };

  const printFormData = (formData) => {
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
  }

  const showError = (message) => {
    errorMessage.value = message;
    isError.value = true;
    setTimeout(() => {
      isError.value = false;
      errorMessage.value = '';
    }, 3000);
  };

  const showSuccess = () => {
    isSuccess.value = true;
    setTimeout(() => {
      isSuccess.value = false;
      window.history.back();
    }, 1000);
  }

  const updateItem = async () => {
    try {
      const formData = createSharedFormData();
      printFormData(formData);
      await pb.collection(type).update(id, formData);
      showSuccess();
    } catch (error) {
      showError(error.message || 'Error updating item');
    }
  }

  const createItem = async () => {
    try {
      const formData = createSharedFormData();

      // add user relation
      formData.append('user', pb.authStore.record?.id);

      const record = await pb.collection(type).create(formData);

      // the following adds a back-relation if needed (included in url query)
      if(field && collection && relationid) {
        await pb.collection(collection).update(relationid, { [field]: record.id });
      }

      showSuccess();
    } catch (error) {
      showError(error.message || 'Error creating item');
    }
  }

  const deleteItem = async () => {
    // Safety check - prevent deletion if type is in nonDeletableTypes
    if (!isDeletionAllowed) {
      console.error('This type cannot be deleted');
      return;
    }

    // Check and Delete item's address if it exists
    if(data.value.address) {
      await pb.collection('addresses').delete(data.value.address);
    }

    // Delete the item
    await pb.collection(type).delete(id);
    goBack();
  }

  init();
  isLoaded.value = true;
</script>

<style scoped>
  .vueform__file__upload-button {
    display: none;
  }
</style>