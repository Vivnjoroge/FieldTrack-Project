const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// ✅ 1. Employees Submit Expenses
router.post("/", verifyToken, (req, res) => {
    const { expense_type, amount, description, receipt } = req.body;
    const { id, role } = req.user; // Get user ID and role from token
    const date_submitted = new Date();

    if (role !== "Employee") {
        return res.status(403).json({ message: "Only employees can submit expenses!" });
    }

    db.query(
        "INSERT INTO Expense (Employee_ID, Expense_Type, Amount, Description, Receipt, Date_Submitted, Status) VALUES (?, ?, ?, ?, ?, ?, 'Pending')", 
        [id, expense_type, amount, description, receipt, date_submitted], 
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error creating expense" });
            res.json({ message: "Expense submitted successfully!" });
        }
    );
});

// ✅ 2. Finance Approves Expenses
router.put("/approve/:expenseId", verifyToken, (req, res) => {
    const { role } = req.user;
    const { expenseId } = req.params;

    if (role !== "Finance") {
        return res.status(403).json({ message: "Only Finance can approve expenses!" });
    }

    db.query(
        "UPDATE Expense SET Status = 'Approved' WHERE ID = ? AND Status = 'Pending'", 
        [expenseId], 
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error approving expense" });
            if (result.affectedRows === 0) return res.status(400).json({ message: "Expense not found or already processed!" });

            res.json({ message: "Expense approved successfully!" });
        }
    );
});

// ✅ 3. Finance Rejects Expenses
router.put("/reject/:expenseId", verifyToken, (req, res) => {
    const { role } = req.user;
    const { expenseId } = req.params;

    if (role !== "Finance") {
        return res.status(403).json({ message: "Only Finance can reject expenses!" });
    }

    db.query(
        "UPDATE Expense SET Status = 'Rejected' WHERE ID = ? AND Status = 'Pending'", 
        [expenseId], 
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error rejecting expense" });
            if (result.affectedRows === 0) return res.status(400).json({ message: "Expense not found or already processed!" });

            res.json({ message: "Expense rejected successfully!" });
        }
    );
});

// ✅ 4. Get Expenses (Employees see their own, Finance sees pending)
router.get("/", verifyToken, (req, res) => {
    const { id, role } = req.user;

    let query = "SELECT * FROM Expense WHERE Employee_ID = ?";
    let params = [id];

    if (role === "Finance") {
        query = "SELECT * FROM Expense WHERE Status = 'Pending'"; // Finance sees pending expenses
        params = [];
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching expenses" });
        res.json(results);
    });
});

// ✅ 5. Get Expense by ID
router.get("/:expenseId", verifyToken, (req, res) => {
    const { expenseId } = req.params;
    const { id, role } = req.user;

    let query = "SELECT * FROM Expense WHERE ID = ? AND Employee_ID = ?";
    let params = [expenseId, id];

    if (role === "Finance") {
        query = "SELECT * FROM Expense WHERE ID = ?";
        params = [expenseId];
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching expense details" });
        if (results.length === 0) return res.status(404).json({ message: "Expense not found!" });

        res.json(results[0]);
    });
});

module.exports = router;
