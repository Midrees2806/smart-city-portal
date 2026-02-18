# import sqlite3

# def init_user_db():
#     conn = sqlite3.connect('smartcity.db')
#     cursor = conn.cursor()
#     # Create users table
#     cursor.execute('''
#         CREATE TABLE IF NOT EXISTS users (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             full_name TEXT NOT NULL,
#             email TEXT UNIQUE NOT NULL,
#             password TEXT NOT NULL,
#             role TEXT DEFAULT 'user',      -- 'admin' or 'user'
#             category TEXT NOT NULL         -- 'hostel' or 'school'
#         )
#     ''')
#     conn.commit()
#     conn.close()

# if __name__ == "__main__":
#     init_user_db()
#     print("User table initialized successfully.")

# import sqlite3
# import os
# import datetime

# DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "smartcity.db")

# def fix_database():
#     """Fix the users table by adding missing columns"""
#     print("="*50)
#     print("🔧 DATABASE FIX UTILITY")
#     print("="*50)
    
#     # Connect to database
#     conn = sqlite3.connect(DB_PATH)
#     cursor = conn.cursor()
    
#     # Check if users table exists
#     cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
#     if not cursor.fetchone():
#         print("❌ Users table doesn't exist! Creating it...")
#         cursor.execute('''
#             CREATE TABLE users (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 full_name TEXT NOT NULL,
#                 email TEXT UNIQUE NOT NULL,
#                 password TEXT NOT NULL,
#                 role TEXT DEFAULT 'user',
#                 category TEXT NOT NULL,
#                 mobile TEXT,
#                 created_at TIMESTAMP,
#                 last_login TIMESTAMP
#             )
#         ''')
#         print("✅ Users table created successfully!")
        
#         # Set created_at for any existing rows (none yet)
#         cursor.execute("UPDATE users SET created_at = ? WHERE created_at IS NULL", 
#                       (datetime.datetime.now(),))
        
#     else:
#         # Get existing columns
#         cursor.execute("PRAGMA table_info(users)")
#         columns = cursor.fetchall()
#         column_names = [col[1] for col in columns]
        
#         print(f"📊 Existing columns: {column_names}")
        
#         # Add missing columns
#         columns_added = []
        
#         if 'mobile' not in column_names:
#             try:
#                 cursor.execute('ALTER TABLE users ADD COLUMN mobile TEXT')
#                 columns_added.append('mobile')
#                 print("  → Added 'mobile' column")
#             except sqlite3.OperationalError as e:
#                 print(f"  ⚠️ Could not add mobile: {e}")
        
#         if 'created_at' not in column_names:
#             try:
#                 # Add column without DEFAULT first
#                 cursor.execute('ALTER TABLE users ADD COLUMN created_at TIMESTAMP')
#                 columns_added.append('created_at')
#                 print("  → Added 'created_at' column")
                
#                 # Now update existing records with current timestamp
#                 cursor.execute("UPDATE users SET created_at = ? WHERE created_at IS NULL", 
#                               (datetime.datetime.now(),))
#                 print(f"  → Updated {cursor.rowcount} records with current timestamp")
                
#             except sqlite3.OperationalError as e:
#                 print(f"  ⚠️ Could not add created_at: {e}")
        
#         if 'last_login' not in column_names:
#             try:
#                 cursor.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP')
#                 columns_added.append('last_login')
#                 print("  → Added 'last_login' column")
#             except sqlite3.OperationalError as e:
#                 print(f"  ⚠️ Could not add last_login: {e}")
        
#         if columns_added:
#             print(f"✅ Added columns: {', '.join(columns_added)}")
#         else:
#             print("✅ All columns already exist!")
    
#     # Verify the fix
#     cursor.execute("PRAGMA table_info(users)")
#     updated_columns = cursor.fetchall()
#     print(f"\n📊 Updated columns: {[col[1] for col in updated_columns]}")
    
