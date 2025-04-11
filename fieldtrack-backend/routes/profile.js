const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth"); // ✅Import Auth Middleware

// GET logged-in user profile (Requires Auth)
router.get("/me", authMiddleware, (req, res) => {
    const userId = req.user.id;

    const query = "SELECT Employee_ID, Name, Department, Email, Role FROM Employee WHERE Employee_ID = ?";

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        console.log("🟢 Database Query Results:", results);
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(results[0]);
    });
});
module.exports = router;
