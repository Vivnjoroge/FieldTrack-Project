import { createRouter, createWebHistory } from 'vue-router';
import AuthenticationView from '@/views/AuthenticationView.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/auth" },
    { path: "/auth", component: AuthenticationView },
  ],
})

export default router;
