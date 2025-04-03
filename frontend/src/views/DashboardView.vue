<script setup>
import { ref, computed, defineAsyncComponent, onMounted } from "vue";
import DashboardLayout from "@/components/dashboard/DashboardLayout.vue";

// Define role-based components dynamically
const panels = {
  Admin: defineAsyncComponent(() => import("@/components/dashboard/AdminPanel.vue")),
  Employee: defineAsyncComponent(() => import("@/components/dashboard/EmployeePanel.vue")),
  Finance: defineAsyncComponent(() => import("@/components/dashboard/FinancePanel.vue")),
  Manager: defineAsyncComponent(() => import("@/components/dashboard/ManagerPanel.vue")),
};

// Reactive variable to store the user's role
const userRole = ref(null);

// Get role from localStorage on mount
onMounted(() => {
  userRole.value = localStorage.getItem("role") || "Employee"; // Default to Employee if not found
});

// Compute the correct component based on role
const selectedPanel = computed(() => panels[userRole.value] || panels.Employee);
</script>

<template>
  <DashboardLayout>
    <h1 class="text-2xl font-bold my-6">Dashboard</h1>
    <div class="w-full max-w-6xl">
      <component :is="selectedPanel" />
    </div>
  </DashboardLayout>
</template>



