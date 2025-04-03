import { createRouter, createWebHistory } from "vue-router";
import AuthenticationView from "@/views/AuthenticationView.vue";
import DashboardView from "@/views/DashboardView.vue";
import ExpenseView from "@/views/ExpenseView.vue";
import RequestResourceView from "@/views/RequestResourceView.vue";
import EmployeesView from "@/views/EmployeesView.vue";

const routes = [
  { path: "/", redirect: "/auth" },
  { path: "/auth", component: AuthenticationView },
  { path: "/dashboard", component: DashboardView, meta: { requiresAuth: true } },
  { path: "/expenses", component: ExpenseView, meta: { requiresAuth: true } },
  { path: "/resources", component: RequestResourceView, meta: { requiresAuth: true } },
  { path: "/employees", component: EmployeesView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// ✅ Updated Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🚫 Redirect unauthenticated users to login
  if (to.meta.requiresAuth && !token) {
    return next("/auth");
  }

  // 🔄 Prevent authenticated users from accessing /auth again
  if (token && to.path === "/auth") {
    return next("/dashboard");
  }

  next(); // ✅ Allow navigation
});

export default router;
