import random
import string
import smtplib
import time
import sqlite3
import os
import datetime
import jwt
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from collections import defaultdict

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "smartcity.db")

# Email Configuration (Use environment variables or defaults for development)
EMAIL_ADDRESS = os.getenv("EMAIL_USER")  # Replace or set env var
EMAIL_PASSWORD = os.getenv("EMAIL_PASS")    # Replace or set env var
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# Rate limiting tracker
otp_request_tracker = defaultdict(list)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_otp_tables():
    """Initialize OTP related tables and ensure users table has all columns"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Create OTP table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS otp_verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            mobile TEXT,
            otp_code TEXT NOT NULL,
            purpose TEXT NOT NULL,
            user_id INTEGER,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT 0,
            attempts INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Check users table columns and add missing ones
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    # Add mobile column to users table if not exists
    if 'mobile' not in column_names:
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN mobile TEXT')
            print("✅ Added 'mobile' column to users table")
        except sqlite3.OperationalError:
            pass
    
    # Add last_login column if not exists
    if 'last_login' not in column_names:
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP')
            print("✅ Added 'last_login' column to users table")
        except sqlite3.OperationalError:
            pass
    
    # Add created_at column if not exists
    if 'created_at' not in column_names:
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
            print("✅ Added 'created_at' column to users table")
        except sqlite3.OperationalError:
            pass
    
    conn.commit()
    conn.close()
    print("✅ OTP tables and users table verified successfully.")

# Initialize tables
init_otp_tables()

def check_rate_limit(email, max_requests=3, time_window=300):
    """Check if user has exceeded OTP request limit (5 minutes window)"""
    now = time.time()
    # Clean old requests
    otp_request_tracker[email] = [t for t in otp_request_tracker[email] if now - t < time_window]
    
    if len(otp_request_tracker[email]) >= max_requests:
        return False
    
    otp_request_tracker[email].append(now)
    return True

def generate_otp(length=6):
    """Generate numeric OTP"""
    return ''.join(random.choices(string.digits, k=length))

def send_email_otp_with_retry(recipient_email, otp_code, purpose, max_retries=3):
    """Send OTP with retry mechanism"""
    for attempt in range(max_retries):
        try:
            result = send_email_otp(recipient_email, otp_code, purpose)
            if result:
                return True
            time.sleep(2 ** attempt)  # Exponential backoff
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
    return False

def cleanup_expired_otps():
    """Delete expired OTPs from database"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM otp_verifications WHERE expires_at < CURRENT_TIMESTAMP')
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    print(f"🧹 Cleaned up {deleted} expired OTPs")
    return deleted

