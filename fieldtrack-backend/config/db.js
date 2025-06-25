require("dotenv").config();
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

// Detect if running on Render (you can also set a custom env var if you want)
const isRender = process.env.RENDER || false;

const caPath = isRender
  ? "/run/secrets/ca.pem"   // Render mounts secret files here
  : path.resolve(__dirname, "../certs/ca.pem"); // Local dev path

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    ca: fs.readFileSync(caPath),
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

