const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// 🚀 Employee Registration (Supports Finance & Manager roles)
router.post("/register", async (req, res) => {
    const { name, department, email, password } = req.body;

    if (!name || !department || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    let role = "Employee";
    const lowerDepartment = department.toLowerCase();
    if (lowerDepartment === "finance") {
        role = "Finance";
    } else if (lowerDepartment === "management") {
        role = "Manager";
    }

    db.query("SELECT * FROM Employee WHERE Email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (results.length > 0) return res.status(400).json({ message: "User already exists!" });

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO Employee (Name, Department, Email, Password, Role) VALUES (?, ?, ?, ?, ?)",
            [name, lowerDepartment, email, hashedPassword, role],
            (err, result) => {
                if (err) return res.status(500).json({ message: "Error registering user" });

                console.log("Register Role (Before Response):", role); // Added logging
                res.json({ success: true, message: "User registered successfully!", role: role }); // Corrected line
            }
        );
    });
});

// 🚀 Employee Login (With JWT Token)
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

        console.log("Login Role (Before Response):", user.Role); // Added logging
        res.json({
            success: true,
            message: "Login successful!",
            token,
            role: user.Role,
            department: user.Department.toLowerCase()
        });
    });
});

// 🚀 Logout (Optional: Clear Token on Frontend)
router.post("/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully!" });
});

module.exports = router;