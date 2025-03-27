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
const email = ref(""); // Email/phone number
const password = ref("");
const message = ref("");
const error = ref("");

const handleAuth = async () => {
    message.value = "";
    error.value = "";

    // Log the input values before submission
    console.log("Email:", email.value);
    console.log("Password:", password.value);

    try {
        let response;
        if (isLogin.value) {
            // Login
            response = await authStore.login({
                email: email.value,
                password: password.value
            });
            if (response.success) {
                message.value = "Login successful!";
                router.push("/dashboard");
            } else {
                error.value = response.message;
            }
        } else {
            // Register
            response = await authStore.register({
                name: name.value,
                department: department.value,
                email: email.value,
                password: password.value
            });
            if (response.success) {
                message.value = response.message;
                isLogin.value = true; // Switch to login after success
            } else {
                error.value = response.message;
            }
        }
    } catch (err) {
        error.value = "An unexpected error occurred.";
        console.error(err);
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
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" />
                            <input v-model="department" type="text" placeholder="Department"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" />
                        </div>

                        <input v-model="email" type="email" placeholder="Email"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" />

                        <input v-model="password" type="password" placeholder="Password"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200" />

                        <button @click="handleAuth" 
                            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200">
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
