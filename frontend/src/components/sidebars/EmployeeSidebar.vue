<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// Employee Sidebar Menu
const employeeMenu = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Submit Expense", path: "/expenses", icon: "💰" },
  { name: "Request Resources", path: "/resources", icon: "🛠️" },
  { name: "Request Reimbursement", path: "/request-reimbursement", icon: "🔄" },
  { name: "View Status", path: "/status", icon: "📋" },
];

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
  <aside class="w-64 bg-gray-800 text-white h-screen p-4">
    <h2 class="text-xl font-bold mb-6">Employee Panel</h2>
    <ul>
      <li v-for="item in employeeMenu" :key="item.path" 
          class="mb-2 px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-lg flex items-center"
          @click="navigate(item.path)">
        <span class="mr-2">{{ item.icon }}</span> {{ item.name }}
      </li>
    </ul>
  </aside>
</template>

<style scoped>
/* Add custom styling if needed */
</style>
