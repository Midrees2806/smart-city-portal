import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './css/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('hostel'); // 'hostel' or 'school'

  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message || '');
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleBlur = (field) => {
    setTouchedFields({
      ...touchedFields,
      [field]: true
    });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setError(''); // Clear any previous errors when switching categories
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  // Mark all fields as touched
  setTouchedFields({
    email: true,
    password: true
  });

  // Send selected category with login request
  const result = await login(email, password, selectedCategory); // Add selectedCategory
  
  if (result.success) {
    const user = result.user;
    
    // Redirect based on role and category
    if (user.role === 'admin') {
      if (user.category === 'hostel') {
        navigate('/admin/bookings');
      } else if (user.category === 'school') {
        navigate('/admin/admissions');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      if (user.category === 'hostel') {
        navigate('/booking');
      } else if (user.category === 'school') {
        navigate('/admission');
      } else {
        navigate('/');
      }
    }
  } else {
    setError(result.error);
  }
  
  setLoading(false);
};

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="smartcity-login-container">
      <div className="smartcity-login-box">
        <div className="login-header">
          <div className="brand-logo">
            <span className="logo-icon">🏙️</span>
            <h2>Smart City Portal</h2>
          </div>
          <p className="brand-tagline">Welcome back! Please login to your account</p>
        </div>
        
        {message && (
          <div className="smartcity-login-success">
            <span className="success-icon">✅</span>
            {message}
          </div>
        )}
        
        {error && (
          <div className="smartcity-login-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {/* Category Selection Tabs */}
        <div className="login-category-tabs">
          <button
            type="button"
            className={`category-tab ${selectedCategory === 'hostel' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('hostel')}
          >
            <span className="tab-icon">🏨</span>
            <span className="tab-label">Hostel Booking</span>
          </button>
          <button
            type="button"
            className={`category-tab ${selectedCategory === 'school' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('school')}
          >
            <span className="tab-icon">🎓</span>
            <span className="tab-label">School Admission</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className={`form-group ${touchedFields.email && (!email || !isEmailValid) ? 'error' : ''}`}>
            <label>
              <span className="label-icon">📧</span>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              required
              placeholder="Enter your email"
              className={touchedFields.email && (!email || !isEmailValid) ? 'error' : ''}
            />
            {touchedFields.email && !email && (
              <span className="field-error">Email is required</span>
            )}
            {touchedFields.email && email && !isEmailValid && (
              <span className="field-error">Please enter a valid email</span>
            )}
          </div>
          
          <div className={`form-group ${touchedFields.password && !password ? 'error' : ''}`}>
            <label>
              <span className="label-icon">🔒</span>
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                required
                placeholder="Enter your password"
                className={touchedFields.password && !password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setPasswordVisible(!passwordVisible)}
                tabIndex="-1"
              >
                {passwordVisible ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {touchedFields.password && !password && (
              <span className="field-error">Password is required</span>
            )}
          </div>

          <div className="forgot-password-link">
            <Link to="/forgot-password">
              <span className="link-icon">🔑</span>
              Forgot Password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="smartcity-login-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Logging in...
              </>
            ) : (
              <>
                <span className="btn-icon">🚪</span>
                Login as {selectedCategory === 'hostel' ? 'Hostel User' : 'School User'}
              </>
            )}
          </button>
        </form>
        
        <p className="smartcity-register-link">
          <span className="link-text">Don't have an account?</span>
          <Link to="/register">
            <span className="link-icon">📝</span>
            Register here
          </Link>
        </p>

        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">🏨</span>
            <span>Hostel Booking</span>
          </div>
          <div className="feature-divider">•</div>
          <div className="feature-item">
            <span className="feature-icon">🎓</span>
            <span>School Admission</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;