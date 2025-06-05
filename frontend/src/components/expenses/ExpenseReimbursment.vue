<script setup>
const apiUrl = import.meta.env.VITE_API_URL;
import Breadcrumb from '../layouts/Breadcrumb.vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { format } from 'date-fns'; // Import date-fns for date manipulation

const breadcrumbSegments = ref([
  { label: 'Dashboard', path: '/dashboard' },
  //{ label: 'Expense Reimbursment' },
]);

const form = ref({
  expenseType: '',
  amount: null,
  description: '',
  receipt: null,
  field_work_details: {
    location: '',
    start_date: null,
    end_date: null,
  },
});

const submissionStatus = ref('');
const submissionError = ref('');
const recentClaims = ref([]);
const loadingClaims = ref(false);
const errorClaims = ref(null);
const selectedClaim = ref(null);
const userRole = ref('');
const validationErrors = ref({});

const handleFileUpload = (event) => {
  form.value.receipt = event.target.files[0];
};

const validateForm = () => {
  validationErrors.value = {};
  let isValid = true;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date

  if (form.value.description && !/^[a-zA-Z\s]+$/.test(form.value.description)) {
    validationErrors.value.description = 'Description must contain only letters and spaces.';
    isValid = false;
  }

  if (form.value.field_work_details.location && !/^[a-zA-Z\s]+$/.test(form.value.field_work_details.location)) {
    validationErrors.value.location = 'Location must contain only letters and spaces.';
    isValid = false;
  }

  if (form.value.field_work_details.start_date) {
    const startDate = new Date(form.value.field_work_details.start_date);
    if (startDate < today) {
      validationErrors.value.startDate = 'Start date cannot be in the past.';
      isValid = false;
    }
  } else {
    validationErrors.value.startDate = 'Start date is required.';
    isValid = false;
  }

  if (form.value.field_work_details.end_date) {
    const endDate = new Date(form.value.field_work_details.end_date);
    if (endDate < today) {
      validationErrors.value.endDate = 'End date cannot be in the past.';
      isValid = false;
    }
    if (form.value.field_work_details.start_date && endDate < new Date(form.value.field_work_details.start_date)) {
      validationErrors.value.endDate = 'End date cannot be before the start date.';
      isValid = false;
    }
  } else {
    validationErrors.value.endDate = 'End date is required.';
    isValid = false;
  }

  return isValid;
};

