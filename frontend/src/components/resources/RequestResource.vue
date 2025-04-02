<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// UI State
const showRequestForm = ref(false);
const isManager = ref(false);

// Form Fields
const resourceName = ref("");
const quantity = ref(1);
const reason = ref("");
const message = ref("");
const messageClass = ref("");

// Resource Requests
const resourceRequests = ref([]);
const loading = ref(false);

// Modal State
const showModal = ref(false);
const editResourceId = ref(null);
const editResourceName = ref("");
const editQuantity = ref(1);
const editReason = ref("");

// Fetch User Role
const fetchUserRole = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.get("http://localhost:5000/api/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    isManager.value = response.data.Role === "Manager";
    showRequestForm.value = !isManager.value;
  } catch (error) {
    console.error("❌ Error Fetching User Role:", error.response?.data);
  }
};

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
    resourceName.value = "";
    quantity.value = 1;
    reason.value = "";
    fetchResources();
  } catch (error) {
    console.error("❌ Error Submitting Request:", error.response?.data);
    message.value = "Failed to submit request.";
    messageClass.value = "text-red-600 bg-red-100 p-2";
  }
};

// Approve Request
const approveRequest = async (requestId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`http://localhost:5000/api/resources/approve/${requestId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchResources();
  } catch (error) {
    console.error("❌ Error Approving Request:", error.response?.data);
    message.value = "Failed to approve request.";
    messageClass.value = "text-red-600 bg-red-100 p-2";
  }
};

// Reject Request
const rejectRequest = async (requestId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`http://localhost:5000/api/resources/reject/${requestId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchResources();
  } catch (error) {
    console.error("❌ Error Rejecting Request:", error.response?.data);
    message.value = "Failed to reject request.";
    messageClass.value = "text-red-600 bg-red-100 p-2";
  }
};

// Edit Request
const showEditModal = (resourceId) => {
  const request = resourceRequests.value.find((r) => r.Resource_ID === resourceId);
  editResourceId.value = resourceId;
  editResourceName.value = request.Resource_Name;
  editQuantity.value = request.Quantity;
  editReason.value = request.Reason;
  showModal.value = true;
};

const updateRequest = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`http://localhost:5000/api/resources/${editResourceId.value}`, {
      resource_name: editResourceName.value,
      quantity: editQuantity.value,
      reason: editReason.value,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    message.value = "Request updated successfully.";
    messageClass.value = "text-green-600 bg-green-100 p-2";
    fetchResources();
    showModal.value = false;
  } catch (error) {
    console.error("❌ Error Updating Request:", error.response?.data);
    message.value = "Failed to update request.";
    messageClass.value = "text-red-600 bg-red-100 p-2";
  }
};

// Delete Request
const deleteRequest = async (resourceId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/resources/${resourceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    message.value = "Request deleted successfully.";
    messageClass.value = "text-green-600 bg-green-100 p-2";
    fetchResources();
  } catch (error) {
    console.error("❌ Error Deleting Request:", error.response?.data);
    message.value = "Failed to delete request.";
    messageClass.value = "text-red-600 bg-red-100 p-2";
  }
};

onMounted(() => {
  fetchUserRole();
  fetchResources();
});
</script>


<template>
  <div class="max-w-3xl mx-auto bg-white shadow-md p-6 rounded-lg">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">
        {{ showRequestForm ? "Request a Resource" : "Your Resource Requests" }}
      </h2>
      <button @click="showRequestForm = !showRequestForm"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        {{ showRequestForm ? "View Requests" : "Request Resource" }}
      </button>
    </div>

    <p v-if="message" :class="messageClass" class="mb-4 text-center">{{ message }}</p>

    <form v-if="showRequestForm" @submit.prevent="submitRequest" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium">Resource Name:</label>
        <input type="text" v-model="resourceName" required class="w-full p-2 border rounded"
          placeholder="Enter resource name" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Quantity:</label>
        <input type="number" v-model="quantity" min="1" required class="w-full p-2 border rounded" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Reason:</label>
        <textarea v-model="reason" required class="w-full p-2 border rounded"
          placeholder="Explain why you need this resource"></textarea>
      </div>

      <button type="submit" :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
        <span v-if="loading">Loading...</span>
        <span v-else>Submit Request</span>
      </button>
    </form>

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
            <th v-if="isManager" class="p-3 border">Actions</th>
            <th v-if="!isManager" class="p-3 border">Manage</th>
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
            <td class="p-3 border">{{ new Date(request.Date_Requested).toLocaleDateString() }}</td>
            <td v-if="isManager" class="p-3 border">
              <button v-if="request.Status === 'Pending'" @click="approveRequest(request.Resource_ID)"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2">Approve</button>
              <button v-if="request.Status === 'Pending'" @click="rejectRequest(request.Resource_ID)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Reject</button>
            </td>
            <td v-if="!isManager" class="p-3 border flex justify-center space-x-2">
              <button @click="showEditModal(request.Resource_ID)" title="Edit"
                class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.586 9 16.414 7.586 13.586 10.414 10.757z" />
                </svg>
              </button>
              <button @click="deleteRequest(request.Resource_ID)" title="Delete"
                class="bg-red-500 hover:bg-red-600 text-white p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">Edit Resource Request</h2>
        <div>
          <label class="block text-gray-700 font-medium">Resource Name:</label>
          <input type="text" v-model="editResourceName" required class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-gray-700 font-medium">Quantity:</label>
          <input type="number" v-model="editQuantity" min="1" required class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-gray-700 font-medium">Reason:</label>
          <textarea v-model="editReason" required class="w-full p-2 border rounded"></textarea>
        </div>
        <div class="mt-4 flex justify-end">
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2" @click="showModal = false">Cancel</button>
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" @click="updateRequest">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>