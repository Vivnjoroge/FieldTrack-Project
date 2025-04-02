<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// Router
const router = useRouter();

// Dummy Data for Expenses
const totalExpenses = ref(120000);
const pendingReimbursements = ref(5);
const approvedExpenses = ref(35);
const rejectedExpenses = ref(7);

// Expense Approval Requests
const expenseRequests = ref([
  { id: 1, employee: "John Doe", amount: 5000, purpose: "Travel Allowance", status: "Pending" },
  { id: 2, employee: "Jane Smith", amount: 12000, purpose: "Equipment Purchase", status: "Pending" },
]);

// Budget Tracking
const departmentBudgets = ref([
  { department: "Operations", allocated: 200000, spent: 120000 },
  { department: "Marketing", allocated: 150000, spent: 80000 },
]);

// Resource Allocation
const resources = ref([
  { id: 1, resource: "Company Vehicle", assignedTo: "Alice Brown", status: "In Use" },
  { id: 2, resource: "Laptop", assignedTo: "Mike Johnson", status: "Available" },
]);

// Approve or Reject Expenses
const updateExpenseStatus = (id, status) => {
  const expense = expenseRequests.value.find((e) => e.id === id);
  if (expense) {
    expense.status = status;
  }
};

// Redirect If Not a Manager
onMounted(() => {
  const role = localStorage.getItem("role");
  if (role !== "Manager") {
    router.push("/unauthorized");
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Main Content -->
    <main class="w-4/5 p-8">
      <h1 class="text-2xl font-bold">Manager Dashboard</h1>

      <!-- Expense Overview -->
      <div class="grid grid-cols-4 gap-6 mt-6">
        <div class="p-5 bg-white shadow rounded">
          <h3 class="text-lg font-semibold">Total Expenses</h3>
          <p class="text-2xl font-bold text-blue-600">Ksh {{ totalExpenses }}</p>
        </div>
        <div class="p-5 bg-white shadow rounded">
          <h3 class="text-lg font-semibold">Pending Reimbursements</h3>
          <p class="text-2xl font-bold text-orange-600">{{ pendingReimbursements }}</p>
        </div>
        <div class="p-5 bg-white shadow rounded">
          <h3 class="text-lg font-semibold">Approved Expenses</h3>
          <p class="text-2xl font-bold text-green-600">{{ approvedExpenses }}</p>
        </div>
        <div class="p-5 bg-white shadow rounded">
          <h3 class="text-lg font-semibold">Rejected Expenses</h3>
          <p class="text-2xl font-bold text-red-600">{{ rejectedExpenses }}</p>
        </div>
      </div>

      <!-- Expense Approvals -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold">Expense Approval Requests</h2>
        <table class="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-200">
              <th class="border p-3">Employee</th>
              <th class="border p-3">Amount (Ksh)</th>
              <th class="border p-3">Purpose</th>
              <th class="border p-3">Status</th>
              <th class="border p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in expenseRequests" :key="expense.id">
              <td class="border p-3">{{ expense.employee }}</td>
              <td class="border p-3">{{ expense.amount }}</td>
              <td class="border p-3">{{ expense.purpose }}</td>
              <td class="border p-3">{{ expense.status }}</td>
              <td class="border p-3 text-center">
                <button
                  class="bg-green-600 text-white px-3 py-1 rounded mx-1"
                  @click="updateExpenseStatus(expense.id, 'Approved')"
                >
                  Approve
                </button>
                <button
                  class="bg-red-600 text-white px-3 py-1 rounded mx-1"
                  @click="updateExpenseStatus(expense.id, 'Rejected')"
                >
                  Reject
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Budget Tracking -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold">Budget Tracking</h2>
        <table class="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-200">
              <th class="border p-3">Department</th>
              <th class="border p-3">Allocated Budget (Ksh)</th>
              <th class="border p-3">Spent (Ksh)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="budget in departmentBudgets" :key="budget.department">
              <td class="border p-3">{{ budget.department }}</td>
              <td class="border p-3">{{ budget.allocated }}</td>
              <td class="border p-3">{{ budget.spent }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Resource Allocation -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold">Resource Allocation</h2>
        <ul class="mt-4">
          <li v-for="resource in resources" :key="resource.id" class="p-2 bg-white shadow rounded mb-2">
            <strong>{{ resource.resource }}</strong> - Assigned to: {{ resource.assignedTo }} ({{ resource.status }})
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Sidebar Styling */
aside {
  height: 100vh;
}
</style>

