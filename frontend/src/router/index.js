import { createRouter, createWebHistory } from 'vue-router';
import AuthenticationView from '@/views/AuthenticationView.vue';
import DashboardView from '@/views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/auth" },  // Redirect root path to authentication
    { path: "/auth", component: AuthenticationView },
    { 
      path: "/dashboard", 
      component: DashboardView,
      meta: { requiresAuth: true }  // Add meta to protect dashboard route
    }
  ],
});

// Navigation guard to protect the dashboard route
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("role"); // Check if the user is logged in

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/auth");  // Redirect to login if not authenticated
  } else {
    next(); // Allow navigation
  }
});

export default router;