#     # Show some data
#     cursor.execute("SELECT id, email, created_at FROM users LIMIT 5")
#     users = cursor.fetchall()
#     if users:
#         print("\n👤 Sample users:")
#         for user in users:
#             created = user[2] if user[2] else "Not set"
#             print(f"   ID: {user[0]}, Email: {user[1]}, Created: {created}")
#     else:
#         print("\n👤 No users found in database.")
    
#     conn.commit()
#     conn.close()
    
#     print("\n" + "="*50)
#     print("✅ Database fix completed!")
#     print("="*50)

# def verify_fix():
#     """Verify that all columns are accessible"""
#     print("\n🔍 VERIFYING FIX...")
#     conn = sqlite3.connect(DB_PATH)
#     conn.row_factory = sqlite3.Row
#     cursor = conn.cursor()
    
#     try:
#         # Try to query with all columns
#         cursor.execute('''
#             SELECT id, full_name, email, mobile, role, category, created_at, last_login 
#             FROM users LIMIT 1
#         ''')
#         result = cursor.fetchone()
#         if result:
#             print("✅ Successfully queried all columns!")
#             print(f"   Sample data: {dict(result)}")
#         else:
#             print("✅ Table structure is correct (no data yet)")
            
#     except sqlite3.OperationalError as e:
#         print(f"❌ Verification failed: {e}")
#     finally:
#         conn.close()

# def create_test_user():
#     """Create a test user to verify everything works"""
#     print("\n🧪 CREATING TEST USER...")
#     conn = sqlite3.connect(DB_PATH)
#     cursor = conn.cursor()
    
#     try:
#         from werkzeug.security import generate_password_hash
        
#         # Check if test user already exists
#         cursor.execute("SELECT id FROM users WHERE email = ?", ("test@example.com",))
#         if cursor.fetchone():
#             print("⚠️ Test user already exists")
#         else:
#             # Create test user
#             hashed_password = generate_password_hash("Test@123")
#             cursor.execute('''
#                 INSERT INTO users (full_name, email, password, role, category, mobile, created_at)
#                 VALUES (?, ?, ?, ?, ?, ?, ?)
#             ''', (
#                 "Test User",
#                 "test@example.com",
#                 hashed_password,
#                 "user",
#                 "hostel",
#                 "+1234567890",
#                 datetime.datetime.now()
#             ))
#             conn.commit()
#             print("✅ Test user created successfully!")
#             print("   Email: test@example.com")
#             print("   Password: Test@123")
            
#     except Exception as e:
#         print(f"❌ Failed to create test user: {e}")
#     finally:
#         conn.close()

# if __name__ == "__main__":
#     fix_database()
#     verify_fix()
    
#     # Ask if user wants to create a test user
#     response = input("\n❓ Create a test user? (yes/no): ").lower()
#     if response == 'yes' or response == 'y':
#         create_test_user()

# import sqlite3
# import os

# DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "smartcity.db")

# def update_database_schema():
#     """Update database schema to allow same email with different categories"""
    
#     print("="*60)
#     print("🔧 DATABASE SCHEMA UPDATE UTILITY")
#     print("="*60)
#     print(f"Database path: {DB_PATH}")
#     print("-"*60)
    
#     # Connect to database
#     conn = sqlite3.connect(DB_PATH)
#     cursor = conn.cursor()
    
#     try:
#         # Step 1: Check current schema
#         print("\n📊 Checking current database schema...")
#         cursor.execute("PRAGMA table_info(users)")
#         columns = cursor.fetchall()
#         print(f"Current columns in users table: {[col[1] for col in columns]}")
        
#         # Step 2: Check existing unique constraints
#         cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
#         create_stmt = cursor.fetchone()
#         if create_stmt:
#             print(f"\nCurrent CREATE statement: {create_stmt[0]}")
        
#         # Step 3: Check for duplicate email-category combinations (data quality check)
#         print("\n🔍 Checking for existing data issues...")
#         cursor.execute("""
#             SELECT email, category, COUNT(*) as count 
#             FROM users 
#             GROUP BY email, category 
#             HAVING COUNT(*) > 1
#         """)
#         duplicates = cursor.fetchall()
        
