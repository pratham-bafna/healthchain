import sqlite3
import json
from datetime import datetime

def connect_db():
    return sqlite3.connect('data/healthchain.db')

def print_line(width=100):
    print('-' * width)

def print_row(columns, widths):
    row = '|'
    for col, width in zip(columns, widths):
        row += f' {str(col):<{width-2}} |'
    print(row)

def check_table_structure():
    conn = connect_db()
    cursor = conn.cursor()
    
    # Get table info for users
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    print("\nUsers Table Structure:")
    print_line()
    for col in columns:
        print(f"Column: {col[1]}, Type: {col[2]}, Required: {'Yes' if col[3] else 'No'}")
    print_line()
    
    # Get table info for medical_records
    cursor.execute("PRAGMA table_info(medical_records)")
    columns = cursor.fetchall()
    print("\nMedical Records Table Structure:")
    print_line()
    for col in columns:
        print(f"Column: {col[1]}, Type: {col[2]}, Required: {'Yes' if col[3] else 'No'}")
    print_line()
    
    conn.close()

def view_all_records():
    conn = connect_db()
    cursor = conn.cursor()
    
    # Get all records
    cursor.execute('SELECT * FROM medical_records ORDER BY created_at ASC')
    records = cursor.fetchall()
    
    if not records:
        print("No records found in the database.")
        return
    
    # Get column names
    cursor.execute("PRAGMA table_info(medical_records)")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Define column widths
    widths = [5, 10, 10, 40, 20]  # Adjust these values as needed
    
    # Print headers
    print_line(sum(widths) + len(widths) + 1)
    print_row(['ID', 'Patient', 'Doctor', 'Diagnosis', 'Created At'], widths)
    print_line(sum(widths) + len(widths) + 1)
    
    # Print records
    for record in records:
        record_dict = dict(zip(columns, record))
        formatted_time = record_dict['created_at']
        row_data = [
            record_dict['id'],
            record_dict['patient_id'],
            record_dict['doctor_id'],
            record_dict['diagnosis'][:36] + '...' if len(record_dict['diagnosis']) > 36 else record_dict['diagnosis'],
            formatted_time
        ]
        print_row(row_data, widths)
    
    print_line(sum(widths) + len(widths) + 1)
    conn.close()

def get_patient_records(patient_id):
    conn = connect_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM medical_records 
        WHERE patient_id = ? 
        ORDER BY created_at ASC
    ''', (patient_id,))
    
    records = cursor.fetchall()
    
    if not records:
        print(f"No records found for patient {patient_id}")
        return
    
    # Get column names
    cursor.execute("PRAGMA table_info(medical_records)")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Define column widths
    widths = [5, 10, 40, 20, 40]  # Adjust these values as needed
    
    # Print headers
    print_line(sum(widths) + len(widths) + 1)
    print_row(['ID', 'Doctor', 'Diagnosis', 'Created At', 'Prescription'], widths)
    print_line(sum(widths) + len(widths) + 1)
    
    # Print records
    for record in records:
        record_dict = dict(zip(columns, record))
        formatted_time = record_dict['created_at']
        row_data = [
            record_dict['id'],
            record_dict['doctor_id'],
            record_dict['diagnosis'][:36] + '...' if len(record_dict['diagnosis']) > 36 else record_dict['diagnosis'],
            formatted_time,
            record_dict['prescription'][:36] + '...' if record_dict['prescription'] and len(record_dict['prescription']) > 36 else record_dict['prescription'] or 'N/A'
        ]
        print_row(row_data, widths)
    
    print_line(sum(widths) + len(widths) + 1)
    conn.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "view":
            view_all_records()
        elif command == "patient" and len(sys.argv) >= 3:
            patient_id = sys.argv[2]
            get_patient_records(patient_id)
        elif command == "check":
            check_table_structure()
        else:
            print("Usage:")
            print("  python db_viewer.py view")
            print("  python db_viewer.py patient <patient_id>")
            print("  python db_viewer.py check")
    else:
        print("Usage:")
        print("  python db_viewer.py view")
        print("  python db_viewer.py patient <patient_id>")
        print("  python db_viewer.py check") 