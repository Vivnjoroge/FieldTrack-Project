const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config(); // Load environment variables

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY; // Ensure this is set in your .env file

// 🚀 Employee Registration
router.post("/register", async (req, res) => {
    const { name, department, email, password } = req.body;

    if (!name || !department || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // 🔍 Check if user already exists
    db.query("SELECT * FROM Employee WHERE Email = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "⚠️ User already exists!" });
        }

        // ✅ Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        db.query(
            "INSERT INTO Employee (Name, Department, Email, Password) VALUES (?, ?, ?, ?)", 
            [name, department, email, hashedPassword], 
            (err, result) => {
                if (err) {
                    console.error("❌ Registration error:", err);
                    return res.status(500).json({ message: "Error registering user" });
                }
                res.json({ message: "✅ User registered successfully!" });
            }
        );
    });
});

// 🚀 Employee Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("📩 Received request body:", req.body);

    if (!email || !password) {
        console.warn("⚠️ Missing email or password!");
        return res.status(400).json({ message: "Email and password are required" });
    }

    db.query("SELECT * FROM Employee WHERE Email = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length === 0) {
            console.warn("⚠️ No user found with email:", email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = results[0];
        console.log("🔍 Found user:", user);

        // ✅ Compare passwords
        const isMatch = await bcrypt.compare(password, user.Password);
        console.log("🔑 Password match:", isMatch);

        if (!isMatch) {
            console.warn("⚠️ Incorrect password for:", email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ✅ Generate JWT token
        const token = jwt.sign({ id: user.Employee_ID }, SECRET_KEY, { expiresIn: "1h" });
        console.log("✅ Login successful! Token generated.");
        res.json({ token });
    });
});

module.exports = router;

