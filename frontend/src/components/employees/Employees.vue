<script setup>
import Breadcrumb from "../layouts/Breadcrumb.vue";
import { ref, onMounted } from "vue";

const employees = ref([]);
const error = ref(null);
const loading = ref(true);
const editingEmployee = ref(null);
const updatedEmployee = ref({});

const breadcrumbSegments = ref([
  { label: 'Dashboard', path: '/dashboard' }, 
  //{ label: 'Employees' },
]);


onMounted(fetchEmployees);

// Fetch Employees
async function fetchEmployees() {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/employees", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch employees.");
    }

    employees.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// Edit Employee
function startEditing(employee) {
  editingEmployee.value = employee.Employee_ID;
  updatedEmployee.value = { ...employee }; // Clone employee data
}

async function saveEdit() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/employees/${editingEmployee.value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedEmployee.value),
    });

    if (!response.ok) {
      throw new Error("Failed to update employee.");
    }

    // Update UI
    const index = employees.value.findIndex(emp => emp.Employee_ID === editingEmployee.value);
    employees.value[index] = { ...updatedEmployee.value };
    editingEmployee.value = null;
  } catch (err) {
    alert(err.message);
  }
}

// Delete Employee
async function deleteEmployee(employeeID) {
  if (!confirm("Are you sure you want to delete this employee?")) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/employees/${employeeID}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to delete employee.");
    }

    // Update UI
    employees.value = employees.value.filter(emp => emp.Employee_ID !== employeeID);
  } catch (err) {
    alert(err.message);
  }
}
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto bg-white shadow-xl rounded-lg">
    <Breadcrumb :segments="breadcrumbSegments" class="mb-4" />
    <h2 class="text-3xl font-bold text-blue-800 mb-6">Employee Management</h2>

    <!-- Loading & Error States -->
    <div v-if="loading" class="text-blue-600 font-medium">Loading employees...</div>
    <div v-else-if="error" class="text-red-500 font-semibold">{{ error }}</div>
    <div v-else-if="employees.length === 0" class="text-gray-500 italic">No employees found.</div>

    <!-- Employee Table -->
    <div v-else class="overflow-x-auto mt-4 rounded-md border border-gray-200">
      <table class="min-w-full text-sm text-left">
        <thead class="bg-blue-600 text-white uppercase text-xs tracking-wider">
          <tr>
            <th class="px-6 py-3 text-center">ID</th>
            <th class="px-6 py-3">Name</th>
            <th class="px-6 py-3">Department</th>
            <th class="px-6 py-3">Email</th>
            <th class="px-6 py-3">Role</th>
            <th class="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in employees" :key="employee.Employee_ID" class="hover:bg-gray-100 transition">
            <td class="px-6 py-4 text-center font-medium text-gray-700">{{ employee.Employee_ID }}</td>
            <td class="px-6 py-4">{{ employee.Name }}</td>
            <td class="px-6 py-4">{{ employee.Department }}</td>
            <td class="px-6 py-4">{{ employee.Email }}</td>
            <td class="px-6 py-4 font-semibold">{{ employee.Role }}</td>
            <td class="px-6 py-4 text-center space-x-2">
              <button
                @click="startEditing(employee)"
                class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition duration-200"
              >
                Edit
              </button>
              <button
                @click="deleteEmployee(employee.Employee_ID)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200"
              >
                 Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <transition name="fade">
      <div v-if="editingEmployee" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white w-96 p-6 rounded-xl shadow-lg transform transition-all duration-300">
          <h3 class="text-xl font-semibold text-blue-700 mb-4">Edit Employee</h3>
          <div class="space-y-3">
            <input v-model="updatedEmployee.Name" placeholder="Name" class="form-input" />
            <input v-model="updatedEmployee.Department" placeholder="Department" class="form-input" />
            <input v-model="updatedEmployee.Email" placeholder="Email" class="form-input" />
            <input v-model="updatedEmployee.Role" placeholder="Role" class="form-input" />
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button @click="editingEmployee = null" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">
              Cancel
            </button>
            <button @click="saveEdit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.form-input {
  @apply w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
