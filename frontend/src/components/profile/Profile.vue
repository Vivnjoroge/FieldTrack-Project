<script setup>
const apiUrl = import.meta.env.VITE_API_URL;
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  const profileData = ref({});
  const loading = ref(true);
  const error = ref(null);
  const router = useRouter();
  
  onMounted(async () => {
    await fetchProfileData();
  });
  
  const fetchProfileData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      profileData.value = response.data;
    } catch (err) {
      error.value = 'Failed to fetch profile information.';
      console.error('Error fetching profile data:', err);
    } finally {
      loading.value = false;
    }
  };
  
  const navigateToSettings = () => {
    router.push('/settings'); // Assuming '/settings' is your settings page route
  };
  </script>

<template>
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-6">Your Profile</h1>
  
      <div v-if="loading" class="text-gray-500 italic">Loading profile information...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-else class="bg-white shadow overflow-hidden rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg font-medium text-gray-900">
            Personal Information
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            View your basic profile details.
          </p>
        </div>
        <div class="border-t border-gray-200">
          <dl>
            <div class="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Employee ID
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ profileData.Employee_ID || 'N/A' }}
              </dd>
            </div>
            <div class="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Name
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ profileData.Name || 'N/A' }}
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Email Address
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ profileData.Email || 'N/A' }}
              </dd>
            </div>
            <div class="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Department
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ profileData.Department || 'N/A' }}
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">
                Role
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ profileData.Role || 'N/A' }}
              </dd>
            </div>
            </dl>
        </div>
        <div class="px-4 py-4 bg-gray-50 text-right sm:px-6">
          <button
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            @click="navigateToSettings"
          >
            Edit Settings
          </button>
        </div>
      </div>
    </div>
  </template>
  
  