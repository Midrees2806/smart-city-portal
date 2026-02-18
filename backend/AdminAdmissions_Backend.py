from flask import Blueprint, request, jsonify
import sqlite3
import os
import uuid
from datetime import datetime, timedelta
# Import the new mailer function
from mailer_utils import send_admission_verification_email 

admin_admission_bp = Blueprint('admin_admission_bp', __name__)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "smartcity.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'admissions')
MAX_FILE_SIZE = 1 * 1024 * 1024  # 1MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, label):
    if file and file.filename != '':
        if not allowed_file(file.filename):
            return None, "Invalid file type. Only images are allowed."
        
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)
        
        if size > MAX_FILE_SIZE:
            return None, "File exceeds 1MB limit."

        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}_{label}.{ext}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        return filename, None
    return None, None

# 1. GET ALL ADMISSIONS (ACTIVE ONLY)
@admin_admission_bp.route("/admin/admissions", methods=["GET"])
def get_all_admissions():
    try:
        conn = get_db_connection()
        rows = conn.execute("SELECT * FROM admissions WHERE deleted_at IS NULL ORDER BY id DESC").fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. GET RECYCLE BIN (DELETED WITHIN LAST 30 DAYS)
@admin_admission_bp.route("/admin/admissions/trash", methods=["GET"])
def get_trash_admissions():
    try:
        thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')
        conn = get_db_connection()
        rows = conn.execute("SELECT * FROM admissions WHERE deleted_at IS NOT NULL AND deleted_at >= ? ORDER BY deleted_at DESC", (thirty_days_ago,)).fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. SOFT DELETE (Move to Recycle Bin)
@admin_admission_bp.route("/admin/admissions/<int:id>", methods=["DELETE"])
def delete_admission(id):
    try:
        conn = get_db_connection()
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        conn.execute("UPDATE admissions SET deleted_at = ? WHERE id = ?", (current_time, id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Moved to Recycle Bin"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. RESTORE ADMISSION
@admin_admission_bp.route("/admin/admissions/<int:id>/restore", methods=["PUT"])
def restore_admission(id):
    try:
        conn = get_db_connection()
        conn.execute("UPDATE admissions SET deleted_at = NULL WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Record restored successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# NEW: PERMANENT DELETE (Remove from DB and Filesystem)
@admin_admission_bp.route("/admin/admissions/<int:id>/permanent", methods=["DELETE"])
def permanent_delete_admission(id):
    try:
        conn = get_db_connection()
        student = conn.execute("SELECT * FROM admissions WHERE id = ?", (id,)).fetchone()
        
        if student:
            # Delete associated files
            file_cols = ['student_photos_path', 'b_form_file_path', 'father_cnic_front_path', 
                         'father_cnic_back_path', 'school_cert_file_path', 'father_signature']
            for col in file_cols:
                file_path = student[col]
                if file_path and not file_path.startswith('data:'):
                    full_path = os.path.join(UPLOAD_FOLDER, file_path)
                    if os.path.exists(full_path):
                        os.remove(full_path)
            
            conn.execute("DELETE FROM admissions WHERE id = ?", (id,))
            conn.commit()
        
        conn.close()
        return jsonify({"message": "Record permanently deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5. UPDATE STATUS (Verify/Reject)
@admin_admission_bp.route("/admin/admissions/<int:id>/status", methods=["PUT"])
def update_status(id):
    try:
        data = request.json
        new_status = data.get('status')
        conn = get_db_connection()
        conn.execute("UPDATE admissions SET status = ? WHERE id = ?", (new_status, id))
        conn.commit()
        if new_status == "Verified":
            student = conn.execute("SELECT * FROM admissions WHERE id = ?", (id,)).fetchone()
            if student:
                student_data = dict(student)
                if student_data.get('email'):
                    send_admission_verification_email(student_data)
        conn.close()
        return jsonify({"message": f"Status updated to {new_status}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6. UPDATE ADMISSION
@admin_admission_bp.route("/admin/admissions/<int:id>", methods=["PUT"])
def update_admission(id):
    try:
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form
            files = request.files
        else:
            data = request.json
            files = {}

        conn = get_db_connection()
        fields = []
        values = []

        for key, val in data.items():
            if key not in ['id', 'status', 'father_signature', 'deleted_at']:
                fields.append(f"{key} = ?")
                values.append(val)

        file_mapping = {
            'student_photos': 'student_photos_path',
            'b_form_file': 'b_form_file_path',
            'father_cnic_front': 'father_cnic_front_path',
            'father_cnic_back': 'father_cnic_back_path',
            'school_cert_file': 'school_cert_file_path',
            'father_signature': 'father_signature'
        }

        for file_key, db_column in file_mapping.items():
            if file_key in files:
                new_filename, error = save_file(files[file_key], file_key)
                if error:
                    conn.close()
                    return jsonify({"error": f"{file_key}: {error}"}), 400
                if new_filename:
                    fields.append(f"{db_column} = ?")
                    values.append(new_filename)

        if not fields:
            conn.close()
            return jsonify({"message": "No changes detected"}), 200

        values.append(id)
        query = f"UPDATE admissions SET {', '.join(fields)} WHERE id = ?"
        conn.execute(query, values)
        conn.commit()
        conn.close()
        return jsonify({"message": "Successfully updated!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500