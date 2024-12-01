<template>
  <HexBackground>
    <div class="main-container">
      <div class="wiki-container">
        <WikiPage />
      </div>
    </div>
  </HexBackground>
</template>

<script>
import HexBackground from './HexBackground.vue'
import WikiPage from './wiki/WikiPage.vue'

export default {
  name: 'MainPage',
  components: {
    HexBackground,
    WikiPage
  }
}
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  display: flex;
}

.wiki-container {
  width: 50%;
  height: 100%;
}
</style>
