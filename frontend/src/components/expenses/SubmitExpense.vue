<script setup>
import { ref, onMounted, computed } from "vue";
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
const userDepartment = ref("");
const showModal = ref(false);
const modalImageSrc = ref("");
const editingExpense = ref(null); // For editing
const editedAmount = ref("");
const editedDescription = ref("");
const editedExpenseType = ref("");

// Get department from localStorage
const getUserDepartment = () => {
    return localStorage.getItem("department"); // No default value
};

// Computed property to show form
const showForm = computed(() => {
    const allowedDepartments = ["employee", "it", "sales", "business", "survey", "gis", "hr"];
    return allowedDepartments.includes(userDepartment.value.toLowerCase());
});

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

// Handle Form Submission
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

  let receiptBase64 = null;
  if (receipt.value) {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(receipt.value);

      receiptBase64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });
    } catch (error) {
      console.error("❌ Receipt Read Error:", error);
      message.value = "Error reading receipt.";
      messageClass.value = "text-red-600 bg-red-100";
      loading.value = false;
      return;
    }
  }

  const expenseData = {
    amount: parseFloat(amount.value) || 0,
    description: description.value.trim(),
    expense_type: expense_type.value.trim(),
    receipt: receiptBase64,
  };

  try {
    await axios.post("http://localhost:5000/api/expenses", expenseData, {
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

    if (error.response) {
      console.error("Server Response:", error.response.data);
    }
  } finally {
    loading.value = false;
  }
};

// Approve Expense
const approveExpense = async (expenseId) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await axios.put(`http://localhost:5000/api/expenses/approve/${expenseId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchExpenses();
  } catch (error) {
    console.error("❌ Approval Error:", error);
  }
};

// Reject Expense
const rejectExpense = async (expenseId) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await axios.put(`http://localhost:5000/api/expenses/reject/${expenseId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchExpenses();
  } catch (error) {
    console.error("❌ Rejection Error:", error);
  }
};

// Open the modal with the receipt image
const openModal = (receipt) => {
  modalImageSrc.value = `data:image/png;base64,${receipt}`;
  showModal.value = true;
};

// Close the modal
const closeModal = () => {
  showModal.value = false;
};

// Delete expense
const deleteExpense = async (expenseId) => {
  console.log("Deleting Expense ID:", expenseId); 
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await axios.delete(`http://localhost:5000/api/expenses/${expenseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchExpenses();
  } catch (error) {
    console.error("❌ Delete Error:", error);
  }
};

// Edit expense
const editExpense = (expense) => {
  editingExpense.value = expense;
  editedAmount.value = expense.Amount;
  editedDescription.value = expense.Description;
  editedExpenseType.value = expense.Expense_Type;
  showModal.value = true;
};

// Save edited expense
const saveEditedExpense = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await axios.put(`http://localhost:5000/api/expenses/${editingExpense.value.Expense_ID}`, {
      amount: editedAmount.value,
      description: editedDescription.value,
      expense_type: editedExpenseType.value,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchExpenses();
    showModal.value = false;
  } catch (error) {
    console.error("❌ Update Error:", error);
  }
};


// Ensure department is set before running fetchExpenses
onMounted(async () => {
  userDepartment.value = getUserDepartment();
  console.log('onMounted userDepartment.value', userDepartment.value);
  fetchExpenses();
});
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-6">Expense Management</h2>

    <div>User Department: {{ userDepartment }}</div>
    <div>Show Form: {{ showForm }}</div>

    <div v-if="showForm" class="mb-6">
      <h3 class="text-xl font-semibold mb-4">Submit Expense</h3>
      <div v-if="message" :class="`p-3 rounded-md mb-4 ${messageClass}`">
        {{ message }}
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="amount" class="block text-gray-700 text-sm font-bold mb-2">Amount</label>
          <input v-model="amount" id="amount" type="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Amount" required>
        </div>
        <div class="mb-4">
          <label for="description" class="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea v-model="description" id="description" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Description" required></textarea>
        </div>
        <div class="mb-4">
          <label for="expense_type" class="block text-gray-700 text-sm font-bold mb-2">Expense Type</label>
          <input v-model="expense_type" id="expense_type" type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Expense Type" required>
        </div>
        <div class="mb-4">
          <label for="receipt" class="block text-gray-700 text-sm font-bold mb-2">Receipt (Base64)</label>
          <input type="file" @change="(event) => receipt = event.target.files[0]" id="receipt" accept="image/*" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" :disabled="loading">
          {{ loading ? 'Submitting...' : 'Submit' }}
        </button>
      </form>
    </div>

    <div class="bg-gray-50 p-6 rounded-lg shadow-md">
      <table class="w-full border-collapse bg-white shadow-sm rounded-lg">
        <thead>
          <tr class="bg-blue-100 text-gray-700">
            <th class="border px-4 py-2">Amount</th>
            <th class="border px-4 py-2">Description</th>
            <th class="border px-4 py-2">Type</th>
            <th class="border px-4 py-2">Receipt</th>
            <th class="border px-4 py-2">Status</th>
            <th class="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.Expense_ID" class="hover:bg-gray-100">
            <td class="border px-4 py-2 font-semibold text-gray-900">Ksh {{ expense.Amount }}</td>
            <td class="border px-4 py-2 text-gray-700">{{ expense.Description }}</td>
            <td class="border px-4 py-2 text-gray-600">{{ expense.Expense_Type }}</td>
            <td class="border px-4 py-2">
              <img v-if="expense.Receipt" :src="'data:image/png;base64,' + expense.Receipt" class="w-10 h-10 rounded-md shadow-md cursor-pointer" @click="openModal(expense.Receipt)">
              <span v-else class="text-gray-500 italic">No Receipt</span>
            </td>
            <td class="p-3 border font-bold">
              <span v-if="expense.Approval_Status !== 'Pending'" :class="{
                'text-green-500': expense.Approval_Status === 'Approved',
                'text-red-500': expense.Approval_Status === 'Rejected'
              }">
                {{ expense.Approval_Status }}
              </span>
              <div v-else-if="userDepartment.toLowerCase() === 'finance'" class="flex space-x-2">
                <button @click="approveExpense(expense.Expense_ID)" class="group relative flex justify-center py-2 px-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Approve</span>
                </button>
                <button @click="rejectExpense(expense.Expense_ID)" class="group relative flex justify-center py-2 px-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Reject</span>
                </button>
              </div>
              <span v-else class="text-yellow-500">Pending</span>
            </td>
            <td class="border px-4 py-2 flex space-x-2 justify-center">
              <button @click="editExpense(expense)" class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors duration-200">Edit</button>
              <button @click="deleteExpense(expense.Expense_ID)" class="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors duration-200">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <img v-if="modalImageSrc" :src="modalImageSrc" class="w-full">
            <div v-else>
              <label for="editedAmount" class="block text-gray-700 text-sm font-bold mb-2">Amount</label>
              <input v-model="editedAmount" id="editedAmount" type="number" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Amount">
              <label for="editedDescription" class="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea v-model="editedDescription" id="editedDescription" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Description"></textarea>
              <label for="editedExpenseType" class="block text-gray-700 text-sm font-bold mb-2">Expense Type</label>
              <input v-model="editedExpenseType" id="editedExpenseType" type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Expense Type">
              <button @click="saveEditedExpense" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="closeModal" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>