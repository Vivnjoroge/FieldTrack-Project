<script setup>
import Breadcrumb from "../layouts/Breadcrumb.vue";
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

const breadcrumbSegments = ref([
    { label: 'Dashboard', path: '/dashboard' },
    //{ label: 'Expenses' },
]);

// Get department from localStorage
const getUserDepartment = () => {
  return localStorage.getItem("department"); // No default value
};

// Computed property to show form
const showForm = computed(() => {
  const allowedDepartments = ["employee", "it", "sales", "business", "survey", "gis", "hr"]; // Exclude "management"
  return allowedDepartments.includes(userDepartment.value.toLowerCase());
});

// Fetch Expenses with Employee Name
const fetchExpenses = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.get("http://localhost:5000/api/expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });

    expenses.value = response.data;
  } catch (error) {
    console.error("Error Fetching Expenses:", error);
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
      console.error(" Receipt Read Error:", error);
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
    console.error("Submission Error:", error);
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
    console.error("Rejection Error:", error);
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
    console.error("Delete Error:", error);
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
    console.error("Update Error:", error);
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
  <div class="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-2xl rounded-xl border border-gray-100">
    <Breadcrumb :segments="breadcrumbSegments" class="mb-4" />
    <h2 class="text-4xl font-extrabold text-gray-800 text-center mb-8">Expense Management</h2>

    <div v-if="showForm" class="mb-10 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
      <h3 class="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">Submit Expense</h3>

      <div v-if="message" :class="`p-3 rounded-md mb-4 ${messageClass}`">
        {{ message }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input v-model="amount" id="amount" type="number" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-4 text-gray-800 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter amount" required>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea v-model="description" id="description" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-4 text-gray-800 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter description" required></textarea>
        </div>

        <div>
          <label for="expense_type" class="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
          <input v-model="expense_type" id="expense_type" type="text" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-4 text-gray-800 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter expense type" required>
        </div>

        <div>
          <label for="receipt" class="block text-sm font-medium text-gray-700 mb-1">Receipt (Image)</label>
          <input type="file" @change="(event) => receipt = event.target.files[0]" id="receipt" accept="image/*" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-4 text-gray-800 focus:ring-blue-500 focus:border-blue-500">
        </div>

        <button type="submit" class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400" :disabled="loading">
          {{ loading ? 'Submitting...' : 'Submit' }}
        </button>
      </form>
    </div>

    <div class="overflow-x-auto bg-white p-4 rounded-xl shadow-md border border-gray-100">
      <table class="w-full border-collapse text-left text-sm text-gray-700">
        <thead>
          <tr class="bg-blue-50 text-gray-800 text-sm uppercase tracking-wide">
            <th class="border px-4 py-2">Employee ID</th>
            <th class="border px-4 py-2">Employee Name</th>
            <th class="border px-4 py-2">Amount</th>
            <th class="border px-4 py-2">Description</th>
            <th class="border px-4 py-2">Type</th>
            <th class="border px-4 py-2">Receipt</th>
            <th class="border px-4 py-2">Status</th>
            <th class="border px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.Expense_ID" class="hover:bg-gray-50">
            <td class="border px-4 py-2">{{ expense.Employee_ID }}</td>
            <td class="border px-4 py-2">{{ expense.Employee_Name }}</td>
            <td class="border px-4 py-2 font-semibold text-gray-900">Ksh {{ expense.Amount }}</td>
            <td class="border px-4 py-2">{{ expense.Description }}</td>
            <td class="border px-4 py-2">{{ expense.Expense_Type }}</td>
            <td class="border px-4 py-2 text-center">
              <img v-if="expense.Receipt" :src="'data:image/png;base64,' + expense.Receipt" class="w-12 h-12 rounded-md shadow cursor-zoom-in hover:scale-105 transition-transform duration-150 mx-auto" @click="openModal(expense.Receipt)">
              <span v-else class="text-gray-500 italic">No Receipt</span>
            </td>
            <td class="border px-4 py-2 font-semibold text-center">
              <span v-if="expense.Approval_Status !== 'Pending'" :class="{
                  'text-green-600': expense.Approval_Status === 'Approved',
                  'text-red-600': expense.Approval_Status === 'Rejected'
                }">
                {{ expense.Approval_Status }}
              </span>
              <div v-else-if="userDepartment.toLowerCase() === 'finance'" class="flex justify-center space-x-2">
                <button @click="approveExpense(expense.Expense_ID)" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-all">
                  Approve
                </button>
                <button @click="rejectExpense(expense.Expense_ID)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-all">
                  Reject
                </button>
              </div>
              <span v-else class="text-yellow-500">Pending</span>
            </td>
            <td class="border px-4 py-2 flex space-x-2 justify-center">
              <button @click="editExpense(expense)" class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors">Edit</button>
              <button @click="deleteExpense(expense.Expense_ID)" class="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed z-50 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-12 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="p-6 space-y-4">
            <img v-if="modalImageSrc" :src="modalImageSrc" class="w-full rounded-md shadow" />
            <div v-else class="space-y-4">
              <div>
                <label for="editedAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input v-model="editedAmount" id="editedAmount" type="number" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-4 text-gray-800 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label for="editedDescription" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea v-model="editedDescription" id="editedDescription" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-4 text-gray-800 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div>
                <label for="editedExpenseType" class="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                <input v-model="editedExpenseType" id="editedExpenseType" type="text" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-4 text-gray-800 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <button @click="saveEditedExpense" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md">Save</button>
            </div>
          </div>
     <div class="bg-gray-100 px-6 py-4 sm:flex sm:flex-row-reverse">
            <button @click="closeModal" type="button" class="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  