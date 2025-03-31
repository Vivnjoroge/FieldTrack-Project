const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// ✅ 1. Employees Submit Expenses
router.post("/", verifyToken, (req, res) => {
    try {
        const { expense_type, amount, description, receipt } = req.body;
        console.log("🟢 Received Data:", req.body);

        if (!expense_type || !amount || !description) {
            return res.status(400).json({ message: "Missing required fields!" });
        }

        const { id, role } = req.user;
        if (!id) {
            return res.status(401).json({ message: "User authentication failed!" });
        }
        if (role !== "Employee") {
            return res.status(403).json({ message: "Only employees can submit expenses!" });
        }

        const date_submitted = new Date().toISOString().split('T')[0]; // Ensure correct date format

        db.query(
            `INSERT INTO Expense (Employee_ID, Expense_Type, Amount, Description, Receipt, Date_Submitted, Approval_Status) 
             VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
            [id, expense_type, amount, description, receipt || null, date_submitted],
            (err, result) => {
                if (err) {
                    console.error("❌ Database Insert Error:", err);
                    return res.status(500).json({ message: "Error creating expense", error: err });
                }
                console.log("✅ Inserted Data Successfully!", result);
                res.json({ message: "Expense submitted successfully!", expenseId: result.insertId });
            }
        );
    } catch (error) {
        console.error("❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// ✅ 2. Finance Approves Expenses
router.put("/approve/:expenseId", verifyToken, (req, res) => {
    try {
        const { role } = req.user;
        const { expenseId } = req.params;

        if (!expenseId) return res.status(400).json({ message: "Expense ID is required!" });

        if (role !== "Finance") {
            return res.status(403).json({ message: "Only Finance can approve expenses!" });
        }

        db.query(
            "UPDATE Expense SET Approval_Status = 'Approved' WHERE Expense_ID = ? AND Approval_Status = 'Pending'", 
            [expenseId], 
            (err, result) => {
                if (err) {
                    console.error("❌ Database Error:", err);
                    return res.status(500).json({ message: "Error approving expense" });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Expense not found or already processed!" });
                }

                res.json({ message: "Expense approved successfully!" });
            }
        );
    } catch (error) {
        console.error("❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ 3. Finance Rejects Expenses
router.put("/reject/:expenseId", verifyToken, (req, res) => {
    try {
        const { role } = req.user;
        const { expenseId } = req.params;

        if (!expenseId) return res.status(400).json({ message: "Expense ID is required!" });

        if (role !== "Finance") {
            return res.status(403).json({ message: "Only Finance can reject expenses!" });
        }

        db.query(
            "UPDATE Expense SET Approval_Status = 'Rejected' WHERE Expense_ID = ? AND Approval_Status = 'Pending'", 
            [expenseId], 
            (err, result) => {
                if (err) {
                    console.error("❌ Database Error:", err);
                    return res.status(500).json({ message: "Error rejecting expense" });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Expense not found or already processed!" });
                }

                res.json({ message: "Expense rejected successfully!" });
            }
        );
    } catch (error) {
        console.error("❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ 4. Get Expenses (Employees see their own, Finance sees all)
router.get("/", verifyToken, (req, res) => {
    try {
        const { id, role } = req.user;

        if (!id) return res.status(401).json({ message: "User authentication failed!" });

        let query = "SELECT * FROM Expense WHERE Employee_ID = ?";
        let params = [id];

        if (role === "Finance") {
            query = "SELECT * FROM Expense"; // Finance sees all expenses
            params = [];
        }

        console.log("🟢 Executing Query:", query);
        console.log("🟢 Query Parameters:", params);

        db.query(query, params, (err, results) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Error fetching expenses" });
            }

            console.log("🟢 Query Results:", results);
            res.json(results);
        });
    } catch (error) {
        console.error("❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ 5. Get Expense by ID
router.get("/:expenseId", verifyToken, (req, res) => {
    try {
        const { expenseId } = req.params;
        const { id, role } = req.user;

        if (!expenseId) return res.status(400).json({ message: "Expense ID is required!" });

        let query = "SELECT * FROM Expense WHERE Expense_ID = ? AND Employee_ID = ?";
        let params = [expenseId, id];

        if (role === "Finance") {
            query = "SELECT * FROM Expense WHERE Expense_ID = ?";
            params = [expenseId];
        }

        db.query(query, params, (err, results) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Error fetching expense details" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Expense not found!" });
            }

            res.json(results[0]);
        });
    } catch (error) {
        console.error("❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;

