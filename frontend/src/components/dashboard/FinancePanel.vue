<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const pendingExpenses = ref([]);
const overviewStats = ref({
    totalExpenses: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalReimbursements: 0,
});
const loading = ref(true);
const error = ref(null);

// ✅ Fetch all expenses and calculate statistics
const fetchFinanceData = async () => {
    loading.value = true;
    error.value = null;
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/expenses", {
            headers: { Authorization: `Bearer ${token}` },
        });

        const allExpenses = response.data;

        // Calculate statistics
        overviewStats.value.totalExpenses = allExpenses.length;
        overviewStats.value.pending = allExpenses.filter(expense => expense.Approval_Status === "Pending").length;
        overviewStats.value.approved = allExpenses.filter(expense => expense.Approval_Status === "Approved").length;
        overviewStats.value.rejected = allExpenses.filter(expense => expense.Approval_Status === "Rejected").length;

        // Get pending expenses for the table
        pendingExpenses.value = allExpenses.filter(expense => expense.Approval_Status === "Pending");

        console.log("All Expenses Data:", allExpenses);
        console.log("Updated overviewStats:", overviewStats.value);
        console.log("Pending Expenses Data:", pendingExpenses.value);

    } catch (err) {
        console.error("❌ Error fetching finance data:", err);
        error.value = "Failed to fetch finance data.";
    } finally {
        loading.value = false;
    }
};

onMounted(fetchFinanceData);

// ✅ Approve Expense
const approveExpense = async (id) => {
    try {
        await axios.put(`http://localhost:5000/api/expenses/approve/${id}`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchFinanceData(); // Refresh data
    } catch (error) {
        console.error("❌ Error approving expense:", error);
    }
};

// ❌ Reject Expense
const rejectExpense = async (id) => {
    try {
        await axios.put(`http://localhost:5000/api/expenses/reject/${id}`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchFinanceData(); // Refresh data
    } catch (error) {
        console.error("❌ Error rejecting expense:", error);
    }
};
</script>

<template>
    <div v-if="loading" class="p-6 bg-white rounded-lg shadow-md">Loading finance data...</div>
    <div v-else-if="error" class="p-6 bg-white rounded-lg shadow-md text-red-500">Error: {{ error }}</div>
    <div v-else class="p-6 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold mb-4">Finance Dashboard</h1>

        <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="p-4 bg-blue-100 text-blue-800 rounded-md">
                <h3 class="text-lg font-semibold">Total Expenses</h3>
                <p class="text-2xl">{{ overviewStats.totalExpenses }}</p>
            </div>
            <div class="p-4 bg-yellow-100 text-yellow-800 rounded-md">
                <h3 class="text-lg font-semibold">Pending Approvals</h3>
                <p class="text-2xl">{{ overviewStats.pending }}</p>
            </div>
            <div class="p-4 bg-green-100 text-green-800 rounded-md">
                <h3 class="text-lg font-semibold">Approved Expenses</h3>
                <p class="text-2xl">{{ overviewStats.approved }}</p>
            </div>
            <div class="p-4 bg-red-100 text-red-800 rounded-md">
                <h3 class="text-lg font-semibold">Rejected Expenses</h3>
                <p class="text-2xl">{{ overviewStats.rejected }}</p>
            </div>
        </div>

        <h2 class="text-xl font-bold mb-3">Pending Approvals</h2>
        <table class="w-full border-collapse border border-gray-200">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border p-2">Employee</th>
                    <th class="border p-2">Expense Type</th>
                    <th class="border p-2">Amount</th>
                    <th class="border p-2">Date</th>
                    <th class="border p-2">Receipt</th>
                    <th class="border p-2">Status</th>
                    <th class="border p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="expense in pendingExpenses" :key="expense.Expense_ID" class="border">
                    <td class="p-2 border">{{ expense.Employee_Name }}</td>
                    <td class="p-2 border">{{ expense.Expense_Type }}</td>
                    <td class="p-2 border">{{ expense.Amount }}</td>
                    <td class="p-2 border">{{ new Date(expense.Date_Submitted).toLocaleDateString() }}</td>
                    <td class="p-2 border">
                        <a v-if="expense.Receipt" :href="expense.Receipt" target="_blank" class="text-blue-600 underline">View</a>
                        <span v-else>No Receipt</span>
                    </td>
                    <td class="p-2 border">{{ expense.Approval_Status }}</td>
                    <td class="p-2 border">
                        <button
                            @click="approveExpense(expense.Expense_ID)"
                            class="bg-green-500 text-white px-3 py-1 rounded mr-2"
                            v-if="expense.Approval_Status === 'Pending'"
                        >
                            ✅ Approve
                        </button>
                        <button
                            @click="rejectExpense(expense.Expense_ID)"
                            class="bg-red-500 text-white px-3 py-1 rounded"
                            v-if="expense.Approval_Status === 'Pending'"
                        >
                            ❌ Reject
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-if="pendingExpenses.length === 0 && !loading">No pending approvals.</p>
    </div>
</template>

<style scoped>
/* Add styling if needed */
</style>