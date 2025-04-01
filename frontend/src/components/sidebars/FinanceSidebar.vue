
<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// Finance Sidebar Menu
const financeMenu = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "All Expenses", path: "/expenses", icon: "💰" },
  { name: "Reimbursement Requests", path: "/finance/reimbursements", icon: "🔄" },
  { name: "Financial Reports", path: "/reports", icon: "📊" },
];

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
  <aside class="w-64 bg-green-800 text-white h-screen p-4">
    <h2 class="text-xl font-bold mb-6">Finance Panel</h2>
    <ul>
      <li v-for="item in financeMenu" :key="item.path" 
          class="mb-2 px-4 py-2 hover:bg-green-700 cursor-pointer rounded-lg flex items-center"
          @click="navigate(item.path)">
        <span class="mr-2">{{ item.icon }}</span> {{ item.name }}
      </li>
    </ul>
  </aside>
</template>

<style scoped>
/* Custom styles if needed */
</style>
