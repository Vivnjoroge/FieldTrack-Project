<script setup>
import { ref, computed, onMounted } from 'vue';
import Header from '@/components/layouts/Header.vue';
import EmployeeSidebar from '@/components/sidebars/EmployeeSidebar.vue';
import ManagerSidebar from '@/components/sidebars/ManagerSidebar.vue';
import FinanceSidebar from '@/components/sidebars/FinanceSidebar.vue';
import Navigation from '@/components/layouts/Navigation.vue';
import AdminSidebar from '../sidebars/AdminSidebar.vue';

// ✅ Fetch role from localStorage (or API) when component loads
const userRole = ref(localStorage.getItem("role") || "Employee");

// ✅ Compute the correct sidebar dynamically
const SidebarComponent = computed(() => {
    switch (userRole.value) {
        case "Manager":
            return ManagerSidebar;
        case "Finance":
            return FinanceSidebar;
        case "Admin" :
            return AdminSidebar;
        default:
            return EmployeeSidebar;
    }
});

// ✅ Ensure role is updated on page refresh
onMounted(() => {
    userRole.value = localStorage.getItem("role") || "Employee";
});
</script>

<template>
    <div class="flex h-screen bg-gray-100">
        <component :is="SidebarComponent" />

        <div class="flex-1 flex flex-col overflow-hidden">
            <Navigation />

            <Header />

            <main class="flex-1 p-6 bg-white rounded-lg shadow-md overflow-auto">
                <slot />
            </main>
        </div>
    </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>