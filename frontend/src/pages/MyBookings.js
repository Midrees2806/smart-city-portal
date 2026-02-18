import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './css/MyBookings.css';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    console.log('MyBookings mounted');
    console.log('User from auth:', user);
    
    if (user?.email) {
      console.log('User email found:', user.email);
      fetchUserBookings();
    } else {
      console.log('No user email found');
      setLoading(false);
      setError('Please log in to view your bookings');
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching bookings for email:', user.email);
      setDebugInfo(`Fetching bookings for: ${user.email}`);
      
      // First, check if any bookings exist at all
      try {
        const allBookingsResponse = await axios.get('http://localhost:5000/admin/bookings');
        console.log('All bookings in database:', allBookingsResponse.data);
        setDebugInfo(prev => `${prev}\nTotal bookings in DB: ${allBookingsResponse.data.length}`);
      } catch (e) {
        console.log('Could not fetch all bookings');
      }
      
      // Use the dedicated user endpoint
      const response = await axios.get(`http://localhost:5000/user/bookings/${encodeURIComponent(user.email)}`);
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} bookings`);
        setDebugInfo(prev => `${prev}\nFound ${response.data.length} bookings for your email`);
        setBookings(response.data);
      } else {
        console.log('Response data is not an array:', response.data);
        setBookings([]);
        setDebugInfo(prev => `${prev}\nNo bookings found for your email`);
      }
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      setDebugInfo(prev => `${prev}\nError: ${err.message}`);
      
      // Try fallback to admin endpoint with filtering
      try {
        console.log('Trying fallback to admin endpoint...');
        const fallbackResponse = await axios.get('http://localhost:5000/admin/bookings');
        
        if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
          console.log('Total bookings from admin:', fallbackResponse.data.length);
          setDebugInfo(prev => `${prev}\nTotal bookings in system: ${fallbackResponse.data.length}`);
          
          const userBookings = fallbackResponse.data.filter(booking => 
            booking.email?.toLowerCase() === user.email?.toLowerCase()
          );
          
          console.log('Filtered user bookings:', userBookings.length);
          setDebugInfo(prev => `${prev}\nFound ${userBookings.length} bookings via filtering`);
          setBookings(userBookings);
        }
      } catch (fallbackErr) {
        setError('Unable to load your bookings. Please try again later.');
        setDebugInfo(prev => `${prev}\nFallback also failed: ${fallbackErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return <span className="mybookings-status-badge mybookings-pending">⏳ Pending</span>;
      case 'verified':
        return <span className="mybookings-status-badge mybookings-verified">✅ Verified</span>;
      case 'rejected':
        return <span className="mybookings-status-badge mybookings-rejected">❌ Rejected</span>;
      default:
        return <span className="mybookings-status-badge">{status || 'Pending'}</span>;
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '⏳';
      case 'verified': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status?.toLowerCase() === filter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const LoadingSpinner = () => (
    <div className="mybookings-loading-spinner">
      <div className="mybookings-spinner"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="mybookings-loading-container">
        <LoadingSpinner />
        <p>Loading your bookings...</p>
        <pre style={{color: '#718096', fontSize: '12px', marginTop: '10px', whiteSpace: 'pre-wrap'}}>
          {debugInfo}
        </pre>
      </div>
    );
  }

  return (
    <div className="mybookings-main-container">
      <div className="mybookings-header-section">
        <h1>
          <span className="mybookings-header-icon">📋</span>
          My Hostel Bookings
        </h1>
        <p>Track the status of your hostel booking applications</p>
        <div style={{background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginTop: '10px'}}>
          <pre style={{color: '#475569', fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap'}}>
            Debug: {debugInfo}
          </pre>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="mybookings-status-grid">
        <div className="mybookings-stat-card mybookings-stat-total">
          <span className="mybookings-stat-icon">📊</span>
          <div className="mybookings-stat-info">
            <span className="mybookings-stat-value">{bookings.length}</span>
            <span className="mybookings-stat-label">Total Applications</span>
          </div>
        </div>
        <div className="mybookings-stat-card mybookings-stat-pending">
          <span className="mybookings-stat-icon">⏳</span>
          <div className="mybookings-stat-info">
            <span className="mybookings-stat-value">
              {bookings.filter(b => b.status?.toLowerCase() === 'pending').length}
            </span>
            <span className="mybookings-stat-label">Pending</span>
          </div>
        </div>
        <div className="mybookings-stat-card mybookings-stat-verified">
          <span className="mybookings-stat-icon">✅</span>
          <div className="mybookings-stat-info">
            <span className="mybookings-stat-value">
              {bookings.filter(b => b.status?.toLowerCase() === 'verified').length}
            </span>
            <span className="mybookings-stat-label">Verified</span>
          </div>
        </div>
        <div className="mybookings-stat-card mybookings-stat-rejected">
          <span className="mybookings-stat-icon">❌</span>
          <div className="mybookings-stat-info">
            <span className="mybookings-stat-value">
              {bookings.filter(b => b.status?.toLowerCase() === 'rejected').length}
            </span>
            <span className="mybookings-stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mybookings-filter-container">
        <button 
          className={`mybookings-filter-btn ${filter === 'all' ? 'mybookings-filter-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Applications
        </button>
        <button 
          className={`mybookings-filter-btn ${filter === 'pending' ? 'mybookings-filter-active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`mybookings-filter-btn ${filter === 'verified' ? 'mybookings-filter-active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified
        </button>
        <button 
          className={`mybookings-filter-btn ${filter === 'rejected' ? 'mybookings-filter-active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      {error && <div className="mybookings-error-message">{error}</div>}

      {filteredBookings.length === 0 ? (
        <div className="mybookings-empty-state">
          <span className="mybookings-empty-icon">🏨</span>
          <h3>No bookings found</h3>
          <p>You haven't made any hostel bookings yet with email: {user?.email}</p>
          <button 
            className="mybookings-action-btn"
            onClick={() => navigate('/booking')}
          >
            Book a Hostel Now
          </button>
        </div>
      ) : (
        <div className="mybookings-list-container">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="mybookings-card">
              <div className="mybookings-card-header">
                <div className="mybookings-card-icon">
                  {getStatusIcon(booking.status)}
                </div>
                <div className="mybookings-card-title">
                  <h3>{booking.student_name || 'Student'}</h3>
                  <p className="mybookings-card-reference">Application #{booking.id}</p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="mybookings-details-grid">
                <div className="mybookings-detail-item">
                  <span className="mybookings-detail-label">Father's Name:</span>
                  <span className="mybookings-detail-value">{booking.father_name || 'N/A'}</span>
                </div>
                <div className="mybookings-detail-item">
                  <span className="mybookings-detail-label">Room Number:</span>
                  <span className="mybookings-detail-value">{booking.room_number || 'Not assigned'}</span>
                </div>
                <div className="mybookings-detail-item">
                  <span className="mybookings-detail-label">Bed Number:</span>
                  <span className="mybookings-detail-value">{booking.bed_id || 'Not assigned'}</span>
                </div>
                <div className="mybookings-detail-item">
                  <span className="mybookings-detail-label">Check-in Date:</span>
                  <span className="mybookings-detail-value">{formatDate(booking.check_in_date)}</span>
                </div>
                <div className="mybookings-detail-item">
                  <span className="mybookings-detail-label">Contact:</span>
                  <span className="mybookings-detail-value">{booking.contact || 'N/A'}</span>
                </div>
                <div className="mybookings-detail-item">
                  <span className="mybookings-detail-label">Applied on:</span>
                  <span className="mybookings-detail-value">{formatDate(booking.created_at)}</span>
                </div>
              </div>

              {booking.institute_name && (
                <div className="mybookings-institute-info">
                  <span className="mybookings-institute-label">Institute:</span>
                  <span className="mybookings-institute-value">{booking.institute_name}</span>
                </div>
              )}

              <div className="mybookings-card-footer">
                {booking.status?.toLowerCase() === 'pending' && (
                  <p className="mybookings-status-message mybookings-msg-pending">
                    ⏳ Your application is being reviewed by the admin.
                  </p>
                )}
                {booking.status?.toLowerCase() === 'verified' && (
                  <p className="mybookings-status-message mybookings-msg-verified">
                    ✅ Congratulations! Your booking has been verified.
                  </p>
                )}
                {booking.status?.toLowerCase() === 'rejected' && (
                  <p className="mybookings-status-message mybookings-msg-rejected">
                    ❌ Your application was rejected.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;