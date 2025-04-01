<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// UI State
const showRequestForm = ref(true); // Toggle between form & table

// Form Fields
const resourceName = ref("");
const quantity = ref(1);
const reason = ref("");
const message = ref("");
const messageClass = ref("");

// Resource Requests
const resourceRequests = ref([]);
const loading = ref(false);

// Fetch Resource Requests
const fetchResources = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem("token");
    if (!token) {
      message.value = "Authentication required. Please log in.";
      messageClass.value = "text-red-600 bg-red-100";
      loading.value = false;
      return;
    }

    const response = await axios.get("http://localhost:5000/api/resources", {
      headers: { Authorization: `Bearer ${token}` },
    });

    resourceRequests.value = response.data;
    loading.value = false;
  } catch (error) {
    console.error("❌ Error Fetching Requests:", error.response?.data);
    message.value = "Failed to load requests.";
    messageClass.value = "text-red-600 bg-red-100 p-2";
    loading.value = false;
  }
};

// Submit Request
const submitRequest = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      message.value = "Authentication required. Please log in.";
      messageClass.value = "text-red-600 bg-red-100";
      return;
    }

    const requestData = {
      resource_name: resourceName.value,
      quantity: quantity.value,
      reason: reason.value,
    };

    const response = await axios.post("http://localhost:5000/api/resources", requestData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    message.value = response.data.message;
    messageClass.value = "text-green-600 bg-green-100 p-2";

    // Reset form
    resourceName.value = "";
    quantity.value = 1;
    reason.value = "";

    // Refresh Resource List
    fetchResources();
  } catch (error) {
    console.error("❌ Error Submitting Request:", error.response?.data);
    message.value = "Failed to submit request.";
    messageClass.value = "text-red-600 bg-red-100 p-2";
  }
};

// Fetch resources when the component loads
onMounted(fetchResources);
</script>

<template>
  <div class="max-w-3xl mx-auto bg-white shadow-md p-6 rounded-lg">

    <!-- Toggle Button -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">
        {{ showRequestForm ? "Request a Resource" : "Your Resource Requests" }}
      </h2>
      <button
        @click="showRequestForm = !showRequestForm"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {{ showRequestForm ? "View Requests" : "Request Resource" }}
      </button>
    </div>

    <!-- Success/Error Message -->
    <p v-if="message" :class="messageClass" class="mb-4 text-center">{{ message }}</p>

    <!-- Request Form (Hidden when viewing requests) -->
    <form v-if="showRequestForm" @submit.prevent="submitRequest" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium">Resource Name:</label>
        <input type="text" v-model="resourceName" required class="w-full p-2 border rounded" placeholder="Enter resource name" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Quantity:</label>
        <input type="number" v-model="quantity" min="1" required class="w-full p-2 border rounded" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Reason:</label>
        <textarea v-model="reason" required class="w-full p-2 border rounded" placeholder="Explain why you need this resource"></textarea>
      </div>

      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
        Submit Request
      </button>
    </form>

    <!-- Resource Requests Table (Hidden when requesting) -->
    <div v-if="!showRequestForm" class="overflow-x-auto">
      <p v-if="loading" class="text-blue-500 text-center">Loading requests...</p>
      <p v-if="!loading && resourceRequests.length === 0" class="text-gray-500 text-center">No resource requests found.</p>

      <table v-if="resourceRequests.length > 0" class="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-3 border">Resource Name</th>
            <th class="p-3 border">Quantity</th>
            <th class="p-3 border">Reason</th>
            <th class="p-3 border">Status</th>
            <th class="p-3 border">Date Requested</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in resourceRequests" :key="request.Resource_ID" class="text-center">
            <td class="p-3 border">{{ request.Resource_Name }}</td>
            <td class="p-3 border">{{ request.Quantity }}</td>
            <td class="p-3 border">{{ request.Reason }}</td>
            <td class="p-3 border font-bold" :class="{
              'text-yellow-500': request.Status === 'Pending',
              'text-green-500': request.Status === 'Approved',
              'text-red-500': request.Status === 'Rejected'
            }">
              {{ request.Status }}
            </td>
            <td class="p-3 border">{{ new Date(request.Date_Requested).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
/* Custom styles (optional) */
</style>