const submitClaim = async () => {
  if (!validateForm()) {
    return;
  }

  submissionStatus.value = '';
  submissionError.value = '';
  const formData = new FormData();
  formData.append('expense_type', form.value.expenseType);
  formData.append('amount', form.value.amount);
  formData.append('description', form.value.description);
  if (form.value.receipt) {
    formData.append('receipt', form.value.receipt);
  }
  formData.append('field_work_details', JSON.stringify(form.value.field_work_details));

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${apiUrl}/api/expenses/field-work-reimbursement`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    submissionStatus.value = 'Field work reimbursement claim submitted successfully!';
    form.value = {
      expenseType: '',
      amount: null,
      description: '',
      receipt: null,
      field_work_details: { location: '', start_date: null, end_date: null },
    };
    validationErrors.value = {}; // Clear validation errors on successful submission
    fetchRecentClaims();
  } catch (error) {
    submissionError.value = 'Failed to submit field work reimbursement claim.';
    console.error('Error submitting field work reimbursement claim:', error);
  }
};

const fetchRecentClaims = async () => {
  loadingClaims.value = true;
  errorClaims.value = null;
  try {
    const token = localStorage.getItem('token');
    let apiUrl = '/api/expenses';
    const params = { expense_category: 'Field Work' };

    if (userRole.value === 'Finance') {
      apiUrl = '/api/expenses/field-work-reimbursement/pending';
    } else {
      params.expense_category = 'Field Work';
    }

    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
      params: userRole.value === 'Finance' ? {} : params
    });
    recentClaims.value = response.data
      .sort((a, b) => new Date(b.Date_Submitted) - new Date(a.Date_Submitted));

    // Fetch receipt URLs if available
    recentClaims.value = await Promise.all(recentClaims.value.map(async (claim) => {
      if (claim.Receipt) {
        try {
          const receiptResponse = await axios.get(`${apiUrl}/api/expenses/${claim.Expense_ID}/receipt`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          });
          claim.Receipt = URL.createObjectURL(receiptResponse.data);
        } catch (error) {
          console.error('Error fetching receipt for claim ID:', claim.Expense_ID, error);
          claim.Receipt = null; // Handle error by setting Receipt to null
        }
      }
      return claim;
    }));

  } catch (err) {
    errorClaims.value = 'Failed to fetch field work reimbursement claims.';
    console.error('Error fetching field work reimbursement claims:', err);
  } finally {
    loadingClaims.value = false;
  }
};

const showClaimDetails = (claim) => {
  selectedClaim.value = { ...claim, Field_Work_Details: JSON.parse(claim.Field_Work_Details) };
  if (selectedClaim.value.Receipt && typeof selectedClaim.value.Receipt !== 'string') {
    // If receipt is already a Blob URL, no need to fetch again
    return;
  }
  if (selectedClaim.value.Receipt) {
    const token = localStorage.getItem('token');
    axios.get(`${apiUrl}/api/expenses/${selectedClaim.value.Expense_ID}/receipt`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    })
    .then(response => {
      selectedClaim.value.Receipt = URL.createObjectURL(response.data);
    })
    .catch(error => {
      console.error('Error fetching receipt for claim ID:', selectedClaim.value.Expense_ID, error);
      selectedClaim.value.Receipt = null;
    });
  }
};

const approveClaim = async (expenseId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${apiUrl}/api/expenses/approve/${expenseId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchRecentClaims();
    console.log(`Claim ID ${expenseId} approved successfully.`);
  } catch (error) {
    console.error(`Error approving claim ID ${expenseId}:`, error);
  }
};

const rejectClaim = async (expenseId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${apiUrl}/api/expenses/reject/${expenseId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchRecentClaims();
    console.log(`Claim ID ${expenseId} rejected successfully.`);
  } catch (error) {
    console.error(`Error rejecting claim ID ${expenseId}:`, error);
  }
};

onMounted(() => {
  const storedRole = localStorage.getItem('role');
  if (storedRole) {
    userRole.value = storedRole;
  }
  fetchRecentClaims();
});
</script>

<template>
  <div class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-5xl mx-auto space-y-8">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <Breadcrumb :segments="breadcrumbSegments" class="mb-4 px-6 pt-4" />
        <div class="px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white flex items-center gap-3">
          <span class="material-icons text-2xl">briefcase</span>
          <h2 class="text-xl font-semibold">Field Work Reimbursement</h2>
        </div>

        <div v-if="userRole !== 'Finance'" class="px-6 py-8 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Submit a New Claim</h3>
          <form @submit.prevent="submitClaim" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="expenseType" class="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                <select v-model="form.expenseType" id="expenseType"
                        class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm shadow-sm">
                  <option value="" disabled>Select Type</option>
                  <option value="Travel">Travel</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Meals">Meals</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs">KES</div>
                  <input v-model="form.amount" type="number" id="amount"
                         class="w-full pl-10 pr-3 border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-sm shadow-sm"
                         placeholder="0.00" />
                </div>
              </div>

              <div class="sm:col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea v-model="form.description" id="description" rows="3"
                          class="w-full border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-sm shadow-sm"
                          placeholder="Details of the expenses."></textarea>
                <p v-if="validationErrors.description" class="text-red-500 text-xs mt-1">{{ validationErrors.description }}</p>
              </div>

              <div>
                <label for="receipt" class="block text-sm font-medium text-gray-700 mb-1">Receipt (Optional)</label>
                <input type="file" id="receipt" @change="handleFileUpload"
                       class="block w-full text-sm text-gray-600 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 shadow-sm">
              </div>

              <div>
                <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input v-model="form.field_work_details.location" type="text" id="location"
                       class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm shadow-sm"
                       placeholder="e.g., Project Site" />
                <p v-if="validationErrors.location" class="text-red-500 text-xs mt-1">{{ validationErrors.location }}</p>
              </div>

              <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input v-model="form.field_work_details.start_date" type="date" id="startDate"
                       class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm shadow-sm" />
                <p v-if="validationErrors.startDate" class="text-red-500 text-xs mt-1">{{ validationErrors.startDate }}</p>
              </div>

              <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input v-model="form.field_work_details.end_date" type="date" id="endDate"
                       class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm shadow-sm" />
                <p v-if="validationErrors.endDate" class="text-red-500 text-xs mt-1">{{ validationErrors.endDate }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4 mt-4">
              <button type="submit"
                      class="inline-flex items-center px-5 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <span class="material-icons text-base mr-2">send</span> Submit
              </button>
              <div v-if="submissionStatus" class="text-green-600 text-sm font-medium">{{ submissionStatus }}</div>
              <div v-if="submissionError" class="text-red-600 text-sm font-medium">{{ submissionError }}</div>
            </div>
          </form>
        </div>

        <div class="px-6 py-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ userRole === 'Finance' ? 'Pending Claims' : 'Recent Claims' }}
          </h3>
          <div v-if="loadingClaims" class="text-gray-500 italic">Loading...</div>
          <div v-else-if="errorClaims" class="text-red-500">{{ errorClaims }}</div>

          <ul v-else-if="recentClaims.length > 0" class="space-y-3">
            <li v-for="claim in recentClaims" :key="claim.Expense_ID"
                class="bg-white border rounded-md p-4 shadow-sm">
              <div class="flex justify-between items-center mb-2">
                <p class="text-sm font-medium text-indigo-700">Claim #{{ claim.Expense_ID }}</p>
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': claim.Approval_Status === 'Pending',
                    'bg-green-100 text-green-800': claim.Approval_Status === 'Approved',
                    'bg-red-100 text-red-800': claim.Approval_Status === 'Rejected'
                  }"
                >
                  {{ claim.Approval_Status }}
                </span>
              </div>
              <div class="text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>Submitted: {{ new Date(claim.Date_Submitted).toLocaleDateString() }}</p>
                <p>Amount: KES {{ claim.Amount }}</p>
                <p>Type: {{ claim.Expense_Type }}</p>
                <p>Location: {{ JSON.parse(claim.Field_Work_Details)?.location || 'N/A' }}</p>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <button @click="showClaimDetails(claim)"
                        class="text-indigo-600 text-sm hover:underline focus:outline -none">Details</button>
                        <div v-if="userRole === 'Finance' && claim.Approval_Status === 'Pending'" class="flex gap-2">
                          <button @click="approveClaim(claim.Expense_ID)"
                                  class="px-3 py-1 border border-green-500 text-green-600 hover:bg-green-100 text-xs rounded font-semibold focus:outline-none">Approve</button>
                          <button @click="rejectClaim(claim.Expense_ID)"
                                  class="px-3 py-1 border border-red-500 text-red-600 hover:bg-red-100 text-xs rounded font-semibold focus:outline-none">Reject</button>
                        </div>
                      </div>
                    </li>
                  </ul>

                  <div v-else class="text-gray-500 italic">
                    {{ userRole === 'Finance' ? 'No pending claims.' : 'No recent claims submitted.' }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedClaim"
                 class="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
              <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Claim Details</h3>
                <div class="space-y-2 text-sm text-gray-700">
                  <p><strong>Claim ID:</strong> {{ selectedClaim.Expense_ID }}</p>
                  <p><strong>Expense Type:</strong> {{ selectedClaim.Expense_Type }}
                  </p>
                  <p><strong>Amount:</strong> KES {{ selectedClaim.Amount }}</p>
                  <p><strong>Submitted On:</strong> {{ new Date(selectedClaim.Date_Submitted).toLocaleDateString() }}</p>
                  <p><strong>Status:</strong>
                    <span :class="{
                      'bg-yellow-100 text-yellow-800': selectedClaim.Approval_Status === 'Pending',
                      'bg-green-100 text-green-800': selectedClaim.Approval_Status === 'Approved',
                      'bg-red-100 text-red-800': selectedClaim.Approval_Status === 'Rejected'
                    }"
                          class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ selectedClaim.Approval_Status }}
                    </span>
                  </p>
                  <p><strong>Description:</strong> {{ selectedClaim.Description }}</p>
                  <p><strong>Location:</strong> {{ selectedClaim.Field_Work_Details?.location || 'N/A' }}</p>
                  <p><strong>Start Date:</strong> {{ selectedClaim.Field_Work_Details?.start_date ? new Date(selectedClaim.Field_Work_Details.start_date).toLocaleDateString() : 'N/A' }}</p>
                  <p><strong>End Date:</strong> {{ selectedClaim.Field_Work_Details?.end_date ? new Date(selectedClaim.Field_Work_Details.end_date).toLocaleDateString() : 'N/A' }}</p>

                  <div v-if="selectedClaim.Receipt" class="pt-2">
                    <strong>Receipt:</strong>
                    <a :href="selectedClaim.Receipt" target="_blank" class="text-indigo-600 hover:underline block mt-1">View Attachment</a>
                  </div>
                  <p v-else class="italic text-gray-500">No receipt attached.</p>
                </div>

                <div class="mt-6 text-right">
                  <button @click="selectedClaim = null"
                          class="inline-flex justify-center px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-indigo-500">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>