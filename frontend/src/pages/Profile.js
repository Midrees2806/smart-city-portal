import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './css/Profile.css';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Update states
  const [updateMode, setUpdateMode] = useState(null); // 'name', 'email', 'mobile', 'password'
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [updateData, setUpdateData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchUserDetails();
  }, );

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auth/me');
      setUserDetails(response.data);
      setUpdateData({
        ...updateData,
        full_name: response.data.full_name,
        email: response.data.email,
        mobile: response.data.mobile || ''
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load user details');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    return category === 'hostel' ? '🏨' : '🎓';
  };

  const getCategoryName = (category) => {
    return category === 'hostel' ? 'Hostel Booking' : 'School Admission';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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

  // OTP Handlers
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`profile-otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`profile-otp-${index - 1}`);
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

  const sendProfileUpdateOtp = async () => {
    setUpdateLoading(true);
    setUpdateError('');
    
    try {
      await axios.post('http://localhost:5000/auth/send-profile-update-otp', {
        email: updateData.email
      });
      
      setUpdateSuccess('OTP sent successfully! Please check your email.');
      setStep(2);
      startResendTimer();
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setUpdateLoading(false);
    }
  };

  const updateProfile = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setUpdateError('Please enter complete 6-digit OTP');
      return;
    }

    setUpdateLoading(true);
    setUpdateError('');
    
    try {
      const payload = {
        otp_code: otpCode,
        ...(updateMode === 'name' && { full_name: updateData.full_name }),
        ...(updateMode === 'email' && { email: updateData.email }),
        ...(updateMode === 'mobile' && { mobile: updateData.mobile }),
        ...(updateMode === 'password' && {
          current_password: updateData.current_password,
          new_password: updateData.new_password
        })
      };
      
      const response = await axios.put('http://localhost:5000/auth/update-profile', payload);
      
      // Update token and user data
      localStorage.setItem('token', response.data.token);
      setUserDetails(response.data.user);
      
      setUpdateSuccess('Profile updated successfully!');
      
      // Reset states
      setTimeout(() => {
        setUpdateMode(null);
        setStep(1);
        setOtp(['', '', '', '', '', '']);
        setUpdateSuccess('');
      }, 2000);
      
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdateLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    await sendProfileUpdateOtp();
  };

  const cancelUpdate = () => {
    setUpdateMode(null);
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setUpdateError('');
    setUpdateSuccess('');
    setUpdateData({
      ...updateData,
      full_name: userDetails.full_name,
      email: userDetails.email,
      mobile: userDetails.mobile || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  const passwordStrength = getPasswordStrength(updateData.new_password);
  const passwordsMatch = updateData.new_password === updateData.confirm_password;

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="home-btn">
          <span className="btn-icon">🏠</span>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar" style={{ background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` }}>
            {getInitials(userDetails?.full_name)}
          </div>
          <div className="avatar-badge">
            {userDetails?.role === 'admin' ? '👑' : '👤'}
          </div>
        </div>
        <div className="profile-title">
          <h1>{userDetails?.full_name}</h1>
          <p className="profile-email">{userDetails?.email}</p>
          <div className="profile-meta">
            <span className={`role-tag role-${userDetails?.role}`}>
              {userDetails?.role === 'admin' ? '👑' : '👤'} {userDetails?.role}
            </span>
            <span className={`category-tag category-${userDetails?.category}`}>
              {getCategoryIcon(userDetails?.category)} {getCategoryName(userDetails?.category)}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* Personal Information Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2>
              <span className="header-icon">👤</span>
              Personal Information
            </h2>
            {!updateMode && (
              <span className="verified-badge">
                <span className="verified-icon">✓</span>
                Verified Account
              </span>
            )}
          </div>
          
          {updateMode === 'name' && step === 1 ? (
            <div className="update-form">
              <div className="form-group">
                <label>
                  <span className="label-icon">📝</span>
                  Full Name
                </label>
                <input
                  type="text"
                  value={updateData.full_name}
                  onChange={(e) => setUpdateData({...updateData, full_name: e.target.value})}
                  placeholder="Enter your full name"
                  className="modern-input"
                />
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={sendProfileUpdateOtp} disabled={updateLoading}>
                  {updateLoading ? <LoadingSpinner /> : 'Update Name'}
                </button>
                <button className="cancel-btn" onClick={cancelUpdate}>
                  Cancel
                </button>
              </div>
            </div>
          ) : updateMode === 'name' && step === 2 ? (
            <div className="otp-verification-small">
              <div className="otp-header-small">
                <span className="otp-icon">📧</span>
                <p>Enter OTP sent to <strong>{userDetails.email}</strong></p>
              </div>
              <div className="otp-input-group" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`profile-otp-${index}`}
                    type="text"
                    className="otp-input-small"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <div className="form-actions">
                <button className="verify-btn" onClick={updateProfile} disabled={updateLoading}>
                  {updateLoading ? <LoadingSpinner /> : 'Verify & Update'}
                </button>
                <button className="cancel-btn" onClick={cancelUpdate}>
                  Cancel
                </button>
              </div>
              <div className="otp-resend-small">
                <button 
                  onClick={resendOtp}
                  disabled={resendTimer > 0}
                  className="resend-link"
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
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <div className="info-value-wrapper">
                  <p className="info-value">{userDetails?.full_name}</p>
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      setUpdateMode('name');
                      setStep(1);
                    }}
                  >
                    <span className="edit-icon">✎</span>
                    Edit
                  </button>
                </div>
              </div>

              <div className="info-item">
                <label>Email Address</label>
                <div className="info-value-wrapper">
                  <p className="info-value">{userDetails?.email}</p>
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      setUpdateMode('email');
                      setStep(1);
                    }}
                  >
                    <span className="edit-icon">✎</span>
                    Edit
                  </button>
                </div>
              </div>

              <div className="info-item">
                <label>Mobile Number</label>
                <div className="info-value-wrapper">
                  <p className="info-value">{userDetails?.mobile || 'Not provided'}</p>
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      setUpdateMode('mobile');
                      setStep(1);
                    }}
                  >
                    <span className="edit-icon">✎</span>
                    {userDetails?.mobile ? 'Edit' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Details Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2>
              <span className="header-icon">📊</span>
              Account Details
            </h2>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>User ID</label>
              <p className="info-value mono">#{userDetails?.id}</p>
            </div>

            <div className="info-item">
              <label>Account Status</label>
              <p className="info-value">
                <span className="status-badge active">
                  <span className="status-dot"></span>
                  Active
                </span>
              </p>
            </div>

            <div className="info-item">
              <label>Account Created</label>
              <p className="info-value">{formatDate(userDetails?.created_at)}</p>
            </div>

            <div className="info-item">
              <label>Last Login</label>
              <p className="info-value">{formatDate(userDetails?.last_login) || 'First login'}</p>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2>
              <span className="header-icon">🔒</span>
              Security
            </h2>
          </div>
          
          {updateMode === 'password' && step === 1 ? (
            <div className="update-form">
              <div className="form-group">
                <label>
                  <span className="label-icon">🔑</span>
                  Current Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={passwordVisible.current ? 'text' : 'password'}
                    value={updateData.current_password}
                    onChange={(e) => setUpdateData({...updateData, current_password: e.target.value})}
                    placeholder="Enter current password"
                    className="modern-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setPasswordVisible({...passwordVisible, current: !passwordVisible.current})}
                  >
                    {passwordVisible.current ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>
                  <span className="label-icon">🆕</span>
                  New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={passwordVisible.new ? 'text' : 'password'}
                    value={updateData.new_password}
                    onChange={(e) => setUpdateData({...updateData, new_password: e.target.value})}
                    placeholder="At least 6 characters"
                    className="modern-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setPasswordVisible({...passwordVisible, new: !passwordVisible.new})}
                  >
                    {passwordVisible.new ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {updateData.new_password && (
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
              
              <div className="form-group">
                <label>
                  <span className="label-icon">✓</span>
                  Confirm Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={passwordVisible.confirm ? 'text' : 'password'}
                    value={updateData.confirm_password}
                    onChange={(e) => setUpdateData({...updateData, confirm_password: e.target.value})}
                    placeholder="Re-enter new password"
                    className="modern-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setPasswordVisible({...passwordVisible, confirm: !passwordVisible.confirm})}
                  >
                    {passwordVisible.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {updateData.confirm_password && !passwordsMatch && (
                  <span className="field-error">Passwords do not match</span>
                )}
                {updateData.confirm_password && passwordsMatch && (
                  <span className="field-success">✓ Passwords match</span>
                )}
              </div>

              <div className="form-actions">
                <button 
                  className="save-btn" 
                  onClick={sendProfileUpdateOtp} 
                  disabled={updateLoading || !updateData.current_password || !updateData.new_password || !passwordsMatch}
                >
                  {updateLoading ? <LoadingSpinner /> : 'Change Password'}
                </button>
                <button className="cancel-btn" onClick={cancelUpdate}>
                  Cancel
                </button>
              </div>
            </div>
          ) : updateMode === 'password' && step === 2 ? (
            <div className="otp-verification-small">
              <div className="otp-header-small">
                <span className="otp-icon">📧</span>
                <p>Enter OTP sent to <strong>{userDetails.email}</strong></p>
              </div>
              <div className="otp-input-group" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    className="otp-input-small"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <div className="form-actions">
                <button className="verify-btn" onClick={updateProfile} disabled={updateLoading}>
                  {updateLoading ? <LoadingSpinner /> : 'Verify & Update'}
                </button>
                <button className="cancel-btn" onClick={cancelUpdate}>
                  Cancel
                </button>
              </div>
              <div className="otp-resend-small">
                <button 
                  onClick={resendOtp}
                  disabled={resendTimer > 0}
                  className="resend-link"
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
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Password</label>
                <div className="info-value-wrapper">
                  <p className="info-value password-dots">••••••••</p>
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      setUpdateMode('password');
                      setStep(1);
                    }}
                  >
                    <span className="edit-icon">✎</span>
                    Change
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Update Messages */}
        {updateError && (
          <div className="profile-message error">
            <span className="message-icon">⚠️</span>
            {updateError}
          </div>
        )}
        {updateSuccess && (
          <div className="profile-message success">
            <span className="message-icon">✅</span>
            {updateSuccess}
          </div>
        )}

        {/* Quick Actions Card */}
        <div className="profile-card actions-card">
          <div className="card-header">
            <h2>
              <span className="header-icon">⚡</span>
              Quick Actions
            </h2>
          </div>
          
          <div className="actions-grid">
            {userDetails?.category === 'hostel' && userDetails?.role === 'user' && (
              <button 
                className="action-btn"
                onClick={() => navigate('/booking')}
              >
                <span className="action-icon">🏨</span>
                <span className="action-text">Make a Booking</span>
                <span className="action-arrow">→</span>
              </button>
            )}

            {userDetails?.category === 'school' && userDetails?.role === 'user' && (
              <button 
                className="action-btn"
                onClick={() => navigate('/admission')}
              >
                <span className="action-icon">🎓</span>
                <span className="action-text">Apply for Admission</span>
                <span className="action-arrow">→</span>
              </button>
            )}

            {userDetails?.role === 'admin' && userDetails?.category === 'hostel' && (
              <button 
                className="action-btn"
                onClick={() => navigate('/admin/bookings')}
              >
                <span className="action-icon">⚙️</span>
                <span className="action-text">Manage Bookings</span>
                <span className="action-arrow">→</span>
              </button>
            )}

            {userDetails?.role === 'admin' && userDetails?.category === 'school' && (
              <button 
                className="action-btn"
                onClick={() => navigate('/admin/admissions')}
              >
                <span className="action-icon">⚙️</span>
                <span className="action-text">Manage Admissions</span>
                <span className="action-arrow">→</span>
              </button>
            )}

            <button 
              className="action-btn logout-btn"
              onClick={handleLogout}
            >
              <span className="action-icon">🚪</span>
              <span className="action-text">Logout</span>
              <span className="action-arrow">→</span>
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="profile-note">
          <span className="note-icon">ℹ️</span>
          <p>For security reasons, all profile updates require OTP verification sent to your email.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;