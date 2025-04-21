const db = require('../config/database');

class MedicalRecord {
    static async findAll() {
        return db.prepare('SELECT * FROM medical_records ORDER BY created_at ASC').all();
    }

    static async findByPatientId(patientId) {
        return db.prepare('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY created_at ASC').all(patientId);
    }

    static async findByDoctorId(doctorId) {
        return db.prepare('SELECT * FROM medical_records WHERE doctor_id = ? ORDER BY created_at ASC').all(doctorId);
    }

    static async create(record) {
        const stmt = db.prepare(`
            INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        const result = stmt.run(
            record.patient_id,
            record.doctor_id,
            record.diagnosis,
            record.prescription
        );

        return { id: result.lastInsertRowid, ...record };
    }

    static async findById(id) {
        return db.prepare('SELECT * FROM medical_records WHERE id = ?').get(id);
    }

    static async update(id, updates) {
        const stmt = db.prepare(`
            UPDATE medical_records 
            SET diagnosis = ?, prescription = ?
            WHERE id = ?
        `);
        
        const result = stmt.run(updates.diagnosis, updates.prescription, id);
        return result.changes > 0;
    }

    static async delete(id) {
        const result = db.prepare('DELETE FROM medical_records WHERE id = ?').run(id);
        return result.changes > 0;
    }
}

module.exports = MedicalRecord; 