import sqlite3
import os

def init_db():
    db_path = "smartcity.db"
    
    # Wipe the DB and start fresh to ensure schema matches the new React fields
    if os.path.exists(db_path):
        os.remove(db_path)
        print("🗑️ Existing database removed for fresh start.")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Enable Foreign Key Support
    cursor.execute("PRAGMA foreign_keys = ON")

    # 1. Admissions Table (Updated for full Admission.js compatibility)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admission_class TEXT,
        admission_date TEXT,
        student_name TEXT NOT NULL,
        gender TEXT,
        dob TEXT,
        religion TEXT,
        b_form_no TEXT,
        father_name TEXT,
        father_cnic TEXT,
        father_occupation TEXT,
        mother_name TEXT,
        mother_education TEXT,
        monthly_income TEXT,
        contact_no TEXT,
        home_address TEXT,
        postal_address TEXT,
        has_disability TEXT,
        major_disability TEXT,
        additional_disability TEXT,
        disability_cert_no TEXT,
        emergency_contact TEXT,
        prev_school_details TEXT,
        leaving_reason TEXT,
        email TEXT,
        father_signature TEXT,              -- Stores Base64 Data URL
        father_cnic_front_path TEXT,        -- File path
        father_cnic_back_path TEXT,         -- File path
        student_photos_path TEXT,           -- File path
        b_form_file_path TEXT,              -- File path
        school_cert_file_path TEXT,         -- File path
        status TEXT DEFAULT 'Pending'
    )""")

    # 2. Bookings Table (Fully synced with React Form & Preview)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name TEXT NOT NULL,
        father_name TEXT,
        cnic TEXT,
        contact TEXT,
        email TEXT,                     -- Added to match React
        profession TEXT,                -- Added to match React
        institute_name TEXT,            -- Added to match React
        emergency_contact_name TEXT,    -- Added to match React
        emergency_contact TEXT,
        address TEXT,
        check_in_date TEXT,
        security_deposit REAL DEFAULT 0,
        room_number TEXT,
        bed_id TEXT,                    -- Matches 'R1-B1' format
        has_vehicle TEXT,
        vehicle_type TEXT,
        vehicle_number TEXT,
        status TEXT DEFAULT 'Pending',
        photo_path TEXT,
        cnic_front_path TEXT,
        cnic_back_path TEXT,
        proof_path TEXT,
        voucher_path TEXT,
        signature_path TEXT
    )""")

    # 3. Rooms Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number TEXT UNIQUE NOT NULL,
        total_beds INTEGER NOT NULL
    )""")

    # 4. Beds Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS beds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        bed_number TEXT UNIQUE NOT NULL, -- Format: R1-B1, R1-B2, etc.
        status TEXT DEFAULT 'free',
        FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )""")
    
    # --- SEEDING INITIAL DATA ---
    print("🌱 Seeding 30 rooms and 90 beds...")

    for i in range(1, 31):
        rm_num = str(i)
        # Insert room
        cursor.execute("INSERT INTO rooms (room_number, total_beds) VALUES (?, ?)", (rm_num, 3))
        room_id = cursor.lastrowid
        
        # Insert 3 beds for each room to match React grid
        for b in range(1, 4):
            bed_label = f"R{rm_num}-B{b}"
            cursor.execute("""
                INSERT INTO beds (room_id, bed_number, status)
                VALUES (?, ?, 'free')
            """, (room_id, bed_label))

    conn.commit()
    conn.close()
    
    print("--------------------------------------------------")
    print("✅ Database Initialized Successfully!")
    print("✅ Schema synced with React Frontend (Admissions & Bookings)")
    print("✅ 30 Rooms and 90 Beds seeded.")
    print("--------------------------------------------------")

if __name__ == "__main__":
    init_db()