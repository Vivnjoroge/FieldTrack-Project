const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");
const SECRET_KEY = "your_secret_key";

// Employee Registration
router.post("/register", async (req, res) => {
    const { name, department, contact_info, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO Employee (Name, Department, Contact_Info, Password) VALUES (?, ?, ?, ?)", 
    [name, department, contact_info, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: "Error registering user" });
        res.json({ message: "User registered successfully" });
    });
});

// Employee Login
router.post("/login", (req, res) => {
    const { contact_info, password } = req.body;

    db.query("SELECT * FROM Employee WHERE Contact_Info = ?", [contact_info], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.Employee_ID }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    });
});

module.exports = router;
