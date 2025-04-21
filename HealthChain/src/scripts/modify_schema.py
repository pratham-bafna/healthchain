import sqlite3

def connect_db():
    return sqlite3.connect('data/healthchain.db')

def modify_schema():
    conn = connect_db()
    cursor = conn.cursor()
    
    # Drop the existing medical_records table
    cursor.execute('DROP TABLE IF EXISTS medical_records')
    
    # Create medical_records table without foreign key constraint on doctor_id
    cursor.execute('''
        CREATE TABLE medical_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            diagnosis TEXT NOT NULL,
            prescription TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES users(id)
        )
    ''')
    
    print("Successfully modified the database schema")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    modify_schema() 