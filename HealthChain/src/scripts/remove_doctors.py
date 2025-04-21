import sqlite3

def connect_db():
    return sqlite3.connect('data/healthchain.db')

def remove_doctors():
    conn = connect_db()
    cursor = conn.cursor()
    
    # Delete users with 'doctor' in their username
    cursor.execute("DELETE FROM users WHERE username LIKE '%doctor%'")
    deleted_count = cursor.rowcount
    
    print(f"\nRemoved {deleted_count} users with 'doctor' in their username")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    remove_doctors() 