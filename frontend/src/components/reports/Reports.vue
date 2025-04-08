<script setup>
  import { ref, computed } from 'vue';
  import { Bar } from 'vue-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
  
  const selectedMonth = ref(new Date().getMonth() + 1);
  const selectedYear = ref(new Date().getFullYear());
  const reportData = ref([]);
  const reportDataFetched = ref(false);
  
  const chartData = computed(() => ({
    labels: reportData.value.map((item) => item.Expense_Type),
    datasets: [
      {
        label: 'Total Expenses',
        backgroundColor: '#41B883',
        data: reportData.value.map((item) => item.Total_Amount),
      },
    ],
  }));
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const BarChart = Bar;
  
  const generateDummyData = () => {
    reportData.value = [
      { Expense_Type: 'Travel', Total_Amount: Math.floor(Math.random() * 1000) },
      { Expense_Type: 'Food', Total_Amount: Math.floor(Math.random() * 1000) },
      { Expense_Type: 'Supplies', Total_Amount: Math.floor(Math.random() * 1000) },
      { Expense_Type: 'Entertainment', Total_Amount: Math.floor(Math.random() * 1000) },
      { Expense_Type: 'Rent', Total_Amount: Math.floor(Math.random() * 1000) },
    ];
    reportDataFetched.value = true;
  };
  </script>

<template>
    <div>
      <h2 class="text-xl font-semibold mb-4">Monthly Expense Summary (Dummy Data)</h2>
      <div class="mb-4">
        <label for="month">Month:</label>
        <select v-model="selectedMonth" id="month">
          <option v-for="m in 12" :key="m" :value="m">
            {{ new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' }) }}
          </option>
        </select>
        <label for="year">Year:</label>
        <input type="number" v-model="selectedYear" id="year" min="2000" :max="new Date().getFullYear()" />
        <button @click="generateDummyData" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Generate Report
        </button>
      </div>
      <div v-if="reportData.length > 0">
        <BarChart :chartData="chartData" :chartOptions="chartOptions" />
      </div>
      <p v-else-if="reportDataFetched" class="text-gray-500 italic">No data found for the selected period.</p>
    </div>
  </template>
  