import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './css/ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [touchedFields, setTouchedFields] = useState({});
  const [passwordVisible, setPasswordVisible] = useState({
    new: false,
    confirm: false
  });
  
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: '', score: 0, feedback: '' };
    
    let score = 0;
    
    if (password.length >= 8) score += 25;
    else if (password.length >= 6) score += 15;
    
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;
    
    if (score < 30) return { strength: 'weak', score, feedback: 'Too weak' };
    if (score < 60) return { strength: 'fair', score, feedback: 'Could be stronger' };
    if (score < 80) return { strength: 'good', score, feedback: 'Good password' };
    return { strength: 'strong', score, feedback: 'Strong password!' };
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
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`reset-otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`);
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

  const sendResetOtp = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/auth/forgot-password', {
        email: email
      });
      
      setSuccess('Password reset OTP sent successfully! Please check your email.');
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyResetOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/auth/verify-reset-otp', {
        email: email,
        otp_code: otpCode
      });
      
      setResetToken(response.data.reset_token);
      setSuccess('OTP verified! Please set your new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setTouchedFields({
      new: true,
      confirm: true
    });

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/auth/reset-password', {
        reset_token: resetToken,
        new_password: newPassword
      });
      
      setSuccess('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please login with your new password.' 
          } 
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
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
    await sendResetOtp();
  };

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  const passwordStrength = getPasswordStrength(newPassword);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordsMatch = newPassword === confirmPassword;

  return (
    <div className="smartcity-forgot-container">
      <div className="smartcity-forgot-box">
        <div className="forgot-header">
          <div className="brand-logo">
            <span className="logo-icon">🔐</span>
            <h2>Smart City Portal</h2>
          </div>
          <p className="brand-tagline">Reset your password securely</p>
        </div>
        
        <div className="step-indicator">
          <div className={`step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">
              {step > 1 ? '✓' : '1'}
            </div>
            <div className="step-label">
              <span>Email</span>
              <small>Verification</small>
            </div>
          </div>
          <div className={`step-connector ${step > 1 ? 'active' : ''}`}>
            <div className="connector-line"></div>
          </div>
          <div className={`step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">
              {step > 2 ? '✓' : '2'}
            </div>
            <div className="step-label">
              <span>OTP</span>
              <small>Verification</small>
            </div>
          </div>
          <div className={`step-connector ${step > 2 ? 'active' : ''}`}>
            <div className="connector-line"></div>
          </div>
          <div className={`step-item ${step === 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">
              <span>Reset</span>
              <small>New Password</small>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="smartcity-forgot-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="smartcity-forgot-success">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}
        
        {step === 1 && (
          <div className="forgot-step">
            <div className="step-icon">📧</div>
            <h3>Forgot Password?</h3>
            <p>Enter your email address to receive a verification code.</p>
            
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
                placeholder="e.g., user@example.com"
                className={touchedFields.email && (!email || !isEmailValid) ? 'error' : ''}
                required
              />
              {touchedFields.email && !email && (
                <span className="field-error">Email is required</span>
              )}
              {touchedFields.email && email && !isEmailValid && (
                <span className="field-error">Please enter a valid email</span>
              )}
            </div>
            
            <button 
              className="smartcity-forgot-btn"
              onClick={sendResetOtp}
              disabled={loading || !email || !isEmailValid}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Sending...
                </>
              ) : (
                <>
                  <span className="btn-icon">📨</span>
                  Send Reset Code
                </>
              )}
            </button>
          </div>
        )}
        
        {step === 2 && (
          <div className="otp-verification">
            <div className="otp-header">
              <div className="otp-icon">📧</div>
              <h3>Verify Your Identity</h3>
              <p>Enter the 6-digit code sent to</p>
              <p className="otp-destination">{email}</p>
            </div>
            
            <div className="otp-input-group" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-otp-${index}`}
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
              onClick={verifyResetOtp}
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
                  Verify OTP
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
              Back to Email
            </button>
          </div>
        )}
        
        {step === 3 && (
          <div className="reset-password">
            <div className="step-icon">🔒</div>
            <h3>Set New Password</h3>
            <p>Create a strong password for your account.</p>
            
            <div className={`form-group ${touchedFields.new && !newPassword ? 'error' : ''}`}>
              <label>
                <span className="label-icon">🔒</span>
                New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible.new ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => handleBlur('new')}
                  placeholder="At least 6 characters"
                  className={touchedFields.new && !newPassword ? 'error' : ''}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setPasswordVisible({...passwordVisible, new: !passwordVisible.new})}
                >
                  {passwordVisible.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {touchedFields.new && !newPassword && (
                <span className="field-error">Password is required</span>
              )}
              {newPassword && (
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
                    {passwordStrength.feedback}
                  </div>
                </div>
              )}
            </div>
            
            <div className={`form-group ${touchedFields.confirm && (!confirmPassword || !passwordsMatch) ? 'error' : ''}`}>
              <label>
                <span className="label-icon">✓</span>
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible.confirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirm')}
                  placeholder="Re-enter your password"
                  className={touchedFields.confirm && (!confirmPassword || !passwordsMatch) ? 'error' : ''}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setPasswordVisible({...passwordVisible, confirm: !passwordVisible.confirm})}
                >
                  {passwordVisible.confirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {touchedFields.confirm && !confirmPassword && (
                <span className="field-error">Please confirm your password</span>
              )}
              {touchedFields.confirm && confirmPassword && !passwordsMatch && (
                <span className="field-error">Passwords do not match</span>
              )}
              {confirmPassword && passwordsMatch && (
                <span className="field-success">✓ Passwords match</span>
              )}
            </div>
            
            <button 
              className="smartcity-reset-btn"
              onClick={resetPassword}
              disabled={loading || !newPassword || !confirmPassword || !passwordsMatch}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Resetting...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔓</span>
                  Reset Password
                </>
              )}
            </button>
            
            <button 
              className="back-btn"
              onClick={() => setStep(2)}
            >
              <span className="back-icon">←</span>
              Back to OTP
            </button>
          </div>
        )}
        
        <p className="smartcity-login-link">
          <span className="link-text">Remember your password?</span>
          <Link to="/login">
            <span className="link-icon">🔑</span>
            Login here
          </Link>
        </p>

        <div className="security-note">
          <span className="note-icon">🛡️</span>
          <span>All password resets are secured with OTP verification</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;