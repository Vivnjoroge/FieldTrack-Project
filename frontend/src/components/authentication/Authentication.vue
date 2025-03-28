<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

// Initialize store and router
const authStore = useAuthStore();
const router = useRouter();

// Form State
const isLogin = ref(true); // Toggle between login & register
const name = ref(""); // Used only for Register
const department = ref(""); // Used for assigning role
const email = ref(""); // Email input
const password = ref(""); // Password input
const message = ref(""); // Success message
const error = ref(""); // Error message
const loading = ref(false); // Loading state

// Function to determine role based on department
const getRole = (dept) => {
  if (!dept) return "Employee"; // Default role if no department is given
  const lowerDept = dept.toLowerCase();
  if (lowerDept === "finance") return "Finance";
  if (lowerDept === "management") return "Manager";
  if (lowerDept === "admin") return "Admin";
  return "Employee"; // Default role
};

// Handle Login or Register
const handleAuth = async () => {
  message.value = "";
  error.value = "";
  loading.value = true;

  try {
    let response;
    if (isLogin.value) {
      // User Login
      response = await authStore.login({
        email: email.value,
        password: password.value,
      });
    } else {
      // User Register (Role Assigned Automatically)
      const assignedRole = getRole(department.value);

      response = await authStore.register({
        name: name.value,
        department: department.value,
        email: email.value,
        password: password.value,
        role: assignedRole, // Assign role dynamically
      });
    }

    // If authentication is successful
    if (response.success) {
      message.value = response.message;

      // Store token & role in localStorage
      localStorage.setItem("role", response.role);
      localStorage.setItem("token", response.token);

      console.log("Stored Role:", localStorage.getItem("role")); // Debugging

      // Redirect Based on Role
      redirectUser(response.role);
    } else {
      error.value = response.message;
    }
  } catch (err) {
    error.value = "An unexpected error occurred.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Redirect Based on Role
const redirectUser = (role) => {
  switch (role) {
    case "Admin":
      router.push("/admin");
      break;
    case "Finance":
      router.push("/finance");
      break;
    case "Manager":
      router.push("/manager");
      break;
    default:
      router.push("/dashboard"); // Default for Employee
  }
};

// Auto-Redirect if Already Logged In
onMounted(() => {
  const savedRole = localStorage.getItem("role");
  if (savedRole) {
    redirectUser(savedRole);
  }
});
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
