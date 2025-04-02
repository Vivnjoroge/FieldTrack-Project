<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

// Initialize store and router
const authStore = useAuthStore();
const router = useRouter();

// Form State
const name = ref(""); 
const department = ref(""); 
const email = ref(""); 
const password = ref(""); 
const message = ref(""); 
const error = ref(""); 
const loading = ref(false); 
const showPassword = ref(false); 
const isRegister = ref(false); 

// Function to determine role based on department
const getRole = (dept) => {
  if (!dept) return "Employee"; 
  const lowerDept = dept.trim().toLowerCase();
  if (lowerDept === "finance") return "Finance";
  if (lowerDept === "management") return "Manager";
  if (lowerDept === "admin") return "Admin";
  return "Employee"; 
};

// Handle Login or Register
const handleAuth = async () => {
  message.value = "";
  error.value = "";
  loading.value = true;

  try {
    let response;
    if (isRegister.value) {
      console.log("Department value before getRole:", department.value);
      
      const assignedRole = getRole(department.value.trim());
      console.log("Assigned Role:", assignedRole); 

      response = await authStore.register({
        name: name.value,
        department: department.value,
        email: email.value,
        password: password.value,
        role: assignedRole,
      });
    } else {
      response = await authStore.login({
        email: email.value,
        password: password.value,
      });
    }

    if (response.success) {
      message.value = response.message;
      localStorage.setItem("role", response.role);
      localStorage.setItem("token", response.token);

      console.log("Stored Role:", localStorage.getItem("role"));

      // Redirect user based on role
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

// ✅ Corrected Role-Based Redirection
const redirectUser = (role) => {
  console.log("Redirecting user based on role:", role);
  
  switch (role) {
    case "Finance":
      router.push("/dashboard");
      break;
    case "Manager":
      router.push("/dashboard");
      break;
    case "Admin":
      router.push("/dashboard");
      break;
    default:
      router.push("/dashboard"); // Default for Employees
  }
};

// ✅ Auto-Redirect if Already Logged In
onMounted(() => {
  const savedRole = localStorage.getItem("role");
  if (savedRole) {
    console.log("Auto-redirecting based on stored role:", savedRole);
    redirectUser(savedRole);
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="flex w-full h-screen">
      <!-- Left Section - Branding -->
      <div class="w-full lg:w-2/5 bg-cover bg-center relative left-section">
        <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white px-8 text-center">
          <h2 class="text-2xl font-semibold">Field Management System</h2>
          <p class="mt-3 text-sm leading-relaxed">
            Streamline your field operations, manage teams efficiently, and track progress in real-time.
          </p>
        </div>
      </div>

      <!-- Right Section - Form -->
      <div class="w-full lg:w-3/5 flex items-center justify-center p-8">
        <div class="max-w-md w-full bg-white p-8 shadow-lg rounded-md">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Welcome to Field Management System
          </h2>

          <p class="text-center text-sm text-gray-600 mb-4">
            Please login or register to continue.
          </p>

          <!-- Success & Error Messages -->
          <p v-if="message" class="text-green-600 text-center">{{ message }}</p>
          <p v-if="error" class="text-red-500 text-center">{{ error }}</p>

          <!-- Form Inputs -->
          <div class="space-y-4">
            <!-- Register Fields (Only Visible in Register Mode) -->
            <div v-if="isRegister" class="space-y-4">
              <input v-model="name" type="text" placeholder="Full Name"
                class="input-field" required />

              <input v-model="department" type="text" placeholder="Department"
                class="input-field" required />
            </div>

            <!-- Common Fields for Login & Register -->
            <input v-model="email" type="email" placeholder="Enter your work email"
              class="input-field" required />

            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter password"
                class="input-field" required />
              <button @click="showPassword = !showPassword" type="button"
                class="absolute right-3 top-3 text-gray-500 focus:outline-none">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>

            <!-- Submit Button -->
            <button @click="handleAuth" :disabled="loading"
              class="btn-primary">
              {{ isRegister ? "Register" : "Login" }}
            </button>

            <div class="flex justify-between items-center text-sm mt-4">
              <a href="#" class="text-blue-600 hover:underline">Forgot password?</a>
              <p>
                {{ isRegister ? "Already have an account?" : "New to the system?" }}
                <button @click="isRegister = !isRegister"
                  class="text-blue-600 font-medium hover:underline">
                  {{ isRegister ? "Login" : "Register" }}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* General Layout */
.bg-gray-100 {
  background-color: #f9fafb;
}

.left-section {
  background-image: url('@/img/expense.jpg'); /* Ensure this is the correct path */
  background-size: cover;
  background-position: center;
  height: 100vh;
  position: relative;
}

/* Form Inputs */
.input-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease-in-out;
}

.input-field:focus {
  border-color: #2563eb;
  box-shadow: 0 0 5px rgba(37, 99, 235, 0.3);
  outline: none;
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: #2563eb;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  transition: background 0.3s ease-in-out;
}

.btn-primary:hover {
  background-color: #1e40af;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}
</style>
