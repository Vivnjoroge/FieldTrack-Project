const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth"); // Import your authentication middleware

// GET all employees (manager only)
router.get("/", verifyToken, (req, res) => {
    if (req.user.role !== "Manager") {
        return res.status(403).json({ message: "Access denied. Managers only." });
    }

    db.query("SELECT Employee_ID, Name, Department, Email, Role FROM Employee", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error fetching employees" });
        }
        res.json(results);
    });
});

// POST route to create a new employee
router.post("/", (req, res) => {
    const { name, position, department } = req.body; // Assuming you're sending data like this
    const query = "INSERT INTO Employee (name, position, department) VALUES (?, ?, ?)";

    db.query(query, [name, position, department], (err, results) => {
        if (err) {
            console.error("Database error:", err); // Log the error to the console
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Employee created successfully", employeeId: results.insertId });
    });
});

module.exports = router;