const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findAll() {
        return db.prepare('SELECT id, username, email, created_at FROM users ORDER BY created_at ASC').all();
    }

    static async findByUsername(username) {
        return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    }

    static async findById(id) {
        return db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(id);
    }

    static async create(user) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const stmt = db.prepare(`
            INSERT INTO users (username, password, email, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        const result = stmt.run(user.username, hashedPassword, user.email);
        return { id: result.lastInsertRowid, username: user.username, email: user.email };
    }

    static async update(id, updates) {
        const updates_array = [];
        const values = [];
        
        if (updates.username) {
            updates_array.push('username = ?');
            values.push(updates.username);
        }
        if (updates.email) {
            updates_array.push('email = ?');
            values.push(updates.email);
        }
        if (updates.password) {
            updates_array.push('password = ?');
            values.push(await bcrypt.hash(updates.password, 10));
        }

        if (updates_array.length === 0) return false;

        values.push(id);
        const stmt = db.prepare(`
            UPDATE users 
            SET ${updates_array.join(', ')}
            WHERE id = ?
        `);
        
        const result = stmt.run(...values);
        return result.changes > 0;
    }

    static async delete(id) {
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
        return result.changes > 0;
    }

    static async validatePassword(user, password) {
        return bcrypt.compare(password, user.password);
    }
}

module.exports = User; 