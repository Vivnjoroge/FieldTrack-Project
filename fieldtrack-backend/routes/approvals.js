// approvals.js - This file handles expense approval and rejection
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// ✅ 1. Get all approval statuses
router.get("/", verifyToken, (req, res) => {
    console.log("➡️ GET /api/approvals - Get All Approval Statuses");
    try {
        db.query("SELECT Expense_ID, Approval_Status FROM Expense", (err, results) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Error fetching approval statuses", error: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ 2. Finance Approves Expenses
router.put("/approve/:expenseId", verifyToken, (req, res) => {
    console.log("PUT /api/approvals/approve/:expenseId - Approve Expense"); // Updated route path
    try {
        const { role } = req.user;
        const { expenseId } = req.params;
        console.log("    Expense ID:", expenseId, "User Role:", role);

        if (!expenseId) {
            console.log("    Error: Expense ID is required!");
            return res.status(400).json({ message: "Expense ID is required!" });
        }

        if (role !== "Finance") {
            console.log("    Error: Only Finance can approve expenses!");
            return res.status(403).json({ message: "Only Finance can approve expenses!" });
        }

        db.query(
            "UPDATE Expense SET Approval_Status = 'Approved' WHERE Expense_ID = ? AND Approval_Status = 'Pending'",
            [expenseId],
            (err, result) => {
                console.log("    ➡️ Database Query:", this.sql);
                console.log("    ➡️ Database Error:", err);
                console.log("    ➡️ Database Result:", result);
                if (err) {
                    console.error("    Database Error:", err);
                    return res.status(500).json({ message: "Error approving expense", error: err.message });
                }
                if (result.affectedRows === 0) {
                    console.log("    Error: Expense not found or already processed!");
                    return res.status(404).json({ message: "Expense not found or already processed!" });
                }

                res.json({ message: "Expense approved successfully!" });
            }
        );
    } catch (error) {
        console.error("    Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ 3. Finance Rejects Expenses
router.put("/reject/:expenseId", verifyToken, (req, res) => {
    console.log("➡️ PUT /api/approvals/reject/:expenseId - Reject Expense"); // Updated route path
    try {
        const { role } = req.user;
        const { expenseId } = req.params;
        console.log("    ➡️ Expense ID:", expenseId, "User Role:", role);

        if (!expenseId) {
            console.log("    ❌ Error: Expense ID is required!");
            return res.status(400).json({ message: "Expense ID is required!" });
        }

        if (role !== "Finance") {
            console.log("    ❌ Error: Only Finance can reject expenses!");
            return res.status(403).json({ message: "Only Finance can reject expenses!" });
        }

        db.query(
            "UPDATE Expense SET Approval_Status = 'Rejected' WHERE Expense_ID = ? AND Approval_Status = 'Pending'",
            [expenseId],
            (err, result) => {
                console.log("    ➡️ Database Query:", this.sql);
                console.log("    ➡️ Database Error:", err);
                console.log("    ➡️ Database Result:", result);
                if (err) {
                    console.error("    ❌ Database Error:", err);
                    return res.status(500).json({ message: "Error rejecting expense", error: err.message });
                }
                if (result.affectedRows === 0) {
                    console.log("    ❌ Error: Expense not found or already processed!");
                    return res.status(404).json({ message: "Expense not found or already processed!" });
                }

                res.json({ message: "Expense rejected successfully!" });
            }
        );
    } catch (error) {
        console.error("    ❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ 4. Finance Gets Pending Field Work Reimbursements
router.get("/field-work-reimbursement/pending", verifyToken, (req, res) => {
    console.log("➡️ GET /api/approvals/field-work-reimbursement/pending - Get Pending Field Work Reimbursements"); // Updated route path
    try {
        const { role } = req.user;
        console.log("    ➡️ User Role:", role);

        if (role !== "Finance") {
            console.log("    ❌ Error: Only Finance can view pending field work reimbursements!");
            return res.status(403).json({ message: "Only Finance can view pending field work reimbursements!" });
        }

        const query = `
            SELECT
                Expense.*,
                Employee.Name AS Employee_Name
            FROM
                Expense
            JOIN
                Employee ON Expense.Employee_ID = Employee.Employee_ID
            WHERE
                Expense.Approval_Status = 'Pending' AND Expense.Expense_Category = 'Field Work'
        `;

        db.query(query, (err, results) => {
            console.log("    ➡️ Database Query:", this.sql);
            console.log("    ➡️ Database Error:", err);
            console.log("    ➡️ Database Results:", results);
            if (err) {
                console.error("    ❌ Database Error (Get Pending Field Work):", err);
                return res.status(500).json({ message: "Error fetching pending field work reimbursements", error: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("    ❌ Unexpected Error (Get Pending Field Work):", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ 5. Finance Marks Expense as Reimbursed
router.put("/reimburse/:expenseId", verifyToken, (req, res) => {
    console.log("➡️ PUT /api/approvals/reimburse/:expenseId - Reimburse Expense"); // Updated route path
    try {
        const { role } = req.user;
        const { expenseId } = req.params;
        console.log("    ➡️ Reimburse Request Received for Expense ID:", expenseId);
        console.log("    ➡️ User Role:", role);

        if (!expenseId) {
            console.log("    ❌ Error: Expense ID is missing!");
            return res.status(400).json({ message: "Expense ID is required!" });
        }

        if (role !== "Finance") {
            console.log("    ❌ Error: User is not Finance!");
            return res.status(403).json({ message: "Only Finance can mark expenses as reimbursed!" });
        }

        db.query(
            "UPDATE Expense SET Reimbursement_Status = 'Reimbursed', Date_Reimbursed = NOW() WHERE Expense_ID = ? AND Approval_Status = 'Approved' AND (Reimbursement_Status IS NULL OR Reimbursement_Status != 'Reimbursed')",
            [expenseId],
            (err, result) => {
                console.log("    ➡️ Database Query:", this.sql); // Log the actual SQL query
                console.log("    ➡️ Database Error:", err);
                console.log("    ➡️ Database Result:", result);

                if (err) {
                    console.error("    ❌ Database Error:", err);
                    return res.status(500).json({ message: "Error marking expense as reimbursed", error: err.message });
                }
                if (result.affectedRows === 0) {
                    console.log("    ❌ Error: Expense not found, not approved, or already reimbursed!");
                    return res.status(404).json({ message: "Expense not found, not approved, or already reimbursed!" });
                }

                res.json({ message: "Expense marked as reimbursed successfully!" });
            }
        );
    } catch (error) {
        console.error("    ❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;