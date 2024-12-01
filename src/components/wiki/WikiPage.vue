<template>
  <div class="wiki-page">
    <div class="container">
      <WikiHeader :navigation="mockWikiHeader.navigation" :title="mockWikiHeader.title" />
    </div>
    <div class="container">
      <WikiBody :wiki-body="mockWikiBody" />
    </div>
  </div>
</template>

<script>
import WikiHeader from './WikiHeader.vue'
import WikiBody from './WikiBody.vue'
import WikiRelatedProcesses from './WikiRelatedProcesses.vue'
import { mockWikiHeader } from '@/mocks/WikiHeader'
import { mockWikiBody } from '@/mocks/WikiBody'

export default {
  name: 'WikiPage',
  components: {
    WikiHeader,
    WikiBody,
    WikiRelatedProcesses
  },
  data() {
    return {
      mockWikiHeader,
      mockWikiBody
    }
  }
}
</script>

<style scoped>
.wiki-page {
  margin: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.container {
  background-color: var(--wiki-background-color-dark);
  border: 3px solid var(--wiki-stroke-color-dark);
  border-radius: 30px;
}
</style>
