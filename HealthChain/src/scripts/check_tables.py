import sqlite3

def check_tables():
    conn = sqlite3.connect('temp.db')
    cursor = conn.cursor()
    
    # Get list of tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("\nTables in the database:")
    for table in tables:
        table_name = table[0]
        print("\n" + "=" * 50)
        print(f"Table: {table_name}")
        print("=" * 50)
        
        # Get table schema
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print("\nColumns:")
        for col in columns:
            nullable = "NOT NULL" if col[3] else "NULL"
            pk = "PRIMARY KEY" if col[5] else ""
            print(f"  - {col[1]}: {col[2]} {nullable} {pk}")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"\nNumber of rows: {count}")
        
        # Show sample data if any exists
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
            sample = cursor.fetchone()
            print("\nSample row:")
            cursor.execute(f"PRAGMA table_info({table_name})")
            cols = cursor.fetchall()
            for i, value in enumerate(sample):
                print(f"  {cols[i][1]}: {value}")
    
    conn.close()

if __name__ == "__main__":
    check_tables() 