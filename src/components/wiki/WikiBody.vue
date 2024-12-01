<template>
  <div class="wiki-body">
    <div class="content-container">
      <div class="text-content">
        <p v-for="(paragraph, index) in paragraphs" :key="index">
          {{ paragraph }}
        </p>
      </div>
      <div class="metadata-container">
        <img :src="wikiBody.image" alt="Wiki Entry Image" class="metadata-image">
        <div class="metadata-table">
          <div v-for="(value, key) in wikiBody.metainfo" :key="key" class="metadata-row">
            <span class="metadata-label">{{ key }}</span>
            <span class="metadata-value">{{ value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { WikiBody } from '@/models/WikiBody'

export default {
  name: 'WikiBody',
  props: {
    wikiBody: {
      type: WikiBody,
      required: true
    }
  },
  computed: {
    paragraphs() {
      return this.wikiBody.text.split('\n').filter(p => p.trim());
    }
  }
}
</script>

<style scoped>
.wiki-body {
  padding: 28px 20px 20px 32px;
}

.content-container {
  display: flex;
  gap: 20px;
}

.metadata-container {
  flex-shrink: 0;
  width: 300px;
  padding: 0 10px 0 10px;
}

.metadata-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  padding-top: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  filter: brightness(0) invert(1);
}

.metadata-table {
  display: flex;
  flex-direction: column;
}

.metadata-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 18px;
}

.metadata-label {
  color: var(--secondary-text-color-dark);
}

.metadata-value {
  color: var(--text-color-dark);
}

.text-content {
  color: var(--text-color-dark);
  font-size: 18px;
  flex-grow: 1;
  line-height: 1.6;
}

.text-content p {
  margin-bottom: 1em;
}
</style>
