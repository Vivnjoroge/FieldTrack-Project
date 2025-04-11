const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// 1. Employees Request Resources
router.post("/", verifyToken, (req, res) => {
  const { resource_name, quantity, reason } = req.body;
  const { id, role } = req.user;
  const date_requested = new Date();

  if (role !== "Employee") {
    return res.status(403).json({ message: "Only employees can request resources!" });
  }

  db.query(
    "INSERT INTO Resource (Employee_ID, Resource_Name, Quantity, Reason, Date_Requested, Status) VALUES (?, ?, ?, ?, ?, 'Pending')",
    [id, resource_name, quantity, reason, date_requested],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err.sqlMessage);
        return res.status(500).json({ message: "Error requesting resource", error: err.sqlMessage });
      }
      res.json({ message: "Resource request submitted successfully!" });
    }
  );
});

//  2. Managers Approve Resource Requests
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

// 3. Managers Reject Resource Requests
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
// 4. Get Resource Requests (Employees see their own, Managers see all)
router.get("/", verifyToken, (req, res) => {
  const { id, role } = req.user;

  let query = `
      SELECT
          r.Resource_ID,
          r.Resource_Name,
          r.Quantity,
          r.Reason,
          r.Date_Requested,
          r.Status,
          e.Employee_ID AS Employee_ID,
          e.Name AS Employee_Name
      FROM
          Resource r
      LEFT JOIN
          Employee e ON r.Employee_ID = e.Employee_ID
  `;
  let params = [];

  if (role === "Employee") {
      query = `
          SELECT
              r.Resource_ID,
              r.Resource_Name,
              r.Quantity,
              r.Reason,
              r.Date_Requested,
              r.Status,
              e.Employee_ID AS Employee_ID,
              e.Name AS Employee_Name
          FROM
              Resource r
          LEFT JOIN
              Employee e ON r.Employee_ID = e.Employee_ID
          WHERE
              r.Employee_ID = ?
      `;
      params = [id];
  }

  db.query(query, params, (err, results) => {
      if (err) {
          console.error("Database Error:", err.sqlMessage);
          return res.status(500).json({ message: "Error fetching resource requests", error: err.sqlMessage });
      }
      res.json(results);
  });
});

// 5. Update Resource Request (Employees can edit their own)
router.put("/:resourceId", verifyToken, (req, res) => {
  const { resource_name, quantity, reason } = req.body;
  const { resourceId } = req.params;
  const { id, role } = req.user;

  db.query(
    "UPDATE Resource SET Resource_Name = ?, Quantity = ?, Reason = ? WHERE Resource_ID = ? AND Employee_ID = ?",
    [resource_name, quantity, reason, resourceId, id],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err.sqlMessage);
        return res.status(500).json({ message: "Error updating resource request", error: err.sqlMessage });
      }
      if (result.affectedRows === 0) {
        return res.status(403).json({ message: "You are not authorized to edit this resource request or it doesn't exist." });
      }
      res.json({ message: "Resource request updated successfully!" });
    }
  );
});

// 6. Delete Resource Request (Employees can delete their own)
router.delete("/:resourceId", verifyToken, (req, res) => {
  const { resourceId } = req.params;
  const { id, role } = req.user;

  db.query(
    "DELETE FROM Resource WHERE Resource_ID = ? AND Employee_ID = ?",
    [resourceId, id],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err.sqlMessage);
        return res.status(500).json({ message: "Error deleting resource request", error: err.sqlMessage });
      }
      if (result.affectedRows === 0) {
        return res.status(403).json({ message: "You are not authorized to delete this resource request or it doesn't exist." });
      }
      res.json({ message: "Resource request deleted successfully!" });
    }
  );
});

module.exports = router;