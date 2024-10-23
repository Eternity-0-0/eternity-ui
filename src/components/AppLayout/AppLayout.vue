<script lang="ts">
import AppHeader from '../AppHeader/AppHeader.vue';
import { RouterView } from 'vue-router';

export default {
    components: {AppHeader, RouterView}
}
</script>

<template>
  <div class="h-screen bg-slate-100">
    <AppHeader />
    <div class="max-w-[1280px] mx-auto w-full px-4 h-[calc(100vh-88px)] pt-4">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>

</style>
