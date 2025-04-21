const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { Blockchain } = require('../src/blockchain/Blockchain');

describe('Blockchain-Database Integration Tests', () => {
    let db;
    let blockchain;
    const testDbPath = path.join(__dirname, 'test_integration.db');

    beforeAll(() => {
        // Initialize blockchain
        blockchain = new Blockchain();
        
        // Create test database
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
                    block_hash TEXT,
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
        // Clear tables and blockchain before each test
        db.serialize(() => {
            db.run('DELETE FROM medical_records');
            db.run('DELETE FROM users');
        });
        blockchain = new Blockchain(); // Reset blockchain
    });

    test('should add medical record to both database and blockchain', (done) => {
        // Create test user
        db.run(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            ['testuser', 'hashedpassword', 'test@example.com'],
            function(err) {
                expect(err).toBeNull();
                const userId = this.lastID;

                // Create medical record data
                const record = {
                    patient_id: userId,
                    doctor_id: 1,
                    diagnosis: 'Test Diagnosis',
                    prescription: 'Test Prescription'
                };

                // Add to blockchain first
                const block = blockchain.addBlock(record);
                expect(block).toBeDefined();
                expect(block.hash).toBeDefined();

                // Add to database with block hash
                db.run(
                    'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, block_hash) VALUES (?, ?, ?, ?, ?)',
                    [record.patient_id, record.doctor_id, record.diagnosis, record.prescription, block.hash],
                    function(err) {
                        expect(err).toBeNull();
                        expect(this.lastID).toBeDefined();

                        // Verify both database and blockchain
                        db.get(
                            'SELECT * FROM medical_records WHERE id = ?',
                            [this.lastID],
                            (err, dbRecord) => {
                                expect(err).toBeNull();
                                expect(dbRecord).toBeDefined();
                                expect(dbRecord.block_hash).toBe(block.hash);

                                // Verify blockchain
                                const chainRecord = blockchain.getBlockByHash(block.hash);
                                expect(chainRecord).toBeDefined();
                                expect(chainRecord.data).toEqual(record);
                                done();
                            }
                        );
                    }
                );
            }
        );
    });

    test('should verify integrity of records', (done) => {
        // Create test user
        db.run(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            ['testuser', 'hashedpassword', 'test@example.com'],
            function(err) {
                expect(err).toBeNull();
                const userId = this.lastID;

                // Create and add multiple records
                const records = [
                    { patient_id: userId, doctor_id: 1, diagnosis: 'Diagnosis 1', prescription: 'Prescription 1' },
                    { patient_id: userId, doctor_id: 2, diagnosis: 'Diagnosis 2', prescription: 'Prescription 2' }
                ];

                let recordsAdded = 0;
                records.forEach(record => {
                    // Add to blockchain
                    const block = blockchain.addBlock(record);
                    
                    // Add to database
                    db.run(
                        'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, block_hash) VALUES (?, ?, ?, ?, ?)',
                        [record.patient_id, record.doctor_id, record.diagnosis, record.prescription, block.hash],
                        function(err) {
                            expect(err).toBeNull();
                            recordsAdded++;

                            if (recordsAdded === records.length) {
                                // Verify all records
                                db.all(
                                    'SELECT * FROM medical_records WHERE patient_id = ?',
                                    [userId],
                                    (err, dbRecords) => {
                                        expect(err).toBeNull();
                                        expect(dbRecords.length).toBe(2);

                                        // Verify each record's integrity
                                        dbRecords.forEach(dbRecord => {
                                            const chainRecord = blockchain.getBlockByHash(dbRecord.block_hash);
                                            expect(chainRecord).toBeDefined();
                                            expect(chainRecord.data).toEqual({
                                                patient_id: dbRecord.patient_id,
                                                doctor_id: dbRecord.doctor_id,
                                                diagnosis: dbRecord.diagnosis,
                                                prescription: dbRecord.prescription
                                            });
                                        });

                                        // Verify blockchain integrity
                                        expect(blockchain.isChainValid()).toBe(true);
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

    test('should detect tampering in database', (done) => {
        // Create test user and record
        db.run(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            ['testuser', 'hashedpassword', 'test@example.com'],
            function(err) {
                expect(err).toBeNull();
                const userId = this.lastID;

                const record = {
                    patient_id: userId,
                    doctor_id: 1,
                    diagnosis: 'Original Diagnosis',
                    prescription: 'Original Prescription'
                };

                // Add to blockchain
                const block = blockchain.addBlock(record);

                // Add to database
                db.run(
                    'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, block_hash) VALUES (?, ?, ?, ?, ?)',
                    [record.patient_id, record.doctor_id, record.diagnosis, record.prescription, block.hash],
                    function(err) {
                        expect(err).toBeNull();
                        const recordId = this.lastID;

                        // Tamper with database record
                        db.run(
                            'UPDATE medical_records SET diagnosis = ? WHERE id = ?',
                            ['Tampered Diagnosis', recordId],
                            function(err) {
                                expect(err).toBeNull();
                                expect(this.changes).toBe(1);

                                // Verify tampering is detected
                                db.get(
                                    'SELECT * FROM medical_records WHERE id = ?',
                                    [recordId],
                                    (err, dbRecord) => {
                                        expect(err).toBeNull();
                                        const chainRecord = blockchain.getBlockByHash(dbRecord.block_hash);
                                        expect(chainRecord.data.diagnosis).not.toBe(dbRecord.diagnosis);
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