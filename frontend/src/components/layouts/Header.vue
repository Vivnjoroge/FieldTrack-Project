<script setup>

import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
  localStorage.clear(); // Clears all stored data
  router.push("/auth");
};
</script>

<template>
  <header>
    
  </header>
</template>
