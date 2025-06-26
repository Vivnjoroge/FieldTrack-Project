const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "your-default-secret";
console.log("Using SECRET_KEY:", SECRET_KEY);

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("⚠️ No token provided or incorrect format.");
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted:", token);

    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded token payload:", decoded);

    if (decoded.id) {
      req.user = decoded;
      return next();
    }

    // fallback DB query if ID missing in token
    db.query(
      "SELECT Employee_ID FROM Employee WHERE Role = ? AND Department = ? LIMIT 1",
      [decoded.role, decoded.department],
      (dbErr, results) => {
        if (dbErr) {
          console.error("❌ Database Error:", dbErr);
          return res.status(500).json({ message: "Error fetching user ID." });
        }

        if (results.length === 0) {
          console.warn("⚠️ No matching user found in database.");
          return res.status(403).json({ message: "Invalid user. No matching record found." });
        }

        req.user = { ...decoded, id: results[0].Employee_ID };
        console.log("✅ User ID Fetched from DB:", req.user.id);
        next();
      }
    );
  } catch (err) {
    console.error("❌ Token Verification Failed:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = verifyToken;
