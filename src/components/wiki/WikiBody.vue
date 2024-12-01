<template>
  <div class="wiki-body">
    <div class="content-container">
      <div class="metadata-container">
        <img src="" alt="Wiki Entry Image" class="metadata-image">
        <div class="metadata-table">
          <div class="metadata-row">
            <span class="metadata-label">Label 1</span>
            <span class="metadata-value">Value 1</span>
          </div>
          <div class="metadata-row">
            <span class="metadata-label">Label 2</span>
            <span class="metadata-value">Value 2</span>
          </div>
          <div class="metadata-row">
            <span class="metadata-label">Label 3</span>
            <span class="metadata-value">Value 3</span>
          </div>
        </div>
      </div>
      <div class="text-content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WikiBody'
}
</script>

<style scoped>
.wiki-body {
  padding: 20px;
}

.content-container {
  display: flex;
  gap: 20px;
}

.metadata-container {
  flex-shrink: 0;
  width: 300px;
  border: 1px solid var(--wiki-stroke-color-dark);
  border-radius: 4px;
  padding: 10px;
}

.metadata-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.metadata-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metadata-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid var(--wiki-stroke-color-dark);
}

.metadata-label {
  font-weight: bold;
  color: var(--text-color-dark);
}

.metadata-value {
  color: var(--text-color-dark);
}

.text-content {
  flex-grow: 1;
  line-height: 1.6;
}
</style>
