<template>
  <div class="wiki-page">
    <div class="container">
      <WikiHeader :wiki-header="wikiHeader" />
    </div>
    <div class="container">
      <WikiBody :wiki-body="wikiBody" />
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
      console.log(this.componentData)
      return new WikiHeaderData({
        navigation: [],
        title: this.componentData.nice_name
      })
    },
    wikiBody() {
      return new WikiBodyData({
        text: `${this.componentData.description}\n\n${this.componentData.function}`,
        image: this.componentData.image,
        metainfo: {
          'Size': `${this.componentData.size.min}-${this.componentData.size.max} ${this.componentData.size.unit}`
        }
      })
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
