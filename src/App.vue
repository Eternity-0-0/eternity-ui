<template>
  <div class="app-root">
    <AppHeader />
    <CellViewer />
  </div>
</template>

<script lang="ts">
import AppHeader from './components/AppHeader/AppHeader.vue';
import CellViewer from './views/CellViewer/CellViewer.vue';

export default {
  components: {
    CellViewer, AppHeader
  }
}
</script>

<style scoped>
.app-root {
  padding: 16px;
  display: grid;
  height: 100vh;
  grid-template-rows: 60px auto;
  row-gap: 8px;
}
</style>
