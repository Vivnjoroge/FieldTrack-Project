const jwt = require("jsonwebtoken");

const SECRET_KEY = "278683f7fda2b507544fc5a074d2209fc99764e119ee5cd461b53d1806bab30b64e535b1eb0109ba424c9d2aa1d2519a0abc3623850187848303bfc830a51a6f"; // Ensure this matches your server.js

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }
        req.user = decoded; // Store decoded token in req.user
        next();
    });
};

module.exports = verifyToken;
