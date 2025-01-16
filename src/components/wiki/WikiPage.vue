<template>
  <div class="wiki-page">
    <div class="container">
      <WikiHeader :wiki-header-data="wikiHeader" />
    </div>
    <div class="container">
      <WikiBody :wiki-body-data="wikiBody" />
    </div>
  </div>
</template>

<script>
import WikiHeader from './WikiHeader.vue'
import WikiBody from './WikiBody.vue'
import WikiRelatedProcesses from './WikiRelatedProcesses.vue'
import { WikiBodyData } from '@/models/WikiBodyData'
import { WikiHeaderData } from '@/models/WikiHeaderData'

export default {
  name: 'WikiPage',
  components: {
    WikiHeader,
    WikiBody,
    WikiRelatedProcesses
  },
  props: {
    componentData: {
      type: Object,
      required: true
    }
  },
  computed: {
    wikiHeader() {
      return new WikiHeaderData(
        [],
        this.componentData.nice_name
      )
    },
    wikiBody() {
      return new WikiBodyData(
        `${this.componentData.description}\n\n${this.componentData.function}`,
        this.componentData.image,
        {
          'Size': `${this.componentData.size.min}-${this.componentData.size.max} ${this.componentData.size.unit}`
        }
      )
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
