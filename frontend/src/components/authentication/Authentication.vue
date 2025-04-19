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
const rememberMe = ref(false); // Added ref for "Remember Me" checkbox

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
                if (rememberMe.value) {
                    localStorage.setItem("email", email.value.trim());
                    localStorage.setItem("password", password.value);
                    localStorage.setItem("rememberMe", "true");
                } else {
                    localStorage.setItem("rememberMe", "false");
                    localStorage.removeItem("email");
                    localStorage.removeItem("password");
                }
            }
        } else {
            response = await authStore.login({
                email: email.value.trim(),
                password: password.value,
            });

            if (response.success) {
                localStorage.setItem("role", response.role);
                localStorage.setItem("department", response.department);
                if (rememberMe.value) {
                    localStorage.setItem("email", email.value.trim());
                    localStorage.setItem("password", password.value);
                    localStorage.setItem("rememberMe", "true");
                } else {
                    localStorage.setItem("rememberMe", "false");
                    localStorage.removeItem("email");
                    localStorage.removeItem("password");
                }
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
        rememberMe.value = true;
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
        rememberMe.value = true;
    } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
        localStorage.setItem("rememberMe", "false");
        rememberMe.value = false;
    }
    showSaveCredentialsPrompt.value = false;
};

const handleLogout = () => {
    localStorage.clear();
    name.value = "";
    department.value = "";
    email.value = "";
    password.value = "";
    rememberMe.value = false;
    formKey.value++;
    router.push("/");
};
</script>


<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8">
        <div class="relative overflow-hidden rounded-xl shadow-md md:grid md:grid-cols-2 md:items-center md:gap-10 lg:gap-16 max-w-screen-xl w-full">

            <div class="relative z-10 p-8 md:p-12 lg:p-16 bg-white rounded-l-xl">
                <div class="absolute inset-0 overflow-hidden rounded-l-xl">
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
                            Easy Expense Management
                        </li>
                        <li class="flex items-center">
                            <svg class="w-5 h-5 mr-3 text-purple-500 animate-wiggle delay-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.995 1.995 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path></svg>
                            Easy Resource Management
                        </li>
                        <li class="flex items-center">
                            <svg class="w-5 h-5 mr-3 text-indigo-500 animate-wiggle delay-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                            Automated Processes
                        </li>
                    </ul>
                    <p class="mt-10 text-sm opacity-50 animate-fade-in-down delay-600">
                        Experience a new way to manage your field operations.
                    </p>
                </div>
            </div>

            <div class="bg-white p-8 md:p-12 lg:p-16 rounded-r-xl shadow-md relative overflow-hidden">
                <div class="text-center md:text-left">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4 tracking-tight">
                        {{ isRegister ? 'Create Account' : 'Sign In' }}
                    </h2>
                    <p class="text-sm text-gray-700 mb-6">
                        {{ isRegister ? 'Get started by creating your account.' : 'Enter your details to access your account.' }}
                    </p>
                </div>

                <p v-if="message" class="text-green-600 text-sm mb-4 text-center">{{ message }}</p>
                <p v-if="error" class="text-red-500 text-sm mb-4 text-center">{{ error }}</p>

                <form :key="formKey" @submit.prevent="handleAuth" autocomplete="off" class="space-y-4">
                    <div v-if="isRegister">
                        <label for="name" class="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                        <input v-model="name" type="text" id="name" placeholder="Your Full Name" class="form-input" required />
                        <span v-if="name && nameError" class="text-xs text-red-500">{{ nameError }}</span>
                    </div>

                    <div v-if="isRegister">
                        <label for="department" class="block text-gray-700 text-sm font-medium mb-2">Department</label>
                        <select v-model="department" id="department" class="form-select" required>
                            <option disabled value="">Select Department</option>
                            <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                        </select>
                    </div>

                    <div>
                        <label for="email" class="block text-gray-700 text-sm font-medium mb-2">Work Email</label>
                        <input v-model="email" type="text" id="email" name="email-x123" placeholder="your@company.com" class="form-input" required />
                        <span v-if="email && emailError" class="text-xs text-red-500">{{ emailError }}</span>
                    </div>

                    <div class="relative">
                        <label for="password" class="block text-gray-700 text-sm font-medium mb-2">Password</label>
                        <input
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            id="password"
                            name="pass-y456"
                            placeholder="Your Secure Password"
                            class="form-input"
                            required
                        />
                        <button
                            type="button"
                            @click="showPassword = !showPassword"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 focus:outline-none"
                        >
                            {{ showPassword ? 'Hide' : 'Show' }}
                        </button>
                        <span v-if="password && passwordError" class="text-xs text-red-500">{{ passwordError }}</span>
                    </div>

                    <!-- <div class="flex items-center mb-4">
                        <input v-model="rememberMe" type="checkbox" id="rememberMe" class="form-checkbox mr-2">
                        <label for="rememberMe" class="text-gray-700 text-sm">Remember Me</label>
                    </div> -->

                    <button :disabled="loading" class="form-button w-full">
                        {{ isRegister ? "Create Account" : "Sign In" }}
                    </button>
                </form>

                <div class="mt-6 text-center">
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
</template>



<style scoped>
/* Existing animations for the left side */
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

/* New styles for the form side */
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f7f7f7;
  transition: border-color 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
  background-color: white;
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f7f7f7;
  appearance: none; /* Remove default arrow */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3e%3cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 1em;
  transition: border-color 0.2s ease-in-out;
}

.form-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
  background-color: white;
}

.form-button {
  background-color: #6366f1;
  color: white;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 6px;
  transition: background-color 0.2s ease-in-out, box-shadow 0.1s ease-in-out;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-button:hover {
  background-color: #5a53f0;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.form-button:active {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-button:disabled {
  background-color: #cbd5e0;
  color: #718096;
  cursor: not-allowed;
}
</style>