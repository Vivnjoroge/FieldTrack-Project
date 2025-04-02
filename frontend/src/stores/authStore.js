// authStore.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: localStorage.getItem("token") || "",
    }),

    actions: {
        async register(userData) {
            try {
                const response = await fetch("http://localhost:5000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Registration failed");

                return { success: true, message: "Registration successful! You can now log in." };
            } catch (error) {
                if (error.message.includes("email already exists")) {
                    return { success: false, message: "This email is already in use. Try logging in." };
                }
                return { success: false, message: error.message };
            }
        },

        async login(credentials) {
            try {
                console.log("Token before login:", localStorage.getItem("token")); // Log token before login
                const response = await fetch("http://localhost:5000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(credentials),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Login failed");

                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("department", data.department);
                this.token = data.token;
                this.user = data.user;

                return {
                    success: true,
                    role: data.role,
                    token: data.token,
                    department: data.department,
                };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        logout() {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("department");
            this.token = "";
            this.user = null;
        },
    },
});