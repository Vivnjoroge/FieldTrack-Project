<script setup>
import { computed, defineProps } from "vue";

const props = defineProps(["role"]);

const menuItems = computed(() => ({
  Admin: [{ label: "Manage Users", path: "/admin/users" }],
  Manager: [{ label: "Reports", path: "/manager/reports" }],
  Finance: [{ label: "Finance Dashboard", path: "/finance" }],
  Employee: [{ label: "Tasks", path: "/employee/tasks" }],
}[props.role] || []));
</script>

<template>
  <aside class="w-64 bg-gray-800 text-white h-screen p-4">
    <h2 class="text-xl font-bold">{{ role }} Panel</h2>
    <ul class="mt-4">
      <li v-for="item in menuItems" :key="item.label" class="py-2">
        <router-link :to="item.path" class="block px-4 py-2 hover:bg-gray-700 rounded">
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </aside>
</template>
