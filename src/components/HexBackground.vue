<template>
  <div class="hexagon-container">
    <!-- Your page content goes here -->
    <slot></slot>
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
  height: 100vh; /* Adjust as needed */
  background-color: var(--background-color-dark);
  background-image: var(--background_hexagon-path-dark);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 180%; /* Displays the central 80% of the image */
  position: relative;
}
</style>
