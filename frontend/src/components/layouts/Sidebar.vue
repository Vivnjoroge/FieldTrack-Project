<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

// Reactive variable for user role
const userRole = ref(null);
const router = useRouter();

// Get role from localStorage on mount
onMounted(() => {
  userRole.value = localStorage.getItem("role") || "Employee";
});

// Define sidebar items based on role
const sidebarItems = computed(() => {
  const commonLinks = [{ name: "Dashboard", path: "/dashboard" }];

  const roleBasedLinks = {
    Admin: [{ name: "Manage Users", path: "/admin" }],
    Manager: [{ name: "Team Overview", path: "/manager" }],
    Finance: [{ name: "Finance Reports", path: "/finance" }],
    Employee: [{ name: "My Tasks", path: "/dashboard" }],
  };

  return [...commonLinks, ...(roleBasedLinks[userRole.value] || [])];
});

// Logout function
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  router.push("/auth"); // Redirect to login page
};
</script>

<template>
  <aside class="w-64 bg-blue-800 text-white h-full p-4">
    <h2 class="text-xl font-bold mb-4">Sidebar</h2>
    
    <nav>
      <ul>
        <li v-for="item in sidebarItems" :key="item.path" class="mb-2">
          <router-link :to="item.path" class="block p-2 rounded hover:bg-blue-700">
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Logout Button -->
    <button
      @click="logout"
      class="mt-6 w-full bg-red-500 hover:bg-red-700 text-white py-2 rounded"
    >
      Logout
    </button>
  </aside>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
