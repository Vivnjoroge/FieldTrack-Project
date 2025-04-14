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
const isRegister = ref(false); // Default to Sign In
const isRegisterChanged = ref(false); // Track if the register state has just changed
const showSaveCredentialsPrompt = ref(false);
const formKey = ref(0);

// Validation
const nameError = ref("");
const emailError = ref("");
const passwordError = ref("");

// Validation Helpers
const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);
const isValidEmail = (email) => /^[a-zA-Z][^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    isRegisterChanged.value = true;
    name.value = "";
    department.value = "";
    email.value = "";
    password.value = "";
    nameError.value = "";
    emailError.value = "";
    passwordError.value = "";
    formKey.value++;
});

const resetIsRegisterChanged = () => {
    isRegisterChanged.value = false;
};

const toggleRegister = () => {
    isRegisterChanged.value = true;
    isRegister.value = !isRegister.value;
    formKey.value++;
    message.value = "";
    error.value = "";
    nameError.value = "";
    emailError.value = "";
    passwordError.value = "";
};

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
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8">
      <div class="relative overflow-hidden rounded-lg shadow-md md:grid md:grid-cols-2 md:items-center md:gap-10 lg:gap-16 max-w-screen-xl w-full">
  
        <div class="relative z-10 p-8 md:p-12 lg:p-16 bg-white rounded-l-lg animate-slide-in-left">
          <div class="absolute inset-0 overflow-hidden rounded-l-lg">
            <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-teal-400 to-cyan-300 opacity-70 transform skew-y-[-10deg] origin-top-left"></div>
            <div class="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-bl from-purple-400 to-indigo-500 opacity-70 transform skew-y-[10deg] origin-bottom-right"></div>
            <div class="absolute inset-0 bg-white opacity-30 animate-pulse-bg"></div>
          </div>
          <div class="relative text-gray-800 text-center md:text-left">
            <h2 class="text-2xl font-semibold mb-6 tracking-tight animate-fade-in-down delay-200">
              Field Management System
            </h2>
            <p class="text-lg opacity-70 leading-relaxed animate-fade-in-down delay-400">
              Connecting your field teams with powerful tools for seamless operations.
            </p>
            <ul class="mt-8 space-y-3 opacity-60 animate-fade-in-down delay-500">
              <li class="flex items-center">
                <svg class="w-5 h-5 mr-3 text-teal-500 animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Smart Task Assignment
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 mr-3 text-purple-500 animate-wiggle delay-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.995 1.995 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path></svg>
                Real-time Tracking
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 mr-3 text-indigo-500 animate-wiggle delay-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                Data-Driven Insights
              </li>
            </ul>
            <p class="mt-10 text-sm opacity-50 animate-fade-in-down delay-600">
              Experience a new way to manage your field operations.
            </p>
          </div>
        </div>
  
        <div class="bg-white p-8 md:p-12 lg:p-16 rounded-r-lg shadow-md relative overflow-hidden">
          <div
            class="form-inner"
            :class="{
              'animate-slide-out-left': isRegisterChanged && !isRegister,
              'animate-slide-in-right': isRegisterChanged && isRegister,
              'animate-slide-out-left-reverse': isRegisterChanged && isRegister,
              'animate-slide-in-right-reverse': isRegisterChanged && !isRegister,
            }"
            @animationend="resetIsRegisterChanged"
          >
            <div class="text-center md:text-left">
              <h2 class="text-xl font-semibold text-gray-900 mb-5 tracking-tight animate-fade-in-down">
                {{ isRegister ? 'Create Account' : 'Sign In' }}
              </h2>
              <p class="text-sm text-gray-700 mb-8 animate-fade-in delay-100">
                {{ isRegister ? 'Get started by creating your account.' : 'Enter your details to access your account.' }}
              </p>
            </div>
  
            <p v-if="message" class="text-green-600 text-sm mb-4 text-center animate-fade-in delay-200">{{ message }}</p>
            <p v-if="error" class="text-red-500 text-sm mb-4 text-center animate-fade-in delay-200">{{ error }}</p>
  
            <form :key="formKey" @submit.prevent="handleAuth" autocomplete="off" class="space-y-5">
              <div v-if="isRegister" class="animate-fade-in delay-300">
                <label for="name" class="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                <input v-model="name" type="text" id="name" placeholder="Your Full Name" class="input-field" required />
                <span v-if="name && nameError" class="text-xs text-red-500">{{ nameError }}</span>
              </div>
  
              <div v-if="isRegister" class="animate-fade-in delay-400">
                <label for="department" class="block text-gray-700 text-sm font-medium mb-2">Department</label>
                <select v-model="department" id="department" class="input-field" required>
                  <option disabled value="">Select Department</option>
                  <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                </select>
              </div>
  
              <div class="animate-fade-in" :class="{'delay-300': isRegister, 'delay-200': !isRegister}">
                <label for="email" class="block text-gray-700 text-sm font-medium mb-2">Work Email</label>
                <input v-model="email" type="text" id="email" name="email-x123" placeholder="your@company.com" class="input-field" required />
                <span v-if="email && emailError" class="text-xs text-red-500">{{ emailError }}</span>
              </div>
  
              <div class="relative animate-fade-in" :class="{'delay-400': isRegister, 'delay-300': !isRegister}">
                <label for="password" class="block text-gray-700 text-sm font-medium mb-2">Password</label>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  name="pass-y456"
                  placeholder="Your Secure Password"
                  class="input-field"
                  required
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 focus:outline-none">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
                <span v-if="password && passwordError" class="text-xs text-red-500">{{ passwordError }}</span>
              </div>
  
              <button :disabled="loading" class="btn-primary w-full animate-fade-in delay-500">
                {{ isRegister ? "Create Account" : "Sign In" }}
              </button>
            </form>
  
            <div class="mt-8 text-center animate-fade-in delay-600">
              <p class="text-sm text-gray-700">
                {{ isRegister ? "Already have an account?" : "Don't have an account?" }}
                <button @click="toggleRegister" type="button" class="text-indigo-600 font-semibold hover:underline focus:outline-none">
                  {{ isRegister ? "Sign In" : "Create Account" }}
                </button>
              </p>
            </div>
          </div>
        </div>
  
      </div>
    </div>
  </template>
  
  
  <style scoped>
  @keyframes slide-in-left {
    from {
      transform: translateX(-30px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slide-in-right {
    from {
      transform: translateX(30px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slide-out-left {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-30px);
      opacity: 0;
    }
  }
  
  @keyframes slide-out-left-reverse {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-30px);
      opacity: 0;
    }
  }
  
  @keyframes slide-in-right-reverse {
    from {
      transform: translateX(30px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fade-in-down {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse-bg {
    0% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.02); }
    100% { opacity: 0.3; transform: scale(1); }
  }
  
  @keyframes wiggle {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg); }
    50% { transform: rotate(0deg); }
    75% { transform: rotate(2deg); }
    100% { transform: rotate(0deg); }
  }
  
  .animate-slide-in-left {
    animation: slide-in-left 0.6s ease-out forwards;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.4s ease-out forwards;
  }
  
  .animate-slide-out-left {
    animation: slide-out-left 0.4s ease-in forwards;
  }
  
  .animate-slide-out-left-reverse {
    animation: slide-out-left-reverse 0.4s ease-in forwards;
  }
  
  .animate-slide-in-right-reverse {
    animation: slide-in-right-reverse 0.4s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fade-in 0.4s ease-out forwards;
  }
  
  .animate-fade-in-down {
    animation: fade-in-down 0.5s ease-out forwards;
  }
  
  .animate-pulse-bg {
    animation: pulse-bg 2s ease-in-out infinite;
  }
  
  .animate-wiggle {
    animation: wiggle 1.5s ease-in-out infinite;
  }
  
  .form-inner {
    position: relative; /* Needed for proper animation context */
    transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  }
  
  .input-field {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s ease-in-out;
    background-color: #f9fafb;
  }
  
  .input-field:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
    background-color: white;
  }
  
  .btn-primary {
    background-color: #6366f1;
    color: white;
    font-weight: 600;
    padding: 14px 24px;
    border-radius: 8px;
    transition: background-color 0.2s ease-in-out, box-shadow 0.1s ease-in-out;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
  }
  
  .btn-primary:hover {
    background-color: #5a53f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .btn-primary:active {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .btn-primary:disabled {
    background-color: #cbd5e0;
    color: #718096;
    cursor: not-allowed;
  }
  </style>