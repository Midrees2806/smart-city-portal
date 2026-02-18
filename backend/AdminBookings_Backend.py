from flask import Blueprint, request, jsonify
import os
import uuid
import sqlite3
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from mailer_utils import send_verification_email

admin_bp = Blueprint('admin_bp', __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "smartcity.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- 1. GET ALL ACTIVE BOOKINGS ---
@admin_bp.route("/admin/bookings", methods=["GET"])
def get_bookings():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM bookings WHERE is_deleted=0 ORDER BY id DESC").fetchall()
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- 2. VERIFY RESIDENT ---
@admin_bp.route("/admin/verify/<int:id>", methods=["PATCH"])
def verify_resident(id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        booking = cursor.execute("SELECT * FROM bookings WHERE id=?", (id,)).fetchone()
        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        bed_id = booking['bed_id']
        check_bed = cursor.execute("SELECT status FROM beds WHERE bed_number=?", (bed_id,)).fetchone()
        
        if check_bed and check_bed['status'] == 'occupied':
            return jsonify({
                "message": f"❌ Conflict: Bed {bed_id} is already occupied. Re-assign bed before verifying."
            }), 409

        cursor.execute("UPDATE bookings SET status='Verified' WHERE id=?", (id,))
        cursor.execute("UPDATE beds SET status='occupied' WHERE bed_number=?", (bed_id,))
        
        email_sent = send_verification_email(dict(booking))
        conn.commit()
        return jsonify({"message": "Resident verified successfully!", "email_status": "Sent" if email_sent else "Failed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- 3. SOFT DELETE (Move to Trash) ---
@admin_bp.route("/admin/bookings/<int:id>", methods=["DELETE"])
def soft_delete_booking(id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        res = cursor.execute("SELECT bed_id FROM bookings WHERE id=?", (id,)).fetchone()
        if res and res['bed_id']:
            cursor.execute("UPDATE beds SET status='free' WHERE bed_number=?", (res['bed_id'],))
            
        # We store the current timestamp to handle 30-day auto-deletion later
        deletion_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("UPDATE bookings SET is_deleted=1, updated_at=? WHERE id=?", (deletion_date, id))
        conn.commit()
        return jsonify({"message": "Resident moved to Recycle Bin"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- 4. RECYCLE BIN OPERATIONS ---

@admin_bp.route("/admin/recycle_bin", methods=["GET"])
def get_trashed_bookings():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # 1. Check if column exists before running auto-delete to prevent 500 errors
        cursor.execute("PRAGMA table_info(bookings)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'updated_at' in columns:
            thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute("DELETE FROM bookings WHERE is_deleted=1 AND updated_at < ?", (thirty_days_ago,))
            conn.commit()

        # 2. Always fetch as list
        rows = cursor.execute("SELECT * FROM bookings WHERE is_deleted=1 ORDER BY id DESC").fetchall()
        return jsonify([dict(row) for row in rows]) # This returns [] if empty
    except Exception as e:
        print(f"Error: {e}")
        return jsonify([]), 500 # Return empty array even on error to prevent frontend crash
    finally:
        conn.close()

@admin_bp.route("/admin/restore/<int:id>", methods=["PATCH"])
def restore_booking(id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # 1. Get the resident's bed details before restoring
        resident = cursor.execute("SELECT bed_id, status FROM bookings WHERE id=?", (id,)).fetchone()
        
        if resident:
            # 2. Mark the resident as not deleted
            cursor.execute("UPDATE bookings SET is_deleted=0 WHERE id=?", (id,))
            
            # 3. If the resident was already 'Verified', their bed should be occupied again
            if resident['status'] == 'Verified' and resident['bed_id']:
                cursor.execute("UPDATE beds SET status='occupied' WHERE bed_number=?", (resident['bed_id'],))
        
        conn.commit()
        return jsonify({"message": "Resident restored successfully and bed status updated"})
    except Exception as e:
        print(f"Restore error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@admin_bp.route("/admin/permanent_delete/<int:id>", methods=["DELETE"])
def permanent_delete(id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM bookings WHERE id=?", (id,))
        conn.commit()
        return jsonify({"message": "Record permanently removed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- 5. ROOMS & UPDATES ---

@admin_bp.route("/admin/rooms_detailed", methods=["GET"])
def get_rooms_detailed():
    conn = get_connection()
    try:
        rooms = conn.execute("SELECT * FROM rooms").fetchall()
        detailed_rooms = []
        for room in rooms:
            beds = conn.execute("SELECT * FROM beds WHERE room_id=?", (room["id"],)).fetchall()
            detailed_rooms.append({
                "room_id": room["id"],
                "room_number": room["room_number"],
                "beds": [dict(b) for b in beds]
            })
        return jsonify(detailed_rooms)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- 6. REJECT BOOKING ---
@admin_bp.route("/admin/reject/<int:id>", methods=["PATCH"])
def reject_booking(id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        booking = cursor.execute("SELECT * FROM bookings WHERE id=?", (id,)).fetchone()
        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        # Update booking status to Rejected
        cursor.execute("UPDATE bookings SET status='Rejected' WHERE id=?", (id,))
        
        # If bed was reserved, free it up
        if booking['bed_id']:
            cursor.execute("UPDATE beds SET status='free' WHERE bed_number=?", (booking['bed_id'],))
        
        conn.commit()
        return jsonify({"message": "Application rejected successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()        

@admin_bp.route("/admin/bookings/<int:id>", methods=["PUT"])
def update_booking(id):
    data = request.form
    files = request.files
    conn = get_connection()
    cursor = conn.cursor()
    try:
        current = cursor.execute("SELECT * FROM bookings WHERE id=?", (id,)).fetchone()
        if not current:
            return jsonify({"message": "Resident record not found"}), 404

        new_bed_id = data.get("bed_id")
        if current['bed_id'] != new_bed_id:
            cursor.execute("UPDATE beds SET status='free' WHERE bed_number=?", (current['bed_id'],))
            if current['status'] == 'Verified':
                cursor.execute("UPDATE beds SET status='occupied' WHERE bed_number=?", (new_bed_id,))

        file_map = {
            'photo': 'photo_path', 'cnic_front': 'cnic_front_path',
            'cnic_back': 'cnic_back_path', 'proof_profession': 'proof_path',
            'fee_voucher': 'voucher_path', 'signature': 'signature_path'
        }
        
        paths = {col: current[col] for col in file_map.values()}
        for key, db_col in file_map.items():
            if key in files:
                file = files[key]
                if file.filename != '':
                    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
                    file.save(os.path.join(UPLOAD_FOLDER, filename))
                    paths[db_col] = filename

        cursor.execute("""
            UPDATE bookings SET 
            student_name=?, father_name=?, cnic=?, contact=?, email=?,
            profession=?, institute_name=?, emergency_contact_name=?,
            emergency_contact=?, address=?, check_in_date=?, 
            room_number=?, bed_id=?, has_vehicle=?, vehicle_type=?, vehicle_number=?,
            photo_path=?, cnic_front_path=?, cnic_back_path=?, 
            proof_path=?, voucher_path=?, signature_path=?
            WHERE id=?
        """, (
            data.get("student_name"), data.get("father_name"), data.get("cnic"),
            data.get("contact"), data.get("email"), data.get("profession"),
            data.get("institute_name"), data.get("emergency_contact_name"),
            data.get("emergency_contact"), data.get("address"), data.get("check_in_date"),
            data.get("room_number"), new_bed_id, data.get("has_vehicle"), 
            data.get("vehicle_type"), data.get("vehicle_number"),
            paths['photo_path'], paths['cnic_front_path'], paths['cnic_back_path'],
            paths['proof_path'], paths['voucher_path'], paths['signature_path'], 
            id
        ))
        
        conn.commit()
        return jsonify({"message": "Full Profile and Assignment Updated Successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()