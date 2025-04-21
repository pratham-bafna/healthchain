const Database = require('better-sqlite3');
const path = require('path');

// Define the database path in the data directory
const dbPath = path.join('/app/data', 'healthchain.db');

// Create database connection
const db = new Database(dbPath, { verbose: console.log });

// Initialize database with tables
function initializeDatabase() {
    // Create users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create medical records table
    db.exec(`
        CREATE TABLE IF NOT EXISTS medical_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            diagnosis TEXT NOT NULL,
            prescription TEXT,
            block_hash TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES users(id),
            FOREIGN KEY (doctor_id) REFERENCES users(id)
        )
    `);
}

// Initialize the database
initializeDatabase();

module.exports = db; 