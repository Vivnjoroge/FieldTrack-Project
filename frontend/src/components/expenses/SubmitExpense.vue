<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// Form state variables
const amount = ref("");
const description = ref("");
const expense_type = ref("");
const receipt = ref(null);
const loading = ref(false);
const message = ref("");
const messageClass = ref("");
const expenses = ref([]);
const showForm = ref(false); // Hide form initially
const userDepartment = ref(""); // Store user department

// Get department from localStorage (set during login)
const getUserDepartment = () => {
  const department = localStorage.getItem("department"); // Get department from localStorage
  return department || "Employee"; // Default to "Employee" if not found
};

// Fetch Expenses
const fetchExpenses = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.get("http://localhost:5000/api/expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });

    expenses.value = response.data;
  } catch (error) {
    console.error("❌ Error Fetching Expenses:", error);
  }
};

// Handle Form Submission (Only for Employees)
const handleSubmit = async () => {
  if (!showForm.value) {
    message.value = "Only employees can submit expenses.";
    messageClass.value = "text-red-600 bg-red-100";
    return;
  }

  loading.value = true;
  message.value = "";

  const token = localStorage.getItem("token");
  if (!token) {
    message.value = "Authentication required.";
    messageClass.value = "text-red-600 bg-red-100";
    loading.value = false;
    return;
  }

  const expenseData = {
    amount: parseFloat(amount.value) || 0,
    description: description.value.trim(),
    expense_type: expense_type.value.trim(),
    receipt: receipt.value || null,
    date_submitted: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  try {
    const response = await axios.post("http://localhost:5000/api/expenses", expenseData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    message.value = "Expense submitted successfully!";
    messageClass.value = "text-green-600 bg-green-100";

    amount.value = "";
    description.value = "";
    expense_type.value = "";
    receipt.value = null;

    fetchExpenses();
  } catch (error) {
    console.error("❌ Submission Error:", error);
    message.value = "Failed to submit expense.";
    messageClass.value = "text-red-600 bg-red-100";
  } finally {
    loading.value = false;
  }
};

// ✅ Ensure department is set before running fetchExpenses
onMounted(async () => {
  userDepartment.value = getUserDepartment(); // Get department from localStorage
  showForm.value = userDepartment.value === "Employee"; // Show form only for employees
  fetchExpenses(); // Fetch expenses after setting department
});
</script>

<template>
  
  <div class="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">Expense Management</h2>

    <!-- Toggle Button to Show/Hide Form -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-800">
        {{ showForm ? "Submit an Expense" : "Your Submitted Expenses" }}
      </h3>
      <button
        @click="showForm = !showForm"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {{ showForm ? "View Expenses" : "Submit Expense" }}
      </button>
    </div>

    <!-- Success/Error Message -->
    <p v-if="message" :class="messageClass" class="mb-4 text-center">{{ message }}</p>

    <!-- Expense Submission Form -->
    <div v-if="showForm" class="bg-gray-100 p-6 rounded-lg mb-6 shadow-md">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-gray-700 font-medium">Amount:</label>
          <input type="number" v-model="amount" required class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
        </div>

        <div>
          <label class="block text-gray-700 font-medium">Description:</label>
          <input type="text" v-model="description" required class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
        </div>

        <div>
          <label class="block text-gray-700 font-medium">Expense Type:</label>
          <select v-model="expense_type" required class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400">
            <option value="" disabled>Select Expense Type</option>
            <option value="Office Expenses">Office Expenses</option>
            <option value="Travel">Travel</option>
            <option value="Utilities">Utilities</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-700 font-medium">Upload Receipt:</label>
          <input type="file" accept="image/*" @change="handleFileUpload" class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
        </div>

        <button type="submit" :disabled="loading" class="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          {{ loading ? "Submitting..." : "Submit Expense" }}
        </button>
      </form>
    </div>

    <!-- Expense List -->
    <div v-if="!showForm" class="bg-gray-50 p-6 rounded-lg shadow-md">
      <table class="w-full border-collapse bg-white shadow-sm rounded-lg">
        <thead>
          <tr class="bg-blue-100 text-gray-700">
            <th class="border px-4 py-2">Amount</th>
            <th class="border px-4 py-2">Description</th>
            <th class="border px-4 py-2">Type</th>
            <th class="border px-4 py-2">Receipt</th>
            <th class="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.Expense_ID" class="hover:bg-gray-100">
            <td class="border px-4 py-2 font-semibold text-gray-900">Ksh {{ expense.Amount }}</td>
            <td class="border px-4 py-2 text-gray-700">{{ expense.Description }}</td>
            <td class="border px-4 py-2 text-gray-600">{{ expense.Expense_Type }}</td>
            <td class="border px-4 py-2">
              <img v-if="expense.Receipt" :src="'data:image/png;base64,' + expense.Receipt" class="w-10 h-10 rounded-md shadow-md">
              <span v-else class="text-gray-500 italic">No Receipt</span>
            </td>
            <td class="p-3 border font-bold">
              <span :class="{
             'text-yellow-500': expense.Approval_Status === 'Pending',
             'text-green-500': expense.Approval_Status === 'Approved',
             'text-red-500': expense.Approval_Status === 'Rejected',
              'text-blue-500': expense.Approval_Status === 'Submitted'
            }">
                {{ expense.Approval_Status }}
          </span>
           </td>
  

          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
/* Custom styles (optional) */
</style>
