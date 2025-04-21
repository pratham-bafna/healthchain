const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

describe('Database Tests', () => {
    let db;
    const testDbPath = path.join(__dirname, 'test.db');

    beforeAll(() => {
        // Create a test database
        db = new sqlite3.Database(testDbPath);
        
        // Create tables
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS medical_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER NOT NULL,
                    doctor_id INTEGER NOT NULL,
                    diagnosis TEXT NOT NULL,
                    prescription TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (patient_id) REFERENCES users(id)
                )
            `);
        });
    });

    afterAll(() => {
        // Close database and delete test file
        db.close();
        fs.unlinkSync(testDbPath);
    });

    beforeEach(() => {
        // Clear tables before each test
        db.serialize(() => {
            db.run('DELETE FROM medical_records');
            db.run('DELETE FROM users');
        });
    });

    test('should create user', (done) => {
        const user = {
            username: 'testuser',
            password: 'hashedpassword',
            email: 'test@example.com'
        };

        db.run(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [user.username, user.password, user.email],
            function(err) {
                expect(err).toBeNull();
                expect(this.lastID).toBeDefined();
                done();
            }
        );
    });

    test('should create medical record', (done) => {
        // First create a user
        db.run(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            ['testuser', 'hashedpassword', 'test@example.com'],
            function(err) {
                expect(err).toBeNull();
                const userId = this.lastID;

                // Then create a medical record
                const record = {
                    patient_id: userId,
                    doctor_id: 1,
                    diagnosis: 'Test Diagnosis',
                    prescription: 'Test Prescription'
                };

                db.run(
                    'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription) VALUES (?, ?, ?, ?)',
                    [record.patient_id, record.doctor_id, record.diagnosis, record.prescription],
                    function(err) {
                        expect(err).toBeNull();
                        expect(this.lastID).toBeDefined();
                        done();
                    }
                );
            }
        );
    });

    test('should retrieve medical records by patient', (done) => {
        // Create test data
        db.serialize(() => {
            // Create user
            db.run(
                'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                ['testuser', 'hashedpassword', 'test@example.com'],
                function(err) {
                    expect(err).toBeNull();
                    const userId = this.lastID;

                    // Create multiple records
                    const records = [
                        [userId, 1, 'Diagnosis 1', 'Prescription 1'],
                        [userId, 2, 'Diagnosis 2', 'Prescription 2']
                    ];

                    let recordsAdded = 0;
                    records.forEach(record => {
                        db.run(
                            'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription) VALUES (?, ?, ?, ?)',
                            record,
                            function(err) {
                                expect(err).toBeNull();
                                recordsAdded++;
                                
                                if (recordsAdded === records.length) {
                                    // Retrieve records
                                    db.all(
                                        'SELECT * FROM medical_records WHERE patient_id = ?',
                                        [userId],
                                        (err, rows) => {
                                            expect(err).toBeNull();
                                            expect(rows.length).toBe(2);
                                            expect(rows[0].diagnosis).toBe('Diagnosis 1');
                                            expect(rows[1].diagnosis).toBe('Diagnosis 2');
                                            done();
                                        }
                                    );
                                }
                            }
                        );
                    });
                }
            );
        });
    });

    test('should enforce foreign key constraint', (done) => {
        // Try to create a medical record with non-existent patient
        db.run(
            'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription) VALUES (?, ?, ?, ?)',
            [999, 1, 'Test Diagnosis', 'Test Prescription'],
            function(err) {
                expect(err).toBeDefined();
                done();
            }
        );
    });

    test('should update medical record', (done) => {
        // Create test data
        db.serialize(() => {
            // Create user
            db.run(
                'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                ['testuser', 'hashedpassword', 'test@example.com'],
                function(err) {
                    expect(err).toBeNull();
                    const userId = this.lastID;

                    // Create record
                    db.run(
                        'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription) VALUES (?, ?, ?, ?)',
                        [userId, 1, 'Original Diagnosis', 'Original Prescription'],
                        function(err) {
                            expect(err).toBeNull();
                            const recordId = this.lastID;

                            // Update record
                            db.run(
                                'UPDATE medical_records SET diagnosis = ?, prescription = ? WHERE id = ?',
                                ['Updated Diagnosis', 'Updated Prescription', recordId],
                                function(err) {
                                    expect(err).toBeNull();
                                    expect(this.changes).toBe(1);

                                    // Verify update
                                    db.get(
                                        'SELECT * FROM medical_records WHERE id = ?',
                                        [recordId],
                                        (err, row) => {
                                            expect(err).toBeNull();
                                            expect(row.diagnosis).toBe('Updated Diagnosis');
                                            expect(row.prescription).toBe('Updated Prescription');
                                            done();
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        });
    });
}); 