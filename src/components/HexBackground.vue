<template>
  <div class="hexagon-container">
    <img src="@/assets/hexagons.svg" class="hexagon-pattern" alt="Hexagon pattern background">
  </div>
</template>

<script>
export default {
  name: 'HexagonBackground'
};
</script>

<style scoped>
.hexagon-container {
  width: 100%;
  background-color: var(--background-hexagon-color-dark); /* White background */
  overflow: hidden;
}
.hexagon-pattern {
  width: 100%;
  object-fit: cover;
  opacity: 0.8; /* Slightly transparent to show the background */
}
</style>
