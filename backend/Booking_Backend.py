from flask import Blueprint, request, jsonify
import os
import uuid
from werkzeug.utils import secure_filename
import sqlite3

booking_bp = Blueprint('booking_bp', __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "smartcity.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
@booking_bp.route("/user/bookings/<string:email>", methods=["GET"])
def get_user_bookings(email):
    conn = get_connection()
    try:
        # URL decode the email if needed
        from urllib.parse import unquote
        email = unquote(email)
        
        bookings = conn.execute(
            "SELECT * FROM bookings WHERE email = ? AND is_deleted = 0 ORDER BY id DESC", 
            (email,)
        ).fetchall()
        return jsonify([dict(booking) for booking in bookings])
    except Exception as e:
        print(f"Error fetching user bookings: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@booking_bp.route("/booking", methods=["POST"])
def add_booking():
    data = request.form
    files = request.files
    conn = get_connection()
    cursor = conn.cursor()

    bed_id = data.get("bed_id")

    try:
        # 1. Check if bed is still free (Safety check)
        check = cursor.execute("SELECT status FROM beds WHERE bed_number=?", (bed_id,)).fetchone()
        if check and check['status'] != 'free':
            return jsonify({"message": "This bed was just booked by someone else. Please select another."}), 409

        # 2. Handle File Uploads
        paths = {}
        doc_keys = ['photo', 'cnic_front', 'cnic_back', 'proof_profession', 'fee_voucher', 'signature']
        for key in doc_keys:
            if key in files:
                file = files[key]
                if file.filename != '':
                    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
                    file.save(os.path.join(UPLOAD_FOLDER, filename))
                    paths[key] = filename
                else: paths[key] = None
            else: paths[key] = None

        # 3. Insert Booking
        cursor.execute("""
            INSERT INTO bookings (
                student_name, father_name, cnic, contact, email,
                profession, institute_name, emergency_contact_name,
                emergency_contact, address, check_in_date, 
                room_number, bed_id, has_vehicle, vehicle_type, 
                vehicle_number, photo_path, cnic_front_path, 
                cnic_back_path, proof_path, voucher_path, signature_path, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        """, (
            data.get("student_name"), data.get("father_name"), data.get("cnic"),
            data.get("contact"), data.get("email"), data.get("profession"),
            data.get("institute_name"), data.get("emergency_contact_name"),
            data.get("emergency_contact"), data.get("address"), data.get("check_in_date"), 
            data.get("room_number"), bed_id, data.get("has_vehicle"), 
            data.get("vehicle_type"), data.get("vehicle_number"),
            paths['photo'], paths['cnic_front'], paths['cnic_back'], 
            paths['proof_profession'], paths['fee_voucher'], paths['signature']
        ))

        # 4. Mark Bed as Reserved
        cursor.execute("UPDATE beds SET status='Reserved' WHERE bed_number=?", (bed_id,))

        conn.commit()
        return jsonify({"message": "Booking submitted successfully!"}), 201
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500
    finally:
        conn.close()