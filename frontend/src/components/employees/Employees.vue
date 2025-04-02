<script setup>
import { ref, onMounted } from "vue";

const employees = ref([]);
const error = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/employees", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch employees.");
    }

    employees.value = await response.json();
    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
});
</script>


<template>
    <div class="p-4">
      <h2 class="text-2xl font-semibold mb-4">Employee List</h2>
      <div v-if="employees.length > 0">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="employee in employees" :key="employee.Employee_ID">
              <td class="px-6 py-4 whitespace-nowrap">{{ employee.Employee_ID }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ employee.Name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ employee.Department }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ employee.Email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ employee.Role }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else-if="loading" class="text-gray-600 italic">Loading employees...</p>
      <p v-else-if="error" class="text-red-600">{{ error }}</p>
      <p v-else class="text-gray-600 italic">No employees found.</p>
    </div>
  </template>