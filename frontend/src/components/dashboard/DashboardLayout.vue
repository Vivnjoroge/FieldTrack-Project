<!-- src/components/Layout.vue -->
<script setup>
import Header from './Header.vue';
import Sidebar from './Sidebar.vue';
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <Header />

      <!-- Main content area -->
      <main class="flex-1 p-6 bg-white rounded-lg shadow-md overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
