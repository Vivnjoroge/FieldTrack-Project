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

// You no longer need the 'open' prop or emit here
// defineProps({
//   open: {
//     type: Boolean,
//     default: true
//   }
// });

// const emit = defineEmits(['update:open']);

// const closeSidebar = () => {
//   emit('update:open', false);
// };

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
  fetchUserProfile();      // Now it's accessible!
  fetchDashboardData();
});
</script>

<template>
  <div class="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto space-y-8">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex items-center">
          <span class="text-yellow-500 text-2xl mr-2">👋</span>
          <h2 v-if="userProfile" class="text-2xl font-semibold text-gray-900 leading-tight">
            Welcome, <span class="text-indigo-700">{{ userProfile.Name }}</span>
          </h2>
        </div>
        <p class="mt-1 text-sm text-gray-600">
          Department: <span class="font-medium text-gray-800">{{ userProfile?.Department || 'Not assigned' }}</span>
        </p>
        <div class="mt-4 flex md:mt-0 md:ml-4 space-x-2">
          <button
            @click="router.push('/expenses')"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="material-icons mr-2">add</span> Submit Expense
          </button>
          <button
            @click="router.push('/reports')"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="material-icons mr-2">assessment</span> View Reports
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-blue-50 shadow rounded-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span class="material-icons text-xl">attach_money</span>
                </span>
              </div>
              <div class="ml-4">
                <dt class="text-sm font-medium text-gray-600 truncate">Total Expenses</dt>
                <dd class="mt-1 text-3xl font-semibold text-blue-700">{{ totalExpenses }}</dd>
                <p class="mt-1 text-sm text-gray-600">All submitted expenses</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-amber-50 shadow rounded-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center h-12 w-12 rounded-md bg-amber-500 text-white">
                  <span class="material-icons text-xl">hourglass_empty</span>
                </span>
              </div>
              <div class="ml-4">
                <dt class="text-sm font-medium text-gray-600 truncate">Pending Reimbursements</dt>
                <dd class="mt-1 text-3xl font-semibold text-amber-700">{{ pendingReimbursements }}</dd>
                <p class="mt-1 text-sm text-gray-600">Awaiting approval</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-green-50 shadow rounded-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <span class="material-icons text-xl">check_circle</span>
                </span>
              </div>
              <div class="ml-4">
                <dt class="text-sm font-medium text-gray-600 truncate">Approved Requests</dt>
                <dd class="mt-1 text-3xl font-semibold text-green-700">{{ approvedRequests }}</dd>
                <p class="mt-1 text-sm text-gray-600">Successfully approved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-5 sm:px-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Expense Submissions</h2>
        </div>
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="item in recentSubmissions" :key="item.id" class="px-6 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-indigo-700">{{ item.type }}</p>
              <div class="ml-2 flex-shrink-0">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': item.status === 'Pending',
                    'bg-green-100 text-green-800': item.status === 'Approved',
                    'bg-red-100 text-red-800': item.status === 'Rejected'
                  }"
                >
                  {{ item.status }}
                </span>
              </div>
            </div>
            <div class="mt-2 sm:flex sm:justify-between">
              <div class="sm:flex">
                <span class="mr-4 flex items-center text-sm text-gray-600">
                  <span class="material-icons mr-1 text-gray-500 text-sm">calendar_today</span>
                  {{ new Date(item.date).toLocaleDateString() }}
                </span>
              </div>
              <div class="mt-2 sm:mt-0">
                <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">View Details</a>
              </div>
            </div>
          </li>
          <li v-if="recentSubmissions.length === 0" class="px-6 py-4 sm:px-6 text-gray-500 italic">No recent submissions.</li>
        </ul>
        <div class="bg-gray-50 px-6 py-3 sm:px-6 sm:flex sm:justify-end">
          <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">View All Submissions</a>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-5 sm:px-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Pending Approval Requests</h2>
        </div>
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="item in pendingRequests" :key="item.id" class="px-6 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-amber-700">{{ item.type }}</p>
              <div class="ml-2 flex-shrink-0">
                <span class="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                  {{ item.status }}
                </span>
              </div>
            </div>
            <div class="mt-2 sm:flex sm:justify-between">
              <div class="sm:flex">
                <span class="mr-4 flex items-center text-sm text-gray-600">
                  <span class="material-icons mr-1 text-gray-500 text-sm">calendar_today</span>
                  {{ new Date(item.date).toLocaleDateString() }}
                </span>
              </div>
              <div class="mt-2 sm:mt-0">
                <a href="#" class="text-sm font-medium text-amber-600 hover:text-amber-500">Review</a>
              </div>
            </div>
          </li>
          <li v-if="pendingRequests.length === 0" class="px-6 py-4 sm:px-6 text-gray-500 italic">No pending requests.</li>
        </ul>
        <div class="bg-gray-50 px-6 py-3 sm:px-6 sm:flex sm:justify-end">
          <a href="#" class="text-sm font-medium text-amber-600 hover:text-amber-500">View All Pending</a>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-5 sm:px-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        </div>
        <div class="px-6 py-5 sm:px-6 flex gap-3">
          <button
            @click="router.push('/expenses')"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="material-icons mr-2 text-sm">add</span> Submit Expense
          </button>
          <button
            @click="router.push('/resources')"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
          <span class="material-icons mr-2 text-sm">inventory</span> Request Resources
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Add transition for the content shift when the sidebar opens/closes */
/* You can remove this from Dashboard.vue as it's now in the layout */
/* .transition-margin-left {
  transition: margin-left 0.3s ease-in-out;
} */
</style>