#         if duplicates:
#             print("⚠️ Found duplicate email-category combinations:")
#             for dup in duplicates:
#                 print(f"   - {dup[0]} ({dup[1]}) appears {dup[2]} times")
#             print("\nPlease resolve duplicates before proceeding.")
#             choice = input("Continue anyway? (yes/no): ").lower()
#             if choice != 'yes':
#                 print("❌ Operation cancelled.")
#                 return
#         else:
#             print("✅ No duplicate email-category combinations found.")
        
#         # Step 4: Create backup of existing data
#         print("\n💾 Creating backup of existing data...")
#         cursor.execute("SELECT * FROM users")
#         users_data = cursor.fetchall()
#         print(f"✅ Backed up {len(users_data)} user records")
        
#         # Step 5: Create new table with composite unique constraint
#         print("\n🔄 Creating new table with composite unique constraint...")
#         cursor.execute("""
#             CREATE TABLE users_new (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 full_name TEXT NOT NULL,
#                 email TEXT NOT NULL,
#                 password TEXT NOT NULL,
#                 role TEXT DEFAULT 'user',
#                 category TEXT NOT NULL,
#                 mobile TEXT,
#                 last_login TIMESTAMP,
#                 created_at TIMESTAMP,
#                 UNIQUE(email, category)
#             )
#         """)
#         print("✅ New table created successfully")
        
#         # Step 6: Copy data to new table
#         print("\n📋 Copying data to new table...")
#         cursor.execute("""
#             INSERT INTO users_new (id, full_name, email, password, role, category, mobile, last_login, created_at)
#             SELECT id, full_name, email, password, role, category, mobile, last_login, created_at FROM users
#         """)
#         rows_copied = cursor.rowcount
#         print(f"✅ Copied {rows_copied} records to new table")
        
#         # Step 7: Drop old table
#         print("\n🗑️ Dropping old users table...")
#         cursor.execute("DROP TABLE users")
#         print("✅ Old table dropped")
        
#         # Step 8: Rename new table
#         print("\n📝 Renaming new table to users...")
#         cursor.execute("ALTER TABLE users_new RENAME TO users")
#         print("✅ Table renamed successfully")
        
#         # Step 9: Verify the new schema
#         print("\n🔍 Verifying new schema...")
#         cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
#         new_create_stmt = cursor.fetchone()
#         print(f"New CREATE statement: {new_create_stmt[0]}")
        
#         # Step 10: Test the unique constraint
#         print("\n🧪 Testing unique constraint...")
#         try:
#             # Try to insert a duplicate (should fail - this is just a test, will be rolled back)
#             test_data = users_data[0] if users_data else None
#             if test_data:
#                 cursor.execute("""
#                     INSERT INTO users (full_name, email, password, role, category)
#                     VALUES (?, ?, ?, ?, ?)
#                 """, (test_data[1], test_data[2], test_data[3], test_data[4], test_data[5]))
#                 print("❌ Warning: Unique constraint not working!")
#                 conn.rollback()
#             else:
#                 print("⚠️ No test data available for constraint testing")
#         except sqlite3.IntegrityError as e:
#             print(f"✅ Unique constraint working correctly: {e}")
        
#         # Commit all changes
#         conn.commit()
#         print("\n" + "="*60)
#         print("✅ DATABASE SCHEMA UPDATED SUCCESSFULLY!")
#         print("="*60)
#         print("\n📝 Summary of changes:")
#         print("   - Removed UNIQUE constraint on email")
#         print("   - Added composite UNIQUE constraint on (email, category)")
#         print("   - Now same email can be used for different categories")
#         print("   - Cannot register same category twice with same email")
        
#     except Exception as e:
#         print(f"\n❌ Error: {e}")
#         print("Rolling back changes...")
#         conn.rollback()
#         print("✅ Rollback complete")
        
