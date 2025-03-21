const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key"; // Make sure to use the same secret key from server.js

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }
        req.user = decoded; // Add user data to request
        next();
    });
};

module.exports = verifyToken;
