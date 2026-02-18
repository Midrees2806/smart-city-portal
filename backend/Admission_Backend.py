from flask import Blueprint, request, jsonify
import sqlite3
import os
import uuid
from werkzeug.utils import secure_filename

admission_bp = Blueprint('admission_bp', __name__)

# Configuration for file storage
UPLOAD_FOLDER = 'uploads/admissions'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 1 * 1024 * 1024  # 1 MB in bytes

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_db_connection():
    conn = sqlite3.connect("smartcity.db")
    conn.row_factory = sqlite3.Row
    return conn

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, label):
    if file and file.filename != '':
        # Check file extension
        if not allowed_file(file.filename):
            raise ValueError(f"Invalid file type for {label}. Only JPG, JPEG, and PNG are allowed.")
        
        # Check file size server-side
        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0) # Reset file pointer after checking size
        
        if size > MAX_FILE_SIZE:
            raise ValueError(f"File {label} exceeds the 1MB size limit.")

        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}_{label}.{ext}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        return filename
    return None

@admission_bp.route("/admission", methods=["POST"])
def submit_admission():
    try:
        # 1. Collect Text Data
        data = request.form
        
        # 2. Collect and Save Files with validation
        files = request.files
        try:
            f_cnic_front = save_file(files.get('father_cnic_front'), 'cnic_front')
            f_cnic_back = save_file(files.get('father_cnic_back'), 'cnic_back')
            s_photo = save_file(files.get('student_photos'), 'student_photo')
            b_form = save_file(files.get('b_form_file'), 'b_form')
            s_cert = save_file(files.get('school_cert_file'), 'school_cert')
        except ValueError as ve:
            return jsonify({"message": str(ve)}), 400

        # 3. Database Insertion
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
        INSERT INTO admissions (
            admission_class, admission_date, student_name, gender, dob, 
            religion, b_form_no, father_name, father_cnic, father_occupation,
            mother_name, mother_education, monthly_income, contact_no, 
            home_address, postal_address, has_disability, major_disability,
            additional_disability, disability_cert_no, emergency_contact,
            prev_school_details, leaving_reason, email, father_signature,
            father_cnic_front_path, father_cnic_back_path, student_photos_path,
            b_form_file_path, school_cert_file_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        params = (
            data.get('admission_class'), data.get('admission_date'), data.get('student_name'),
            data.get('gender'), data.get('dob'), data.get('religion'), 
            data.get('b_form_no'), data.get('father_name'), data.get('father_cnic'),
            data.get('father_occupation'), data.get('mother_name'), data.get('mother_education'),
            data.get('monthly_income'), data.get('contact_no'), data.get('home_address'),
            data.get('postal_address'), data.get('has_disability'), data.get('major_disability'),
            data.get('additional_disability'), data.get('disability_cert_no'), data.get('emergency_contact'),
            data.get('prev_school_details'), data.get('leaving_reason'), data.get('email'),
            data.get('father_signature'), # Storing the Base64 canvas data
            f_cnic_front, f_cnic_back, s_photo, b_form, s_cert
        )

        cursor.execute(query, params)
        conn.commit()
        conn.close()

        return jsonify({"message": "Application submitted successfully!"}), 201

    except Exception as e:
        print(f"Submission Error: {str(e)}")
        return jsonify({"message": "Failed to submit application", "error": str(e)}), 500

@admission_bp.route("/admin/admissions", methods=["GET"])
def get_admissions():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM admissions ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@admission_bp.route("/admin/admissions/<int:id>", methods=["DELETE"])
def delete_admission(id):
    conn = get_db_connection()
    conn.execute("DELETE FROM admissions WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Record deleted"}), 200