# import sqlite3
# import os

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DB_PATH = os.path.join(BASE_DIR, "smartcity.db")

# def check_users():
#     conn = sqlite3.connect(DB_PATH)
#     conn.row_factory = sqlite3.Row
#     cursor = conn.cursor()
    
#     print(f"Checking database at: {DB_PATH}")
#     try:
#         users = cursor.execute("SELECT id, full_name, email, password, role FROM users").fetchall()
#         if not users:
#             print("❌ No users found in the database!")
#         for user in users:
#             print(f"ID: {user['id']} | Name: {user['full_name']} | Email: {user['email']} | Pass: {user['password']} | Role: {user['role']}")
#     except sqlite3.OperationalError as e:
#         print(f"❌ Error: {e} (Does the 'users' table exist?)")
#     finally:
#         conn.close()

# if __name__ == "__main__":
#     check_users()

# Run this in Python shell or create a script
from werkzeug.security import generate_password_hash
import sqlite3

conn = sqlite3.connect('smartcity.db')
cursor = conn.cursor()

# Create admin for hostel
cursor.execute('''
    INSERT INTO users (full_name, email, password, role, category)
    VALUES (?, ?, ?, ?, ?)
''', ('Hostel Admin', 'hosteladmin@smartcity.com', generate_password_hash('admin123'), 'admin', 'hostel'))

# Create admin for school
cursor.execute('''
    INSERT INTO users (full_name, email, password, role, category)
    VALUES (?, ?, ?, ?, ?)
''', ('School Admin', 'schooladmin@smartcity.com', generate_password_hash('admin123'), 'admin', 'school'))

conn.commit()
conn.close()