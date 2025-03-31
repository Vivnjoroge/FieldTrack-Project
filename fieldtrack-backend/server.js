require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");
const db = require("./config/db");

// Import Routes
const auth = require("./routes/auth");
const employees = require("./routes/employees");
const expenses = require("./routes/expenses");
const resources = require("./routes/resources");
const approvals = require("./routes/approvals");
const profile = require("./routes/profile");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Default Route
app.get("/", (req, res) => {
    res.send("Field Resource Management API is Running!");
});

// Use Routes
app.use("/api/auth", auth);
console.log("✅ auth.js loaded");
app.use("/api/employees", employees);
app.use("/api/expenses", expenses);
app.use("/api/resources", resources);
app.use("/api/approvals", approvals);
app.use("/api/profile", profile);

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    },
});

const upload = multer({ storage });

// API to Upload Receipt
app.post("/api/expenses/upload-receipt", upload.single("receipt"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const { expenseId } = req.body;
    const receiptPath = req.file.path.replace(/\\/g, "/"); // Normalize path

    const sql = "UPDATE Expense SET Receipt = ? WHERE id = ?";
    db.query(sql, [receiptPath, expenseId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "Receipt uploaded successfully", path: receiptPath });
    });
});

// API to Retrieve Receipt
app.get("/api/expenses/receipt/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT Receipt FROM Expense WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Receipt not found" });

        const receiptPath = result[0].Receipt;
        res.sendFile(path.resolve(receiptPath));
    });
});

const expressListEndpoints = require("express-list-endpoints");
console.log(expressListEndpoints(app));

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

