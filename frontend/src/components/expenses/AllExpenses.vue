<script setup>
const apiUrl = import.meta.env.VITE_API_URL;
import { ref, onMounted } from 'vue';
import axios from 'axios';

const expenseList = ref([]);

// Load all submitted expenses when component is mounted
const loadExpenses = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${apiUrl}/api/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expenseList.value = response.data;
  } catch (err) {
    console.error('Failed to load expenses:', err);
  }
};

// Mark an expense as approved
const handleApprove = async (expenseId) => {
  try {
    await axios.put(`${apiUrl}/api/expenses/${expenseId}/approve`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    await loadExpenses(); // Refresh the list
  } catch (err) {
    console.error('Error approving the expense:', err);
  }
};

// Mark an expense as rejected
const handleReject = async (expenseId) => {
  try {
    await axios.put(`${apiUrl}/api/expenses/${expenseId}/reject`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    await loadExpenses(); // Refresh the list
  } catch (err) {
    console.error('Error rejecting the expense:', err);
  }
};

onMounted(loadExpenses);
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-4">Submitted Expenses</h1>

    <table class="w-full border-collapse border border-gray-200">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="border p-2">Employee</th>
          <th class="border p-2">Type</th>
          <th class="border p-2">Amount</th>
          <th class="border p-2">Date Submitted</th>
          <th class="border p-2">Receipt</th>
          <th class="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="expense in expenseList"
          :key="expense.id"
          class="border hover:bg-gray-50"
        >
          <td class="p-2 border">{{ expense.employee_name }}</td>
          <td class="p-2 border">{{ expense.expense_type }}</td>
          <td class="p-2 border">{{ expense.amount }}</td>
          <td class="p-2 border">{{ expense.date_submitted }}</td>
          <td class="p-2 border">
            <a
              :href="expense.receipt"
              target="_blank"
              class="text-blue-600 underline"
            >
              View
            </a>
          </td>
          <td class="p-2 border">
            <button
              @click="handleApprove(expense.id)"
              class="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
            >
              Approve
            </button>
            <button
              @click="handleReject(expense.id)"
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Reject
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
