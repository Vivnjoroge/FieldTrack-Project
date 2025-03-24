const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../config/db");

const SECRET_KEY = "your_secret_key"; // Replace with process.env.SECRET_KEY

// Employee Registration
router.post("/register", async (req, res) => {
    const { name, department, email, password } = req.body; // Change contact_info to email
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO Employee (Name, Department, Email, Password) VALUES (?, ?, ?, ?)", 
        [name, department, email, hashedPassword], 
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error registering user", error: err });
            res.json({ message: "User registered successfully" });
        }
    );
});

// Employee Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM Employee WHERE Email = ?", [email], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.Employee_ID }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    });
});

module.exports = router;