#     finally:
#         conn.close()
#         print("\n🔚 Database connection closed")

# def verify_schema():
#     """Verify the updated schema"""
#     print("\n" + "="*60)
#     print("🔍 VERIFYING UPDATED SCHEMA")
#     print("="*60)
    
#     conn = sqlite3.connect(DB_PATH)
#     cursor = conn.cursor()
    
#     try:
#         # Check table structure
#         cursor.execute("PRAGMA table_info(users)")
#         columns = cursor.fetchall()
#         print("\n📊 Current users table columns:")
#         for col in columns:
#             print(f"   - {col[1]} ({col[2]})")
        
#         # Check constraints
#         cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
#         create_stmt = cursor.fetchone()
#         print(f"\n📝 Table definition:")
#         print(f"   {create_stmt[0]}")
        
#         # Show sample data
#         cursor.execute("SELECT id, email, category FROM users LIMIT 5")
#         sample_data = cursor.fetchall()
#         print(f"\n👤 Sample data ({len(sample_data)} records):")
#         for row in sample_data:
#             print(f"   - ID: {row[0]}, Email: {row[1]}, Category: {row[2]}")
        
#         # Show unique email-category combinations
#         cursor.execute("""
#             SELECT email, COUNT(DISTINCT category) as categories
#             FROM users
#             GROUP BY email
#             HAVING COUNT(DISTINCT category) > 1
#             LIMIT 5
#         """)
#         multi_category = cursor.fetchall()
#         if multi_category:
#             print(f"\n📧 Users with multiple categories:")
#             for row in multi_category:
#                 print(f"   - {row[0]} has {row[1]} categories")
        
#     except Exception as e:
#         print(f"❌ Verification error: {e}")
#     finally:
#         conn.close()

# if __name__ == "__main__":
#     print("\n🚀 Starting database schema update...\n")
    
#     # Confirm with user
#     print("⚠️  WARNING: This script will modify your database schema.")
#     print("   - It will remove the UNIQUE constraint on email")
#     print("   - It will add a composite UNIQUE constraint on (email, category)")
#     print("   - Your existing data will be preserved")
#     print("   - It's recommended to backup your database first\n")
    
#     choice = input("Do you want to proceed? (yes/no): ").lower()
    
#     if choice == 'yes':
#         update_database_schema()
#         verify_schema()
#         print("\n✨ Script execution complete!")
#     else:
#         print("❌ Operation cancelled.")

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "smartcity.db")

