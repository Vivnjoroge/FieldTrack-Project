const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Function to determine role
const getRole = (department) => {
    if (!department) return "Employee";
    const lowerDept = department.toLowerCase();
    if (lowerDept === "finance") return "Finance";
    if (lowerDept === "management") return "Manager";
    if (lowerDept === "admin") return "Admin";
    return "Employee"; // Default role
};

// Register Employee
router.post("/register", async (req, res) => {
    console.log("📝 Register request body:", req.body);
    const { name, department, email, password } = req.body;

    if (!name || !department || !email || !password) {
        console.warn("⚠️ Register: Missing fields");
        return res.status(400).json({ message: "All fields are required!" });
    }

    const role = getRole(department);
    console.log("🎭 Register: Computed role:", role);

    db.query("SELECT * FROM Employee WHERE Email = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ Register: DB error on SELECT:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length > 0) {
            console.warn("⚠️ Register: User already exists:", email);
            return res.status(400).json({ message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔐 Register: Password hashed");

        db.query(
            "INSERT INTO Employee (Name, Department, Email, Password, Role) VALUES (?, ?, ?, ?, ?)",
            [name, department, email, hashedPassword, role],
            (err, result) => {
                if (err) {
                    console.error("❌ Register: DB error on INSERT:", err);
                    return res.status(500).json({ message: "Error registering user" });
                }

                console.log("✅ Register: User registered with role:", role);
                res.json({
                    success: true,
                    message: "Registration successful! You can now log in.",
                    role: role,
                });
            }
        );
    });
});

// Login User
router.post("/login", async (req, res) => {
    console.log("📝 Login request body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        console.warn("⚠️ Login: Missing email or password");
        return res.status(400).json({ message: "Email and password are required!" });
    }

    db.query("SELECT * FROM Employee WHERE Email = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ Login: DB error on SELECT:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length === 0) {
            console.warn("⚠️ Login: No user found with email:", email);
            return res.status(401).json({ message: "Invalid email or password!" });
        }

        const user = results[0];
        console.log("👤 Login: User found:", user.Email, "Role:", user.Role);

        const match = await bcrypt.compare(password, user.Password);
        if (!match) {
            console.warn("⚠️ Login: Password mismatch for user:", email);
            return res.status(401).json({ message: "Invalid email or password!" });
        }

        const token = jwt.sign(
            { id: user.Employee_ID, role: user.Role, department: user.Department },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        console.log("🔑 Login: JWT token created for user ID:", user.Employee_ID);
        res.json({
            success: true,
            message: "Login successful!",
            token,
            role: user.Role,
            department: user.Department.toLowerCase(),
        });
    });
});

// Logout (Clears token on frontend)
router.post("/logout", (req, res) => {
    console.log("🚪 Logout requested");
    res.json({ success: true, message: "Logged out successfully!" });
});

module.exports = router;

