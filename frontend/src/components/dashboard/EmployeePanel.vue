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
const user = ref({
  name: "",
  email: "",
  profilePic: "https://via.placeholder.com/150",
});
const loading = ref(true); // Add loading state
const errorMessage = ref(null); // Add error message

// Fetch Dashboard Data
const fetchDashboardData = async () => {
  loading.value = true; // Set loading to true
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch user profile (remove if not used)
    try {
      const userResponse = await axios.get("http://localhost:5000/api/profile/me", { // <---- CORRECTED URL
        headers: { Authorization: `Bearer ${token}` },
      });
      user.value = userResponse.data;
    } catch (profileError) {
      console.error("error retrieving profile data", profileError);
    }
    // Fetch expenses (recent and pending)
    const expensesResponse = await axios.get("http://localhost:5000/api/expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const expenses = expensesResponse.data;

    // Calculate dashboard stats
    totalExpenses.value = expenses.length;
    pendingReimbursements.value = expenses.filter(
      (expense) => expense.Approval_Status === "Pending"
    ).length;
    approvedRequests.value = expenses.filter(
      (expense) => expense.Approval_Status === "Approved"
    ).length;

    // Get recent submissions (last 5)
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

    // Get pending requests
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
    errorMessage.value = "Failed to load dashboard data. Please try again."; // Set error message
  } finally {
    loading.value = false; // Set loading to false
  }
};

onMounted(fetchDashboardData);
</script>
<template>
  <div class="p-6">
    <div class="bg-white shadow p-4 rounded-lg flex items-center mb-6">
      <img :src="user.profilePic" alt="Profile Picture" class="w-16 h-16 rounded-full mr-4" />
      <div>
        <p class="text-xl font-semibold">{{ user.name }}</p>
        <p class="text-gray-600">{{ user.email }}</p>
        <router-link to="/profile" class="text-blue-500 underline">View Full Profile</router-link>
      </div>
    </div>

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

    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Recent Submissions</h2>
      <ul class="bg-white shadow rounded-lg p-4">
        <li v-for="item in recentSubmissions" :key="item.id" class="py-2 border-b last:border-b-0 flex justify-between">
          <span class="font-semibold">{{ item.type }}</span>
          <span :class="{
            'text-yellow-600': item.status === 'Pending',
            'text-green-600': item.status === 'Approved',
            'text-red-600': item.status === 'Rejected'
          }">
            {{ item.status }}
          </span>
          <span>{{ item.date }}</span>
        </li>
      </ul>
    </div>

    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Pending Requests</h2>
      <ul class="bg-white shadow rounded-lg p-4">
        <li v-for="item in pendingRequests" :key="item.id" class="py-2 border-b last:border-b-0 flex justify-between">
          <span class="font-semibold">{{ item.type }}</span>
          <span class="text-yellow-600">{{ item.status }}</span>
          <span>{{ item.date }}</span>
        </li>
      </ul>
    </div>

    <div class="flex gap-4">
      <button @click="router.push('/expenses')" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
        Submit Expense
      </button>
      <button @click="router.push('/resources')" class="bg-green-600 text-white px-4 py-2 rounded-lg">
        Request Resources
      </button>
    </div>
  </div>
</template>