<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  chartData: Array
})

const data = {
  labels: props.chartData.map(item => item.expenseType),
  datasets: [
    {
      label: 'Total Amount (KES)',
      data: props.chartData.map(item => item.amount),
      backgroundColor: '#3182ce'
    }
  ]
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: value => `KSh ${value.toLocaleString()}`
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: context => `KSh ${context.raw.toLocaleString()}`
      }
    }
  }
}
</script>

<template>
  <div style="height: 300px;">
    <Bar :data="data" :options="options" />
  </div>
</template>
