const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth"); // Import authentication middleware

// GET all employees (Manager only)
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

// POST - Create a new employee
router.post("/", verifyToken, (req, res) => {
    if (req.user.role !== "Manager") {
        return res.status(403).json({ message: "Access denied. Managers only." });
    }

    const { Name, Department, Email, Role } = req.body;
    const query = "INSERT INTO Employee (Name, Department, Email, Role) VALUES (?, ?, ?, ?)";

    db.query(query, [Name, Department, Email, Role], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Error creating employee" });
        }
        res.status(201).json({ message: "Employee created successfully", employeeId: results.insertId });
    });
});

// PUT - Edit an existing employee
router.put("/:id", verifyToken, (req, res) => {
    if (req.user.role !== "Manager") {
        return res.status(403).json({ message: "Access denied. Managers only." });
    }

    const { Name, Department, Email, Role } = req.body;
    const employeeId = req.params.id;

    const query = "UPDATE Employee SET Name = ?, Department = ?, Email = ?, Role = ? WHERE Employee_ID = ?";
    
    db.query(query, [Name, Department, Email, Role, employeeId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Error updating employee" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.json({ message: "Employee updated successfully" });
    });
});

// DELETE - Remove an employee
router.delete("/:id", verifyToken, (req, res) => {
    if (req.user.role !== "Manager") {
        return res.status(403).json({ message: "Access denied. Managers only." });
    }

    const employeeId = req.params.id;
    const query = "DELETE FROM Employee WHERE Employee_ID = ?";

    db.query(query, [employeeId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Error deleting employee" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.json({ message: "Employee deleted successfully" });
    });
});

module.exports = router;
