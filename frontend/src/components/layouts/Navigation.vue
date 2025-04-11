<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
    localStorage.removeItem("token"); // Remove authentication token
    localStorage.removeItem("role");  // Remove stored user role
    localStorage.removeItem("email"); // Remove stored email if you have it
    localStorage.removeItem("password"); // Remove stored password if you have it
    localStorage.removeItem("rememberMe"); // Remove rememberMe preference
    localStorage.removeItem("department"); // Remove department if stored
    router.push("/auth"); // Redirect to login page
};
</script>

<template>
    <nav class="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">Dashboard</h1>

        <button
            @click="logout"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
            Logout
        </button>
    </nav>
</template>

<style scoped>
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: white;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}
</style>