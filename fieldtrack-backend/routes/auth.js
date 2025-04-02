const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config(); // Load environment variables

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY; // Ensure this is set in your .env file

// 🚀 Employee Registration (Supports Finance & Manager roles)
router.post("/register", async (req, res) => {
    const { name, department, email, password } = req.body;

    if (!name || !department || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Assign role based on department (convert to lowercase)
    let role = "Employee"; // Default role
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
            [name, lowerDepartment, email, hashedPassword, role], // store lowercased department
            (err, result) => {
                if (err) return res.status(500).json({ message: "Error registering user" });

                res.json({ success: true, message: "User registered successfully!", role });
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

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.ID, role: user.Role, department: user.Department }, // Payload
            SECRET_KEY,
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        res.json({
            success: true,
            message: "Login successful!",
            token, // Send token to frontend
            role: user.Role,
            department: user.Department.toLowerCase() // send lowercased department
        });
    });
});

// 🚀 Logout (Optional: Clear Token on Frontend)
router.post("/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully!" });
});

module.exports = router;