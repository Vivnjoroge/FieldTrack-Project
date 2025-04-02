const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config(); // Load environment variables

const SECRET_KEY = process.env.JWT_SECRET || "278683f7fda2b507544fc5a074d2209fc99764e119ee5cd461b53d1806bab30b64e535b1eb0109ba424c9d2aa1d2519a0abc3623850187848303bfc830a51a6f";
console.log("process.env.SECRET_KEY");

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn("⚠️ No token provided or incorrect format.");
            return res.status(403).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("✅ Token Verified:", decoded);

        // If ID exists in the token, proceed
        if (decoded.id) {
            req.user = decoded;
            return next();
        }

        console.warn("⚠️ User ID is missing in token! Fetching from DB...");

        // If ID is missing, fetch from database
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
        console.error("❌ Token Verification Failed:", err.message);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }

        return res.status(401).json({ message: "Invalid token." });
    }
};

module.exports = verifyToken;