<template>
  <div id="app">
    <Cell3D />
  </div>
</template>

<script lang="ts">
import Cell3D from './components/Cell3D/Cell3D.vue';


export default {
  components: {
    Cell3D
  }
}
</script>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
