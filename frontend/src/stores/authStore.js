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

                return { success: true, message: data.message };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        async login(credentials) {
            try {
                const response = await fetch("http://localhost:5000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(credentials),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Login failed");

                localStorage.setItem("token", data.token);
                this.token = data.token;
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        },

        logout() {
            localStorage.removeItem("token");
            this.token = "";
        },
    },
});