def migrate_existing_users():
    """Migrate existing users to new schema and allow registrations for other categories"""
    
    print("="*60)
    print("🔧 DATABASE MIGRATION UTILITY")
    print("="*60)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Step 1: Check current schema
        print("\n📊 Checking current database schema...")
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        print(f"Current columns: {[col[1] for col in columns]}")
        
        # Step 2: Count existing users
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"\n👤 Total existing users: {user_count}")
        
        # Step 3: Check for users with same email (should be none currently)
        cursor.execute("""
            SELECT email, COUNT(*) as count 
            FROM users 
            GROUP BY email 
            HAVING COUNT(*) > 1
        """)
        duplicates = cursor.fetchall()
        
        if duplicates:
            print("\n⚠️ Found users with same email:")
            for dup in duplicates:
                print(f"   - {dup[0]} appears {dup[1]} times")
        else:
            print("\n✅ No duplicate emails found (good!)")
        
        # Step 4: Show current email-category combinations
        print("\n📧 Current email-category combinations:")
        cursor.execute("""
            SELECT email, category, COUNT(*) 
            FROM users 
            GROUP BY email, category
            ORDER BY email
            LIMIT 10
        """)
        combinations = cursor.fetchall()
        for combo in combinations:
            print(f"   - {combo[0]} : {combo[1]}")
        
        # Step 5: Create new table with composite unique constraint
        print("\n🔄 Creating new table with composite unique constraint...")
        cursor.execute("""
            CREATE TABLE users_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                category TEXT NOT NULL,
                mobile TEXT,
                last_login TIMESTAMP,
                created_at TIMESTAMP,
                UNIQUE(email, category)
            )
        """)
        print("✅ New table created")
        
        # Step 6: Copy all existing data
        print("\n📋 Copying existing users to new table...")
        cursor.execute("""
            INSERT INTO users_new (id, full_name, email, password, role, category, mobile, last_login, created_at)
            SELECT id, full_name, email, password, role, category, mobile, last_login, created_at FROM users
        """)
        copied = cursor.rowcount
        print(f"✅ Copied {copied} users to new table")
        
        # Step 7: Drop old table
        print("\n🗑️ Dropping old users table...")
        cursor.execute("DROP TABLE users")
        print("✅ Old table dropped")
        
        # Step 8: Rename new table
        print("\n📝 Renaming new table to users...")
        cursor.execute("ALTER TABLE users_new RENAME TO users")
        print("✅ New table renamed")
        
        # Step 9: Verify the migration
        print("\n🔍 Verifying migration...")
        cursor.execute("SELECT COUNT(*) FROM users")
        new_count = cursor.fetchone()[0]
        print(f"✅ Users in new table: {new_count} (matches original: {new_count == user_count})")
        
        # Step 10: Test the new constraint
        print("\n🧪 Testing new unique constraint...")
        
        # Get a sample user to test
        cursor.execute("SELECT email, category FROM users LIMIT 1")
        sample = cursor.fetchone()
        
        if sample:
            test_email, test_category = sample
            try:
                # Try to insert duplicate (should fail)
                cursor.execute("""
                    INSERT INTO users (full_name, email, password, category)
                    VALUES (?, ?, ?, ?)
                """, ("Test User", test_email, "testpass123", test_category))
                print("❌ Warning: Unique constraint not working!")
                conn.rollback()
            except sqlite3.IntegrityError as e:
                print(f"✅ Unique constraint working: {e}")
        
        # Commit all changes
        conn.commit()
        print("\n" + "="*60)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
        print("="*60)
        
        print("\n📝 What changed:")
        print("   ✅ All existing users preserved")
        print("   ✅ Now each email can have up to 2 accounts (hostel + school)")
        print("   ✅ Cannot register same category twice with same email")
        print("\n📧 Example:")
        print("   - user@email.com (hostel) - existing record")
        print("   - user@email.com (school) - can register now")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Rolling back changes...")
        conn.rollback()
        print("✅ Rollback complete")
        
    finally:
        conn.close()

def show_registration_options():
    """Show what users can now do"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("📋 REGISTRATION OPTIONS FOR EXISTING USERS")
    print("="*60)
    
    try:
        # Get all users with their categories
        cursor.execute("""
            SELECT email, GROUP_CONCAT(category) as categories
            FROM users
            GROUP BY email
            ORDER BY email
        """)
        users = cursor.fetchall()
        
        for user in users:
            email, categories = user
            categories_list = categories.split(',')
            
            print(f"\n👤 {email}")
            print(f"   Currently registered for: {', '.join(categories_list)}")
            
            if 'hostel' not in categories_list:
                print(f"   ✅ Can register for: Hostel Booking")
            if 'school' not in categories_list:
                print(f"   ✅ Can register for: School Admission")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("\n🚀 Starting database migration...\n")
    
    print("⚠️  This script will:")
    print("   ✅ Preserve ALL existing user records")
    print("   ✅ Allow existing users to register for the OTHER category")
    print("   ✅ Prevent duplicate registrations for same category")
    print("   ❌ NOT delete any existing data\n")
    
    choice = input("Do you want to proceed? (yes/no): ").lower()
    
    if choice == 'yes':
        migrate_existing_users()
        show_registration_options()
        print("\n✨ Migration complete! Existing users can now register for the other category.")
    else:
        print("❌ Operation cancelled.")