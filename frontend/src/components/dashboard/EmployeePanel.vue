<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const totalExpenses = ref(0);
const pendingReimbursements = ref(0);
const approvedRequests = ref(0);
const recentSubmissions = ref([]);
const pendingRequests = ref([]);

// Simulate fetching data from API (Replace with actual API call)
const fetchDashboardData = async () => {
  try {
    // Mock API response
    totalExpenses.value = 5; // Example: 5 total submitted expenses
    pendingReimbursements.value = 2; // Example: 2 reimbursements pending
    approvedRequests.value = 3; // Example: 3 approved resource requests

    // Example data (Replace with API response)
    recentSubmissions.value = [
      { id: 1, type: "Expense", status: "Pending", date: "2024-03-20" },
      { id: 2, type: "Resource", status: "Approved", date: "2024-03-18" },
    ];
    pendingRequests.value = [
      { id: 3, type: "Reimbursement", status: "Pending", date: "2024-03-19" },
    ];
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};

onMounted(fetchDashboardData);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Employee Dashboard</h1>

    <!-- Summary Cards -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-500 text-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold">Total Expenses</h2>
        <p class="text-2xl">{{ totalExpenses }}</p>
      </div>
      <div class="bg-yellow-500 text-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold">Pending Reimbursements</h2>
        <p class="text-2xl">{{ pendingReimbursements }}</p>
      </div>
      <div class="bg-green-500 text-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold">Approved Requests</h2>
        <p class="text-2xl">{{ approvedRequests }}</p>
      </div>
    </div>

    <!-- Recent Submissions -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Recent Submissions</h2>
      <ul class="bg-white shadow rounded-lg p-4">
        <li v-for="item in recentSubmissions" :key="item.id" class="py-2 border-b last:border-b-0">
          <span class="font-semibold">{{ item.type }}</span> - {{ item.status }} ({{ item.date }})
        </li>
      </ul>
    </div>

    <!-- Pending Requests -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Pending Requests</h2>
      <ul class="bg-white shadow rounded-lg p-4">
        <li v-for="item in pendingRequests" :key="item.id" class="py-2 border-b last:border-b-0">
          <span class="font-semibold">{{ item.type }}</span> - {{ item.status }} ({{ item.date }})
        </li>
      </ul>
    </div>

    <!-- Quick Actions -->
    <div class="flex gap-4">
      <button @click="router.push('/submit-expense')" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
        Submit Expense
      </button>
      <button @click="router.push('/request-resources')" class="bg-green-600 text-white px-4 py-2 rounded-lg">
        Request Resources
      </button>
    </div>
  </div>
</template>
