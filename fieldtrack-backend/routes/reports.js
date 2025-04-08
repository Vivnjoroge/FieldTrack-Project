// reports.js (or your expenses router file)
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// ... other routes ...

// ✅ Monthly Expense Summary Report
router.get("/monthly-summary", verifyToken, (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required!" });
        }

        const query = `
            SELECT
                Expense_Type,
                SUM(Amount) AS Total_Amount
            FROM
                Expense
            WHERE
                MONTH(Date_Submitted) = ? AND YEAR(Date_Submitted) = ?
            GROUP BY
                Expense_Type;
        `;

        db.query(query, [month, year], (err, results) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Error fetching monthly expense summary", error: err.message });
            }

            res.json(results);
        });
    } catch (error) {
        console.error("❌ Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;