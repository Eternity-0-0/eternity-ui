<template>
    <div class="wiki-body">
      <div class="content-container">
        <!-- Move metadata-container before text-content for proper float behavior -->
        <div class="metadata-container">
          <img :src="'data:image/png;base64,' + wikiBodyData.image" alt="Wiki Entry Image" class="metadata-image" :class="{ 'whiten': wikiBodyData.whiten_image }">
          <div class="metadata-table">
            <div 
              v-for="(value, key) in wikiBodyData.metainfo" 
              :key="key" 
              class="metadata-row"
            >
              <span class="metadata-label">{{ key }}</span>
              <span class="metadata-value">{{ value }}</span>
            </div>
          </div>
        </div>
        <div class="text-content">
          <!-- Changed to use htmlParagraphs with v-html to render LaTeX equations -->
          <p v-for="(paragraph, index) in htmlParagraphs" :key="index" v-html="paragraph"></p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import katex from 'katex'
  import 'katex/dist/katex.min.css'
  import { WikiBodyData } from '@/models/WikiBodyData'
  
  export default {
    name: 'WikiBody',
    props: {
      wikiBodyData: {
        type: WikiBodyData,
        required: true
      }
    },
    computed: {
      paragraphs() {
        return this.wikiBodyData.text.split('\n').filter(p => p.trim());
      },
      htmlParagraphs() {
        return this.paragraphs.map(paragraph => this.renderLatex(paragraph));
      }
    },
    methods: {
      renderLatex(text) {
        return text
          .replace(/\$\$([\s\S]+?)\$\$/g, (match, content) => {
            try {
              return katex.renderToString(content, { displayMode: true, throwOnError: false });
            } catch (err) {
              console.error(err);
              return match;
            }
          })
          .replace(/\$([^\$]+?)\$/g, (match, content) => {
            try {
              return katex.renderToString(content, { displayMode: false, throwOnError: false });
            } catch (err) {
              console.error(err);
              return match;
            }
          });
      }
    }
  }
  </script>
  
  <style scoped>
  .wiki-body {
    padding: 28px 20px 20px 32px;
  }
  
  .content-container {
    /* Remove flex properties to allow text wrapping */
    /* display: flex; */
    /* gap: 20px; */
    overflow: hidden; /* Clear floats */
  }
  
  .metadata-container {
    float: right; /* Float the metadata to the right */
    width: 300px;
    padding: 0 10px 20px 10px;
    margin-left: 20px; /* Space between metadata and text */
  }
  
  .metadata-image {
    width: 100%;
    height: auto;
    object-fit: contain;
    padding-top: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .metadata-image.whiten {
    filter: brightness(0) invert(1);
  }
  
  .metadata-table {
    margin-top: 40px;
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
    /* flex-grow: 1; */ /* Remove flex properties */
    line-height: 1.6;
  }
  
  .text-content p {
    margin-bottom: 1em;
  }
  </style>  
