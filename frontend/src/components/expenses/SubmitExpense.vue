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
const expenses = ref([]); // ✅ Stores fetched expenses
const showForm = ref(true); // ✅ Toggles between form and list

// Converts an image to Base64
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    receipt.value = reader.result.split(",")[1]; // Get Base64 data
  };
  reader.readAsDataURL(file);
};

// Fetch Expenses from API
const fetchExpenses = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      message.value = "Authentication required. Please log in.";
      messageClass.value = "text-red-600 bg-red-100";
      return;
    }

    const response = await axios.get("http://localhost:5000/api/expenses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expenses.value = response.data;
  } catch (error) {
    console.error("❌ Error Fetching Expenses:", error.response?.data);
    message.value = "Failed to load expenses.";
    messageClass.value = "text-red-600 bg-red-100";
  }
};

// Handle Form Submission
const handleSubmit = async () => {
  loading.value = true;
  message.value = "";

  const token = localStorage.getItem("token");
  if (!token) {
    message.value = "Authentication required. Please log in.";
    messageClass.value = "text-red-600 bg-red-100";
    loading.value = false;
    return;
  }

  // Ensure values are correctly formatted
  const expenseData = {
    amount: parseFloat(amount.value) || 0, // Ensure amount is a number
    description: description.value.trim(),
    expense_type: expense_type.value.trim(),
    receipt: receipt.value || null,
    date_submitted: new Date().toISOString().slice(0, 19).replace("T", " ")
  };

  // Validate required fields
  if (!expenseData.expense_type || !expenseData.amount || !expenseData.description) {
    message.value = "Please fill in all required fields.";
    messageClass.value = "text-red-600 bg-red-100";
    loading.value = false;
    return;
  }

  console.log("📤 Submitting Expense:", expenseData); // Debugging log

  try {
    const response = await axios.post(
      "http://localhost:5000/api/expenses",
      expenseData,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Expense Submitted:", response.data);
    message.value = response.data.message || "Expense submitted successfully!";
    messageClass.value = "text-green-600 bg-green-100";
    
    // Reset form fields
    amount.value = "";
    description.value = "";
    expense_type.value = "";
    receipt.value = null;

    // Refresh expenses after submission
    fetchExpenses();
  } catch (error) {
    console.error("❌ Submission Error:", error.response?.data);
    message.value = error.response?.data?.message || "Failed to submit expense.";
    messageClass.value = "text-red-600 bg-red-100";
  } finally {
    loading.value = false;
  }
};

// Fetch expenses on component load
onMounted(fetchExpenses);
</script>

<template>
  <div class="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-semibold mb-4">Expense Management</h2>

    <p v-if="message" class="text-center text-sm py-2 rounded-md" :class="messageClass">
      {{ message }}
    </p>

    <!-- Toggle Button -->
    <button @click="showForm = !showForm"
      class="w-full mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200">
      {{ showForm ? "View Expenses" : "Submit Expense" }}
    </button>

    <!-- Expense Submission Form -->
    <form v-if="showForm" @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium">Amount:</label>
        <input type="number" v-model="amount" required
          class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Description:</label>
        <input type="text" v-model="description" required
          class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Expense Type:</label>
        <select v-model="expense_type" required
          class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>Select Expense Type</option>
          <option value="Office Expenses">Office Expenses</option>
          <option value="Travel">Travel</option>
          <option value="Utilities">Utilities</option>
        </select>
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Upload Receipt:</label>
        <input type="file" accept="image/*" @change="handleFileUpload"
          class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
      </div>

      <button type="submit" :disabled="loading"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        :class="{ 'opacity-50': loading }">
        {{ loading ? "Submitting..." : "Submit Expense" }}
      </button>
    </form>

    <!-- Expense List -->
    <div v-else>
      <h3 class="text-xl font-semibold my-4">Submitted Expenses</h3>
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-200">
            <th class="border px-4 py-2">Amount</th>
            <th class="border px-4 py-2">Description</th>
            <th class="border px-4 py-2">Type</th>
            <th class="border px-4 py-2">Receipt</th>
            <th class="border px-4 py-2">Date</th>
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
            <td class="border px-4 py-2">{{ new Date(expense.Date_Submitted).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
