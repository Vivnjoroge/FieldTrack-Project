require("dotenv").config();
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    ssl: {
        // Read the CA cert file
        ca: fs.readFileSync(path.resolve(__dirname, "../certs/ca.pem")),
        rejectUnauthorized: true
    }
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        console.error("Host:", process.env.DB_HOST);
        console.error("Port:", process.env.DB_PORT);
        console.error("User:", process.env.DB_USER);
        console.error("Database:", process.env.DB_NAME);
    } else {
        console.log("Connected to Aiven MySQL Database!");
    }
});

module.exports = db;
