<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const approvedExpenses = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  await fetchApprovedExpenses();
});

const fetchApprovedExpenses = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/expenses', {
      headers: { Authorization: `Bearer ${token}` },
      params: { approval_status: 'Approved' }, // Backend needs to handle this filter
    });
    approvedExpenses.value = response.data.filter(expense => expense.Approval_Status === 'Approved'); // Basic frontend filter
  } catch (err) {
    error.value = 'Failed to fetch approved expenses.';
    console.error('Error fetching approved expenses:', err);
  } finally {
    loading.value = false;
  }
};

const reimburseExpense = async (expenseId) => {
  if (confirm(`Are you sure you want to mark Expense ID ${expenseId} as reimbursed?`)) {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/expenses/reimburse/${expenseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Expense ID ${expenseId} marked as reimbursed successfully!`);
      await fetchApprovedExpenses(); // Refresh the list
    } catch (err) {
      alert(`Failed to mark Expense ID ${expenseId} as reimbursed.`);
      console.error('Error marking as reimbursed:', err);
    }
  }
};
</script>

<template>
    <div>
      <h2 class="text-xl font-semibold mb-4">Approved Expenses for Reimbursement</h2>
      <div v-if="loading" class="text-gray-500 italic">Loading approved expenses...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="expense in approvedExpenses" :key="expense.Expense_ID">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.Expense_ID }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.Employee_Name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.Expense_Type }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.Amount }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">{{ expense.Description }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ new Date(expense.Date_Submitted).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <a
                v-if="expense.Receipt"
                :href="'/api/expenses/receipt/' + expense.Expense_ID"
                target="_blank"
                class="text-blue-500 hover:text-blue-700"
                >View</a
              >
              <span v-else class="text-gray-500 italic">No Receipt</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                v-if="expense.Reimbursement_Status !== 'Reimbursed'"
                @click="reimburseExpense(expense.Expense_ID)"
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Reimburse
              </button>
              <span v-else class="text-green-500 italic">
                Reimbursed on {{ new Date(expense.Date_Reimbursed).toLocaleDateString() }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="approvedExpenses.length === 0 && !loading" class="text-gray-500 italic">
        No approved expenses found for reimbursement.
      </p>
    </div>
  </template>






















