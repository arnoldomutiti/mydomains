const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
// If file doesn't exist, it will be created
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )`);

        // Create Domains Table
        db.run(`CREATE TABLE IF NOT EXISTS domains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            created_date TEXT,
            expiry_date TEXT,
            registrar TEXT,
            status TEXT,
            full_details TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error("Error creating domains table:", err.message);
            } else {
                console.log("Domains table ready.");
            }
        });
    }
});

module.exports = db;
