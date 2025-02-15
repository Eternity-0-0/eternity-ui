<template>
    <div class="search-container" v-click-outside="handleClickOutside">
      <img src="@/assets/search_icon.svg" class="search-icon" :class="{ 'search-icon-active': query || isFocused }" alt="Search" />
      <input
        type="text"
        v-model="query"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter="selectHighlighted"
        placeholder="Search..."
        class="search-input"
      />
      <ul v-if="suggestions.length" class="suggestion-list">
        <li
          v-for="(item, index) in suggestions"
          :key="index"
          @click="selectSuggestion(item)"
          class="suggestion-item"
          :class="{ 'suggestion-item-hover': hoveredIndex === index }"
          @mouseover="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
        >
          {{ item.name_for_rendering }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import Fuse from "fuse.js";
  
  export default {
    name: "SearchBar",
    props: {
      options: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        query: "",
        suggestions: [],
        fuse: null,
        hoveredIndex: null,
        isFocused: false,
      };
    },
    mounted() {
      // Initialize Fuse.js with the options
      this.fuse = new Fuse(this.options, {
        threshold: 0.3,
        keys: ['name_for_rendering']
      });
    },
    directives: {
      clickOutside: {
        mounted(el, binding) {
          el.clickOutsideEvent = function(event) {
            if (!(el === event.target || el.contains(event.target))) {
              binding.value(event);
            }
          };
          document.addEventListener('click', el.clickOutsideEvent);
        },
        unmounted(el) {
          document.removeEventListener('click', el.clickOutsideEvent);
        },
      },
    },
    methods: {
      onInput() {
        if (this.query.trim()) {
          const results = this.fuse.search(this.query);
          this.suggestions = results.slice(0, 10).map((result) => result.item); // Limit to 10 results
          this.hoveredIndex = null; // Reset hover index when suggestions change
        } else {
          this.suggestions = [];
          this.hoveredIndex = null;
        }
      },
      selectSuggestion(item) {
        this.query = ""; // Clear the search input
        this.$emit('search', item);
        this.suggestions = [];
        this.hoveredIndex = null;
      },
      handleClickOutside() {
        this.suggestions = [];
        this.hoveredIndex = null;
      },
      navigateDown() {
        if (this.suggestions.length) {
          if (this.hoveredIndex === null) {
            this.hoveredIndex = 0;
          } else {
            this.hoveredIndex = (this.hoveredIndex + 1) % this.suggestions.length;
          }
        }
      },
      navigateUp() {
        if (this.suggestions.length) {
          if (this.hoveredIndex === null) {
            this.hoveredIndex = this.suggestions.length - 1;
          } else {
            this.hoveredIndex = (this.hoveredIndex - 1 + this.suggestions.length) % this.suggestions.length;
          }
        }
      },
      selectHighlighted() {
        if (this.hoveredIndex !== null && this.suggestions[this.hoveredIndex]) {
          this.selectSuggestion(this.suggestions[this.hoveredIndex]);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .search-container {
    position: relative;
    width: 100%;
    margin: 20px;
    padding: 0 20px 0 15px;
    background-color: var(--wiki-background-color-dark);
    border: 3px solid var(--wiki-stroke-color-dark);
    border-radius: 30px;
    height: 60px;
    display: flex;
    align-items: center;
  }
  
  .search-icon {
    width: 30px;
    height: 30px;
    margin-right: 5px;
    filter: invert(82%) sepia(0%) saturate(0%) hue-rotate(137deg) brightness(92%) contrast(92%);
    transition: filter 0.2s ease;
  }

  .search-icon-active {
    filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
  }

  .search-input {
    width: 100%;
    padding: 8px;
    font-size: 18px;
    background-color: transparent;
    border: none;
    color: var(--text-color-dark);
    outline: none; /* Remove the focus outline */
    font-family: 'Lexend Deca', sans-serif;
    font-weight: 100;
  }
  
  .suggestion-list {
    position: absolute;
    top: 100%;
    left: 20px;
    width: calc(100% - 40px);
    margin: 0;
    padding: 0;
    list-style: none;
    background-color: var(--wiki-background-color-dark);
    border: 3px solid var(--wiki-stroke-color-dark);
    border-radius: 0 0 20px 20px;
    z-index: 10;
  }
  
  .suggestion-item {
    height: 40px;
    padding: 0 10px;
    cursor: pointer;
    color: var(--text-color-dark);
    font-family: 'Lexend Deca', sans-serif;
    font-size: 18px;
    display: flex;
    align-items: center;
    border-radius: 10px;
    margin: 0px 10px;
  }
  
  .suggestion-item span {
    padding-left: 10px;
  }
  
  .suggestion-item-hover {
    background-color: var(--wiki-stroke-color-dark);
  }

  .suggestion-item:first-child {
    margin-top: 7px;
  }

  .suggestion-item:last-child {
    margin-bottom: 10px;
  }
  </style>