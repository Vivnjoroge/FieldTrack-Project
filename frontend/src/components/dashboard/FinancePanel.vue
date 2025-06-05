<script setup>
const apiUrl = import.meta.env.VITE_API_URL;
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { Pie } from "vue-chartjs";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

// Reactive data
const userProfile = ref(null);
const pendingExpenses = ref([]);
const overviewStats = ref({
    totalExpenses: 0,
    pending: 0,
    approved: 0,
    rejected: 0
});

const loading = ref(true);
const error = ref(null);

// Pie chart data for visualization
const chartData = computed(() => ({
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
        {
            backgroundColor: ["#facc15", "#4ade80", "#f87171"],
            data: [
                overviewStats.value.pending,
                overviewStats.value.approved,
                overviewStats.value.rejected
            ]
        }
    ]
}));

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: "bottom"
        },
        title: {
            display: true,
            text: "Expense Status Overview"
        }
    }
};

// Fetch user profile
const fetchUserProfile = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/api/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        userProfile.value = response.data;
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
};

// Fetch finance data
const fetchFinanceData = async () => {
    loading.value = true;
    error.value = null;

    try {
        const token = localStorage.getItem("token");
        const { data: allExpenses } = await axios.get(`${apiUrl}/api/expenses`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        overviewStats.value.totalExpenses = allExpenses.length;
        overviewStats.value.pending = allExpenses.filter(e => e.Approval_Status === "Pending").length;
        overviewStats.value.approved = allExpenses.filter(e => e.Approval_Status === "Approved").length;
        overviewStats.value.rejected = allExpenses.filter(e => e.Approval_Status === "Rejected").length;

        pendingExpenses.value = allExpenses.filter(e => e.Approval_Status === "Pending");
    } catch (err) {
        error.value = "Failed to load finance data.";
        console.error("Finance fetch error:", err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchFinanceData();
    fetchUserProfile(); // Fetch user profile on mount
});

// Approve
const approveExpense = async (id) => {
    try {
        
      await axios.put(`${apiUrl}/api/expenses/approve/${id}`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        fetchFinanceData();
    } catch (err) {
        console.error("Approve error:", err);
    }
};

// Reject
const rejectExpense = async (id) => {
    try {
        await axios.put(`${apiUrl}/api/expenses/reject/${id}`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        fetchFinanceData();
    } catch (err) {
        console.error(" Reject error:", err);
    }
};
</script>

<template>
    <div class="p-6 space-y-6 bg-gray-100 min-h-screen">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">Finance Dashboard</h1>
                <p v-if="userProfile" class="text-sm text-gray-500">Welcome, {{ userProfile.Name }} ({{ userProfile.Department }})</p>
            </div>
            <div class="flex items-center space-x-4">
                </div>
        </div>

        <div v-if="loading" class="text-center text-lg text-gray-600">⏳ Loading finance data...</div>
        <div v-else-if="error" class="text-center text-red-500 text-lg">{{ error }}</div>

        <div v-else class="space-y-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-blue-50 p-4 rounded shadow text-center">
                    <h3 class="text-sm text-gray-500">Total Expenses</h3>
                    <p class="text-2xl font-bold text-blue-600">{{ overviewStats.totalExpenses }}</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded shadow text-center">
                    <h3 class="text-sm text-gray-500">Pending Approvals</h3>
                    <p class="text-2xl font-bold text-yellow-600">{{ overviewStats.pending }}</p>
                </div>
                <div class="bg-green-50 p-4 rounded shadow text-center">
                    <h3 class="text-sm text-gray-500">Approved</h3>
                    <p class="text-2xl font-bold text-green-600">{{ overviewStats.approved }}</p>
                </div>
                <div class="bg-red-50 p-4 rounded shadow text-center">
                    <h3 class="text-sm text-gray-500">Rejected</h3>
                    <p class="text-2xl font-bold text-red-600">{{ overviewStats.rejected }}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white p-6 rounded shadow">
                    <h2 class="text-xl font-semibold mb-4">📊 Expense Status Overview</h2>
                    <Pie :data="chartData" :options="chartOptions" />
                </div>

                <div class="bg-white p-6 rounded shadow">
                    <h2 class="text-xl font-semibold mb-4">📋 Pending Expenses</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-gray-700">
                            <thead class="bg-gray-100 text-xs uppercase">
                                <tr>
                                    <th class="p-2">Employee</th>
                                    <th class="p-2">Type</th>
                                    <th class="p-2">Amount</th>
                                    <th class="p-2">Date</th>
                                    <th class="p-2">Receipt</th>
                                    <th class="p-2">Status</th>
                                    <th class="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="expense in pendingExpenses"
                                    :key="expense.Expense_ID"
                                    class="border-t hover:bg-gray-50"
                                >
                                    <td class="p-2">{{ expense.Employee_Name }}</td>
                                    <td class="p-2">{{ expense.Expense_Type }}</td>
                                    <td class="p-2">KSh {{ expense.Amount }}</td>
                                    <td class="p-2">{{ new Date(expense.Date_Submitted).toLocaleDateString() }}</td>
                                    <td class="p-2">
                                        <a
                                            v-if="expense.Receipt"
                                            :href="expense.Receipt"
                                            target="_blank"
                                            class="text-blue-600 underline"
                                        >View</a>
                                        <span v-else class="text-gray-400">No Receipt</span>
                                    </td>
                                    <td class="p-2">{{ expense.Approval_Status }}</td>
                                    <td class="p-2 flex space-x-2">
                                        <button
                                            @click="approveExpense(expense.Expense_ID)"
                                            class="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                                        >
                                            ✅ Approve
                                        </button>
                                        <button
                                            @click="rejectExpense(expense.Expense_ID)"
                                            class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                                        >
                                            ❌ Reject
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p v-if="pendingExpenses.length === 0" class="mt-4 text-gray-500 text-center">
                             All expenses are reviewed!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add any custom styling if needed for finer control */
</style>
