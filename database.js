// database.js
const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database or open an existing one
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create a table for storing user info
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);
});

module.exports = db;
