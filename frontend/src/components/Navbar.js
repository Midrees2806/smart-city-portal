import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCategoryIcon = (category) => {
    return category === 'hostel' ? '🏠' : '📚';
  };

  const getRoleBadgeColor = (role) => {
    return role === 'admin' ? '#dc3545' : '#28a745';
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo with Icon */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <span className="logo-icon">🏙️</span>
          <span className="logo-text">Smart<span>City</span></span>
        </Link>

        {/* Mobile Menu Toggle */}
        <div className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}></span>
        </div>

        {/* Navigation Menu */}
        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>
              <span className="nav-icon">🏠</span>
              <span>Home</span>
            </Link>
          </li>
          
          <li className="nav-item">
            <Link to="/about" className="nav-link" onClick={closeMobileMenu}>
              <span className="nav-icon">ℹ️</span>
              <span>About</span>
            </Link>
          </li>
          
          {isAuthenticated ? (
            <>
              {/* Regular user navigation based on category */}
              {!isAdmin && user?.category === 'hostel' && (
                <>
                  <li className="nav-item">
                    <Link to="/booking" className="nav-link" onClick={closeMobileMenu}>
                      <span className="nav-icon">🏨</span>
                      <span>Book Hostel</span>
                    </Link>
                  </li>
                  {/* ADD MY BOOKINGS LINK FOR HOSTEL USERS */}
                  <li className="nav-item">
                    <Link to="/my-bookings" className="nav-link" onClick={closeMobileMenu}>
                      <span className="nav-icon">📋</span>
                      <span>My Bookings</span>
                    </Link>
                  </li>
                </>
              )}
              
              {!isAdmin && user?.category === 'school' && (
                <>
                  <li className="nav-item">
                    <Link to="/admission" className="nav-link" onClick={closeMobileMenu}>
                      <span className="nav-icon">🎓</span>
                      <span>School Admission</span>
                    </Link>
                  </li>
                  {/* ADD MY APPLICATIONS LINK FOR SCHOOL USERS */}
                  <li className="nav-item">
                    <Link to="/my-applications" className="nav-link" onClick={closeMobileMenu}>
                      <span className="nav-icon">📝</span>
                      <span>My Applications</span>
                    </Link>
                  </li>
                </>
              )}
              
              {/* Admin navigation */}
              {isAdmin && (
                <>
                  {user?.category === 'hostel' && (
                    <li className="nav-item">
                      <Link to="/admin/bookings" className="nav-link" onClick={closeMobileMenu}>
                        <span className="nav-icon">⚙️</span>
                        <span>Manage Bookings</span>
                      </Link>
                    </li>
                  )}
                  {user?.category === 'school' && (
                    <li className="nav-item">
                      <Link to="/admin/admissions" className="nav-link" onClick={closeMobileMenu}>
                        <span className="nav-icon">⚙️</span>
                        <span>Manage Admissions</span>
                      </Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <Link to="/admin/ai-fee" className="nav-link" onClick={closeMobileMenu}>
                      <span className="nav-icon">💰</span>
                      <span>Fee Reminder</span>
                    </Link>
                  </li>
                </>
              )}
              
              {/* User Dropdown with enhanced design */}
              <li className="nav-item user-dropdown" ref={dropdownRef}>
                <div 
                  className={`user-info ${showDropdown ? 'active' : ''}`} 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar" style={{ backgroundColor: getRoleBadgeColor(user?.role) }}>
                    {getInitials(user?.full_name)}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user?.full_name?.split(' ')[0]}</span>
                    <span className="user-badge" style={{ backgroundColor: getRoleBadgeColor(user?.role) }}>
                      {user?.role}
                    </span>
                  </div>
                  <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
                </div>
                
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <div className="dropdown-avatar" style={{ backgroundColor: getRoleBadgeColor(user?.role) }}>
                          {getInitials(user?.full_name)}
                        </div>
                        <div className="dropdown-user-details">
                          <strong>{user?.full_name}</strong>
                          <small>{user?.email}</small>
                          <span className="dropdown-category">
                            {getCategoryIcon(user?.category)} {user?.category === 'hostel' ? 'Hostel' : 'School'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span className="item-icon">👤</span>
                      <span>Profile Settings</span>
                      <span className="item-shortcut">⌘P</span>
                    </Link>
                    
                    {user?.role === 'user' && (
                      <>
                        <Link 
                          to={user?.category === 'hostel' ? '/booking' : '/admission'} 
                          className="dropdown-item" 
                          onClick={() => setShowDropdown(false)}
                        >
                          <span className="item-icon">{user?.category === 'hostel' ? '🏨' : '🎓'}</span>
                          <span>{user?.category === 'hostel' ? 'New Booking' : 'New Application'}</span>
                        </Link>
                        {/* ADD MY BOOKINGS/APPLICATIONS TO DROPDOWN AS WELL */}
                        <Link 
                          to={user?.category === 'hostel' ? '/my-bookings' : '/my-applications'} 
                          className="dropdown-item" 
                          onClick={() => setShowDropdown(false)}
                        >
                          <span className="item-icon">📋</span>
                          <span>{user?.category === 'hostel' ? 'My Bookings' : 'My Applications'}</span>
                        </Link>
                      </>
                    )}
                    
                    {/* Commented out admin dashboard link */}
                    {/* {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        <span className="item-icon">📊</span>
                        <span>Dashboard</span>
                      </Link>
                    )} */}
                    
                    <div className="dropdown-divider"></div>
                    
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      <span className="item-icon">🚪</span>
                      <span>Logout</span>
                      <span className="item-shortcut">⌘L</span>
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/hostel" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">🏨</span>
                  <span>Hostel</span>
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/school" className="nav-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">🏫</span>
                  <span>School</span>
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/login" className="nav-link login-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">🔑</span>
                  <span>Login</span>
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/register" className="nav-link register-link" onClick={closeMobileMenu}>
                  <span className="nav-icon">📝</span>
                  <span>Register</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;