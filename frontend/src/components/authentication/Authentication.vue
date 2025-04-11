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
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="flex w-full h-screen">
      <!-- Left Section -->
      <div
        class="w-full lg:w-2/5 bg-cover bg-center relative left-section"
        style="background-image: url('/images/login-bg.jpg');"
      >
        <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white px-8 text-center">
          <h2 class="text-2xl font-semibold">Field Management System</h2>
          <p class="mt-3 text-sm leading-relaxed">
            Streamline your field operations, manage teams efficiently, and track progress in real-time.
          </p>
        </div>
      </div>

      <!-- Right Section -->
      <div class="w-full lg:w-3/5 flex items-center justify-center p-8">
        <div class="max-w-md w-full bg-white p-8 shadow-lg rounded-md relative">
          <div
            v-if="showSaveCredentialsPrompt"
            class="absolute top-0 left-0 right-0 bg-yellow-200 p-3 text-center text-yellow-700 rounded-md shadow-md z-10"
          >
            <p class="text-sm">Would you like to save credentials?</p>
            <div class="flex justify-center gap-4 mt-2">
              <button
                @click="handleSaveCredentials('yes')"
                class="btn-primary bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4"
              >
                Yes, Save Credentials
              </button>
              <button
                @click="handleSaveCredentials('no')"
                class="btn-primary bg-red-500 hover:bg-red-600 text-white rounded-md py-2 px-4"
              >
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

          <form :key="formKey" @submit.prevent="handleAuth" autocomplete="off">
            <div class="space-y-4 mt-4">
              <div v-if="isRegister" class="space-y-2">
                <input v-model="name" type="text" placeholder="Full Name" class="input-field" required />
                <span v-if="name && nameError" class="text-xs text-red-500">{{ nameError }}</span>

                <select v-model="department" class="input-field" required>
                  <option disabled value="">Select Department</option>
                  <option value="Admin">Admin</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                  <option value="Operations">Operations</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              <input
                v-model="email"
                type="email"
                name="email-x123"
                placeholder="Enter your work email"
                class="input-field"
                required
              />
              <span v-if="email && emailError" class="text-xs text-red-500">{{ emailError }}</span>

              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  name="pass-y456"
                  placeholder="Enter password"
                  class="input-field"
                  autocomplete="new-password"
                  required
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
              <span v-if="password && passwordError" class="text-xs text-red-500">{{ passwordError }}</span>

              <button
                :disabled="loading"
                class="btn-primary"
              >
                {{ isRegister ? "Register" : "Login" }}
              </button>

              <p class="text-center text-sm text-gray-600 mt-2">
                {{ isRegister ? "Already have an account?" : "Don't have an account?" }}
                <button
                  @click="isRegister = !isRegister"
                  type="button"
                  class="text-blue-500 underline"
                >
                  {{ isRegister ? "Login" : "Register" }}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.left-section {
  background-size: cover;
  background-position: center;
  height: 100vh;
  position: relative;
}

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
