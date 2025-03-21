const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

router.post("/approve", verifyToken, (req, res) => {
    const { approval_id, status } = req.body;

    db.query("UPDATE Approval SET Approval_Status = ?, Date_Approved = ? WHERE Approval_ID = ?", 
    [status, new Date(), approval_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating approval" });
        res.json({ message: "Approval status updated" });
    });
});
module.exports = router;
