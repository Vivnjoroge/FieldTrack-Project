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
const isRegister = ref(true); // Default to register for this stunning layout
const showSaveCredentialsPrompt = ref(false);
const formKey = ref(0);

// Validation
const nameError = ref("");
const emailError = ref("");
const passwordError = ref("");

// Validation Helpers
const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password) =>
    /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password);

const departments = ["Finance", "Management", "IT", "Business", "Survey", "GIS", "Human Resources"];

const getRole = (dept) => {
    if (!dept) return "Employee";
    const lowerDept = dept.trim().toLowerCase();
    if (lowerDept === "finance") return "Finance";
    if (lowerDept === "management") return "Manager";
    if (lowerDept === "admin") return "Admin";
    return "Employee";
};

const validateForm = () => {
    let valid = true;
    nameError.value = "";
    emailError.value = "";
    passwordError.value = "";

    if (isRegister.value && !isValidName(name.value)) {
        nameError.value = "Name must contain only letters and spaces.";
        valid = false;
    }

    if (!isValidEmail(email.value)) {
        emailError.value = "Enter a valid email address.";
        valid = false;
    }

    if (!isStrongPassword(password.value)) {
        passwordError.value =
            "Password must be at least 6 characters and include uppercase, number, and symbol.";
        valid = false;
    }

    return valid;
};

