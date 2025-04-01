<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const expenses = ref([]);

// ✅ Fetch all expenses
const fetchExpenses = async () => {
  try {
    const token = localStorage.getItem("token"); // Ensure user is authenticated
    const response = await axios.get("http://localhost:5000/api/expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expenses.value = response.data;
  } catch (error) {
    console.error("❌ Error fetching expenses:", error);
  }
};

// ✅ Approve Expense
const approveExpense = async (id) => {
  try {
    await axios.put(`http://localhost:5000/api/expenses/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchExpenses(); // Refresh data
  } catch (error) {
    console.error("❌ Error approving expense:", error);
  }
};

// ❌ Reject Expense
const rejectExpense = async (id) => {
  try {
    await axios.put(`http://localhost:5000/api/expenses/${id}/reject`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchExpenses(); // Refresh data
  } catch (error) {
    console.error("❌ Error rejecting expense:", error);
  }
};

onMounted(fetchExpenses);
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-4">All Expenses</h1>

    <table class="w-full border-collapse border border-gray-200">
      <thead>
        <tr class="bg-gray-100">
          <th class="border p-2">Employee</th>
          <th class="border p-2">Expense Type</th>
          <th class="border p-2">Amount</th>
          <th class="border p-2">Date</th>
          <th class="border p-2">Receipt</th>
          <th class="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="expense in expenses" :key="expense.id" class="border">
          <td class="p-2 border">{{ expense.employee_name }}</td>
          <td class="p-2 border">{{ expense.expense_type }}</td>
          <td class="p-2 border">{{ expense.amount }}</td>
          <td class="p-2 border">{{ expense.date_submitted }}</td>
          <td class="p-2 border">
            <a :href="expense.receipt" target="_blank" class="text-blue-600 underline">View</a>
          </td>
          <td class="p-2 border">
            <button @click="approveExpense(expense.id)" class="bg-green-500 text-white px-3 py-1 rounded mr-2">
              ✅ Approve
            </button>
            <button @click="rejectExpense(expense.id)" class="bg-red-500 text-white px-3 py-1 rounded">
              ❌ Reject
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
