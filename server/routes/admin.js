import express from "express";
import { getDb } from "../db/connection.js";
import authMiddleware from "../middleware/auth.js";

const db = getDb();
const router = express.Router();


// 1. Ban or unban a user
// POST /api/admin/users/:id/ban { banned: true|false }
router.post("/users/:id/ban", authMiddleware, async (req, res) => {

    const userId = req.params.id;
    let { banned } = req.body;

    // Coerce string "true"/"false" to boolean if needed
    if (typeof banned === "string") {
        if (banned === "true") banned = true;
        else if (banned === "false") banned = false;
    } else if (typeof banned !== "boolean") {
        return res.status(400).json({ error: "`banned` must be boolean" });
    }

    db.run(
        "UPDATE users SET is_banned = ? WHERE id = ?",
        [banned ? 1 : 0, userId],
        function (err) {
            if (err) return res.status(500).json({ error: "DB error" });
            res.json({ message: `User ${banned ? "banned" : "unbanned"}` });
        }
    );
});

// 2. View & unflag flagged issues
// GET /api/admin/flags/issues
router.get("/flags/issues", authMiddleware, (req, res) => {
    db.all(
      `SELECT 
         i.id, i.title, i.description, i.category, i.status,
         i.latitude, i.longitude,
         i.flag_count, i.is_flagged,
         i.created_at, i.updated_at,
         GROUP_CONCAT(img.file_path) AS images,
         u.username AS reporter
       FROM issues i
       LEFT JOIN issue_images img ON i.id = img.issue_id
       LEFT JOIN users u ON i.reporter_id = u.id
       WHERE i.is_flagged = 1
       GROUP BY i.id
       ORDER BY i.flag_count DESC, i.updated_at DESC;`,
        (err, rows) => {
          if (err) return res.status(500).json({ error: "DB error" });
          
          const flaggedIssues = rows.map((r) => ({
            ...r,
            images: r.images ? r.images.split(",") : [],
          }));
        res.json({ flaggedIssues: rows });
      }
    );
});

// POST /api/admin/flags/issues/:id/unflag
router.post("/flags/issues/:id/unflag", authMiddleware, (req, res) => {

    const issueId = req.params.id;

    db.run(
        "UPDATE issues SET is_flagged = 0, flag_count = 0 WHERE id = ?",
            [issueId],
            function (err) {
                if (err) return res.status(500).json({ error: "DB error" });
                res.json({ message: "Issue unflagged and counters reset" });
            }
        );
    }
);

// 3. Simple analytics: total users, total issues, counts by category/status
// GET /api/admin/analytics
router.get("/analytics", authMiddleware, (req, res) => {

    const queries = {
        totalUsers: "SELECT COUNT(*) AS count FROM users",
        totalIssues: "SELECT COUNT(*) AS count FROM issues",
        byCategory: `SELECT category, COUNT(*) AS count
                   FROM issues GROUP BY category`,
        byStatus: `SELECT status, COUNT(*) AS count
                 FROM issues GROUP BY status`,
    };

    const results = {};

    db.serialize(() => {
        db.get(queries.totalUsers, (e, row) => {
            results.totalUsers = row.count;
        });
        db.get(queries.totalIssues, (e, row) => {
            results.totalIssues = row.count;
        });
        db.all(queries.byCategory, (e, rows) => {
            results.byCategory = rows;
        });
        db.all(queries.byStatus, (e, rows) => {
            results.byStatus = rows;
            res.json({ analytics: results });
        });
    });
});

export default router;