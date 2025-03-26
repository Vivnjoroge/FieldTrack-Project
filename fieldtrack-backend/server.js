require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./config/db");

// Import Routes
const auth = require("./routes/auth");
const employees = require("./routes/employees");
const expenses = require("./routes/expenses");
const resources = require("./routes/resources");
const approvals = require("./routes/approvals");

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

const expressListEndpoints = require("express-list-endpoints");
console.log(expressListEndpoints(app));


// Start Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
