import sqlite3

def connect_db():
    return sqlite3.connect('temp.db')

def check_medical_records():
    conn = connect_db()
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='medical_records'")
    if not cursor.fetchone():
        print("\nmedical_records table does not exist")
        return
    
    # Get table structure
    print("\nMedical Records Table Structure:")
    print("-" * 60)
    cursor.execute("PRAGMA table_info(medical_records)")
    columns = cursor.fetchall()
    for col in columns:
        nullable = "NOT NULL" if col[3] else "NULL"
        pk = "PRIMARY KEY" if col[5] else ""
        print(f"Column: {col[1]}, Type: {col[2]} {nullable} {pk}")
    
    # Get all records
    print("\nMedical Records Data:")
    print("-" * 60)
    cursor.execute("SELECT * FROM medical_records")
    records = cursor.fetchall()
    
    if not records:
        print("No records found")
    else:
        for record in records:
            print(f"\nRecord ID: {record[0]}")
            print(f"Patient ID: {record[1]}")
            print(f"Doctor ID: {record[2]}")
            print(f"Diagnosis: {record[3]}")
            print(f"Prescription: {record[4]}")
            print(f"Created At: {record[5]}")
            print("-" * 60)
    
    conn.close()

if __name__ == "__main__":
    check_medical_records() 