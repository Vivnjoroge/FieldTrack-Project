<script setup>
const apiUrl = import.meta.env.VITE_API_URL;
import { ref, onMounted } from "vue";
import axios from "axios"; // ✅ Make sure axios is imported
import ExpenseSummary from "../expenses/ExpenseSummary.vue";
import RequestResource from "../resources/RequestResource.vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const userProfile = ref(null); // ✅ Declare userProfile as a reactive ref

// ✅ Fetch user profile
const fetchUserProfile = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/api/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        userProfile.value = response.data;
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
};

onMounted(() => {
    const role = localStorage.getItem("role");
    if (role !== "Manager") {
        router.push("/unauthorized");
    } else {
        fetchUserProfile(); // ✅ Call this only if role is Manager
    }
});
</script>

<template>
    <div class="bg-gray-100 min-h-screen p-6 sm:p-8 md:p-12">
        <header class="mb-8">
            <h1 class="text-3xl font-semibold text-gray-800 flex items-center gap-3">
                📊 <span class="text-blue-600">Manager Dashboard</span>
            </h1>
            <h1 v-if="userProfile" class="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                Welcome, {{ userProfile.Name }}
                <span v-if="userProfile.Department" class="text-sm text-gray-600">
                    ({{ userProfile.Department }})
                </span>
            </h1>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Quick Actions -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6">
                    <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        ⚡ Quick Actions
                    </h2>
                    <div class="flex flex-col gap-3">
                        <button
                            @click="$router.push('/expense-summary')"
                            class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-md transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <span class="text-sm sm:text-base">Expenses Summary</span>
                        </button>
                        <button
                            @click="$router.push('/reports')"
                            class="bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-md transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                            <span class="text-sm sm:text-base">Manage Resources</span>
                        </button>
                        <button
                            @click="$router.push('/employees')"
                            class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 rounded-md transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                            <span class="text-sm sm:text-base">View Employees</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Monthly Expense Summary -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6">
                    <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-2m3-9l-3 3m-3-3l3 3m-3-3l-3 3" />
                        </svg>
                        Monthly Expense Summary
                    </h2>
                    <div class="overflow-auto">
                        <ExpenseSummary />
                    </div>
                </div>
            </div>

            <!-- Pending Resource Requests -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6">
                    <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending Resource Requests
                    </h2>
                    <div class="overflow-auto">
                        <RequestResource />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
