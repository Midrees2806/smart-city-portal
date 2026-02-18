from functools import wraps
from flask import jsonify
from auth import token_required

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated_function(current_user, *args, **kwargs):
            if current_user['role'] not in allowed_roles:
                return jsonify({'error': 'Access denied. Insufficient permissions.'}), 403
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator

def category_required(allowed_categories):
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated_function(current_user, *args, **kwargs):
            if current_user['category'] not in allowed_categories:
                return jsonify({'error': f'Access denied. This feature is only for {allowed_categories} category.'}), 403
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated_function(current_user, *args, **kwargs):
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function

def hostel_access(f):
    @wraps(f)
    @token_required
    def decorated_function(current_user, *args, **kwargs):
        if current_user['category'] != 'hostel' and current_user['role'] != 'admin':
            return jsonify({'error': 'Hostel access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function

def school_access(f):
    @wraps(f)
    @token_required
    def decorated_function(current_user, *args, **kwargs):
        if current_user['category'] != 'school' and current_user['role'] != 'admin':
            return jsonify({'error': 'School access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function