<script setup>
import { ref } from "vue";
import axios from "axios";

const amount = ref("");
const description = ref("");
const expense_type = ref(""); // ✅ Matches 'Expense_Type'
const receipt = ref(null); // ✅ Matches 'Receipt'
const loading = ref(false);
const message = ref("");
const messageClass = ref("");

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

const handleSubmit = async () => {
  loading.value = true;
  message.value = "";

  const token = localStorage.getItem("token"); // Ensure user is authenticated
  if (!token) {
    message.value = "Authentication required. Please log in.";
    messageClass.value = "text-red-600 bg-red-100";
    loading.value = false;
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:5000/api/expenses",
      { 
        amount: amount.value, 
        description: description.value, 
        expense_type: expense_type.value, // ✅ Matches DB column
        receipt: receipt.value, // ✅ Matches DB column (Base64 string)
        date_submitted: new Date().toISOString().slice(0, 19).replace("T", " ") // ✅ Matches 'Date_Submitted' format
      },
      {

        headers: {
          "Authorization": `Bearer ${token}`, // ✅ Fix this line
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
  } catch (error) {
    console.error("❌ Submission Error:", error.response?.data);
    message.value = error.response?.data?.message || "Failed to submit expense.";
    messageClass.value = "text-red-600 bg-red-100";
  } finally {
    loading.value = false;
  }
};

</script>

<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-semibold mb-4">Submit Expense</h2>

    <p v-if="message" class="text-center text-sm py-2 rounded-md" :class="messageClass">
      {{ message }}
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
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
  </div>
</template>

