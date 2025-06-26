
require("dotenv").config();              // ❶ always load env first
const fs    = require("fs");
const path  = require("path");
const mysql = require("mysql2");

const isRender = process.env.RENDER === "true";
const isAiven = isRender || process.env.NODE_ENV === "production";

let sslConfig = null;

if (isRender) {
  // Only try to read CA cert if on Render
  const caPath = "/etc/secrets/ca.pem";
  try {
    const sslCa = fs.readFileSync(caPath);
    sslConfig = {
      ca: sslCa,
      rejectUnauthorized: true,
    };
  } catch (err) {
    console.error(`❌ Failed to read CA cert at ${caPath}:`, err.message);
    process.exit(1);
  }
}

const databaseName = process.env.DB_NAME || (isAiven ? "defaultdb" : "FieldResourceManagement");

console.log("isAiven:", isAiven);
console.log("Using database:", databaseName);

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: databaseName,
  port: parseInt(process.env.DB_PORT, 10),
};

if (sslConfig) {
  dbConfig.ssl = sslConfig;
}

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to Aiven MySQL Database!");
  }
});

module.exports = db;
