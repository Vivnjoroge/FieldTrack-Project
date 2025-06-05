require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
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
const reports = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration: allow only your frontend domain
app.use(cors({
  origin: "https://final-project-two-sooty.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // enable if you use cookies or auth headers requiring credentials
}));

app.use(bodyParser.json());

// Default Route
app.get("/", (req, res) => {
    res.send("Field Resource Management API is Running!");
});

// Use Routes
app.use("/api/auth", auth);
app.use("/api/employees", employees);
app.use("/api/expenses", expenses);
app.use("/api/resources", resources);
app.use("/api/approvals", approvals);
app.use("/api/profile", profile);
app.use("/api/reports", reports);

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
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { expenseId } = req.body;
    const receiptPath = req.file.path.replace(/\\/g, "/"); // Normalize path

    const sql = "UPDATE Expense SET Receipt = ? WHERE id = ?";
    db.query(sql, [receiptPath, expenseId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, message: "Receipt uploaded successfully", path: receiptPath });
    });
});

// API to Retrieve Receipt
app.get("/api/expenses/receipt/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT Receipt FROM Expense WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (result.length === 0) return res.status(404).json({ success: false, message: "Receipt not found" });

        const receiptPath = result[0].Receipt;
        res.sendFile(path.join(__dirname, receiptPath)); // Use path.join for security
    });
});

const expressListEndpoints = require("express-list-endpoints");
console.log(expressListEndpoints(app));

const frontendPath = path.join(__dirname, "dist");

// Serve static files from the Vue.js app
app.use(express.static(frontendPath));

// Handle SPA routing (send index.html for unknown routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
