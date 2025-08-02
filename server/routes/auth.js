import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDb } from "../db/connection.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
const db = getDb();


// User registration route
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("username")
      .optional()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body("phone_number")
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage(
        "Phone number must be a valid format (10-16 digits, optional + prefix)"
      ),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, username, phone_number } = req.body;

      // Check if user exists
      db.get(
        "SELECT id FROM users WHERE email = ?",
        [email],
        async (err, user) => {
          // Handle database errors
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          if (user) {
            return res.status(400).json({ error: "User already exists" });
          }

          // Hash password
          const saltRounds = 12;
          const passwordHash = await bcrypt.hash(password, saltRounds);

          // Insert user
          db.run(
            "INSERT INTO users (email, password_hash, username, phone_number) VALUES (?, ?, ?, ?)",
            [email, passwordHash, username, phone_number],
            // Function syntax for getting hold of 'this'
            function (err) {
              if (err) {
                return res.status(500).json({ error: "Failed to create user" });
              }

              // Generate JWT
              const token = jwt.sign(
                { userId: this.lastID, email },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
              );

              res.status(201).json({
                message: "User created successfully",
                token,
                user: { id: this.lastID, email, username },
              });
            }
          );
        }
      );
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// User login route
router.post("/login", [

    body("email").isEmail().normalizeEmail(),
    body("password").exists()

], async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        db.get(
            "SELECT * FROM users WHERE email = ? AND is_banned = FALSE",
            [email],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: "Database error" });
                }

                if (!user) {
                    return res.status(401).json({ error: "User not found or banned" });
                }

                // Check password
                const isValidPassword = await bcrypt.compare(
                    password,
                    user.password_hash
                );
                if (!isValidPassword) {
                    return res.status(401).json({ error: "Password is incorrect. Try again!" });
                }

                // Generate JWT
                const token = jwt.sign(
                    { userId: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                );

                res.json({
                    message: "Login successful",
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                    },
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;