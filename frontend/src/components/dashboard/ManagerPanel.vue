<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const resources = ref([]);
const loadingResources = ref(true);
const resourceError = ref(null);

onMounted(async () => {
  const role = localStorage.getItem("role");
  if (role !== "Manager") {
    return router.push("/unauthorized");
  }

  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    resources.value = await (await fetch("http://localhost:5000/api/resources", { headers })).json();
    loadingResources.value = false;
  } catch (error) {
    console.error("Error fetching data:", error);
    resourceError.value = "Failed to load resource data.";
    loadingResources.value = false;
  }
});

const approveResource = async (resourceId) => {
  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const response = await fetch(`http://localhost:5000/api/resources/approve/${resourceId}`, {
      method: "PUT",
      headers: headers,
    });

    if (response.ok) {
      const resource = resources.value.find((r) => r.Resource_ID === resourceId);
      if (resource) {
        resource.Status = "Approved";
      }
    } else {
      console.error("Failed to approve resource:", await response.json());
      alert('Failed to approve resource.');
    }
  } catch (error) {
    console.error("Error approving resource:", error);
    alert('An unexpected error occurred during approval.');

  }
};

const rejectResource = async (resourceId) => {
  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const response = await fetch(`http://localhost:5000/api/resources/reject/${resourceId}`, {
      method: "PUT",
      headers: headers,
    });

    if (response.ok) {
      const resource = resources.value.find((r) => r.Resource_ID === resourceId);
      if (resource) {
        resource.Status = "Rejected";
      }
    } else {
      console.error("Failed to reject resource:", await response.json());
      alert('Failed to reject resource.');
    }
  } catch (error) {
    console.error("Error rejecting resource:", error);
    alert('An unexpected error occurred during rejection.');
  }
};
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-6">Manager Dashboard</h1>

    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Expense Approval Requests</h2>
      <div v-if="loadingExpenses">Loading...</div>
      <div v-else-if="expenseError" class="text-red-500">{{ expenseError }}</div>
      <div v-else-if="expenseRequests && expenseRequests.length > 0">
        <table class="min-w-full divide-y divide-gray-200">
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="expense in expenseRequests" :key="expense.id">
              </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-500 italic">No expense approval requests found.</p>
    </div>

    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Budget Tracking</h2>
      <div v-if="loadingBudgets">Loading...</div>
      <div v-else-if="budgetError" class="text-red-500">{{ budgetError }}</div>
      <div v-else-if="departmentBudgets && departmentBudgets.length > 0">
        <table class="min-w-full divide-y divide-gray-200">
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="budget in departmentBudgets" :key="budget.department">
              </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-500 italic">No budget tracking data found.</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-4">Resource Allocation</h2>
      <div v-if="loadingResources">Loading...</div>
      <div v-else-if="resourceError" class="text-red-500">{{ resourceError }}</div>
      <div v-else-if="resources && resources.length > 0">
        <ul class="space-y-2">
          <li v-for="resource in resources" :key="resource.Resource_ID" class="bg-white p-4 rounded shadow">
            </li>
        </ul>
      </div>
      <p v-else class="text-gray-500 italic">No resource allocation data found.</p>
    </div>
  </div>
</template>