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

// Fetch Resource Requests with Employee Info
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

// Submit Request with Employee ID
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
    <div class="max-w-4xl mx-auto bg-white shadow-xl p-8 rounded-xl mt-10">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-bold text-gray-800">
                {{ showRequestForm ? "Request a Resource" : "Your Resource Requests" }}
            </h2>
            <button @click="showRequestForm = !showRequestForm"
                class="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 shadow transition duration-300">
                {{ showRequestForm ? "View Requests" : "Request Resource" }}
            </button>
        </div>

        <p v-if="message" :class="messageClass"
            class="mb-4 text-center text-lg font-medium px-4 py-2 rounded-md border shadow-sm">
            {{ message }}
        </p>

        <form v-if="showRequestForm" @submit.prevent="submitRequest" class="space-y-5">
            <div>
                <label class="block text-gray-700 font-semibold mb-1">Resource Name</label>
                <input type="text" v-model="resourceName" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="Enter resource name" />
            </div>

            <div>
                <label class="block text-gray-700 font-semibold mb-1">Quantity</label>
                <input type="number" v-model="quantity" min="1" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="Enter quantity" />
            </div>

            <div>
                <label class="block text-gray-700 font-semibold mb-1">Reason</label>
                <textarea v-model="reason" required rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="Explain why you need this resource"></textarea>
            </div>

            <button type="submit" :disabled="loading"
                class="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold transition duration-300 shadow">
                <span v-if="loading">Submitting...</span>
                <span v-else>Submit Request</span>
            </button>
        </form>

        <div v-if="!showRequestForm" class="mt-6 overflow-x-auto">
            <p v-if="loading" class="text-blue-500 text-center">Loading requests...</p>
            <p v-if="!loading && resourceRequests.length === 0" class="text-gray-500 text-center">No resource requests found.</p>

            <table v-if="resourceRequests.length > 0"
                class="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
                <thead class="bg-gray-100 text-gray-800">
                    <tr>
                        <th class="p-3 border text-left">Employee ID</th>
                        <th class="p-3 border text-left">Employee Name</th>
                        <th class="p-3 border text-left">Resource Name</th>
                        <th class="p-3 border text-left">Quantity</th>
                        <th class="p-3 border text-left">Reason</th>
                        <th class="p-3 border text-center">Status</th>
                        <th class="p-3 border text-center">Date</th>
                        <th class="p-3 border text-center">{{ isManager ? "Actions" : "Manage" }}</th>
                    </tr>
                </thead>
                <tbody class="text-gray-700">
                    <tr v-for="(request, index) in resourceRequests" :key="request.Resource_ID"
                        :class="{ 'bg-gray-50': index % 2 === 0 }" class="hover:bg-blue-50 transition">
                        <td class="p-3 border">{{ request.Employee_ID }}</td>
                        <td class="p-3 border">{{ request.Employee_Name }}</td>
                        <td class="p-3 border">{{ request.Resource_Name }}</td>
                        <td class="p-3 border">{{ request.Quantity }}</td>
                        <td class="p-3 border">{{ request.Reason }}</td>
                        <td class="p-3 border text-center font-bold" :class="{
                            'text-yellow-500': request.Status === 'Pending',
                            'text-green-500': request.Status === 'Approved',
                            'text-red-500': request.Status === 'Rejected'
                        }">
                            {{ request.Status }}
                        </td>
                        <td class="p-3 border text-center">{{ new Date(request.Date_Requested).toLocaleDateString() }}</td>
                        <td class="p-3 border text-center">
                            <div v-if="isManager">
                                <button v-if="request.Status === 'Pending'" @click="approveRequest(request.Resource_ID)"
                                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2 text-sm shadow">
                                    Approve
                                </button>
                                <button v-if="request.Status === 'Pending'" @click="rejectRequest(request.Resource_ID)"
                                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm shadow">
                                    Reject
                                </button>
                            </div>

                            <div v-else class="flex justify-center space-x-3">
                                <button @click="showEditModal(request.Resource_ID)" title="Edit"
                                    class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shadow transition duration-200">
                                    Edit
                                </button>
                                <button @click="deleteRequest(request.Resource_ID)" title="Delete"
                                    class="bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow transition duration-200">
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <transition name="fade">
            <div v-if="showModal"
                class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
                <div class="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl animate-fadeIn">
                    <h3 class="text-xl font-semibold mb-4 text-gray-800">Edit Resource Request</h3>

                    <div class="mb-4">
                        <label class="block text-gray-700 mb-1 font-medium">Resource Name</label>
                        <input v-model="editResourceName" type="text"
                            class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-1 font-medium">Quantity</label>
                        <input v-model="editQuantity" type="number" min="1"
                            class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-1 font-medium">Reason</label>
                        <textarea v-model="editReason" rows="3"
                            class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                    </div>

                    <div class="flex justify-end space-x-3 mt-6">
                        <button @click="showModal = false"
                            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition">Cancel</button>
                        <button @click="updateRequest"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition">Save</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

