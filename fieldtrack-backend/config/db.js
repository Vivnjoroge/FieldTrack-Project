const mysql = require("mysql2");

// Create MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "vivian",
    password: "Njoroge@2024!",
    database: "FieldResourceManagement"
});

// Connect to Database
db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL Database");
    }
});

module.exports = db;
