<script setup>
import { defineProps } from 'vue';

defineProps({
  segments: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<template>
  <nav v-if="segments.length > 0" class="text-sm text-gray-500" aria-label="Breadcrumb">
    <ol class="list-none p-0 inline-flex">
      <li class="flex items-center" v-for="(segment, index) in segments" :key="index">
        <router-link v-if="segment.path" :to="segment.path" class="hover:text-blue-600">
          <span v-html="segment.label"></span>
        </router-link>
        <span v-else v-html="segment.label"></span>
        <svg v-if="index < segments.length - 1" class="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M27.66 247l192-192c4.68-4.68 12.28-4.68 16.97 0l192 192c4.69 4.69 4.69 12.29 0 16.97l-192 192c-4.69 4.69-12.29 4.69-16.97 0l-192-192c-4.68-4.68-4.68-12.28 0-16.97z"/></svg>
      </li>
    </ol>
  </nav>
</template>
