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

const getRole = (dept) => {
    if (!dept) return "Employee";
    const lowerDept = dept.trim().toLowerCase();
    if (lowerDept === "finance") return "Finance";
    if (lowerDept === "management") return "Manager";
    if (lowerDept === "admin") return "Admin";
    return "Employee";
};

const handleAuth = async () => {
    message.value = "";
    error.value = "";
    loading.value = true;

    try {
        let response;
        if (isRegister.value) {
            const trimmedDept = department.value.trim();
            const assignedRole = getRole(trimmedDept);

            response = await authStore.register({
                name: name.value,
                department: trimmedDept,
                email: email.value,
                password: password.value,
            });

            if (response.success) {
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
    // Only prefill login form if user opted to save credentials
    const shouldLoadSaved = localStorage.getItem("rememberMe") === "true";

    if (!isRegister.value && shouldLoadSaved) {
        const savedEmail = localStorage.getItem("email");
        const savedPassword = localStorage.getItem("password");
        email.value = savedEmail || "";
        password.value = savedPassword || "";
    } else {
        name.value = "";
        department.value = "";
        email.value = "";
        password.value = "";
    }
});

watch(isRegister, () => {
    name.value = "";
    department.value = "";
    email.value = "";
    password.value = "";
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
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("department");
    localStorage.removeItem("rememberMe");

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
            <div class="w-full lg:w-2/5 bg-cover bg-center relative left-section" style="background-image: url('/images/login-bg.jpg');">
                <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white px-8 text-center">
                    <h2 class="text-2xl font-semibold">Field Management System</h2>
                    <p class="mt-3 text-sm leading-relaxed">
                        Streamline your field operations, manage teams efficiently, and track progress in real-time.
                    </p>
                </div>
            </div>

            <div class="w-full lg:w-3/5 flex items-center justify-center p-8">
                <div class="max-w-md w-full bg-white p-8 shadow-lg rounded-md relative">
                    <div v-if="showSaveCredentialsPrompt" class="absolute top-0 left-0 right-0 bg-yellow-200 p-3 text-center text-yellow-700 rounded-md shadow-md z-10">
                        <p class="text-sm">Would you like to save credentials</p>
                        <div class="flex justify-center gap-4 mt-2">
                            <button @click="handleSaveCredentials('yes')" class="btn-primary bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4">
                                Yes, Save Credentials
                            </button>
                            <button @click="handleSaveCredentials('no')" class="btn-primary bg-red-500 hover:bg-red-600 text-white rounded-md py-2 px-4">
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
                        <input type="text" name="fake-email" style="display:none;" autocomplete="off" />
                        <input type="password" name="fake-password" style="display:none;" autocomplete="off" />

                        <div class="space-y-4 mt-4">
                            <div v-if="isRegister" class="space-y-4">
                                <input v-model="name" type="text" placeholder="Full Name" class="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" autocomplete="off" required />
                                <input v-model="department" type="text" placeholder="Department" class="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" autocomplete="off" required />
                            </div>

                            <input v-model="email" type="email" name="email-x123" placeholder="Enter your work email" class="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" autocomplete="off" required />
                            <div class="relative">
                                <input v-model="password" :type="showPassword ? 'text' : 'password'" name="pass-y456" placeholder="Enter password" class="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" autocomplete="new-password" required />
                                <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500">
                                    {{ showPassword ? 'Hide' : 'Show' }}
                                </button>
                            </div>

                            <button :disabled="loading" class="btn-primary bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                                {{ isRegister ? "Register" : "Login" }}
                            </button>

                            <p class="text-center text-sm text-gray-600 mt-2">
                                {{ isRegister ? "Already have an account?" : "Don't have an account?" }}
                                <button @click="isRegister = !isRegister" type="button" class="text-blue-500 underline">
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