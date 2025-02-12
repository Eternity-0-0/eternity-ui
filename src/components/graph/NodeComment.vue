<template>
  <div class="node-comment" ref="commentEl">
    {{ comment }}
  </div>
</template>

<script setup lang="ts">
// This component displays a node comment tooltip
// It receives a 'comment' prop containing the text of the comment

import { ref, onMounted } from 'vue'

defineProps<{ comment: string }>()

const commentEl = ref<HTMLElement | null>(null)

onMounted(() => {
  if (commentEl.value) {
    const rect = commentEl.value.getBoundingClientRect()
    console.log('NodeComment position:', {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height
    })
  }
})
</script>

<style scoped>
.node-comment {
  position: absolute;
  transform: translate(calc(0% - 5px), calc(-100% + 5px));  /* Align bottom with hover point, plus 8px gap */
  background: var(--background-color-dark);
  border: 1px solid var(--secondary-text-color-dark);
  padding: 12px 16px;
  font-size: 16px;
  color: var(--text-color-dark);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
  max-width: 400px;  /* Increased maximum width */
  min-width: 200px;  /* Increased minimum width */
  min-height: 50px;
  line-height: 1.5;  /* Slightly increased line height */
  text-align: left;
}

.node-comment::after {
  content: "";
  position: absolute;
  bottom: -6px;  /* Position at the bottom */
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: var(--background-color-dark) transparent transparent transparent;
}
</style> 