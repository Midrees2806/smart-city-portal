from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os
import sqlite3

# Import both blueprints
from Booking_Backend import booking_bp
from AdminBookings_Backend import admin_bp
from Admission_Backend import admission_bp
from AdminAdmissions_Backend import admin_admission_bp
from auth import auth_bp  # NEW: Import auth blueprint
from ai_fee_reminder import ai_fee_bp

app = Flask(__name__)
CORS(app)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
# --- ADDED: Path for Admission Documents ---
ADMISSION_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'admissions')
DB_PATH = os.path.join(BASE_DIR, "smartcity.db")

# Ensure upload directories exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
# --- ADDED: Ensure Admission folder exists ---
if not os.path.exists(ADMISSION_UPLOAD_FOLDER):
    os.makedirs(ADMISSION_UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ADMISSION_UPLOAD_FOLDER'] = ADMISSION_UPLOAD_FOLDER

# Register Blueprints - EACH BLUEPRINT ONLY ONCE
app.register_blueprint(auth_bp, url_prefix='/auth')  # Auth blueprint
app.register_blueprint(admission_bp)  # Admission blueprint
app.register_blueprint(booking_bp)  # Booking blueprint
app.register_blueprint(admin_bp)  # Admin bookings blueprint
app.register_blueprint(admin_admission_bp)  # Admin admission blueprint - REGISTERED ONLY ONCE
app.register_blueprint(ai_fee_bp, url_prefix='/ai')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/", methods=["GET"])
def home():
    return "Smart City Backend is Running!"

# Serves standard booking images
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- ADDED: Serves admission documents (CNIC, B-Form, etc.) ---
@app.route('/uploads/admissions/<filename>')
def serve_admission_files(filename):
    return send_from_directory(app.config['ADMISSION_UPLOAD_FOLDER'], filename)

# Room/Bed fetching for the Frontend Grid (Your existing code)
@app.route("/rooms", methods=["GET"])
def get_rooms():
    conn = get_connection()
    try:
        rooms = conn.execute("SELECT * FROM rooms").fetchall()
        result = []
        for room in rooms:
            beds = conn.execute("SELECT status FROM beds WHERE room_id=?", (room["id"],)).fetchall()
            free = sum(1 for b in beds if b["status"] == "free")
            status = "full" if free == 0 else "free" if free == room["total_beds"] else "partial"
            result.append({
                "room_id": room["id"], 
                "room_number": room["room_number"], 
                "total_beds": room["total_beds"], 
                "free_beds": free, 
                "status": status
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route("/rooms/<int:room_id>/beds", methods=["GET"])
def get_beds(room_id):
    conn = get_connection()
    beds = conn.execute("SELECT id, bed_number, status FROM beds WHERE room_id=?", (room_id,)).fetchall()
    conn.close()
    return jsonify([dict(b) for b in beds])

if __name__ == "__main__":
    app.run(debug=True, port=5000)