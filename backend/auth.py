from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import jwt
import datetime
from functools import wraps
import os
from otp_utils import save_otp, send_email_otp, verify_otp

auth_bp = Blueprint('auth', __name__)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "smartcity.db")

# Secret key for JWT
JWT_SECRET = "your-secret-key-change-this-in-production"
JWT_ALGORITHM = "HS256"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            current_user = get_user_by_id(data['user_id'])
            
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

def get_user_by_id(user_id):
    conn = get_db()
    user = conn.execute(
        "SELECT id, full_name, email, mobile, role, category, created_at, last_login FROM users WHERE id = ?", 
        (user_id,)
    ).fetchone()
    conn.close()
    return dict(user) if user else None

# ==================== REGISTRATION WITH OTP ====================

@auth_bp.route('/send-registration-otp', methods=['POST'])
def send_registration_otp():
    """Send OTP for registration verification"""
    try:
        data = request.get_json()
        email = data.get('email')
        category = data.get('category')  # Make sure frontend sends category
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not category:
            return jsonify({'error': 'Category is required'}), 400
        
        # Check if email already exists for THIS SPECIFIC CATEGORY
        conn = get_db()
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ? AND category = ?", 
            (email, category)
        ).fetchone()
        conn.close()
        
        if existing:
            return jsonify({'error': f'This email is already registered for {category}'}), 409
        
        # Generate and save OTP
        otp_code = save_otp(email, None, 'registration')
        
        # Send OTP via email
        otp_sent = send_email_otp(email, otp_code, 'registration')
        
        if otp_sent:
            return jsonify({'message': 'OTP sent successfully', 'email': email}), 200
        else:
            return jsonify({'error': 'Failed to send OTP. Please try again.'}), 500
            
    except Exception as e:
        print(f"Error in send_registration_otp: {e}")
        return jsonify({'error': str(e)}), 500

# ==================== VERIFY REGISTRATION OTP AND COMPLETE REGISTRATION ====================

