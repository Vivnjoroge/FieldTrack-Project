const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all employees
router.get("/", (req, res) => {
    db.query("SELECT Employee_ID, Name, Department, Email FROM Employee", (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching employees" });
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
