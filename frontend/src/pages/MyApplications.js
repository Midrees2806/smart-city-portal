import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './css/MyApplications.css';

const MyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    console.log('MyApplications mounted');
    console.log('User from auth:', user);
    
    if (user?.email) {
      console.log('User email found:', user.email);
      fetchUserApplications();
    } else {
      console.log('No user email found');
      setLoading(false);
      setError('Please log in to view your applications');
    }
  }, [user]);

  const fetchUserApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching applications for email:', user.email);
      setDebugInfo(`Fetching applications for: ${user.email}`);
      
      // Since there's no dedicated user endpoint for admissions yet,
      // we'll use the admin endpoint and filter
      const response = await axios.get('http://localhost:5000/admin/admissions');
      
      console.log('Response status:', response.status);
      console.log('Total applications in DB:', response.data.length);
      setDebugInfo(prev => `${prev}\nTotal applications in DB: ${response.data.length}`);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter applications for the current user by email
        const userApplications = response.data.filter(app => 
          app.email?.toLowerCase() === user.email?.toLowerCase()
        );
        
        console.log(`Found ${userApplications.length} applications for your email`);
        setDebugInfo(prev => `${prev}\nFound ${userApplications.length} applications for your email`);
        setApplications(userApplications);
      } else {
        console.log('Response data is not an array:', response.data);
        setApplications([]);
        setDebugInfo(prev => `${prev}\nNo applications found for your email`);
      }
      
    } catch (err) {
      console.error('Error fetching applications:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      setDebugInfo(prev => `${prev}\nError: ${err.message}`);
      setError('Unable to load your applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return <span className="myapps-status-badge myapps-pending">⏳ Pending</span>;
      case 'verified':
        return <span className="myapps-status-badge myapps-verified">✅ Verified</span>;
      case 'rejected':
        return <span className="myapps-status-badge myapps-rejected">❌ Rejected</span>;
      default:
        return <span className="myapps-status-badge">{status || 'Pending'}</span>;
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

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status?.toLowerCase() === filter;
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

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `Rs. ${parseFloat(amount).toLocaleString('en-PK')}/-`;
  };

  const LoadingSpinner = () => (
    <div className="myapps-loading-spinner">
      <div className="myapps-spinner"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="myapps-loading-container">
        <LoadingSpinner />
        <p>Loading your applications...</p>
        <pre style={{color: '#718096', fontSize: '12px', marginTop: '10px', whiteSpace: 'pre-wrap'}}>
          {debugInfo}
        </pre>
      </div>
    );
  }

  return (
    <div className="myapps-main-container">
      <div className="myapps-header-section">
        <h1>
          <span className="myapps-header-icon">📋</span>
          My School Applications
        </h1>
        <p>Track the status of your school admission applications</p>
        <div style={{background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginTop: '10px'}}>
          <pre style={{color: '#475569', fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap'}}>
            Debug: {debugInfo}
          </pre>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="myapps-status-grid">
        <div className="myapps-stat-card myapps-stat-total">
          <span className="myapps-stat-icon">📊</span>
          <div className="myapps-stat-info">
            <span className="myapps-stat-value">{applications.length}</span>
            <span className="myapps-stat-label">Total Applications</span>
          </div>
        </div>
        <div className="myapps-stat-card myapps-stat-pending">
          <span className="myapps-stat-icon">⏳</span>
          <div className="myapps-stat-info">
            <span className="myapps-stat-value">
              {applications.filter(a => a.status?.toLowerCase() === 'pending').length}
            </span>
            <span className="myapps-stat-label">Pending</span>
          </div>
        </div>
        <div className="myapps-stat-card myapps-stat-verified">
          <span className="myapps-stat-icon">✅</span>
          <div className="myapps-stat-info">
            <span className="myapps-stat-value">
              {applications.filter(a => a.status?.toLowerCase() === 'verified').length}
            </span>
            <span className="myapps-stat-label">Verified</span>
          </div>
        </div>
        <div className="myapps-stat-card myapps-stat-rejected">
          <span className="myapps-stat-icon">❌</span>
          <div className="myapps-stat-info">
            <span className="myapps-stat-value">
              {applications.filter(a => a.status?.toLowerCase() === 'rejected').length}
            </span>
            <span className="myapps-stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="myapps-filter-container">
        <button 
          className={`myapps-filter-btn ${filter === 'all' ? 'myapps-filter-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Applications
        </button>
        <button 
          className={`myapps-filter-btn ${filter === 'pending' ? 'myapps-filter-active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`myapps-filter-btn ${filter === 'verified' ? 'myapps-filter-active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified
        </button>
        <button 
          className={`myapps-filter-btn ${filter === 'rejected' ? 'myapps-filter-active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      {error && <div className="myapps-error-message">{error}</div>}

      {filteredApplications.length === 0 ? (
        <div className="myapps-empty-state">
          <span className="myapps-empty-icon">🎓</span>
          <h3>No applications found</h3>
          <p>You haven't submitted any school applications yet with email: {user?.email}</p>
          <button 
            className="myapps-action-btn"
            onClick={() => navigate('/admission')}
          >
            Apply for Admission
          </button>
        </div>
      ) : (
        <div className="myapps-list-container">
          {filteredApplications.map((application) => (
            <div key={application.id} className="myapps-card">
              <div className="myapps-card-header">
                <div className="myapps-card-icon">
                  {getStatusIcon(application.status)}
                </div>
                <div className="myapps-card-title">
                  <h3>{application.student_name}</h3>
                  <p className="myapps-card-reference">Application #{application.id}</p>
                </div>
                {getStatusBadge(application.status)}
              </div>

              <div className="myapps-details-grid">
                <div className="myapps-detail-item">
                  <span className="myapps-detail-label">Father's Name:</span>
                  <span className="myapps-detail-value">{application.father_name || 'N/A'}</span>
                </div>
                <div className="myapps-detail-item">
                  <span className="myapps-detail-label">Class:</span>
                  <span className="myapps-detail-value">{application.admission_class || 'N/A'}</span>
                </div>
                <div className="myapps-detail-item">
                  <span className="myapps-detail-label">Gender:</span>
                  <span className="myapps-detail-value">{application.gender || 'N/A'}</span>
                </div>
                <div className="myapps-detail-item">
                  <span className="myapps-detail-label">Date of Birth:</span>
                  <span className="myapps-detail-value">{formatDate(application.dob)}</span>
                </div>
                <div className="myapps-detail-item">
                  <span className="myapps-detail-label">Contact:</span>
                  <span className="myapps-detail-value">{application.contact_no || 'N/A'}</span>
                </div>
                <div className="myapps-detail-item">
                  <span className="myapps-detail-label">Applied on:</span>
                  <span className="myapps-detail-value">{formatDate(application.admission_date)}</span>
                </div>
              </div>

              {application.mother_name && (
                <div className="myapps-parent-info">
                  <span className="myapps-parent-label">Mother's Name:</span>
                  <span className="myapps-parent-value">{application.mother_name}</span>
                </div>
              )}

              <div className="myapps-card-footer">
                {application.status?.toLowerCase() === 'pending' && (
                  <p className="myapps-status-message myapps-msg-pending">
                    ⏳ Your application is being reviewed by the school admin.
                  </p>
                )}
                {application.status?.toLowerCase() === 'verified' && (
                  <p className="myapps-status-message myapps-msg-verified">
                    ✅ Congratulations! Your application has been verified. Please proceed with the fee payment.
                  </p>
                )}
                {application.status?.toLowerCase() === 'rejected' && (
                  <p className="myapps-status-message myapps-msg-rejected">
                    ❌ Your application was rejected. Please contact the school admin for more information.
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

export default MyApplications;