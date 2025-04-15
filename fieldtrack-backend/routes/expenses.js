const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; // Using promises for cleaner async/await

// Configure multer for in-memory storage (BLOB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 1. Employees Submit Expenses
router.post("/", verifyToken, upload.single('receipt'), async (req, res) => {
    console.log(" POST /api/expenses - Submit Expense");
    try {
        const { expense_type, amount, description } = req.body;
        let receiptData = null;

        console.log("  ➡️ Received Data:", req.body);
        console.log("  ➡️ Uploaded File:", req.file);

        if (!expense_type || !amount || !description) {
            console.log("  ❌ Error: Missing required fields!");
            return res.status(400).json({ message: "Missing required fields!" });
        }

        const { id, role } = req.user;
        console.log("  ➡️ User ID:", id, "Role:", role);
        if (!id) {
            console.log("  ❌ Error: User authentication failed!");
            return res.status(401).json({ message: "User authentication failed!" });
        }
        if (role !== "Employee") {
            console.log("  ❌ Error: Only employees can submit expenses!");
            return res.status(403).json({ message: "Only employees can submit expenses!" });
        }

        const date_submitted = new Date().toISOString().split('T')[0];

        if (req.file) {
            receiptData = req.file.buffer; // Store the buffer directly
        }

        db.query(
            `INSERT INTO Expense (Employee_ID, Expense_Type, Amount, Description, Receipt, Date_Submitted, Approval_Status) VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
            [id, expense_type, amount, description, receiptData, date_submitted],
            (err, result) => {
                console.log("  Database Query:", this.sql);
                console.log("   Database Error:", err);
                console.log("   Database Result:", result);
                if (err) {
                    console.error("   Database Insert Error:", err);
                    return res.status(500).json({ message: "Error creating expense", error: err.message });
                }
                console.log("  Inserted Data Successfully!", result);
                res.json({ message: "Expense submitted successfully!", expenseId: result.insertId });
            }
        );
    } catch (error) {
        console.error("   Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// 8. Employees Submit Field Work Reimbursements
router.post("/field-work-reimbursement", verifyToken, upload.single('receipt'), async (req, res) => {
    console.log("POST /api/expenses/field-work-reimbursement - Submit Field Work Reimbursement");
    console.log("  Uploaded File (Field Work):", req.file);
    try {
        const { expense_type, amount, description, field_work_details } = req.body;
        let receiptData = null;

        console.log("   Received Field Work Reimbursement Data:", req.body);
        console.log("   Uploaded File (Field Work):", req.file);

        if (!expense_type || !amount || !description || !field_work_details) {
            console.log("   Error: Missing required fields for field work reimbursement!");
            return res.status(400).json({ message: "Missing required fields for field work reimbursement!" });
        }

        const { id, role } = req.user;
        console.log("  User ID:", id, "Role:", role);
        if (!id) {
            console.log("   Error: User authentication failed!");
            return res.status(401).json({ message: "User authentication failed!" });
        }
        if (role !== "Employee") {
            console.log("   Error: Only employees can submit field work reimbursements!");
            return res.status(403).json({ message: "Only employees can submit field work reimbursements!" });
        }

        const date_submitted = new Date().toISOString().split('T')[0];

        if (req.file) {
            receiptData = req.file.buffer; // Store the buffer directly
        }

        db.query(
            `INSERT INTO Expense (Employee_ID, Expense_Type, Amount, Description, Receipt, Date_Submitted, Approval_Status, Expense_Category, Field_Work_Details) VALUES (?, ?, ?, ?, ?, ?, 'Pending', 'Field Work', ?)`,
            [id, expense_type, amount, description, receiptData, date_submitted, JSON.stringify(field_work_details)],
            (err, result) => {
                console.log("  ➡️ Database Query (Field Work):", this.sql);
                console.log("  ➡️ Database Error (Field Work):", err);
                console.log("  ➡️ Database Result (Field Work):", result);
                if (err) {
                    console.error("   Database Insert Error (Field Work):", err);
                    return res.status(500).json({ message: "Error creating field work reimbursement", error: err.message });
                }
                console.log("  ✅ Field Work Reimbursement Inserted Successfully!", result);
                res.json({ message: "Field work reimbursement submitted successfully!", expenseId: result.insertId });
            }
        );
    } catch (error) {
        console.error("   Unexpected Error (Field Work):", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

//  2. Finance Approves Expenses
router.put("/approve/:expenseId", verifyToken, (req, res) => {
    console.log("PUT /api/expenses/approve/:expenseId - Approve Expense");
    try {
        const { role } = req.user;
        const { expenseId } = req.params;
        console.log("   Expense ID:", expenseId, "User Role:", role);

        if (!expenseId) {
            console.log("   Error: Expense ID is required!");
            return res.status(400).json({ message: "Expense ID is required!" });
        }

        if (role !== "Finance") {
            console.log("   Error: Only Finance can approve expenses!");
            return res.status(403).json({ message: "Only Finance can approve expenses!" });
        }

        db.query(
            "UPDATE Expense SET Approval_Status = 'Approved' WHERE Expense_ID = ? AND Approval_Status = 'Pending'",
            [expenseId],
            (err, result) => {
                console.log("  ➡️ Database Query:", this.sql);
                console.log("  ➡️ Database Error:", err);
                console.log("  ➡️ Database Result:", result);
                if (err) {
                    console.error("   Database Error:", err);
                    return res.status(500).json({ message: "Error approving expense", error: err.message });
                }
                if (result.affectedRows === 0) {
                    console.log("   Error: Expense not found or already processed!");
                    return res.status(404).json({ message: "Expense not found or already processed!" });
                }

                res.json({ message: "Expense approved successfully!" });
            }
        );
    } catch (error) {
        console.error("   Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ 3. Finance Rejects Expenses
router.put("/reject/:expenseId", verifyToken, (req, res) => {
    console.log("➡️ PUT /api/expenses/reject/:expenseId - Reject Expense");
    try {
        const { role } = req.user;
        const { expenseId } = req.params;
        console.log("  ➡️ Expense ID:", expenseId, "User Role:", role);

        if (!expenseId) {
            console.log("  ❌ Error: Expense ID is required!");
            return res.status(400).json({ message: "Expense ID is required!" });
        }

        if (role !== "Finance") {
            console.log("  ❌ Error: Only Finance can reject expenses!");
            return res.status(403).json({ message: "Only Finance can reject expenses!" });
        }

        db.query(
            "UPDATE Expense SET Approval_Status = 'Rejected' WHERE Expense_ID = ? AND Approval_Status = 'Pending'",
            [expenseId],
            (err, result) => {
                console.log("  ➡️ Database Query:", this.sql);
                console.log("  ➡️ Database Error:", err);
                console.log("  ➡️ Database Result:", result);
                if (err) {
                    console.error("  ❌ Database Error:", err);
                    return res.status(500).json({ message: "Error rejecting expense", error: err.message });
                }
                if (result.affectedRows === 0) {
                    console.log("  ❌ Error: Expense not found or already processed!");
                    return res.status(404).json({ message: "Expense not found or already processed!" });
                }

                res.json({ message: "Expense rejected successfully!" });
            }
        );
    } catch (error) {
        console.error("  ❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


// ✅ 4. Get Expenses (Employees see their own, Finance and Management see all)
router.get("/", verifyToken, (req, res) => {
    console.log("➡️ GET /api/expenses - Get Expenses");
    try {
        const { id, role } = req.user;
        const { approval_status, expense_category } = req.query;
        console.log("  ➡️ User ID:", id, "Role:", role, "Query:", req.query);
        let query = `
            SELECT
                Expense.*,
                Employee.Name AS Employee_Name
            FROM
                Expense
            JOIN
                Employee ON Expense.Employee_ID = Employee.Employee_ID
        `;
        let params = [];
        let conditions = [];

        if (role !== "Finance" && role !== "Management") {
            conditions.push("Expense.Employee_ID = ?");
            params.push(id);
        }

        if (approval_status) {
            conditions.push("Expense.Approval_Status = ?");
            params.push(approval_status);
        }

        if (expense_category) {
            conditions.push("Expense.Expense_Category = ?");
            params.push(expense_category);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        console.log("  ➡️ Executing Query:", query);
        console.log("  ➡️ Query Parameters:", params);

        db.query(query, params, (err, results) => {
            console.log("  ➡️ Database Error:", err);
            console.log("  ➡️ Database Results:", results);
            if (err) {
                console.error("  ❌ Database Error:", err);
                return res.status(500).json({ message: "Error fetching expenses", error: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("  ❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ 9. Finance Gets Pending Field Work Reimbursements
router.get("/field-work-reimbursement/pending", verifyToken, (req, res) => {
    console.log("➡️ GET /api/expenses/field-work-reimbursement/pending - Get Pending Field Work Reimbursements");
    try {
        const { role } = req.user;
        console.log("  ➡️ User Role:", role);

        if (role !== "Finance") {
            console.log("  ❌ Error: Only Finance can view pending field work reimbursements!");
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
            console.log("  ➡️ Database Query:", this.sql);
            console.log("  ➡️ Database Error:", err);
            console.log("  ➡️ Database Results:", results);
            if (err) {
                console.error("  ❌ Database Error (Get Pending Field Work):", err);
                return res.status(500).json({ message: "Error fetching pending field work reimbursements", error: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("  ❌ Unexpected Error (Get Pending Field Work):", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ 5. Get Expense by ID - Includes endpoint to serve the receipt BLOB
router.get("/:expenseId", verifyToken, (req, res) => {
    console.log("➡️ GET /api/expenses/:expenseId - Get Expense by ID");
    try {
        const { expenseId } = req.params;
        const { id, role } = req.user;
        console.log("  ➡️ Expense ID:", expenseId, "User ID:", id, "Role:", role);

        if (!expenseId) {
            console.log("  ❌ Error: Expense ID is required!");
            return res.status(400).json({ message: "Expense ID is required!" });
        }

        let query = "SELECT * FROM Expense WHERE Expense_ID = ? AND Employee_ID = ?";
        let params = [expenseId, id];

        if (role === "Finance" || role === "Management") {
            query = "SELECT * FROM Expense WHERE Expense_ID = ?";
            params = [expenseId];
        }

        console.log("  ➡️ Executing Query:", query);
        console.log("  ➡️ Query Parameters:", params);

        db.query(query, params, (err, results) => {
            console.log("  ➡️ Database Error:", err);
            console.log("  ➡️ Database Results:", results);
            if (err) {
                console.error("  ❌ Database Error:", err);
                return res.status(500).json({ message: "Error fetching expense details", error: err.message });
            }
            if (results.length === 0) {
                console.log("  ❌ Error: Expense not found!");
                return res.status(404).json({ message: "Expense not found!" });
            }

            res.json(results[0]);
        });
    } catch (error) {
        console.error("  ❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ Endpoint to serve the receipt BLOB
router.get("/:expenseId/receipt", verifyToken, (req, res) => {
    const { expenseId } = req.params;
    console.log("➡️ GET /api/expenses/:expenseId/receipt - Get Expense Receipt");

    db.query("SELECT Receipt FROM Expense WHERE Expense_ID = ?", [expenseId], (err, results) => {
        if (err) {
            console.error("  ❌ Database Error:", err);
            return res.status(500).json({ message: "Error fetching receipt", error: err.message });
        }
        if (results.length === 0 || !results[0].Receipt) {
            return res.status(404).json({ message: "Receipt not found" });
        }

        const receiptData = results[0].Receipt;

        // Determine the Content-Type based on your application's logic
        // You might need to store the MIME type in the database as well for accuracy
        res.setHeader('Content-Type', 'application/octet-stream'); // Default binary type
        res.send(receiptData);
    });
});

// ✅ 6. Delete Expense
router.delete("/:expenseId", verifyToken, (req, res) => {
    console.log("➡️ DELETE /api/expenses/:expenseId - Delete Expense");
    try {
        const { expenseId } = req.params;
        const { id, role } = req.user;
        console.log("  ➡️ Expense ID:", expenseId, "User ID:", id, "Role:", role);

        if (!expenseId) {
            console.log("  ❌ Error: Expense ID is required!");
            return res.status(400).json({ message: "Expense ID is required!" });
        }

        let query = "DELETE FROM Expense WHERE Expense_ID = ? AND Employee_ID = ?";
        let params = [expenseId, id];

        if (role === "Finance") {
            query = "DELETE FROM Expense WHERE Expense_ID = ?";
            params = [expenseId];
        }

        console.log("  ➡️ Executing Query:", query);
        console.log("  ➡️ Query Parameters:", params);

        db.query(query, params, (err, result) => {
            console.log("  ➡️ Database Error:", err);
            console.log("  ➡️ Database Result:", result);
            if (err) {
                console.error("  ❌ Database Error:", err);
                
                    return res.status(500).json({ message: "Error deleting expense", error: err.message });
            }
            if (result.affectedRows === 0) {
                console.log("  ❌ Error: Expense not found or you are not authorized to delete it.");
                return res.status(404).json({ message: "Expense not found or you are not authorized to delete it." });
            }

            res.json({ message: "Expense deleted successfully!" });
        });
    } catch (error) {
        console.error("  ❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ 7. Edit Expense
router.put("/:expenseId", verifyToken, upload.single('receipt'), (req, res) => {
    console.log("➡️ PUT /api/expenses/:expenseId - Edit Expense");
    try {
        const { expenseId } = req.params;
        const { expense_type, amount, description } = req.body;
        const receipt = req.file ? `/uploads/receipts/${req.file.filename}` : req.body.oldReceipt || null;
        const { id, role } = req.user;
        console.log("  ➡️ Expense ID:", expenseId, "User ID:", id, "Role:", role, "Request Body:", req.body, "Uploaded File:", req.file);

        if (!expenseId) {
            console.log("  ❌ Error: Expense ID is required!");
            return res.status(400).json({ message: "Expense ID is required!" });
        }

        let query = "UPDATE Expense SET Expense_Type = ?, Amount = ?, Description = ?, Receipt = ? WHERE Expense_ID = ? AND Employee_ID = ?";
        let params = [expense_type, amount, description, receipt, expenseId, id];

        if (role === "Finance") {
            query = "UPDATE Expense SET Expense_Type = ?, Amount = ?, Description = ?, Receipt = ? WHERE Expense_ID = ?";
            params = [expense_type, amount, description, receipt, expenseId];
        }

        console.log("  ➡️ Executing Query:", query);
        console.log("  ➡️ Query Parameters:", params);

        db.query(query, params, (err, result) => {
            console.log("  ➡️ Database Error:", err);
            console.log("  ➡️ Database Result:", result);
            if (err) {
                console.error("  ❌ Database Error:", err);
                return res.status(500).json({ message: "Error updating expense", error: err.message });
            }
            if (result.affectedRows === 0) {
                console.log("  ❌ Error: Expense not found or you are not authorized to update it.");
                return res.status(404).json({ message: "Expense not found or you are not authorized to update it." });
            }

            res.json({ message: "Expense updated successfully!" });
        });
    } catch (error) {
        console.error("  ❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.put("/reimburse/:expenseId", verifyToken, (req, res) => {
    console.log("➡️ PUT /api/expenses/reimburse/:expenseId - Reimburse Expense");
    try {
        const { role } = req.user;
        const { expenseId } = req.params;
        console.log("  ➡️ Reimburse Request Received for Expense ID:", expenseId);
        console.log("  ➡️ User Role:", role);

        if (!expenseId) {
            console.log("  ❌ Error: Expense ID is missing!");
            return res.status(400).json({ message: "Expense ID is required!" });
        }

        if (role !== "Finance") {
            console.log("  ❌ Error: User is not Finance!");
            return res.status(403).json({ message: "Only Finance can mark expenses as reimbursed!" });
        }

        db.query(
            "UPDATE Expense SET Reimbursement_Status = 'Reimbursed', Date_Reimbursed = NOW() WHERE Expense_ID = ? AND Approval_Status = 'Approved' AND (Reimbursement_Status IS NULL OR Reimbursement_Status != 'Reimbursed')",
            [expenseId],
            (err, result) => {
                console.log("  ➡️ Database Query:", this.sql); // Log the actual SQL query
                console.log("  ➡️ Database Error:", err);
                console.log("  ➡️ Database Result:", result);

                if (err) {
                    console.error("  ❌ Database Error:", err);
                    return res.status(500).json({ message: "Error marking expense as reimbursed", error: err.message });
                }
                if (result.affectedRows === 0) {
                    console.log("  ❌ Error: Expense not found, not approved, or already reimbursed!");
                    return res.status(404).json({ message: "Expense not found, not approved, or already reimbursed!" });
                }

                res.json({ message: "Expense marked as reimbursed successfully!" });
            }
        );
    } catch (error) {
        console.error("  ❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;