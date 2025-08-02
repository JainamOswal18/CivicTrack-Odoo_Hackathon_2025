import sqlite3 from "sqlite3"
import path from "path"

const dbPath = path.resolve("db.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");
  }
});


const initializeTables = () => {
  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT UNIQUE,
      is_verified BOOLEAN DEFAULT FALSE,
      is_banned BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      phone_number TEXT
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions')),
      status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved')),
      reporter_id INTEGER,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      is_anonymous BOOLEAN DEFAULT FALSE,
      is_flagged BOOLEAN DEFAULT FALSE,
      flag_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS issue_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS issue_flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(issue_id, user_id),
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_issues_location ON issues(latitude, longitude);
  `;

  db.exec(createTables, (err) => {
    if (err) {
      console.error("Error creating tables:", err);
    } else {
      console.log("Database tables initialized");
    }
  });
};

// Initialize the database tables
db.serialize(() => {
  initializeTables();
});

// Export the database connection
export const getDb = () => db;