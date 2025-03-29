<script setup>
import Header from '@/components/layouts/Header.vue'
import EmployeeSidebar from '@/components/sidebars/EmployeeSidebar.vue';
import Navigation from '@/components/layouts/Navigation.vue';
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <EmployeeSidebar />

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Navigation (Including Logout Button) -->
      <Navigation />

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
