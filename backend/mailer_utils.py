import smtplib
import os
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load environment variables
load_dotenv()
EMAIL_SENDER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASS")

def send_admission_verification_email(student_data):
    """
    Sends a professional HTML verification email to the student for School Admission.
    """
    try:
        if not EMAIL_SENDER or not EMAIL_PASSWORD:
            print("Email credentials missing in .env")
            return False

        msg = MIMEMultipart()
        msg['From'] = f"Next Gen School <{EMAIL_SENDER}>"
        msg['To'] = student_data['email']
        msg['Subject'] = "OFFICIAL: Admission Verified - Next Gen School"

        # Format Registration ID
        reg_no = f"NGS-REG-{str(student_data['id']).zfill(3)}"

        html = f"""
        <html>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="background-color: #047857; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Next Gen School</h1>
                </div>
                <div style="padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                    <p>Dear <strong>{student_data['student_name']}</strong>,</p>
                    <p>Congratulations! We are pleased to inform you that your admission application has been <strong>Verified</strong>.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #64748b;">Registration No:</td><td style="font-weight: 600;">{reg_no}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Admission Class:</td><td style="font-weight: 600;">{student_data['admission_class']}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Father's Name:</td><td style="font-weight: 600;">{student_data['father_name']}</td></tr>
                        </table>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul style="color: #475569;">
                        <li>Visit the school accounts office to collect your fee challan.</li>
                        <li>Submit the required physical documents (Original B-Form & Photos).</li>
                        <li>The orientation date will be communicated shortly.</li>
                    </ul>
                    
                    <p style="margin-top: 25px; font-size: 13px; color: #94a3b8;">This is an automated message from Next Gen School. Please do not reply.</p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_verification_email(resident_data):
    """
    Sends a professional HTML verification email to the resident for Hostel Booking.
    """
    try:
        if not EMAIL_SENDER or not EMAIL_PASSWORD:
            print("Email credentials missing in .env")
            return False

        msg = MIMEMultipart()
        msg['From'] = f"Smart City Hostel <{EMAIL_SENDER}>"
        msg['To'] = resident_data['email']
        msg['Subject'] = "OFFICIAL: Booking Verified - Smart City Hostel"

        html = f"""
        <html>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="background-color: #1e40af; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Smart City Hostel</h1>
                </div>
                <div style="padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                    <p>Dear <strong>{resident_data['student_name']}</strong>,</p>
                    <p>We are pleased to inform you that your booking has been <strong>Verified</strong>.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #64748b;">Room Number:</td><td style="font-weight: 600;">{resident_data['room_number']}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Bed ID:</td><td style="font-weight: 600;">{resident_data['bed_id']}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Check-in Date:</td><td style="font-weight: 600;">{resident_data['check_in_date']}</td></tr>
                        </table>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul style="color: #475569;">
                        <li>Bring your original CNIC.</li>
                        <li>Keep your fee deposit slip (Physical/Digital) ready.</li>
                        <li>Report to the Warden office upon arrival.</li>
                    </ul>
                    
                    <p style="margin-top: 25px; font-size: 13px; color: #94a3b8;">This is an automated message. Please do not reply directly to this email.</p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False