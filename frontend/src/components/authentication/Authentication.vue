<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

// Initialize store and router
const authStore = useAuthStore();
const router = useRouter();

const isLogin = ref(true); // Toggle between login and register
const name = ref(""); // Only used for Register
const department = ref(""); // Required for Register
const email = ref(""); // Email input
const password = ref(""); // Password input
const message = ref(""); // Success message
const error = ref(""); // Error message
const loading = ref(false); // Loading state

// Function to determine role based on department
const getRole = (dept) => {
    if (dept.toLowerCase() === "finance") return "Finance";
    if (dept.toLowerCase() === "management") return "Manager";
    return "Employee"; // Default role
};

const handleAuth = async () => {
    message.value = "";
    error.value = "";
    loading.value = true; // Show loading state

    try {
        let response;
        if (isLogin.value) {
            // Login
            response = await authStore.login({
                email: email.value,
                password: password.value
            });
        } else {
            // Register (Role Assigned Automatically)
            const assignedRole = getRole(department.value);

            response = await authStore.register({
                name: name.value,
                department: department.value,
                email: email.value,
                password: password.value,
                role: assignedRole // Assign role dynamically
            });
        }

        if (response.success) {
            message.value = response.message;
            localStorage.setItem("role", response.role); // Store role
            localStorage.setItem("token", response.token); // Store token

            // Redirect Based on Role
            if (response.role === "Admin") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        } else {
            error.value = response.message;
        }
    } catch (err) {
        error.value = "An unexpected error occurred.";
        console.error(err);
    } finally {
        loading.value = false; // Hide loading state
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="flex w-full max-w-4xl">
            <!-- Image Side -->
            <div class="hidden lg:block w-1/2 bg-cover bg-center rounded-l-lg" 
                 style="background-image: url('https://images.unsplash.com/photo-1551632436-c318874f08c7?auto=format&fit=crop&w=1200');">
                <div class="h-full bg-black/30 flex items-center justify-center p-8">
                    <div class="text-white text-center">
                        <h1 class="text-4xl font-bold mb-4">Welcome to FieldTrack</h1>
                        <p class="text-lg">Manage your field expenses and resources efficiently</p>
                    </div>
                </div>
            </div>

            <!-- Form Side -->
            <div class="w-full lg:w-1/2 p-8">
                <div class="bg-white rounded-lg shadow-xl p-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
                        {{ isLogin ? "Welcome Back" : "Create Account" }}
                    </h2>

                    <div class="space-y-4">
                        <p v-if="message" class="text-green-500 text-center">{{ message }}</p>
                        <p v-if="error" class="text-red-500 text-center">{{ error }}</p>

                        <div v-if="!isLogin" class="space-y-4">
                            <input v-model="name" type="text" placeholder="Full Name"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" required />

                            <input v-model="department" type="text" placeholder="Department"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" required />
                        </div>

                        <input v-model="email" type="email" placeholder="Email"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" required />

                        <input v-model="password" type="password" placeholder="Password"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" required />

                        <button @click="handleAuth" :disabled="loading"
                            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex justify-center items-center">
                            <span v-if="loading" class="animate-spin mr-2">🔄</span>
                            {{ isLogin ? "Login" : "Register" }}
                        </button>

                        <div class="text-center mt-6">
                            <p class="text-sm text-gray-600">
                                {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
                                <button @click="isLogin = !isLogin" 
                                    class="text-blue-600 font-medium hover:text-blue-700 transition-all duration-200">
                                    {{ isLogin ? "Register" : "Login" }}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
