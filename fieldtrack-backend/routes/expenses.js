const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// Create Expense
router.post("/", verifyToken, (req, res) => {
    const { expense_type, amount, description, receipt } = req.body;
    const employee_id = req.user.id;
    const date_submitted = new Date();

    db.query("INSERT INTO Expense (Employee_ID, Expense_Type, Amount, Description, Receipt, Date_Submitted) VALUES (?, ?, ?, ?, ?, ?)", 
    [employee_id, expense_type, amount, description, receipt, date_submitted], 
    (err, result) => {
        if (err) return res.status(500).json({ message: "Error creating expense" });
        res.json({ message: "Expense submitted successfully" });
    });
});

// Get Expenses by Employee
router.get("/", verifyToken, (req, res) => {
    db.query("SELECT * FROM Expense WHERE Employee_ID = ?", [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching expenses" });
        res.json(results);
    });
});

module.exports = router;
