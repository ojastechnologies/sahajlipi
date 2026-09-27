<script setup>
import { computed, ref } from 'vue';
import { withBase } from 'vitepress';
import { convertText } from '../../../src/index.js';

const roman = ref('paani');
const nepali = computed(() => convertText(roman.value));
const examples = ['paani', 'paryo', 'camera', '123'];
</script>

<template>
  <section class="word-preview" aria-labelledby="preview-title">
    <div class="word-preview-heading">
      <img :src="withBase('/assets/brand/mark.svg')" alt="" width="42" height="42">
      <h2 id="preview-title">Roman keys. Nepali text.</h2>
    </div>
    <div class="word-preview-writing">
      <label for="roman-preview">Roman input</label>
      <input
        id="roman-preview"
        v-model="roman"
        type="text"
        maxlength="120"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="Try paani, camera, or 123"
      >
      <div class="word-preview-separator" aria-hidden="true">
        <span></span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M12 4v15m-5-5 5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span></span>
      </div>
      <label for="nepali-preview">Nepali Unicode</label>
      <output id="nepali-preview" for="roman-preview" aria-live="polite" lang="ne">{{ nepali }}</output>
    </div>
    <div class="word-preview-examples" role="group" aria-label="Try an example">
      <span>Try</span>
      <button v-for="example in examples" :key="example" type="button" @click="roman = example">{{ example }}</button>
    </div>
    <p class="word-preview-note">This preview uses the core converter. The demo shows live field editing and spelling alternatives.</p>
  </section>
</template>
