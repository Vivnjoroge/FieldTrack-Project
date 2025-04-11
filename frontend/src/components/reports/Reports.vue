<script setup>
import { ref, computed, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import axios from 'axios';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();
const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];
const years = Array.from({ length: 5 }, (_, index) => currentYear - index);

const selectedMonth = ref(currentMonth);
const selectedYear = ref(currentYear);
const reportData = ref([]);
const chartData = ref(null);
const reportDataFetched = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const computedChartData = computed(() => {
    if (!reportData.value || reportData.value.length === 0) {
        return null;
    }
    return {
        labels: reportData.value.map((item) => item.Expense_Type),
        datasets: [
            {
                label: 'Total Expenses (KSh)',
                backgroundColor: '#3b82f6', // Tailwind blue-500
                hoverBackgroundColor: '#2563eb', // Tailwind blue-700
                data: reportData.value.map((item) => item.Total_Amount),
            },
        ],
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Total Amount (KSh)',
                font: {
                    weight: 'bold',
                },
                color: '#4b5563', // Tailwind gray-700
            },
            ticks: {
                callback: function (value) {
                    return new Intl.NumberFormat('en-KE').format(value);
                },
                color: '#6b7280', // Tailwind gray-500
            },
            grid: {
                borderColor: '#e5e7eb', // Tailwind gray-200
                color: '#f3f4f6', // Tailwind gray-100
            },
        },
        x: {
            title: {
                display: true,
                text: 'Expense Type',
                font: {
                    weight: 'bold',
                },
                color: '#4b5563', // Tailwind gray-700
            },
            ticks: {
                color: '#6b7280', // Tailwind gray-500
            },
            grid: {
                borderColor: '#e5e7eb', // Tailwind gray-200
                color: '#f3f4f6', // Tailwind gray-100
            },
        },
    },
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Monthly Expense Summary',
            font: {
                size: 18,
                weight: 'bold',
                color: '#374151', // Tailwind gray-800
            },
            padding: {
                bottom: 10,
            },
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#f9fafb', // Tailwind gray-50
            bodyColor: '#f9fafb', // Tailwind gray-50
            borderColor: '#6b7280', // Tailwind gray-500
            borderWidth: 0.5,
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(context.parsed.y);
                    }
                    return label;
                },
            },
        },
    },
};

const BarChart = Bar;

const fetchExpenseReport = async () => {
    loading.value = true;
    errorMessage.value = '';
    reportDataFetched.value = false;
    reportData.value = [];
    chartData.value = null;

    const token = localStorage.getItem('token');
    if (!token) {
        errorMessage.value = 'Authentication token not found.';
        loading.value = false;
        return;
    }

    console.log("Frontend - Selected Month:", selectedMonth.value, "Selected Year:", selectedYear.value);

    try {
        const response = await axios.get(
            `/api/reports/monthly-summary?month=${selectedMonth.value}&year=${selectedYear.value}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        console.log("Frontend - API Response:", response.data);

        if (response.data && Array.isArray(response.data)) {
            reportData.value = response.data;
            chartData.value = computedChartData.value;
            reportDataFetched.value = true;
        } else {
            errorMessage.value = 'No expense data found for the selected period.';
            reportDataFetched.value = true;
        }
    } catch (error) {
        console.error('Error fetching expense report:', error);
        errorMessage.value = 'Failed to fetch expense report.';
    } finally {
        loading.value = false;
    }
};

const generateReport = () => {
    fetchExpenseReport();
};

onMounted(() => {
    fetchExpenseReport();
});
</script>

<template>
    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">Monthly Expense Summary</h2>

        <div class="mb-6 flex items-center space-x-4">
            <div>
                <label for="month" class="block text-sm font-medium text-gray-700">Month:</label>
                <select v-model="selectedMonth" id="month" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
                </select>
            </div>
            <div>
                <label for="year" class="block text-sm font-medium text-gray-700">Year:</label>
                <select v-model="selectedYear" id="year" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
            </div>
            <button @click="generateReport" class="bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Generate Report
            </button>
        </div>

        <div v-if="loading" class="text-center text-gray-500 italic py-4">Loading expense data...</div>
        <div v-else-if="errorMessage" class="text-red-500 py-4">{{ errorMessage }}</div>

        <div v-else-if="reportData.length > 0 && computedChartData" class="relative h-64">
            <Bar :data="computedChartData" :options="chartOptions" />
        </div>

        <p v-else-if="reportDataFetched" class="text-gray-500 italic py-4 text-center">No data found for the selected period.</p>
    </div>
</template>

<style scoped>

select {
    padding: 0.6rem;
}

button {
    transition: all 0.2s ease-in-out;
}
</style>
  