@auth_bp.route('/verify-registration-otp', methods=['POST'])
def verify_registration_otp():
    """Verify OTP and complete registration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'password', 'category', 'otp_code']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Verify OTP
        otp_verification = verify_otp(data['email'], None, data['otp_code'], 'registration')
        
        if not otp_verification['success']:
            return jsonify({'error': otp_verification['message']}), 400
        
        # Hash password
        hashed_password = generate_password_hash(data['password'])
        
        conn = get_db()
        try:
            # CHECK IF USER ALREADY EXISTS WITH THIS EXACT EMAIL AND CATEGORY
            existing = conn.execute(
                "SELECT * FROM users WHERE email = ? AND category = ?", 
                (data['email'], data['category'])
            ).fetchone()
            
            if existing:
                conn.close()
                return jsonify({'error': f'You have already registered for {data["category"]} with this email'}), 409
            
            # Check if user exists with same email but DIFFERENT category
            # This is ALLOWED now - we just need to insert a new record
            existing_other = conn.execute(
                "SELECT * FROM users WHERE email = ? AND category != ?", 
                (data['email'], data['category'])
            ).fetchone()
            
            if existing_other:
                # User exists with different category - we can create a new account
                print(f"User {data['email']} already exists with category {existing_other['category']}, creating new for {data['category']}")
            
            # Insert new user (same email can be used for different category)
            cursor = conn.execute('''
                INSERT INTO users (full_name, email, password, category, last_login)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (
                data['full_name'], 
                data['email'], 
                hashed_password, 
                data['category']
            ))
            
            conn.commit()
            user_id = cursor.lastrowid
            
            # Generate token
            token = jwt.encode({
                'user_id': user_id,
                'email': data['email'],
                'role': 'user',
                'category': data['category'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
            }, JWT_SECRET, algorithm=JWT_ALGORITHM)
            
            return jsonify({
                'message': 'Registration completed successfully',
                'token': token,
                'user': {
                    'id': user_id,
                    'full_name': data['full_name'],
                    'email': data['email'],
                    'role': 'user',
                    'category': data['category']
                }
            }), 201
            
        except sqlite3.IntegrityError as e:
            print(f"IntegrityError: {e}")
            return jsonify({'error': 'This email is already registered for this category'}), 409
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': str(e)}), 500

# ==================== PASSWORD RESET WITH OTP ====================

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send OTP for password reset"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        conn = get_db()
        
        # Find user
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        
        if not user:
            conn.close()
            return jsonify({'error': 'No account found with this email'}), 404
        
        # Generate and save OTP
        otp_code = save_otp(email, None, 'password_reset', user['id'])
        
        # Send OTP via email
        otp_sent = send_email_otp(email, otp_code, 'password_reset')
        
        conn.close()
        
        if otp_sent:
            return jsonify({'message': 'Password reset OTP sent successfully', 'email': email}), 200
        else:
            return jsonify({'error': 'Failed to send OTP. Please try again.'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-reset-otp', methods=['POST'])
def verify_reset_otp():
    """Verify OTP for password reset"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp_code = data.get('otp_code')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not otp_code:
            return jsonify({'error': 'OTP code is required'}), 400
        
        otp_verification = verify_otp(email, None, otp_code, 'password_reset')
        
        if otp_verification['success']:
            # Generate temporary token for password reset
            reset_token = jwt.encode({
                'user_id': otp_verification['user_id'],
                'purpose': 'password_reset',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
            }, JWT_SECRET, algorithm=JWT_ALGORITHM)
            
            return jsonify({
                'success': True,
                'message': 'OTP verified successfully',
                'reset_token': reset_token
            }), 200
        else:
            return jsonify({'success': False, 'error': otp_verification['message']}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password after OTP verification"""
    try:
        data = request.get_json()
        reset_token = data.get('reset_token')
        new_password = data.get('new_password')
        
        if not reset_token or not new_password:
            return jsonify({'error': 'Reset token and new password are required'}), 400
        
        try:
            # Verify reset token
            token_data = jwt.decode(reset_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            
            if token_data.get('purpose') != 'password_reset':
                return jsonify({'error': 'Invalid reset token'}), 400
            
            user_id = token_data['user_id']
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Reset token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid reset token'}), 401
        
        # Update password
        hashed_password = generate_password_hash(new_password)
        conn = get_db()
        conn.execute('UPDATE users SET password = ? WHERE id = ?', (hashed_password, user_id))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== PROFILE UPDATE WITH OTP ====================

@auth_bp.route('/send-profile-update-otp', methods=['POST'])
@token_required
def send_profile_update_otp(current_user):
    """Send OTP for profile update verification"""
    try:
        data = request.get_json()
        email = data.get('email', current_user['email'])
        
        # Generate and save OTP
        otp_code = save_otp(email, None, 'update_profile', current_user['id'])
        
        # Send OTP via email
        otp_sent = send_email_otp(email, otp_code, 'update_profile')
        
        if otp_sent:
            return jsonify({'message': 'Profile update OTP sent successfully'}), 200
        else:
            return jsonify({'error': 'Failed to send OTP. Please try again.'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile after OTP verification"""
    try:
        data = request.get_json()
        otp_code = data.get('otp_code')
        
        if not otp_code:
            return jsonify({'error': 'OTP code is required'}), 400
        
        # Verify OTP
        otp_verification = verify_otp(
            current_user['email'], 
            None, 
            otp_code, 
            'update_profile'
        )
        
        if not otp_verification['success']:
            return jsonify({'error': otp_verification['message']}), 400
        
        conn = get_db()
        updates = []
        params = []
        
        # Update full name
        if data.get('full_name'):
            updates.append('full_name = ?')
            params.append(data['full_name'])
        
        # Update email
        if data.get('email') and data['email'] != current_user['email']:
            # Check if email already exists
            existing = conn.execute('SELECT id FROM users WHERE email = ? AND id != ?', 
                                   (data['email'], current_user['id'])).fetchone()
            if existing:
                conn.close()
                return jsonify({'error': 'Email already in use'}), 409
            updates.append('email = ?')
            params.append(data['email'])
        
        # Update mobile (optional)
        if 'mobile' in data:
            updates.append('mobile = ?')
            params.append(data['mobile'])
        
        # Update password
        if data.get('new_password'):
            if not data.get('current_password'):
                conn.close()
                return jsonify({'error': 'Current password is required to change password'}), 400
            
            # Verify current password
            user = conn.execute('SELECT password FROM users WHERE id = ?', (current_user['id'],)).fetchone()
            if not check_password_hash(user['password'], data['current_password']):
                conn.close()
                return jsonify({'error': 'Current password is incorrect'}), 401
            
            hashed_password = generate_password_hash(data['new_password'])
            updates.append('password = ?')
            params.append(hashed_password)
        
        if updates:
            params.append(current_user['id'])
            conn.execute(f'UPDATE users SET {", ".join(updates)} WHERE id = ?', params)
            conn.commit()
        
        # Get updated user info
        updated_user = conn.execute(
            'SELECT id, full_name, email, mobile, role, category, created_at FROM users WHERE id = ?',
            (current_user['id'],)
        ).fetchone()
        conn.close()
        
        # Generate new token with updated info
        token = jwt.encode({
            'user_id': updated_user['id'],
            'email': updated_user['email'],
            'role': updated_user['role'],
            'category': updated_user['category'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return jsonify({
            'message': 'Profile updated successfully',
            'token': token,
            'user': dict(updated_user)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== LOGIN ENDPOINT ====================

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        # Get selected category from frontend
        selected_category = data.get('category')  # Add this to your login request
        
        if not selected_category:
            return jsonify({'error': 'Please select a category'}), 400
        
        conn = get_db()
        
        # Get the SPECIFIC user for this email AND category
        user = conn.execute(
            "SELECT * FROM users WHERE email = ? AND category = ?", 
            (data['email'], selected_category)
        ).fetchone()
        
        if not user:
            conn.close()
            # Check if email exists for other category
            other_user = conn.execute(
                "SELECT category FROM users WHERE email = ?", 
                (data['email'],)
            ).fetchone()
            
            if other_user:
                return jsonify({'error': f'This email is registered for {other_user["category"]}. Please select the correct category.'}), 401
            else:
                return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password for this specific user
        if check_password_hash(user['password'], data['password']):
            # Update last login
            conn.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user['id'],))
            conn.commit()
            
            # Get all categories for this email (for UI purposes)
            all_users = conn.execute(
                "SELECT category FROM users WHERE email = ?", 
                (data['email'],)
            ).fetchall()
            categories = [u['category'] for u in all_users]
            
            token = jwt.encode({
                'user_id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'category': user['category'],
                'categories': categories,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
            }, JWT_SECRET, algorithm=JWT_ALGORITHM)
            
            conn.close()
            
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': {
                    'id': user['id'],
                    'full_name': user['full_name'],
                    'email': user['email'],
                    'mobile': user['mobile'],
                    'role': user['role'],
                    'category': user['category'],
                    'categories': categories
                }
            }), 200
        
        conn.close()
        return jsonify({'error': 'Invalid password'}), 401
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': str(e)}), 500

# ==================== GET CURRENT USER ====================

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user info"""
    conn = get_db()
    user = conn.execute(
        '''SELECT id, full_name, email, mobile, role, category, created_at, last_login 
           FROM users WHERE id = ?''',
        (current_user['id'],)
    ).fetchone()
    conn.close()
    return jsonify(dict(user)), 200

# ==================== CREATE ADMIN (ADMIN ONLY) ====================

@auth_bp.route('/create-admin', methods=['POST'])
@token_required
def create_admin(current_user):
    """Create admin user (admin only)"""
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        data = request.get_json()
        required_fields = ['full_name', 'email', 'password', 'category']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        hashed_password = generate_password_hash(data['password'])
        
        conn = get_db()
        try:
            cursor = conn.execute('''
                INSERT INTO users (full_name, email, mobile, password, role, category)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data['full_name'], 
                data['email'], 
                data.get('mobile'), 
                hashed_password, 
                'admin', 
                data['category']
            ))
            
            conn.commit()
            user_id = cursor.lastrowid
            
            return jsonify({
                'message': 'Admin created successfully',
                'admin': {
                    'id': user_id,
                    'full_name': data['full_name'],
                    'email': data['email'],
                    'role': 'admin',
                    'category': data['category']
                }
            }), 201
            
        except sqlite3.IntegrityError:
            return jsonify({'error': 'Email already exists'}), 409
        finally:
            conn.close()
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500