<script setup>
import { ref, onMounted } from "vue";
import DashboardLayout from "@/components/dashboard/DashboardLayout.vue";
import AdminPanel from "@/components/dashboard/AdminPanel.vue";
import EmployeePanel from "@/components/dashboard/EmployeePanel.vue";
import FinancePanel from "@/components/dashboard/FinancePanel.vue";
import ManagerPanel from "@/components/dashboard/ManagerPanel.vue";

// Reactive variable to store the user's role
const userRole = ref(null);

// Get role from localStorage on mount
onMounted(() => {
  userRole.value = localStorage.getItem("role"); // Ensure this matches what you store after login
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center">
    <h1 class="text-2xl font-bold my-6">Dashboard</h1>

    <div class="w-full max-w-6xl">
      <AdminPanel v-if="userRole === 'Admin'" />
      <EmployeePanel v-if="userRole === 'Employee'" />
      <FinancePanel v-if="userRole === 'Finance'" />
      <ManagerPanel v-if="userRole === 'Manager'" />
    </div>
  </div>
</template>

