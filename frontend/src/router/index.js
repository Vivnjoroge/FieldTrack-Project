import { createRouter, createWebHistory } from "vue-router";
import AuthenticationView from "@/views/AuthenticationView.vue";
import DashboardView from "@/views/DashboardView.vue";
import FinancePanel from "@/components/dashboard/FinancePanel.vue";
import ManagerPanel from "@/components/dashboard/ManagerPanel.vue";
import AdminPanel from "@/components/dashboard/AdminPanel.vue";

const routes = [
  { path: "/", redirect: "/auth" }, // Default route to authentication
  { path: "/auth", component: AuthenticationView },
  { path: "/dashboard", component: DashboardView, meta: { requiresAuth: true } },
  { path: "/admin", component: AdminPanel, meta: { requiresAuth: true, role: "Admin" } },
  { path: "/finance", component: FinancePanel, meta: { requiresAuth: true, role: "Finance" } },
  { path: "/manager", component: ManagerPanel, meta: { requiresAuth: true, role: "Manager" } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 🛑 **Navigation Guard to Protect Routes**
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (to.meta.requiresAuth && !token) {
    next("/auth"); // If not logged in, go to login page
  } 
  else if (to.meta.role && to.meta.role !== role) {
    // Redirect based on role
    if (role === "Admin") {
      next("/admin");
    } else if (role === "Finance") {
      next("/finance");
    } else if (role === "Manager") {
      next("/manager");
    } else {
      next("/auth"); // 🛠 Instead of /dashboard, redirect to login
    }
  } 
  else {
    next();
  }
});


export default router;
