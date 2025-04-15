<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '../layouts/Header.vue';
import EmployeeSidebar from '@/components/sidebars/EmployeeSidebar.vue';
import ManagerSidebar from '@/components/sidebars/ManagerSidebar.vue';
import FinanceSidebar from '@/components/sidebars/FinanceSidebar.vue';
import Navigation from '@/components/layouts/Navigation.vue';


const userRole = ref(localStorage.getItem("role") || "Employee");

// ✅ This controls whether the sidebar is open or not
/* const sidebarOpen = ref(true); */

const SidebarComponent = computed(() => {
  switch (userRole.value) {
    case "Manager":
      return ManagerSidebar;
    case "Finance":
      return FinanceSidebar;
    case "Admin":
      return AdminSidebar;
    default:
      return EmployeeSidebar;
  }
});

onMounted(() => {
  userRole.value = localStorage.getItem("role") || "Employee";
});
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <component :is="SidebarComponent" :open="sidebarOpen" />

    <div class="flex-1 flex flex-col overflow-hidden transition-margin-left duration-300" :class="{ 'ml-64': sidebarOpen }">
    <!--   <div class="p-2 bg-white shadow-md">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          {{ sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar' }}
        </button>
      </div> -->

      <Navigation />
      <Header />

      <main class="flex-1 p-6 bg-white rounded-lg shadow-md overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.transition-margin-left {
  transition: margin-left 0.3s ease-in-out;
}
</style>