import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './css/Register.css';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    category: 'hostel'
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: '', score: 0, feedback: '' };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 25;
    else if (password.length >= 6) score += 15;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 25;
    
    // Number check
    if (/[0-9]/.test(password)) score += 25;
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;
    
    if (score < 30) {
      return { strength: 'weak', score, feedback: 'Too weak' };
    } else if (score < 60) {
      return { strength: 'fair', score, feedback: 'Could be stronger' };
    } else if (score < 80) {
      return { strength: 'good', score, feedback: 'Good password' };
    } else {
      return { strength: 'strong', score, feedback: 'Strong password!' };
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBlur = (field) => {
    setTouchedFields({
      ...touchedFields,
      [field]: true
    });
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
    }
  };

const sendOtp = async () => {
  setLoading(true);
  setError('');
  
  try {
    // Make sure to send the category along with email
    await axios.post('http://localhost:5000/auth/send-registration-otp', {
      email: formData.email,
      category: formData.category  // Add this line
    });
    
    setSuccess('OTP sent successfully! Please check your email.');
    setStep(2);
    startResendTimer();
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to send OTP');
  } finally {
    setLoading(false);
  }
};

  const verifyOtpAndRegister = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/auth/verify-registration-otp', {
        ...formData,
        otp_code: otpCode
      });
      
      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login with your credentials.' 
          } 
        });
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    await sendOtp();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched for validation
    setTouchedFields({
      full_name: true,
      email: true,
      password: true,
      confirm_password: true,
      category: true
    });

    // Validation
    if (!formData.full_name) {
      setError('Full name is required');
      return;
    }

    if (!formData.email) {
      setError('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    await sendOtp();
  };

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirm_password;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <div className="smartcity-register-container">
      <div className="smartcity-register-box">
        <div className="register-header">
          <div className="brand-logo">
            <span className="logo-icon">🏙️</span>
            <h2>Smart City Portal</h2>
          </div>
          <p className="brand-tagline">Create your account to get started</p>
          
          <div className="step-indicator">
            <div className={`step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">
                {step > 1 ? '✓' : '1'}
              </div>
              <div className="step-label">
                <span>Account Details</span>
                <small>Personal information</small>
              </div>
            </div>
            <div className={`step-connector ${step > 1 ? 'active' : ''}`}>
              <div className="connector-line"></div>
            </div>
            <div className={`step-item ${step === 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">
                <span>Verification</span>
                <small>Email confirmation</small>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="smartcity-register-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="smartcity-register-success">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="registration-form">
            <div className={`form-group ${touchedFields.full_name && !formData.full_name ? 'error' : ''}`}>
              <label>
                <span className="label-icon">👤</span>
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={() => handleBlur('full_name')}
                required
                placeholder="John Doe"
                className={touchedFields.full_name && !formData.full_name ? 'error' : ''}
              />
              {touchedFields.full_name && !formData.full_name && (
                <span className="field-error">Full name is required</span>
              )}
            </div>
            
            <div className={`form-group ${touchedFields.email && (!formData.email || !isEmailValid) ? 'error' : ''}`}>
              <label>
                <span className="label-icon">📧</span>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                required
                placeholder="john@example.com"
                className={touchedFields.email && (!formData.email || !isEmailValid) ? 'error' : ''}
              />
              {touchedFields.email && !formData.email && (
                <span className="field-error">Email is required</span>
              )}
              {touchedFields.email && formData.email && !isEmailValid && (
                <span className="field-error">Please enter a valid email</span>
              )}
              <small className="field-hint">
                <span className="hint-icon">🔐</span>
                You will receive OTP on this email
              </small>
            </div>
            
            <div className="form-row">
              <div className={`form-group half ${touchedFields.password && !formData.password ? 'error' : ''}`}>
                <label>
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    required
                    placeholder="••••••••"
                    className={touchedFields.password && !formData.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {touchedFields.password && !formData.password && (
                  <span className="field-error">Password is required</span>
                )}
                {formData.password && (
                  <div className="password-strength-container">
                    <div className="strength-meter">
                      <div 
                        className={`strength-fill ${passwordStrength.strength}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      ></div>
                    </div>
                    <div className={`password-strength ${passwordStrength.strength}`}>
                      <span className="strength-icon">
                        {passwordStrength.strength === 'strong' ? '🛡️' : 
                         passwordStrength.strength === 'good' ? '👍' : 
                         passwordStrength.strength === 'fair' ? '⚠️' : '❌'}
                      </span>
                      <span className="strength-text">
                        {passwordStrength.feedback}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`form-group half ${touchedFields.confirm_password && (!formData.confirm_password || !passwordsMatch) ? 'error' : ''}`}>
                <label>
                  <span className="label-icon">✓</span>
                  Confirm Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirm_password')}
                    required
                    placeholder="••••••••"
                    className={touchedFields.confirm_password && (!formData.confirm_password || !passwordsMatch) ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    {confirmPasswordVisible ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {touchedFields.confirm_password && !formData.confirm_password && (
                  <span className="field-error">Please confirm your password</span>
                )}
                {touchedFields.confirm_password && formData.confirm_password && !passwordsMatch && (
                  <span className="field-error">Passwords do not match</span>
                )}
                {formData.confirm_password && passwordsMatch && (
                  <span className="field-success">✓ Passwords match</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>
                <span className="label-icon">🏢</span>
                Select Service
              </label>
              <div className="category-selector">
                <div 
                  className={`category-option ${formData.category === 'hostel' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, category: 'hostel'})}
                >
                  <span className="category-icon">🏨</span>
                  <span className="category-name">Hostel Booking</span>
                  <span className="category-description">Book rooms and accommodations</span>
                </div>
                <div 
                  className={`category-option ${formData.category === 'school' ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, category: 'school'})}
                >
                  <span className="category-icon">🎓</span>
                  <span className="category-name">School Admission</span>
                  <span className="category-description">Apply for school admissions</span>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="smartcity-register-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Sending OTP...
                </>
              ) : (
                <>
                  <span className="btn-icon">📨</span>
                  Register & Send OTP
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="otp-verification">
            <div className="otp-header">
              <div className="otp-icon">📧</div>
              <h3>Verify Your Email</h3>
              <p>We've sent a 6-digit verification code to</p>
              <p className="otp-destination">{formData.email}</p>
            </div>
            
            <div className="otp-input-group" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  className="otp-input"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            <button 
              className="smartcity-verify-btn"
              onClick={verifyOtpAndRegister}
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Verifying...
                </>
              ) : (
                <>
                  <span className="btn-icon">✓</span>
                  Verify & Complete Registration
                </>
              )}
            </button>
            
            <div className="otp-resend">
              <p>Didn't receive the code?</p>
              <button 
                onClick={resendOtp}
                disabled={resendTimer > 0}
                className="resend-btn"
              >
                {resendTimer > 0 ? (
                  <>
                    <span className="timer-icon">⏳</span>
                    Resend in {resendTimer}s
                  </>
                ) : (
                  <>
                    <span className="resend-icon">↻</span>
                    Resend OTP
                  </>
                )}
              </button>
            </div>
            
            <button 
              className="back-btn"
              onClick={() => setStep(1)}
            >
              <span className="back-icon">←</span>
              Back to Registration
            </button>
          </div>
        )}
        
        <p className="smartcity-login-link">
          Already have an account?
          <Link to="/login">
            <span className="link-icon">🔑</span>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;