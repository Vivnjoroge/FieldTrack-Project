<script setup>
import Breadcrumb from "../layouts/Breadcrumb.vue";
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { applyPlugin } from 'jspdf-autotable'; // Import applyPlugin

applyPlugin(jsPDF); // Apply the plugin to jsPDF

// Form state variables
const amount = ref("");
const description = ref("");
const expense_type = ref("");
const loading = ref(false);
const message = ref("");
const messageClass = ref("");
const expenses = ref([]);
const userDepartment = ref("");
const showModal = ref(false);
const modalType = ref(null); // 'viewReceipt' or 'editExpense'
const modalImageSrc = ref("");
const editingExpense = ref(null); // For editing
const editedAmount = ref("");
const editedDescription = ref("");
const editedExpenseType = ref("");
const editCounts = ref({}); // Track edit counts per expense ID
const confirmDeleteId = ref(null);
const isDeleting = ref(false);
const editErrorMessage = ref("");
const showEditError = ref(false);

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

        // Initialize edit counts if not present
        response.data.forEach(expense => {
            if (!editCounts.value[expense.Expense_ID]) {
                editCounts.value[expense.Expense_ID] = expense.Edit_Count || 0;
            }
        });

        expenses.value = response.data.map(expense => ({ ...expense, editCount: editCounts.value[expense.Expense_ID] }));
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

    // Basic client-side validation for description and expense_type
    if (!/^[a-zA-Z\s]+$/.test(description.value.trim())) {
        message.value = "Description must contain only letters and spaces.";
        messageClass.value = "text-red-600 bg-red-100";
        return;
    }
    if (!/^[a-zA-Z\s]+$/.test(expense_type.value.trim())) {
        message.value = "Expense Type must contain only letters and spaces.";
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
const openReceiptModal = (receipt) => {
    modalType.value = 'viewReceipt';
    modalImageSrc.value = `data:image/png;base64,${receipt}`;
    showModal.value = true;
};

// Open the edit expense modal
const openEditModal = (expense) => {
    console.log('Edit Count for', expense.Expense_ID, ':', editCounts.value[expense.Expense_ID]);
    if ((editCounts.value[expense.Expense_ID] || 0) >= 3) {
        editErrorMessage.value = `Expense ID ${expense.Expense_ID} cannot be edited more than 3 times.`;
        showEditError.value = true;
        return;
    }
    editErrorMessage.value = "";
    showEditError.value = false;
    modalType.value = 'editExpense';
    editingExpense.value = expense;
    editedAmount.value = expense.Amount;
    editedDescription.value = expense.Description;
    editedExpenseType.value = expense.Expense_Type;
    showModal.value = true;
    console.log('showEditError:', showEditError.value);
};

// Close the modal
const closeModal = () => {
    showModal.value = false;
    modalType.value = null;
    modalImageSrc.value = "";
    editingExpense.value = null;
    message.value = "";
    messageClass.value = "";
    showEditError.value = false;
    editErrorMessage.value = "";
};

// Initiate delete confirmation
const confirmDelete = (expenseId) => {
    confirmDeleteId.value = expenseId;
};

// Cancel delete confirmation
const cancelDelete = () => {
    confirmDeleteId.value = null;
};

// Delete expense
const deleteExpense = async (expenseId) => {
    if (confirmDeleteId.value !== expenseId) {
        return; // Ensure the user confirmed the delete for this ID
    }
    isDeleting.value = true;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        await axios.delete(`http://localhost:5000/api/expenses/${expenseId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchExpenses();
        confirmDeleteId.value = null; // Clear confirmation ID after successful deletion
    } catch (error) {
        console.error("Delete Error:", error);
        // Optionally show an error message to the user
    } finally {
        isDeleting.value = false;
    }
};

// Save edited expense
const saveEditedExpense = async () => {
    if (!editingExpense.value) return;

    // Basic client-side validation for edited description and expense_type
    if (!/^[a-zA-Z\s]+$/.test(editedDescription.value.trim())) {
        message.value = "Description must contain only letters and spaces.";
        messageClass.value = "text-red-600 bg-red-100";
        return;
    }
    if (!/^[a-zA-Z\s]+$/.test(editedExpenseType.value.trim())) {
        message.value = "Expense Type must contain only letters and spaces.";
        messageClass.value = "text-red-600 bg-red-100";
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        await axios.put(`http://localhost:5000/api/expenses/${editingExpense.value.Expense_ID}`, {
            amount: editedAmount.value,
            description: editedDescription.value.trim(),
            expense_type: editedExpenseType.value.trim(),
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Increment edit count locally
        editCounts.value[editingExpense.value.Expense_ID]++;
        fetchExpenses();
        closeModal();
    } catch (error) {
        console.error("Update Error:", error);
        message.value = "Failed to update expense.";
        messageClass.value = "text-red-600 bg-red-100";
    }
};

// Function to generate and download PDF
const printExpensesToPdf = () => {
    const doc = new jsPDF();
    const tableColumn = ["Employee ID", "Employee Name", "Amount", "Description", "Type", "Status"];
    const tableRows = [];

    expenses.value.forEach(expense => {
        const rowData = [
            expense.Employee_ID,
            expense.Employee_Name,
            `Ksh ${expense.Amount}`,
            expense.Description,
            expense.Expense_Type,
            expense.Approval_Status,
        ];
        tableRows.push(rowData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: {
            fontSize: 10,
            cellPadding: 3,
            halign: 'left',
        },
        headStyles: {
            fillColor: [41, 128, 185], // Blue color
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 25 }, // Employee ID
            1: { cellWidth: 40 }, // Employee Name
            2: { cellWidth: 25, halign: 'right' }, // Amount
            3: { cellWidth: 50 }, // Description
            4: { cellWidth: 30 }, // Type
            5: { cellWidth: 25, halign: 'center' }, // Status
        },
    });

    doc.save('expenses.pdf');
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

                <button type="submit" class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400" :disabled="loading">
                    {{ loading ? 'Submitting...' : 'Submit' }}
                </button>
            </form>
        </div>

        <div class="flex justify-end mb-4">
            <button @click="printExpensesToPdf" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400">
                Print to PDF
            </button>
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
                            <button @click="openEditModal(expense)" :disabled="(expense.editCount >= 3)" class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors" :class="{'opacity-50 cursor-not-allowed': expense.editCount >= 3}">
                                Edit
                            </button>
                            <button @click="confirmDelete(expense.Expense_ID)" :disabled="isDeleting" class="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors" :class="{'opacity-50 cursor-not-allowed': isDeleting}">
                                Delete
                            </button>
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
                        <img v-if="modalType === 'viewReceipt' && modalImageSrc" :src="modalImageSrc" class="w-full rounded-md shadow" />
                        <div v-else-if="modalType === 'editExpense' && editingExpense" class="space-y-4">
                            <div v-if="message && modalType=== 'editExpense'" :class="`p-3 rounded-md mb-4 ${messageClass}`">
                                {{ message }}
                            </div>
                            <div v-if="showEditError" class="p-3 rounded-md mb-4 bg-yellow-100 text-yellow-600">
                                {{ editErrorMessage }}
                            </div>
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
                            <button @click="saveEditedExpense" :disabled="(editingExpense?.editCount >= 3)" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md" :class="{'opacity-50 cursor-not-allowed': editingExpense?.editCount >= 3}">Save</button>
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

        <div v-if="confirmDeleteId" class="fixed z-50 inset-0 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen px-4 py-12 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Confirm Delete
                                </h3>
                                <div class="mt-2">
                                    <p class="text-sm text-gray-500">
                                        Are you sure you want to delete this expense? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button @click="deleteExpense(confirmDeleteId)" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto" :disabled="isDeleting">
                            {{ isDeleting ? 'Deleting...' : 'Delete' }}
                        </button>
                        <button @click="cancelDelete" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>