def send_email_otp(recipient_email, otp_code, purpose):
    """Send OTP via email with Outlook/Gmail compatibility"""
    # Check rate limit
    if not check_rate_limit(recipient_email):
        print(f"⚠️ Rate limit exceeded for {recipient_email}")
        return False
    
    # DEVELOPMENT MODE - No email configured
    if not EMAIL_ADDRESS or EMAIL_ADDRESS == "your-email@gmail.com":
        print("\n" + "="*50)
        print("🔐 DEVELOPMENT MODE - Email OTP")
        print("="*50)
        print(f"📧 To: {recipient_email}")
        print(f"🔑 Purpose: {purpose}")
        print(f"🔐 OTP Code: {otp_code}")
        print(f"⏰ Valid for: 10 minutes")
        print("="*50 + "\n")
        return True  # Return True for development
    
    # PRODUCTION MODE - Actually send email with Outlook-compatible HTML
    try:
        # Purpose specific subject and message - Using table-based layout for better email client compatibility
        if purpose == 'registration':
            subject = "Smart City Portal - Email Verification OTP"
            message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <style>
                    /* Email client safe styles */
                    .ExternalClass {{ width: 100%; }}
                    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {{ line-height: 100%; }}
                </style>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#f4f4f4" style="background-color: #f4f4f4;">
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#667eea" style="background-color: #667eea; border-radius: 15px; border-collapse: separate; overflow: hidden;">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="padding: 30px 30px 20px 30px;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Smart City Portal</h1>
                                        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Welcome! 🏙️</p>
                                    </td>
                                </tr>
                                
                                <!-- White Content Box -->
                                <tr>
                                    <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 30px; border-radius: 15px 15px 0 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td>
                                                    <p style="color: #333333; margin: 0 0 20px 0; font-size: 16px;">Thank you for registering. Please verify your email address using the OTP below:</p>
                                                </td>
                                            </tr>
                                            
                                            <!-- OTP Box - Using solid color for better compatibility -->
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#667eea" style="background-color: #667eea; border-radius: 10px;">
                                                        <tr>
                                                            <td align="center" style="padding: 20px 40px;">
                                                                <h1 style="color: #ffffff; margin: 0; font-size: 48px; letter-spacing: 10px; font-weight: 600;">{otp_code}</h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <td>
                                                    <p style="color: #666666; margin: 20px 0 0 0; font-size: 14px;">⏰ This OTP is valid for 10 minutes.</p>
                                                    <p style="color: #999999; margin: 20px 0 0 0; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td bgcolor="#f8f8f8" style="background-color: #f8f8f8; padding: 20px 30px;">
                                        <p style="color: #666666; margin: 0; font-size: 12px; text-align: center;">© 2024 Smart City Portal. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
        elif purpose == 'password_reset':
            subject = "Smart City Portal - Password Reset OTP"
            message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#f4f4f4" style="background-color: #f4f4f4;">
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#f093fb" style="background-color: #f093fb; border-radius: 15px; border-collapse: separate; overflow: hidden;">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="padding: 30px 30px 20px 30px;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Smart City Portal</h1>
                                        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Reset Your Password 🔐</p>
                                    </td>
                                </tr>
                                
                                <!-- White Content Box -->
                                <tr>
                                    <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 30px; border-radius: 15px 15px 0 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td>
                                                    <p style="color: #333333; margin: 0 0 20px 0; font-size: 16px;">We received a request to reset your password. Use the OTP below:</p>
                                                </td>
                                            </tr>
                                            
                                            <!-- OTP Box -->
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#f093fb" style="background-color: #f093fb; border-radius: 10px;">
                                                        <tr>
                                                            <td align="center" style="padding: 20px 40px;">
                                                                <h1 style="color: #ffffff; margin: 0; font-size: 48px; letter-spacing: 10px; font-weight: 600;">{otp_code}</h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <td>
                                                    <p style="color: #666666; margin: 20px 0 0 0; font-size: 14px;">⏰ This OTP is valid for 10 minutes.</p>
                                                    <p style="color: #999999; margin: 20px 0 0 0; font-size: 12px;">If you didn't request this, please secure your account.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td bgcolor="#f8f8f8" style="background-color: #f8f8f8; padding: 20px 30px;">
                                        <p style="color: #666666; margin: 0; font-size: 12px; text-align: center;">© 2024 Smart City Portal. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
        elif purpose == 'update_profile':
            subject = "Smart City Portal - Profile Update OTP"
            message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#f4f4f4" style="background-color: #f4f4f4;">
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#43e97b" style="background-color: #43e97b; border-radius: 15px; border-collapse: separate; overflow: hidden;">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="padding: 30px 30px 20px 30px;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Smart City Portal</h1>
                                        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Profile Update Verification 👤</p>
                                    </td>
                                </tr>
                                
                                <!-- White Content Box -->
                                <tr>
                                    <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 30px; border-radius: 15px 15px 0 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td>
                                                    <p style="color: #333333; margin: 0 0 20px 0; font-size: 16px;">You requested to update your profile information. Use the OTP below:</p>
                                                </td>
                                            </tr>
                                            
                                            <!-- OTP Box -->
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#43e97b" style="background-color: #43e97b; border-radius: 10px;">
                                                        <tr>
                                                            <td align="center" style="padding: 20px 40px;">
                                                                <h1 style="color: #ffffff; margin: 0; font-size: 48px; letter-spacing: 10px; font-weight: 600;">{otp_code}</h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <td>
                                                    <p style="color: #666666; margin: 20px 0 0 0; font-size: 14px;">⏰ This OTP is valid for 10 minutes.</p>
                                                    <p style="color: #999999; margin: 20px 0 0 0; font-size: 12px;">If you didn't request this, please contact support.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td bgcolor="#f8f8f8" style="background-color: #f8f8f8; padding: 20px 30px;">
                                        <p style="color: #666666; margin: 0; font-size: 12px; text-align: center;">© 2024 Smart City Portal. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"Smart City Portal <{EMAIL_ADDRESS}>"
        msg['To'] = recipient_email
        msg['Subject'] = subject
        
        # Add plain text version for better compatibility
        text_version = f"""
Smart City Portal - {purpose.replace('_', ' ').title()}

Your OTP code is: {otp_code}

This code is valid for 10 minutes.

If you didn't request this, please ignore this email.
        """
        
        # Attach both plain text and HTML versions
        part1 = MIMEText(text_version, 'plain')
        part2 = MIMEText(message, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ OTP email sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        print(f"🔐 OTP Code for {recipient_email}: {otp_code} (Use this for testing)")
        return False

def save_otp(email, mobile, purpose, user_id=None):
    """Generate and save OTP to database"""
    otp_code = generate_otp()
    expires_at = datetime.datetime.now() + datetime.timedelta(minutes=10)
    
    conn = get_db()
    
    # Mark previous unused OTPs as used
    if email:
        conn.execute('''
            UPDATE otp_verifications 
            SET used = 1 
            WHERE email = ? AND purpose = ? AND used = 0
        ''', (email, purpose))
    
    if mobile:
        conn.execute('''
            UPDATE otp_verifications 
            SET used = 1 
            WHERE mobile = ? AND purpose = ? AND used = 0
        ''', (mobile, purpose))
    
    # Save new OTP
    conn.execute('''
        INSERT INTO otp_verifications (email, mobile, otp_code, purpose, user_id, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (email, mobile, otp_code, purpose, user_id, expires_at))
    
    conn.commit()
    conn.close()
    
    print(f"✅ OTP generated for {email or mobile}: {otp_code}")
    return otp_code

def verify_otp(email, mobile, otp_code, purpose):
    """Verify OTP code"""
    conn = get_db()
    
    query = "SELECT * FROM otp_verifications WHERE "
    params = []
    
    if email:
        query += "email = ? AND "
        params.append(email)
    if mobile:
        query += "mobile = ? AND "
        params.append(mobile)
    
    query += "purpose = ? AND used = 0 AND expires_at > CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1"
    params.append(purpose)
    
    otp_record = conn.execute(query, params).fetchone()
    
    if not otp_record:
        conn.close()
        return {'success': False, 'message': 'Invalid or expired OTP'}
    
    # Check attempts
    if otp_record['attempts'] >= 5:
        conn.close()
        return {'success': False, 'message': 'Too many failed attempts. Please request new OTP.'}
    
    if otp_record['otp_code'] == otp_code:
        # Mark as used
        conn.execute('UPDATE otp_verifications SET used = 1 WHERE id = ?', (otp_record['id'],))
        conn.commit()
        conn.close()
        print(f"✅ OTP verified successfully for {email or mobile}")
        return {'success': True, 'message': 'OTP verified successfully', 'user_id': otp_record['user_id']}
    else:
        # Increment attempts
        conn.execute('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?', (otp_record['id'],))
        conn.commit()
        conn.close()
        print(f"❌ Invalid OTP attempt for {email or mobile}")
        return {'success': False, 'message': 'Invalid OTP code'}

def test_email_config():
    """Test email configuration"""
    if EMAIL_ADDRESS and EMAIL_ADDRESS != "your-email@gmail.com":
        print(f"📧 Email configured for: {EMAIL_ADDRESS}")
        return True
    else:
        print("📧 Email not configured - Running in DEVELOPMENT MODE")
        print("   OTP codes will be displayed in console for testing")
        return False

# Call test on import
test_email_config()