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

// 🚀 Register Employee
// 🚀 Register Employee
router.post("/register", async (req, res) => {
    const { name, department, email, password } = req.body;

    if (!name || !department || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const role = getRole(department); // Determine role based on department

    db.query("SELECT * FROM Employee WHERE Email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (results.length > 0) return res.status(400).json({ message: "User already exists!" });

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO Employee (Name, Department, Email, Password, Role) VALUES (?, ?, ?, ?, ?)",
            [name, department, email, hashedPassword, role],
            (err, result) => {
                if (err) return res.status(500).json({ message: "Error registering user" });

                console.log("🚀 Register Role (Before Response):", role);

                // **✅ Fix: Return the role in the response**
                res.json({
                    success: true,
                    message: "Registration successful! You can now log in.",
                    role: role, // ✅ Now returning role correctly
                });
            }
        );
    });
});

// 🚀 Login User
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    db.query("SELECT * FROM Employee WHERE Email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (results.length === 0) return res.status(401).json({ message: "Invalid email or password!" });

        const user = results[0];

        const match = await bcrypt.compare(password, user.Password);
        if (!match) return res.status(401).json({ message: "Invalid email or password!" });

        const token = jwt.sign(
            { id: user.Employee_ID, role: user.Role, department: user.Department },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        console.log("Login Role (Before Response):", user.Role);
        res.json({
            success: true,
            message: "Login successful!",
            token,
            role: user.Role,
            department: user.Department.toLowerCase(),
        });
    });
});

// 🚀 Logout (Clears token on frontend)
router.post("/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully!" });
});

module.exports = router;
