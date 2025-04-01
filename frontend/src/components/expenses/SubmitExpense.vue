<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

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

// Fetch User Department from API
const fetchUserDepartment = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.get("http://localhost:5000/api/user-department", {
      headers: { Authorization: `Bearer ${token}` },
    });

    userDepartment.value = response.data.department;

    // Show form only if the user is NOT Admin, Finance, or Manager
    if (!["Admin", "Finance", "Management"].includes(userDepartment.value)) {
      showForm.value = true;
    }
  } catch (error) {
    console.error("❌ Error Fetching Department:", error);
  }
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

// Fetch data on component mount
onMounted(() => {
  fetchUserDepartment();
  fetchExpenses();
});
</script>

<template>
  <div class="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">
      Expense Management
    </h2>

    <!-- Expense Submission Form (Only for Employees NOT in Admin, Finance, or Management) -->
    <form v-if="showForm" @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium">Amount:</label>
        <input type="number" v-model="amount" required class="w-full mt-1 px-4 py-2 border rounded-md" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Description:</label>
        <input type="text" v-model="description" required class="w-full mt-1 px-4 py-2 border rounded-md" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Expense Type:</label>
        <select v-model="expense_type" required class="w-full mt-1 px-4 py-2 border rounded-md">
          <option value="" disabled>Select Expense Type</option>
          <option value="Office Expenses">Office Expenses</option>
          <option value="Travel">Travel</option>
          <option value="Utilities">Utilities</option>
        </select>
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Upload Receipt:</label>
        <input type="file" accept="image/*" @change="handleFileUpload" class="w-full mt-1 px-4 py-2 border rounded-md" />
      </div>

      <button type="submit" :disabled="loading" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md">
        {{ loading ? "Submitting..." : "Submit Expense" }}
      </button>
    </form>

    <!-- Expense List -->
    <h3 class="text-xl font-semibold my-4">Submitted Expenses</h3>
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-200">
          <th class="border px-4 py-2">Amount</th>
          <th class="border px-4 py-2">Description</th>
          <th class="border px-4 py-2">Type</th>
          <th class="border px-4 py-2">Receipt</th>
          <th class="border px-4 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="expense in expenses" :key="expense.Expense_ID" class="hover:bg-gray-100">
          <td class="border px-4 py-2">{{ expense.Amount }}</td>
          <td class="border px-4 py-2">{{ expense.Description }}</td>
          <td class="border px-4 py-2">{{ expense.Expense_Type }}</td>
          <td class="border px-4 py-2">
            <img v-if="expense.Receipt" :src="'data:image/png;base64,' + expense.Receipt" class="w-10 h-10 rounded-md">
            <span v-else>No Receipt</span>
          </td>
          <td class="border px-4 py-2">
            <span :class="{
              'text-green-600': expense.Status === 'Approved',
              'text-red-600': expense.Status === 'Rejected',
              'text-yellow-600': expense.Status === 'Pending'
            }">
              {{ expense.Status || 'Pending' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
