import { getDb } from "../db/connection.js";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { body, validationResult, query } from "express-validator";
import authMiddleware from "../middleware/auth.js";


const router = express.Router();
const db = getDb();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/issues";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

// Haversine distance calculation function
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Create new issue
router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  [
    body("title").trim().isLength({ min: 5, max: 100 }),
    body("description").trim().isLength({ min: 10, max: 500 }),
    body("category").isIn([
      "roads",
      "lighting",
      "water",
      "cleanliness",
      "safety",
      "obstructions",
    ]),
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
    body("is_anonymous").optional().isIn(["true", "false"]).toBoolean(),
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        category,
        latitude,
        longitude,
        address,
        is_anonymous,
      } = req.body;

      const reporterId =
        req.body.is_anonymous === true ? null : req.user.userId;

      db.run(
        `INSERT INTO issues (title, description, category, latitude, longitude, address, reporter_id, is_anonymous) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          category,
          parseFloat(latitude),
          parseFloat(longitude),
          address,
          reporterId,
          is_anonymous === true,
        ],
        function (err) {
          if (err) {
            console.error("Error creating issue:", err);
            return res.status(500).json({ error: "Failed to create issue" });
          }

          const issueId = this.lastID;

          // Save uploaded images
          if (req.files && req.files.length > 0) {
            const imageInsertPromises = req.files.map((file) => {
              return new Promise((resolve, reject) => {
                db.run(
                  "INSERT INTO issue_images (issue_id, filename, file_path) VALUES (?, ?, ?)",
                  [issueId, file.filename, file.path],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            });

            Promise.all(imageInsertPromises)
              .then(() => {
                res.status(201).json({
                  message: "Issue created successfully",
                  issueId,
                  imageCount: req.files.length,
                });
              })
              .catch((err) => {
                console.error("Error saving images:", err);
                res.status(201).json({
                  message: "Issue created but some images failed to upload",
                  issueId,
                });
              });
          } else {
            res.status(201).json({
              message: "Issue created successfully",
              issueId,
            });
          }
        }
      );
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get nearby issues
router.get(
  "/nearby",
  [
    query("lat").isFloat({ min: -90, max: 90 }),
    query("lng").isFloat({ min: -180, max: 180 }),
    query("radius").optional().isFloat({ min: 0.1, max: 5 }).toFloat(),
    query("category")
      .optional()
      .isIn([
        "roads",
        "lighting",
        "water",
        "cleanliness",
        "safety",
        "obstructions",
      ]),
    query("status").optional().isIn(["reported", "in_progress", "resolved"]),
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { lat, lng, radius = 3, category, status } = req.query;
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const searchRadius = parseFloat(radius);

      // Build query with filters
      let query = `
            SELECT i.*, 
                    GROUP_CONCAT(img.filename) as image_files
            FROM issues i
            LEFT JOIN issue_images img ON i.id = img.issue_id
            WHERE i.is_flagged = FALSE
            `;

      const params = [];

      if (category) {
        query += " AND i.category = ?";
        params.push(category);
      }

      if (status) {
        query += " AND i.status = ?";
        params.push(status);
      }

      query += " GROUP BY i.id ORDER BY i.created_at DESC";

      db.all(query, params, (err, issues) => {
        if (err) {
          console.error("Error fetching issues:", err);
          return res.status(500).json({ error: "Failed to fetch issues" });
        }

        // Filter by distance and add distance field
        const nearbyIssues = issues
          .map((issue) => {
            const distance = calculateDistance(
              userLat,
              userLng,
              issue.latitude,
              issue.longitude
            );
            return {
              ...issue,
              distance,
              images: issue.image_files
                ? issue.image_files
                    .split(",")
                    .map((filename) => `/uploads/issues/${filename}`)
                : [],
            };
          })
          .filter((issue) => issue.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance);

        res.json({
          issues: nearbyIssues,
          total: nearbyIssues.length,
        });
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get individual issue by ID
router.get("/:id", (req, res) => {
  try {
    const issueId = req.params.id;

    const query = `
            SELECT i.*, 
                   u.username as reporter_username,
                   GROUP_CONCAT(img.filename) as image_files
            FROM issues i
            LEFT JOIN users u ON i.reporter_id = u.id
            LEFT JOIN issue_images img ON i.id = img.issue_id
            WHERE i.id = ?
            GROUP BY i.id
        `;

    db.get(query, [issueId], (err, issue) => {
      if (err) {
        console.error("Error fetching issue:", err);
        return res.status(500).json({ error: "Failed to fetch issue" });
      }

      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      // Format the response
      const formattedIssue = {
        ...issue,
        images: issue.image_files
          ? issue.image_files
              .split(",")
              .map((filename) => `/uploads/issues/${filename}`)
          : [],
        reporter: issue.is_anonymous
          ? "Anonymous User"
          : issue.reporter_username || "Unknown User",
      };

      // Remove internal fields
      delete formattedIssue.image_files;
      delete formattedIssue.reporter_username;

      res.json({ issue: formattedIssue });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Flag an issue
router.post("/:id/flag", authMiddleware, [
    body("reason").optional().trim().isLength({ max: 200 })
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
            }

            const issueId = req.params.id;
            const userId = req.user.userId;
            const { reason } = req.body;

            // Check if user already flagged this issue
            db.get(
                "SELECT id FROM issue_flags WHERE issue_id = ? AND user_id = ?",
                [issueId, userId],
                (err, existingFlag) => {
                    if (err) {
                        return res.status(500).json({ error: "Database error" });
                    }

                    if (existingFlag) {
                        return res
                            .status(400)
                            .json({ error: "Issue already flagged by user" });
                    }

                    // Add flag
                    db.run(
                        "INSERT INTO issue_flags (issue_id, user_id, reason) VALUES (?, ?, ?)",
                        [issueId, userId, reason],
                        function (err) {
                            if (err) {
                                return res.status(500).json({ error: "Failed to flag issue" });
                            }

                            // Update flag count
                            db.run(
                                "UPDATE issues SET flag_count = flag_count + 1 WHERE id = ?",
                                [issueId],
                                (err) => {
                                    if (err) {
                                        console.error("Error updating flag count:", err);
                                    }

                                    // Check if issue should be auto-hidden (3+ flags)
                                    db.get(
                                        "SELECT flag_count FROM issues WHERE id = ?",
                                        [issueId],
                                        (err, issue) => {
                                            if (!err && issue && issue.flag_count >= 3) {
                                                db.run(
                                                    "UPDATE issues SET is_flagged = TRUE WHERE id = ?",
                                                    [issueId],
                                                    (err) => {
                                                        if (err) {
                                                            console.error("Error flagging issue:", err);
                                                        } else {
                                                            console.log(`Issue ${issueId} auto-flagged due to high flags`);
                                                        }
                                                    }
                                                );
                                            }
                                        }
                                    );

                                    res.json({ message: "Issue flagged successfully" });
                                }
                            );
                        }
                    );
                }
            );
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    }
);

export default router;  
