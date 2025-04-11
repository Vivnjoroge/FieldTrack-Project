const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// Monthly Expense Summary Report
router.get("/monthly-summary", verifyToken, (req, res) => {
    try {
        const { month, year } = req.query;

        console.log("Backend - Requested Month:", month, "Requested Year:", year); // For debugging

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

        console.log("Backend - Executing Query:", query, [month, year]); // For debugging

        db.query(query, [month, year], (err, results) => {
            if (err) {
                console.error(" Backend - Database Error:", err);
                return res.status(500).json({ message: "Error fetching monthly expense summary", error: err.message });
            }

            console.log("Backend - Query Results:", results); // For debugging
            res.json(results);
        });
    } catch (error) {
        console.error("Backend - Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;