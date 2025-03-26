const bcrypt = require("bcryptjs");

const password = "pass123"; // Plain text password

// Manually hash the password and compare
bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
        console.log("Error hashing password:", err);
    } else {
        console.log("Manually hashed password:", hashedPassword);

        // Now compare the newly hashed password with the stored hash (for testing)
        const storedHash = "$2b$10$7U8GjAEoVJho/NldIx4lIOrN6KXhGZqQ/Z4rJHH85QziSbyxTRvda"; // Replace this with your actual DB hash
        bcrypt.compare(password, storedHash, (err, isMatch) => {
            if (err) {
                console.log("Error comparing passwords:", err);
            } else {
                console.log("Password match:", isMatch); // Should log `true` if passwords match
            }
        });
    }
});
