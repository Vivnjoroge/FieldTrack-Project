<script setup>
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const name = ref("");
const department = ref("");
const email = ref("");
const password = ref("");
const message = ref("");
const error = ref("");
const loading = ref(false);
const showPassword = ref(false);
const isRegister = ref(false);
const showSaveCredentialsPrompt = ref(false);

// Determine Role based on Department
const getRole = (dept) => {
    if (!dept) {
        console.log("Department is empty or null.");
        return "Employee";
    }
    const lowerDept = dept.trim().toLowerCase();
    console.log("Original Department:", dept);
    console.log("Lowercase Department:", lowerDept);
    if (lowerDept === "finance") return "Finance";
    if (lowerDept === "management") return "Manager";
    if (lowerDept === "admin") return "Admin";
    console.log("Department does not match any known roles.");
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
            const trimmedDept = department.value.trim();
            const assignedRole = getRole(trimmedDept);

            console.log("Original Department:", department.value);
            console.log("Lowercase Department:", trimmedDept);
            console.log("Assigned Role:", assignedRole);

            response = await authStore.register({
                name: name.value,
                department: trimmedDept,
                email: email.value,
                password: password.value,
            });

            console.log("Full Response from Backend:", response);
            console.log("Response Role from Backend:", response.role);

            if (response.success) {
                // ✅ Fix: Store role in localStorage
                if (response.role) {
                    localStorage.setItem("role", response.role);
                }
                showSaveCredentialsPrompt.value = true;
            }
        } else {
            response = await authStore.login({
                email: email.value,
                password: password.value,
            });

            if (response.success) {
                console.log("Login Response Role:", response.role);
                localStorage.setItem("role", response.role);
                localStorage.setItem("department", response.department);
            }
        }

        if (response.success) {
            message.value = response.message;
            redirectUser(response.role || "Employee"); // Default to Employee if undefined
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


// Role-Based Redirection
const redirectUser = (role) => {
    router.push("/dashboard"); // Always redirect to /dashboard
};
// Autofill Credentials on Login Page
onMounted(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (!isRegister.value && savedEmail && savedPassword) {
        email.value = savedEmail;
        password.value = savedPassword;
    }
});

// Watch for `isRegister` to clear email/password
watch(isRegister, (newValue) => {
    if (newValue) {
        email.value = "";
        password.value = "";
    } else {
        const savedEmail = localStorage.getItem("email");
        const savedPassword = localStorage.getItem("password");

        if (savedEmail && savedPassword) {
            email.value = savedEmail;
            password.value = savedPassword;
        } else {
            email.value = "";
            password.value = "";
        }
    }
});

// Save Credentials
const handleSaveCredentials = (choice) => {
    if (choice === "yes") {
        localStorage.setItem("email", email.value);
        localStorage.setItem("password", password.value);
    }
    showSaveCredentialsPrompt.value = false;
};

// Logout and Clear Saved Credentials
const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("department");

    email.value = "";
    password.value = "";
};
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
        <div class="max-w-md w-full bg-white p-8 shadow-lg rounded-md relative">
          <!-- Save Credentials Prompt -->
          <div v-if="showSaveCredentialsPrompt" class="absolute top-0 left-0 right-0 bg-yellow-200 p-3 text-center text-yellow-700 rounded-md shadow-md z-10">
            <p class="text-sm">Would you like to save your login credentials for easier login next time?</p>
            <div class="flex justify-center gap-4 mt-2">
              <button @click="handleSaveCredentials('yes')" class="btn-primary bg-green-500 hover:bg-green-600 text-white">
                Yes, Save Credentials
              </button>
              <button @click="handleSaveCredentials('no')" class="btn-primary bg-red-500 hover:bg-red-600 text-white">
                No, Thanks
              </button>
            </div>
          </div>

          <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Welcome to Field Management System
          </h2>

          <p class="text-center text-sm text-gray-600 mb-4">
            Please login or register to continue.
          </p>

          <p v-if="message" class="text-green-600 text-center">{{ message }}</p>
          <p v-if="error" class="text-red-500 text-center">{{ error }}</p>

          <div class="space-y-4">
            <div v-if="isRegister" class="space-y-4">
              <input v-model="name" type="text" placeholder="Full Name" class="input-field" required />
              <input v-model="department" type="text" placeholder="Department" class="input-field" required />
            </div>

            <input v-model="email" type="email" placeholder="Enter your work email" class="input-field" required />
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter password" class="input-field" required />

            <button @click="handleAuth" :disabled="loading" class="btn-primary">
              {{ isRegister ? "Register" : "Login" }}
            </button>

            <!-- Toggle between Login and Register -->
            <p class="text-center text-sm text-gray-600 mt-2">
              {{ isRegister ? "Already have an account?" : "Don't have an account?" }}
              <button @click="isRegister = !isRegister" class="text-blue-500 underline">
                {{ isRegister ? "Login" : "Register" }}
              </button>
            </p>
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
  /* background-image: url('@/img/expense.jpg'); */ /* Ensure this is the correct path */
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