import sqlite3

def connect_db():
    return sqlite3.connect('data/healthchain.db')

def check_users():
    conn = connect_db()
    cursor = conn.cursor()
    
    # Get all users ordered by ID
    cursor.execute('SELECT id, username, email, created_at FROM users ORDER BY id')
    users = cursor.fetchall()
    
    print("\nUsers in the database:")
    print("-" * 60)
    for user in users:
        print(f"Patient ID: {user[0]}")
        print(f"Username: {user[1]}")
        print(f"Email: {user[2]}")
        print(f"Created At: {user[3]}")
        print("-" * 60)
    
    conn.close()

if __name__ == "__main__":
    check_users() 