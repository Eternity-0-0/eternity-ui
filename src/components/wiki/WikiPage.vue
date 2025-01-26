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

<script setup lang="ts">
import WikiHeader from './WikiHeader.vue'
import WikiBody from './WikiBody.vue'
import WikiRelatedProcesses from './WikiRelatedProcesses.vue'
import { WikiBodyData } from '@/models/WikiBodyData'
import { WikiHeaderData } from '@/models/WikiHeaderData'
import type { ComponentData } from '@/models/ComponentData'
import { computed } from 'vue'
import { Size } from '@/models/ComponentData'

const props = defineProps<{
  componentData: ComponentData
}>()

const wikiHeader = computed(() => {
  return new WikiHeaderData(
    [],
    props.componentData.nice_name
  )
})

const wikiBody = computed(() => {
  // Create a proper Size instance
  const size = new Size(
    props.componentData.size.min,
    props.componentData.size.max,
    props.componentData.size.value,
    props.componentData.size.unit
  )

  return new WikiBodyData(
    `${props.componentData.description}\n\n${props.componentData.function}`,
    props.componentData.image,
    props.componentData.whiten_image ?? true,
    {
      'Size': size.to_string()
    }
  )
})
</script>

<style scoped>
.wiki-page {
  margin: 10px 0 20px 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
}

.container {
  background-color: var(--wiki-background-color-dark);
  border: 3px solid var(--wiki-stroke-color-dark);
  border-radius: 30px;
}
</style>
