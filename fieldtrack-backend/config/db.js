require("dotenv").config();
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

// Detect if running on Render (you can also set a custom env var if you want)
const isRender = !!process.env.RENDER;

const caPath = isRender
  ? "/etc/secrets/ca.pem"   // Correct path for Render secret files on free plan
  : path.resolve(__dirname, "../certs/ca.pem"); // Local dev path

let sslCa;
try {
  sslCa = fs.readFileSync(caPath);
} catch (err) {
  console.error(`Failed to read CA cert at ${caPath}:`, err.message);
  process.exit(1); // Exit because SSL connection requires CA cert
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    ca: sslCa,
    rejectUnauthorized: true,
  },
});

db.connect((err) => {
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

