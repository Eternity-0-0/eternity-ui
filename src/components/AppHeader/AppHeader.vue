<template>
  <BaseToolbar class="header">
    <template #start>
      Eternity
    </template>
  </BaseToolbar>
</template>
  
<script lang="ts">
  import BaseToolbar from 'primevue/toolbar';
  export default {
    components: {
        BaseToolbar
    }
  }
</script>
  
<style scoped>
  .header {
    border-radius: 0.5rem;
    padding: 1rem 1rem 1rem 1.5rem;
    background-color: white; 
    border: 1px solid rgb(230, 230, 230);
  }
</style>
  