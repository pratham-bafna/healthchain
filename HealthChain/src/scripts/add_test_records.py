import sqlite3

def connect_db():
    return sqlite3.connect('temp.db')

def add_test_records():
    conn = connect_db()
    cursor = conn.cursor()
    
    # Test records with different doctor IDs
    test_records = [
        (1, 1, "Common Cold", "Rest and fluids"),
        (1, 2, "Flu", "Antiviral medication"),
        (1, 3, "Headache", "Painkillers"),
        (1, 4, "Allergies", "Antihistamines"),
        (1, 5, "Check-up", "All good")
    ]
    
    # Add each record
    for patient_id, doctor_id, diagnosis, prescription in test_records:
        cursor.execute('''
            INSERT INTO medical_records 
            (patient_id, doctor_id, diagnosis, prescription, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (patient_id, doctor_id, diagnosis, prescription))
        print(f"Added record: Patient {patient_id}, Doctor {doctor_id}")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    add_test_records() 