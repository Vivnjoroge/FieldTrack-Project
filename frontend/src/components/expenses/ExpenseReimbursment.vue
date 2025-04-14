<script setup>
import Breadcrumb from '../layouts/Breadcrumb.vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';


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

const handleFileUpload = (event) => {
  form.value.receipt = event.target.files[0];
};

const submitClaim = async () => {
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
    const response = await axios.post('/api/expenses/field-work-reimbursement', formData, {
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
          const receiptResponse = await axios.get(`/api/expenses/${claim.Expense_ID}/receipt`, {
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
    axios.get(`/api/expenses/${selectedClaim.value.Expense_ID}/receipt`, {
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
    await axios.put(`/api/expenses/approve/${expenseId}`, {}, {
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
    await axios.put(`/api/expenses/reject/${expenseId}`, {}, {
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
    <div class="max-w-4xl mx-auto space-y-10">
      <!-- Header Card -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <Breadcrumb :segments="breadcrumbSegments" class="mb-4" />
        <div class="px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white flex items-center gap-3">
          <span class="material-icons text-2xl">briefcase</span>
          <h2 class="text-xl font-semibold">Field Work Reimbursement</h2>
        </div>

        <!-- Form Section -->
        <div class="px-6 py-8">
          <div v-if="userRole !== 'Finance'" class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Submit a New Claim</h3>
            <form @submit.prevent="submitClaim" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label for="expenseType" class="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                  <select v-model="form.expenseType" id="expenseType"
                          class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                    <option value="" disabled>Select Type</option>
                    <option value="Travel">Travel</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Meals">Meals</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">KES</div>
                    <input v-model="form.amount" type="number" id="amount"
                           class="w-full pl-10 pr-3 border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                           placeholder="0.00" />
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea v-model="form.description" id="description" rows="3"
                            class="w-full border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            placeholder="Details of the expenses."></textarea>
                </div>

                <div>
                  <label for="receipt" class="block text-sm font-medium text-gray-700 mb-1">Receipt (Optional)</label>
                  <input type="file" id="receipt" @change="handleFileUpload"
                         class="block w-full text-sm text-gray-600 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500">
                </div>

                <div>
                  <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input v-model="form.field_work_details.location" type="text" id="location"
                         class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                         placeholder="e.g., Project Site" />
                </div>

                <div>
                  <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input v-model="form.field_work_details.start_date" type="date" id="startDate"
                         class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm" />
                </div>

                <div>
                  <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input v-model="form.field_work_details.end_date" type="date" id="endDate"
                         class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm" />
                </div>
              </div>

              <div class="flex items-center gap-4 mt-4">
                <button type="submit"
                        class="inline-flex items-center px-5 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500">
                  <span class="material-icons text-base mr-2">send</span> Submit
                </button>
                <div v-if="submissionStatus" class="text-green-600 text-sm font-medium">{{ submissionStatus }}</div>
                <div v-if="submissionError" class="text-red-600 text-sm font-medium">{{ submissionError }}</div>
              </div>
            </form>
          </div>

          <!-- Claims Section -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              {{ userRole === 'Finance' ? 'Pending Claims' : 'Recent Claims' }}
            </h3>
            <div v-if="loadingClaims" class="text-gray-500 italic">Loading...</div>
            <div v-else-if="errorClaims" class="text-red-500">{{ errorClaims }}</div>

            <ul v-else-if="recentClaims.length > 0" class="space-y-4">
              <li v-for="claim in recentClaims" :key="claim.Expense_ID"
                  class="bg-gray-50 border rounded-lg p-4 shadow-sm">
                <div class="flex justify-between items-center">
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
                <div class="mt-2 text-sm text-gray-600 sm:flex sm:justify-between">
                  <p>Submitted: {{ new Date(claim.Date_Submitted).toLocaleDateString() }}</p>
                  <p>Amount: KES {{ claim.Amount }}</p>
                  <div class="flex mt-2 sm:mt-0 gap-2">
                    <button @click="showClaimDetails(claim)"
                            class="text-indigo-600 text-sm hover:underline">Details</button>
                    <template v-if="userRole === 'Finance' && claim.Approval_Status === 'Pending'">
                      <button @click="approveClaim(claim.Expense_ID)"
                              class="px-2 py-1 border border-green-500 text-green-600 hover:bg-green-100 text-xs rounded font-semibold">Approve</button>
                      <button @click="rejectClaim(claim.Expense_ID)"
                              class="px-2 py-1 border border-red-500 text-red-600 hover:bg-red-100 text-xs rounded font-semibold">Reject</button>
                    </template>
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
    </div>

    <!-- Modal for Claim Details -->
    <div v-if="selectedClaim"
         class="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Claim Details</h3>
        <div class="space-y-2 text-sm text-gray-700">
          <p><strong>Claim ID:</strong> {{ selectedClaim.Expense_ID }}</p>
          <p><strong>Expense Type:</strong> {{ selectedClaim.Expense_Type }}</p>
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
          <p><strong>Location:</strong> {{ selectedClaim.Field_Work_Details?.location }}</p>
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
                  class="inline-flex justify-center px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:ring-indigo-500">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
