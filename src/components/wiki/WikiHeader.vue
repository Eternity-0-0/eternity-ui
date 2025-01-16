<template>
  <div class="wiki-header">
    <div class="navigation">
      <template v-for="(item, index) in wikiHeaderData.navigation" :key="index">
        <span class="nav-item">{{ item }}</span>
        <span v-if="index < wikiHeaderData.navigation.length - 1" class="nav-separator">&gt;</span>
      </template>
    </div>
    <div class="title">
      {{ wikiHeaderData.title }}
    </div>
  </div>
</template>

<script>
import { WikiHeaderData } from '@/models/WikiHeaderData'

export default {
  name: 'WikiHeader',
  props: {
    wikiHeaderData: {
      type: WikiHeaderData,
      required: true
    }
  }
}
</script>

<style scoped>
.wiki-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Lexend Deca', sans-serif;
  padding-left: 32px;
  padding-top: 28px;
  padding-bottom: 20px;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  font-size: 20px;
}

.nav-item {
  color: var(--text-color-dark);
}

.nav-separator {
  color: var(--text-color-dark);
  opacity: 0.7;
}

.title {
  width: 100%;
  font-size: 34px;
  font-weight: bold;
  color: var(--text-color-dark);
}
</style>
