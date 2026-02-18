from flask import Blueprint, request, jsonify
import sqlite3
import os
import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ai_fee_bp = Blueprint('ai_fee', __name__)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "smartcity.db")

# Email Configuration
EMAIL_ADDRESS = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASS")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_fee_tables():
    """Initialize fee reminder tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Create fee_reminders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fee_reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT NOT NULL,
            father_name TEXT NOT NULL,
            class_room TEXT,
            amount REAL NOT NULL,
            due_date TEXT NOT NULL,
            fee_type TEXT NOT NULL,
            tone TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            admission_no TEXT,
            late_fee REAL DEFAULT 0,
            remarks TEXT,
            message_subject TEXT,
            message_body TEXT,
            status TEXT DEFAULT 'pending',
            email_sent BOOLEAN DEFAULT 0,
            email_sent_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sent_by TEXT,
            deleted BOOLEAN DEFAULT 0,
            deleted_at TIMESTAMP
        )
    ''')
    
    # Create recycle_bin table for soft deletes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fee_recycle_bin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_id INTEGER,
            student_name TEXT,
            father_name TEXT,
            amount REAL,
            due_date TEXT,
            fee_type TEXT,
            email TEXT,
            phone TEXT,
            status TEXT,
            deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            scheduled_delete TIMESTAMP,
            restored BOOLEAN DEFAULT 0,
            restored_at TIMESTAMP,
            FOREIGN KEY (original_id) REFERENCES fee_reminders (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Fee reminder tables initialized successfully.")

# Initialize tables
init_fee_tables()

def get_institution_name(fee_type):
    """Get institution name based on fee type"""
    if fee_type.lower() == 'school':
        return "NextGen School Jauharabad"
    elif fee_type.lower() == 'hostel':
        return "Smart City Hostel Jauharabad"
    return "Smart City Portal"

def generate_reminder_message(data):
    """Generate reminder message based on input data"""
    student_name = data.get('student_name', '')
    father_name = data.get('father_name', '')
    class_room = data.get('class_room', '')
    amount = data.get('amount', '0')
    due_date = data.get('due_date', '')
    fee_type = data.get('fee_type', 'School')
    tone = data.get('tone', 'formal')
    late_fee = data.get('late_fee', '0')
    admission_no = data.get('admission_no', '')
    remarks = data.get('remarks', '')
    
    # Convert string values to float for formatting
    try:
        amount_float = float(amount) if amount else 0
    except ValueError:
        amount_float = 0
        
    try:
        late_fee_float = float(late_fee) if late_fee else 0
    except ValueError:
        late_fee_float = 0
    
    # Format due date
    try:
        due_date_obj = datetime.datetime.strptime(due_date, '%Y-%m-%d')
        formatted_date = due_date_obj.strftime('%d %B %Y')
        
        # Calculate days left
        today = datetime.datetime.now()
        days_left = (due_date_obj - today).days
    except:
        formatted_date = due_date
        days_left = 0
    
    # Get institution name
    institution = get_institution_name(fee_type)
    
    # Generate subject
    subject = f"Fee Reminder: {fee_type} Fees Due for {student_name} - {institution}"
    
    # Format amounts with commas
    amount_formatted = f"{amount_float:,.0f}"
    late_fee_formatted = f"{late_fee_float:,.0f}" if late_fee_float > 0 else "0"
    
    # Generate message based on tone
    if tone == 'formal':
        message = f"Respected Mr./Ms. {father_name},\n\n"
        message += f"This is a formal reminder regarding the pending {fee_type.lower()} fees for your ward, {student_name}"
        if class_room:
            message += f" ({class_room})"
        message += f" amounting to Rs. {amount_formatted}/-.\n\n"
        message += f"The due date for payment is {formatted_date}."
        
        if days_left <= 3 and days_left > 0:
            message += f" Only {days_left} days remaining!"
        elif days_left <= 0:
            message += " The payment is overdue."
        
        if late_fee_float > 0:
            message += f"\n\nPlease note that a late fee of Rs. {late_fee_formatted}/- will be applicable after the due date."
        
        if admission_no:
            message += f"\n\nAdmission/Registration Number: {admission_no}"
        
        if remarks:
            message += f"\n\nAdditional Remarks: {remarks}"
        
        message += f"\n\nWe request you to clear the dues at the earliest to avoid any inconvenience. Payment can be made through our online portal or at the accounts office.\n\n"
        message += f"Thanking you,\nAccounts Department\n{institution}\n📞 Contact: 0300-1234567\n📧 Email: accounts@{institution.lower().replace(' ', '')}.com"
        
    elif tone == 'friendly':
        message = f"Dear {father_name},\n\n"
        message += f"Hope you're doing well! This is a friendly reminder about the {fee_type.lower()} fees for "
        message += f"{student_name}"
        if class_room:
            message += f" ({class_room})"
        message += f" of Rs. {amount_formatted}/-.\n\n"
        message += f"The payment is due on {formatted_date}."
        
        if days_left <= 3 and days_left > 0:
            message += f" Just {days_left} days left!"
        elif days_left <= 0:
            message += " The due date has passed. Please make the payment at your earliest convenience."
        
        if late_fee_float > 0:
            message += f"\n\nA late fee of Rs. {late_fee_formatted}/- will apply after the due date."
        
        message += f"\n\nYou can easily pay online through our portal or visit the accounts office. Let us know if you need any assistance!\n\n"
        message += f"Have a great day!\nThe {institution} Team\n📞 0300-1234567"
        
    else:  # strict
        message = f"URGENT: Mr./Ms. {father_name},\n\n"
        message += f"This is to bring to your notice that the {fee_type.lower()} fees for your ward, {student_name}"
        if class_room:
            message += f" ({class_room})"
        message += f" of Rs. {amount_formatted}/- is "
        if days_left <= 0:
            message += "OVERDUE"
        else:
            message += f"due on {formatted_date}"
        message += ".\n\n"
        
        if days_left <= 0:
            message += f"The payment was due on {formatted_date}. Immediate action is required."
        else:
            message += f"Only {days_left} days remaining for payment."
        
        if late_fee_float > 0:
            message += f"\n\nA late fee of Rs. {late_fee_formatted}/- has been/will be applied."
        
        message += f"\n\nPlease clear the dues immediately to avoid suspension of services. Contact the accounts office for any queries.\n\n"
        message += f"Accounts Department\n{institution}\n📞 0300-1234567"
    
    return {
        'subject': subject,
        'body': message
    }

@ai_fee_bp.route('/generate-reminder', methods=['POST', 'OPTIONS'])
def generate_reminder():
    """Generate fee reminder preview"""
    # Handle preflight OPTIONS request for CORS
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required = ['student_name', 'father_name', 'amount', 'due_date', 'email', 'fee_type']
        missing_fields = []
        for field in required:
            if field not in data or not data.get(field):
                missing_fields.append(field)
        
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Generate message
        message_data = generate_reminder_message(data)
        
        return jsonify({
            'success': True,
            'subject': message_data['subject'],
            'body': message_data['body'],
            'preview': message_data
        }), 200
        
    except Exception as e:
        print(f"Error in generate_reminder: {str(e)}")  # Log error for debugging
        return jsonify({'error': str(e)}), 500

@ai_fee_bp.route('/save-reminder', methods=['POST', 'OPTIONS'])
def save_reminder():
    """Save reminder to database"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO fee_reminders (
                student_name, father_name, class_room, amount, due_date,
                fee_type, tone, email, phone, admission_no, late_fee,
                remarks, message_subject, message_body, status, sent_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('student_name'),
            data.get('father_name'),
            data.get('class_room'),
            data.get('amount'),
            data.get('due_date'),
            data.get('fee_type'),
            data.get('tone'),
            data.get('email'),
            data.get('phone'),
            data.get('admission_no'),
            data.get('late_fee', 0),
            data.get('remarks'),
            data.get('message_subject'),
            data.get('message_body'),
            'pending',
            data.get('sent_by', 'admin')
        ))
        
        reminder_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Reminder saved successfully',
            'reminder_id': reminder_id
        }), 200
        
    except Exception as e:
        print(f"Error in save_reminder: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ai_fee_bp.route('/send-email', methods=['POST', 'OPTIONS'])
def send_email():
    """Send email reminder"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        reminder_id = data.get('reminder_id')
        recipient_email = data.get('email')
        subject = data.get('subject')
        body = data.get('body')
        fee_type = data.get('fee_type', 'School')
        
        institution = get_institution_name(fee_type)
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{institution} <{EMAIL_ADDRESS}>"
        msg['To'] = recipient_email
        msg['Subject'] = subject
        
        # HTML version
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">{institution}</h1>
            </div>
            <div style="padding: 20px;">
                {body.replace(chr(10), '<br>')}
            </div>
        </body>
        </html>
        """
        
        # Attach parts
        part1 = MIMEText(body, 'plain')
        part2 = MIMEText(html_body, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        if EMAIL_ADDRESS and EMAIL_PASSWORD:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
            server.quit()
            
            # Update database
            if reminder_id:
                conn = get_db()
                conn.execute('''
                    UPDATE fee_reminders 
                    SET email_sent = 1, email_sent_at = CURRENT_TIMESTAMP, status = 'sent'
                    WHERE id = ?
                ''', (reminder_id,))
                conn.commit()
                conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Email sent successfully'
            }), 200
        else:
            return jsonify({'error': 'Email not configured'}), 500
            
    except Exception as e:
        print(f"Error in send_email: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ai_fee_bp.route('/get-reminders', methods=['GET', 'OPTIONS'])
def get_reminders():
    """Get all reminders (not deleted)"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        conn = get_db()
        reminders = conn.execute('''
            SELECT * FROM fee_reminders 
            WHERE deleted = 0 
            ORDER BY created_at DESC 
            LIMIT 50
        ''').fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'reminders': [dict(r) for r in reminders]
        }), 200
        
    except Exception as e:
        print(f"Error in get_reminders: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ai_fee_bp.route('/get-recycle-bin', methods=['GET', 'OPTIONS'])
def get_recycle_bin():
    """Get items in recycle bin"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        conn = get_db()
        items = conn.execute('''
            SELECT * FROM fee_recycle_bin 
            WHERE restored = 0 
            ORDER BY deleted_at DESC 
            LIMIT 50
        ''').fetchall()
        conn.close()
        
        return jsonify({
            'success': True,
            'items': [dict(i) for i in items]
        }), 200
        
    except Exception as e:
        print(f"Error in get_recycle_bin: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ai_fee_bp.route('/delete-reminder', methods=['POST', 'OPTIONS'])
def delete_reminder():
    """Move reminder to recycle bin"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        reminder_id = data.get('reminder_id')
        
        conn = get_db()
        
        # Get reminder details
        reminder = conn.execute('SELECT * FROM fee_reminders WHERE id = ?', (reminder_id,)).fetchone()
        
        if not reminder:
            conn.close()
            return jsonify({'error': 'Reminder not found'}), 404
        
        # Calculate scheduled delete (30 days from now)
        scheduled_delete = datetime.datetime.now() + datetime.timedelta(days=30)
        
        # Move to recycle bin
        conn.execute('''
            INSERT INTO fee_recycle_bin (
                original_id, student_name, father_name, amount, due_date,
                fee_type, email, phone, status, scheduled_delete
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            reminder['id'],
            reminder['student_name'],
            reminder['father_name'],
            reminder['amount'],
            reminder['due_date'],
            reminder['fee_type'],
            reminder['email'],
            reminder['phone'],
            reminder['status'],
            scheduled_delete.isoformat()
        ))
        
        # Mark as deleted in main table
        conn.execute('''
            UPDATE fee_reminders 
            SET deleted = 1, deleted_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ''', (reminder_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Reminder moved to recycle bin'
        }), 200
        
    except Exception as e:
        print(f"Error in delete_reminder: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ai_fee_bp.route('/restore-reminder', methods=['POST', 'OPTIONS'])
def restore_reminder():
    """Restore reminder from recycle bin"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        recycle_id = data.get('recycle_id')
        
        conn = get_db()
        
        # Get from recycle bin
        item = conn.execute('SELECT * FROM fee_recycle_bin WHERE id = ?', (recycle_id,)).fetchone()
        
        if not item:
            conn.close()
            return jsonify({'error': 'Item not found in recycle bin'}), 404
        
        # Restore in main table
        conn.execute('''
            UPDATE fee_reminders 
            SET deleted = 0, deleted_at = NULL 
            WHERE id = ?
        ''', (item['original_id'],))
        
        # Mark as restored in recycle bin
        conn.execute('''
            UPDATE fee_recycle_bin 
            SET restored = 1, restored_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ''', (recycle_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Reminder restored successfully'
        }), 200
        
    except Exception as e:
        print(f"Error in restore_reminder: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ai_fee_bp.route('/permanent-delete', methods=['POST', 'OPTIONS'])
def permanent_delete():
    """Permanently delete from recycle bin"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        recycle_id = data.get('recycle_id')
        
        conn = get_db()
        conn.execute('DELETE FROM fee_recycle_bin WHERE id = ?', (recycle_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Item permanently deleted'
        }), 200
        
    except Exception as e:
        print(f"Error in permanent_delete: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ai_fee_bp.route('/cleanup-recycle-bin', methods=['POST', 'OPTIONS'])
def cleanup_recycle_bin():
    """Clean up recycle bin (items older than 30 days)"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        conn = get_db()
        
        # Delete items older than 30 days
        conn.execute('''
            DELETE FROM fee_recycle_bin 
            WHERE deleted_at < datetime('now', '-30 days')
        ''')
        
        deleted = conn.rowcount
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Cleaned up {deleted} items from recycle bin'
        }), 200
        
    except Exception as e:
        print(f"Error in cleanup_recycle_bin: {str(e)}")
        return jsonify({'error': str(e)}), 500