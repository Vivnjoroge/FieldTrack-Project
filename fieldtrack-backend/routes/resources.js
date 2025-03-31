const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// ✅ 1. Employees Request Resources
router.post("/", verifyToken, (req, res) => {
    const { resource_name, quantity, reason } = req.body;
    const { id, role } = req.user; // Get user ID and role from token
    const date_requested = new Date();

    if (role !== "Employee") {
        return res.status(403).json({ message: "Only employees can request resources!" });
    }

    db.query(
        "INSERT INTO Resource (Employee_ID, Resource_Name, Quantity, Reason, Date_Requested, Status) VALUES (?, ?, ?, ?, ?, 'Pending')",
        [id, resource_name, quantity, reason, date_requested], 
        (err, result) => {
            if (err) {
                console.error("Database Error:", err.sqlMessage); // Log the error message
                return res.status(500).json({ message: "Error requesting resource", error: err.sqlMessage });
            }
            res.json({ message: "Resource request submitted successfully!" });
        }
    );
});

// ✅ 2. Managers Approve Resource Requests
router.put("/approve/:resourceId", verifyToken, (req, res) => {
    const { role } = req.user;
    const { resourceId } = req.params;

    if (role !== "Manager") {
        return res.status(403).json({ message: "Only Managers can approve resource requests!" });
    }

    db.query(
        "UPDATE Resource SET Status = 'Approved' WHERE Resource_ID = ? AND Status = 'Pending'", 
        [resourceId], 
        (err, result) => {
            if (err) {
                console.error("Database Error:", err.sqlMessage);
                return res.status(500).json({ message: "Error approving resource request", error: err.sqlMessage });
            }
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: "Resource not found or already processed!" });
            }

            res.json({ message: "Resource request approved successfully!" });
        }
    );
});

// ✅ 3. Managers Reject Resource Requests
router.put("/reject/:resourceId", verifyToken, (req, res) => {
    const { role } = req.user;
    const { resourceId } = req.params;

    if (role !== "Manager") {
        return res.status(403).json({ message: "Only Managers can reject resource requests!" });
    }

    db.query(
        "UPDATE Resource SET Status = 'Rejected' WHERE Resource_ID = ? AND Status = 'Pending'", 
        [resourceId], 
        (err, result) => {
            if (err) {
                console.error("Database Error:", err.sqlMessage);
                return res.status(500).json({ message: "Error rejecting resource request", error: err.sqlMessage });
            }
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: "Resource not found or already processed!" });
            }

            res.json({ message: "Resource request rejected successfully!" });
        }
    );
});

// ✅ 4. Get Resource Requests (Employees see their own, Managers see pending)
router.get("/", verifyToken, (req, res) => {
    const { id, role } = req.user;

    let query = "SELECT * FROM Resource WHERE Employee_ID = ?";
    let params = [id];

    if (role === "Manager") {
        query = "SELECT * FROM Resource WHERE Status = 'Pending'"; // Managers see pending requests
        params = [];
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Database Error:", err.sqlMessage);
            return res.status(500).json({ message: "Error fetching resource requests", error: err.sqlMessage });
        }
        res.json(results);
    });
});

// ✅ 5. Get Resource Request by ID
router.get("/:resourceId", verifyToken, (req, res) => {
    const { resourceId } = req.params;
    const { id, role } = req.user;

    let query = "SELECT * FROM Resource WHERE Resource_ID = ? AND Employee_ID = ?";
    let params = [resourceId, id];

    if (role === "Manager") {
        query = "SELECT * FROM Resource WHERE Resource_ID = ?";
        params = [resourceId];
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Database Error:", err.sqlMessage);
            return res.status(500).json({ message: "Error fetching resource details", error: err.sqlMessage });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Resource request not found!" });
        }

        res.json(results[0]);
    });
});

module.exports = router;
