<script setup>
const apiUrl = import.meta.env.VITE_API_URL;
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import ExpenseBarChart from './ExpenseBarChart.vue'; // ✅ Custom bar chart component

const summaryData = ref([]);
const loading = ref(false);
const errorMessage = ref('');

const fetchSummaryData = async () => {
    loading.value = true;
    errorMessage.value = '';
    summaryData.value = [];

    const token = localStorage.getItem('token');
    if (!token) {
        errorMessage.value = 'Authentication token not found.';
        loading.value = false;
        return;
    }

    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const response = await axios.get(
            `${apiUrl}/api/reports/monthly-summary?month=${currentMonth}&year=${currentYear}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        console.log('Monthly Expense Summary Data:', response.data);
        summaryData.value = response.data;
    } catch (error) {
        console.error('Error fetching monthly expense summary:', error);
        errorMessage.value = 'Failed to fetch monthly expense summary.';
    } finally {
        loading.value = false;
    }
};

const chartData = computed(() => {
    return summaryData.value.map(item => ({
        expenseType: item.Expense_Type,
        amount: item.Total_Amount,
        amountFormatted: new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            maximumFractionDigits: 0
        }).format(item.Total_Amount),
    }));
});

onMounted(() => {
    fetchSummaryData();
});
</script>

<template>
    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">Expense Summary</h2>

        <div v-if="loading" class="text-center text-gray-500 italic py-4">Loading summary data...</div>
        <div v-else-if="errorMessage" class="text-red-500 py-4">{{ errorMessage }}</div>
        <div v-else-if="summaryData.length > 0">
            
            <!--  Use your custom chart here -->
            <ExpenseBarChart :chartData="chartData" />

            <!-- Summary List -->
            <div class="mt-6 bg-gray-50 p-4 rounded-md shadow-sm">
                <p class="mb-2 font-semibold text-gray-700">Expense Breakdown:</p>
                <ul class="space-y-1">
                    <li
                        v-for="item in summaryData"
                        :key="item.Expense_Type"
                        class="flex justify-between border-b pb-1 text-sm text-gray-600"
                    >
                        <span class="font-medium">{{ item.Expense_Type }}</span>
                        <span>KSh {{ new Intl.NumberFormat('en-KE').format(item.Total_Amount) }}</span>
                    </li>
                </ul>
                <div class="mt-4 font-bold text-right text-gray-800">
                    Total Expenses: KSh {{ new Intl.NumberFormat('en-KE').format(summaryData.reduce((sum, item) => sum + item.Total_Amount, 0)) }}
                </div>
            </div>
        </div>
        <p v-else class="text-gray-500 italic py-4 text-center">No monthly expense summary data available.</p>
    </div>
</template>

