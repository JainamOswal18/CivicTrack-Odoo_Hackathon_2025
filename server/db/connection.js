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