const handleAuth = async () => {
    message.value = "";
    error.value = "";
    loading.value = true;

    if (isRegister.value && !validateForm()) {
        loading.value = false;
        return;
    }

    try {
        let response;
        if (isRegister.value) {
            const assignedRole = getRole(department.value);

            response = await authStore.register({
                name: name.value.trim(),
                department: department.value,
                email: email.value.trim(),
                password: password.value,
            });

            if (response.success && response.role) {
                localStorage.setItem("role", response.role);
                showSaveCredentialsPrompt.value = true;
            }
        } else {
            response = await authStore.login({
                email: email.value.trim(),
                password: password.value,
            });

            if (response.success) {
                localStorage.setItem("role", response.role);
                localStorage.setItem("department", response.department);
            }
        }

        if (response.success) {
            message.value = response.message;
            if (!isRegister.value) {
                email.value = "";
                password.value = "";
            }
            redirectUser(response.role || "Employee");
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

const redirectUser = (role) => {
    router.push("/dashboard");
};

onMounted(() => {
    const shouldLoadSaved = localStorage.getItem("rememberMe") === "true";
    if (!isRegister.value && shouldLoadSaved) {
        email.value = localStorage.getItem("email") || "";
        password.value = localStorage.getItem("password") || "";
    }
});

watch(isRegister, () => {
    name.value = "";
    department.value = "";
    email.value = "";
    password.value = "";
    nameError.value = "";
    emailError.value = "";
    passwordError.value = "";
});

const handleSaveCredentials = (choice) => {
    if (choice === "yes") {
        localStorage.setItem("email", email.value);
        localStorage.setItem("password", password.value);
        localStorage.setItem("rememberMe", "true");
    } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
        localStorage.setItem("rememberMe", "false");
    }
    showSaveCredentialsPrompt.value = false;
};

const handleLogout = () => {
    localStorage.clear();
    name.value = "";
    department.value = "";
    email.value = "";
    password.value = "";
    formKey.value++;
    router.push("/");
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <div class="relative overflow-hidden rounded-xl shadow-2xl md:grid md:grid-cols-2 md:items-center md:gap-8 lg:gap-12">
          <div class="relative z-10 p-8 md:p-12 lg:p-16 animate-slide-in-left">
              <div class="absolute inset-0 bg-black bg-opacity-60 rounded-xl">
                   <img src="../assets/img/expense.jpg" class="absolute inset-0 w-full h-full object-cover rounded-xl mix-blend-overlay" alt="Field Management Operations">  
                  <div class="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 opacity-70 rounded-xl"></div>
              </div>
              <div class="relative text-white">
                  <h2 class="text-3xl font-bold mb-4 tracking-tight animate-fade-in-down delay-200">
                      Field Management System
                  </h2>
                  <p class="text-lg opacity-90 leading-relaxed animate-fade-in-down delay-400">
                      Empowering your field teams with seamless coordination and real-time insights.
                  </p>
                  <ul class="mt-6 space-y-2 opacity-80 animate-fade-in-down delay-500">
                      <li class="flex items-center">
                          <svg class="w-5 h-5 mr-2 text-purple-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Smart Task Assignment
                      </li>
                      <li class="flex items-center">
                          <svg class="w-5 h-5 mr-2 text-indigo-300 animate-pulse delay-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.995 1.995 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path></svg>
                          Interactive Maps & Tracking
                      </li>
                      <li class="flex items-center">
                          <svg class="w-5 h-5 mr-2 text-purple-300 animate-pulse delay-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                          Actionable Data Analytics
                      </li>
                  </ul>
                  <p class="mt-8 text-sm opacity-70 animate-fade-in-down delay-600">
                      Experience the future of field management.
                  </p>
              </div>
          </div>

          <div class="bg-white p-8 md:p-12 lg:p-16 animate-slide-in-right">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 tracking-tight animate-fade-in-down">
                  {{ isRegister ? 'Create Your Account' : 'Welcome Back' }}
              </h2>
              <p class="text-sm text-gray-600 mb-4 animate-fade-in delay-100">
                  {{ isRegister ? 'Please fill in the details below to register.' : 'Enter your credentials to log in.' }}
              </p>

              <p v-if="message" class="text-green-600 text-sm mb-3 animate-fade-in delay-200">{{ message }}</p>
              <p v-if="error" class="text-red-500 text-sm mb-3 animate-fade-in delay-200">{{ error }}</p>

              <form :key="formKey" @submit.prevent="handleAuth" autocomplete="off" class="space-y-4">
                  <div v-if="isRegister" class="animate-fade-in delay-300">
                      <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                      <input v-model="name" type="text" id="name" placeholder="Your Full Name" class="input-field" required />
                      <span v-if="name && nameError" class="text-xs text-red-500">{{ nameError }}</span>
                  </div>

                  <div v-if="isRegister" class="animate-fade-in delay-400">
                      <label for="department" class="block text-gray-700 text-sm font-bold mb-2">Department</label>
                      <select v-model="department" id="department" class="input-field" required>
                          <option disabled value="">Select Department</option>
                          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                      </select>
                  </div>

                  <div class="animate-fade-in" :class="{'delay-300': isRegister, 'delay-200': !isRegister}">
                      <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Work Email</label>
                      <input
                          v-model="email"
                          type="email"
                          id="email"
                          name="email-x123"
                          placeholder="your@company.com"
                          class="input-field"
                          required
                      />
                      <span v-if="email && emailError" class="text-xs text-red-500">{{ emailError }}</span>
                  </div>

                  <div class="relative animate-fade-in" :class="{'delay-400': isRegister, 'delay-300': !isRegister}">
                      <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password</label>
                      <input
                          v-model="password"
                          :type="showPassword ? 'text' : 'password'"
                          id="password"
                          name="pass-y456"
                          placeholder="Your Secure Password"
                          class="input-field"
                          autocomplete="new-password"
                          required
                      />
                      <button
                          type="button"
                          @click="showPassword = !showPassword"
                          class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 focus:outline-none"
                      >
                          {{ showPassword ? 'Show' : 'Hide' }}
                      </button>
                      <span v-if="password && passwordError" class="text-xs text-red-500">{{ passwordError }}</span>
                  </div>

                  <button
                      :disabled="loading"
                      class="btn-primary w-full animate-pulse hover:animate-none"
                      :class="{'delay-500': isRegister, 'delay-400': !isRegister}"
                  >
                      {{ isRegister ? "Create Account" : "Log In" }}
                  </button>

                  <p class="text-center text-sm text-gray-600 mt-4 animate-fade-in delay-600">
                      {{ isRegister ? "Already have an account?" : "Don't have an account?" }}
                      <button
                          @click="isRegister = !isRegister"
                          type="button"
                          class="text-blue-500 hover:underline focus:outline-none"
                      >
                          {{ isRegister ? "Log In" : "Create Account" }}
                      </button>
                  </p>
              </form>
          </div>
      </div>
  </div>
</template>

<style scoped>
.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease-in-out;
}

.input-field:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
}

.btn-primary {
  background-color: #6366f1;
  color: white;
  font-weight: 500;
  padding: 12px 20px;
  border-radius: 6px;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
}

.btn-primary:hover {
  background-color: #5a53f0;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.15);
}

.btn-primary:disabled {
  background-color: #a78bfa;
  cursor: not-allowed;
}

/* Animations */
@keyframes slide-in-left {
  0% { transform: translateX(-30px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-right {
  0% { transform: translateX(30px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes fade-in-down {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% {
      opacity: 1;
      transform: scale(1);
  }
  50% {
      opacity: 0.8;
      transform: scale(1.03);
  }
}

.animate-slide-in-left {
  animation: slide-in-left 0.6s ease-out forwards;
}

.animate-slide-in-right {
  animation: slide-in-right 0.6s ease-out forwards
}
</style>
