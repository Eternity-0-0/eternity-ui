<template>
    <div class="search-container">
      <input
        type="text"
        v-model="query"
        @input="onInput"
        placeholder="Search..."
        class="search-input"
      />
      <ul v-if="suggestions.length" class="suggestion-list">
        <li
          v-for="(item, index) in suggestions"
          :key="index"
          @click="selectSuggestion(item)"
          class="suggestion-item"
        >
          {{ item }}
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
      };
    },
    mounted() {
      // Initialize Fuse.js with the options
      this.fuse = new Fuse(this.options, {
        threshold: 0.3, // Adjust threshold for matching accuracy
      });
    },
    methods: {
      onInput() {
        if (this.query.trim()) {
          const results = this.fuse.search(this.query);
          this.suggestions = results.slice(0, 10).map((result) => result.item); // Limit to 10 results
        } else {
          this.suggestions = [];
        }
      },
      selectSuggestion(item) {
        console.log(`Selected: ${item}`);
        this.query = item;
        this.suggestions = [];
      },
    },
  };
  </script>
  
  <style scoped>
  .search-container {
    position: relative;
    width: 300px;
  }
  .search-input {
    width: 100%;
    padding: 8px;
    font-size: 16px;
  }
  .suggestion-list {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid #ccc;
    background: white;
    z-index: 10;
  }
  .suggestion-item {
    padding: 8px;
    cursor: pointer;
  }
  .suggestion-item:hover {
    background: #f0f0f0;
  }
  </style>
  