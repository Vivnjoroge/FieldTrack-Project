<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const totalExpenses = ref(0);
const pendingReimbursements = ref(0);
const approvedRequests = ref(0);
const recentSubmissions = ref([]);
const pendingRequests = ref([]);
const userProfile = ref(null);
const loading = ref(true);
const errorMessage = ref(null);

// ✅ Fetch User Profile
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:5000/api/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    userProfile.value = response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};

// ✅ Fetch Dashboard Data
const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const expensesResponse = await axios.get("http://localhost:5000/api/expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const expenses = expensesResponse.data;

    totalExpenses.value = expenses.length;
    pendingReimbursements.value = expenses.filter(
      (expense) => expense.Approval_Status === "Pending"
    ).length;
    approvedRequests.value = expenses.filter(
      (expense) => expense.Approval_Status === "Approved"
    ).length;

    recentSubmissions.value = expenses
      .slice()
      .sort((a, b) => new Date(b.Date_Submitted) - new Date(a.Date_Submitted))
      .slice(0, 5)
      .map((expense) => ({
        id: expense.Expense_ID,
        type: expense.Expense_Type,
        status: expense.Approval_Status,
        date: expense.Date_Submitted,
      }));

    pendingRequests.value = expenses
      .filter((expense) => expense.Approval_Status === "Pending")
      .map((expense) => ({
        id: expense.Expense_ID,
        type: expense.Expense_Type,
        status: expense.Approval_Status,
        date: expense.Date_Submitted,
      }));
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    errorMessage.value = "Failed to load dashboard data. Please try again.";
  } finally {
    loading.value = false;
  }
};

// ✅ onMounted Hook
onMounted(() => {
  fetchUserProfile();       // Now it's accessible!
  fetchDashboardData();
});
</script>


<template>
  <div class="bg-gray-50 min-h-screen py-8 px-4 md:px-8">
    <div class="max-w-6xl mx-auto space-y-8">

      <!-- Welcome Card -->
      <div class="bg-white shadow rounded-2xl p-6 md:p-8">
        <h1 v-if="userProfile" class="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
          Welcome, {{ userProfile.Name }}
          <span v-if="userProfile.Department" class="text-sm text-gray-600">({{ userProfile.Department }})</span>
        </h1>
        <p v-else class="text-gray-600 text-base">Here's a quick overview of your employee panel.</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div class="bg-blue-600 text-white p-6 rounded-xl shadow hover:shadow-lg transition duration-300">
          <h2 class="text-lg font-semibold mb-1">Total Expenses</h2>
          <p class="text-4xl font-bold">{{ totalExpenses }}</p>
          <p class="text-sm opacity-80 mt-1">All submitted expenses</p>
        </div>
        <div class="bg-orange-500 text-white p-6 rounded-xl shadow hover:shadow-lg transition duration-300">
          <h2 class="text-lg font-semibold mb-1">Pending Reimbursements</h2>
          <p class="text-4xl font-bold">{{ pendingReimbursements }}</p>
          <p class="text-sm opacity-80 mt-1">Expenses awaiting approval</p>
        </div>
        <div class="bg-green-600 text-white p-6 rounded-xl shadow hover:shadow-lg transition duration-300">
          <h2 class="text-lg font-semibold mb-1">Approved Requests</h2>
          <p class="text-4xl font-bold">{{ approvedRequests }}</p>
          <p class="text-sm opacity-80 mt-1">Expenses that have been approved</p>
        </div>
      </div>

      <!-- Recent Submissions -->
      <div class="bg-white shadow rounded-2xl p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Recent Submissions</h2>
        <div v-if="recentSubmissions.length === 0" class="text-gray-500 italic">No recent submissions.</div>
        <ul v-else class="divide-y divide-gray-200">
          <li
            v-for="item in recentSubmissions"
            :key="item.id"
            class="py-4 flex flex-col md:flex-row md:items-center justify-between gap-2"
          >
            <span class="text-gray-800 font-medium">{{ item.type }}</span>
            <span
              class="text-sm font-semibold px-3 py-1 rounded-full"
              :class="{
                'bg-yellow-200 text-yellow-700': item.status === 'Pending',
                'bg-green-200 text-green-700': item.status === 'Approved',
                'bg-red-200 text-red-700': item.status === 'Rejected'
              }"
            >
              {{ item.status }}
            </span>
            <span class="text-sm text-gray-500">{{ new Date(item.date).toLocaleDateString() }}</span>
          </li>
        </ul>
      </div>

      <!-- Pending Requests -->
      <div class="bg-white shadow rounded-2xl p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Pending Requests</h2>
        <div v-if="pendingRequests.length === 0" class="text-gray-500 italic">No pending requests.</div>
        <ul v-else class="divide-y divide-gray-200">
          <li
            v-for="item in pendingRequests"
            :key="item.id"
            class="py-4 flex flex-col md:flex-row md:items-center justify-between gap-2"
          >
            <span class="text-gray-800 font-medium">{{ item.type }}</span>
            <span class="text-sm font-semibold bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full">
              {{ item.status }}
            </span>
            <span class="text-sm text-gray-500">{{ new Date(item.date).toLocaleDateString() }}</span>
          </li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="bg-white shadow rounded-2xl p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            @click="router.push('/expenses')"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow transition hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6h13M9 11V5H3v6h6zm0 0v6h6V5h6v6H9z" />
            </svg>
            Submit Expense
          </button>
          <button
            @click="router.push('/resources')"
            class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow transition hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Request Resources
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
