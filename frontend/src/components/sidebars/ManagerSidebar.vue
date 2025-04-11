<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// Manager Sidebar Menu
const managerMenu = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Expense Summary", path: "/expense-summary", icon: "📄" },
  { name: "View Employees", path: "/employees", icon: "👥" },
  { name: "Resource Requests", path: "/resources", icon: "🛠️" },
];

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
 <aside class="w-64 bg-gray-800 text-white h-screen p-4">
    <h2 class="text-xl font-bold mb-6">Manager Panel</h2>
    <ul>
      <li v-for="item in managerMenu" :key="item.path" 
          class="mb-2 px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-lg flex items-center"
          @click="navigate(item.path)">
        <span class="mr-2">{{ item.icon }}</span> {{ item.name }}
      </li>
    </ul>
  </aside>
</template>

