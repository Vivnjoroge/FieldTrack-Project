import { createRouter, createWebHistory } from "vue-router";
import AuthenticationView from "@/views/AuthenticationView.vue";
import DashboardView from "@/views/DashboardView.vue";
import ExpenseView from "@/views/ExpenseView.vue";
import FinancePanel from "@/components/dashboard/FinancePanel.vue";
import ManagerPanel from "@/components/dashboard/ManagerPanel.vue";
import AdminPanel from "@/components/dashboard/AdminPanel.vue";
import RequestResourceView from "@/views/RequestResourceView.vue";
import EmployeesView from "@/views/EmployeesView.vue";

const routes = [
  { path: "/", redirect: "/auth" },
  { path: "/auth", component: AuthenticationView },
  { path: "/dashboard", component: DashboardView, meta: { requiresAuth: true } },
  { path: "/expenses", component: ExpenseView, meta: { requiresAuth: true } },
  { path: "/resources", component: RequestResourceView, meta: { requiresAuth: true } },
  { path: "/employees", component: EmployeesView, meta: { requiresAuth: true } },

  // ✅ Role-Based Routes
  { path: "/admin", component: AdminPanel, meta: { requiresAuth: true, role: "Admin" } },
  { path: "/finance", component: FinancePanel, meta: { requiresAuth: true, role: "Finance" } },
  { path: "/manager", component: ManagerPanel, meta: { requiresAuth: true, role: "Manager" } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 🛑 **Fixed Navigation Guard**
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🚫 Not Authenticated? Send to Login
  if (to.meta.requiresAuth && !token) {
    return next("/auth");
  }

  // 🔒 Role-Based Access Control
  if (to.meta.role && to.meta.role !== role) {
    return next("/dashboard"); // Redirect unauthorized users to a safe page
  }

  // 🔄 Prevent Authenticated Users from Reaching Login
  if (token && to.path === "/auth") {
    if (role === "Admin") return next("/admin");
    if (role === "Finance") return next("/finance");
    if (role === "Manager") return next("/manager");
    return next("/dashboard");
  }

  next(); // ✅ Allow navigation if all checks pass
});

export default router;

