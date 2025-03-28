<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
  localStorage.removeItem("role");
  router.push("/login");
};
</script>

<template>
  <header class="bg-white shadow-md p-4 flex justify-between items-center">
    <h1 class="text-lg font-semibold">Dashboard</h1>
    <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded">
      Logout
    </button>
  </header>
</template>
