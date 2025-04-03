<script setup>
import { ref, onMounted } from "vue";

const employees = ref([]);
const error = ref(null);
const loading = ref(true);
const editingEmployee = ref(null);
const updatedEmployee = ref({});

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
  <div class="p-6 bg-white shadow-md rounded-lg">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Employee List</h2>

    <div v-if="employees.length > 0" class="overflow-x-auto">
      <table class="w-full border border-gray-200 rounded-lg shadow-md">
        <thead class="bg-blue-600 text-white uppercase text-sm">
          <tr>
            <th class="px-6 py-3 text-center">ID</th>
            <th class="px-6 py-3 text-left">Name</th>
            <th class="px-6 py-3 text-left">Department</th>
            <th class="px-6 py-3 text-left">Email</th>
            <th class="px-6 py-3 text-left">Role</th>
            <th class="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in employees" :key="employee.Employee_ID" class="hover:bg-gray-100 transition duration-200">
            <td class="px-6 py-4 text-center font-medium text-gray-700">{{ employee.Employee_ID }}</td>
            <td class="px-6 py-4 text-gray-800">{{ employee.Name }}</td>
            <td class="px-6 py-4 text-gray-600">{{ employee.Department }}</td>
            <td class="px-6 py-4 text-gray-600">{{ employee.Email }}</td>
            <td class="px-6 py-4 font-semibold text-gray-700">{{ employee.Role }}</td>
            <td class="px-6 py-4 text-center">
              <button @click="startEditing(employee)" class="text-blue-600 hover:text-blue-800 mr-2">
                ✏️ Edit
              </button>
              <button @click="deleteEmployee(employee.Employee_ID)" class="text-red-600 hover:text-red-800">
                🗑️ Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Form Modal -->
    <div v-if="editingEmployee" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-md w-96">
        <h3 class="text-lg font-semibold mb-4">Edit Employee</h3>
        <input v-model="updatedEmployee.Name" class="w-full border p-2 rounded mb-2" placeholder="Name" />
        <input v-model="updatedEmployee.Department" class="w-full border p-2 rounded mb-2" placeholder="Department" />
        <input v-model="updatedEmployee.Email" class="w-full border p-2 rounded mb-2" placeholder="Email" />
        <input v-model="updatedEmployee.Role" class="w-full border p-2 rounded mb-2" placeholder="Role" />

        <div class="flex justify-end space-x-2 mt-4">
          <button @click="editingEmployee = null" class="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          <button @click="saveEdit" class="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        </div>
      </div>
    </div>

    <!-- Loading & Error States -->
    <p v-else-if="loading" class="text-gray-600 italic mt-4">Loading employees...</p>
    <p v-else-if="error" class="text-red-600 font-semibold mt-4">{{ error }}</p>
    <p v-else class="text-gray-600 italic mt-4">No employees found.</p>
  </div>
</template>

