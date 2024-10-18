<template>
  <BasePanel class="base-panel">
    <p class="m-1">
      Тип:
    </p>
    <p class="m-1">
      Размер:
    </p>
    <p class="m-1">
      Локация:
    </p>
  </BasePanel>
</template>
    
  <script lang="ts">
    import BasePanel from 'primevue/panel';
    
    export default {
      components: {
        BasePanel
      }
    }
  </script>
    
  <style scoped>
  .base-panel {
    border: 1px solid rgb(230, 230, 230);
  }
  </style>
    