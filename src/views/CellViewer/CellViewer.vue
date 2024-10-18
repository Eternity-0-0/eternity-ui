<template>
  <div class="cell-viewer-root">
    <Cell3D class="cellWrapper" />
    <EntityWiki />
  </div>
</template>
  
<script lang="ts">
  import Cell3D from '@components/Cell3D/Cell3D.vue';
  import EntityWiki from '@components/EntityWiki/EntityWiki.vue';
  
  export default {
    components: {
      Cell3D, EntityWiki
    },
    data() {}
  }
</script>
  
<style scoped>
.cell-viewer-root {
    height: 100%;
    padding: 0;
    margin: 0;
    display: grid;
    column-gap: 8px;
    grid-template-columns: 60% 40%;
}
</style>
  