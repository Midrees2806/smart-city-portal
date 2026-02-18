import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './css/Home.css';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats] = useState({
    totalBookings: 1250,
    totalAdmissions: 850,
    availableRooms: 45,
    activeStudents: 720,
    satisfactionRate: 94,
    partnerSchools: 12
  });

  const [featuredServices] = useState([
    {
      id: 1,
      title: 'Hostel Booking',
      description: 'Comfortable and affordable accommodation with modern amenities',
      icon: '🏨',
      color: '#667eea',
      link: '/hostel',
      stats: '45 rooms available',
      features: ['AC Rooms', '24/7 Security', 'Wi-Fi', 'Mess Facility']
    },
    {
      id: 2,
      title: 'School Admission',
      description: 'Quality education with experienced faculty and modern facilities',
      icon: '🎓',
      color: '#48bb78',
      link: '/school',
      stats: '12 partner schools',
      features: ['Expert Teachers', 'Smart Classes', 'Sports', 'Library']
    }
  ]);

  const [testimonials] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Student - Hostel Resident',
      content: 'The hostel facilities are excellent! Clean rooms, good food, and very supportive staff. Best decision ever!',
      avatar: '👩',
      rating: 5,
      category: 'hostel'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Parent',
      content: 'My son got admission through this portal. The process was smooth and transparent. Highly recommended!',
      avatar: '👨',
      rating: 5,
      category: 'school'
    },
    {
      id: 3,
      name: 'Priya Sharma',
      role: 'Student - School',
      content: 'The school has amazing teachers and great infrastructure. Love the smart classes!',
      avatar: '👩',
      rating: 5,
      category: 'school'
    },
    {
      id: 4,
      name: 'Ahmed Khan',
      role: 'Student - Hostel Resident',
      content: 'Safe environment, great location, and affordable prices. Couldn\'t ask for more!',
      avatar: '👨',
      rating: 5,
      category: 'hostel'
    }
  ]);

  const [announcements] = useState([
    {
      id: 1,
      title: 'New Hostel Block Opening',
      date: '2024-03-15',
      content: 'A new hostel block with 100 rooms will be operational from next month. Early bookings open now!',
      type: 'hostel',
      icon: '🏗️'
    },
    {
      id: 2,
      title: 'Admission Deadline Extended',
      date: '2024-03-10',
      content: 'School admissions for the academic year 2024-25 have been extended until March 30th.',
      type: 'school',
      icon: '📅'
    },
    {
      id: 3,
      title: 'Sports Tournament',
      date: '2024-03-05',
      content: 'Annual inter-hostel sports tournament registration starts next week. All residents welcome!',
      type: 'hostel',
      icon: '🏆'
    }
  ]);

  const [partners] = useState([
    { id: 1, name: 'City University', logo: '🏛️', type: 'education' },
    { id: 2, name: 'Global Schools', logo: '🏫', type: 'education' },
    { id: 3, name: 'Tech Solutions', logo: '💻', type: 'corporate' },
    { id: 4, name: 'Health Plus', logo: '🏥', type: 'healthcare' },
    { id: 5, name: 'Sports Academy', logo: '⚽', type: 'sports' },
    { id: 6, name: 'Food Services', logo: '🍽️', type: 'catering' }
  ]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title animate-fade-in">
            Welcome to <span className="highlight">Smart City Portal</span>
          </h1>
          <p className="hero-subtitle animate-fade-in-delay">
            Your one-stop solution for hostel bookings and school admissions
          </p>
          <div className="hero-buttons animate-fade-in-delay-2">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn btn-primary">
                  <span className="btn-icon">📝</span>
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  <span className="btn-icon">🔑</span>
                  Login
                </Link>
              </>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => navigate(user?.category === 'hostel' ? '/booking' : '/admission')}
              >
                <span className="btn-icon">🚀</span>
                Go to Dashboard
              </button>
            )}
          </div>
          <div className="hero-stats animate-fade-in-delay-3">
            <div className="stat-item">
              <span className="stat-number">{stats.totalBookings}+</span>
              <span className="stat-label">Bookings</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalAdmissions}+</span>
              <span className="stat-label">Admissions</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{stats.satisfactionRate}%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll" onClick={() => scrollToSection('services')}>
          <span className="scroll-text">Scroll to explore</span>
          <span className="scroll-icon">↓</span>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Comprehensive solutions for students and parents</p>
        </div>
        
        <div className="services-grid">
          {featuredServices.map((service) => (
            <div key={service.id} className="service-card" style={{ borderTopColor: service.color }}>
              <div className="service-icon" style={{ background: `${service.color}20` }}>
                <span>{service.icon}</span>
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              
              <div className="service-features">
                {service.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-bullet">•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="service-stats">
                <span className="stats-badge">{service.stats}</span>
              </div>
              
              <Link to={service.link} className="service-link">
                <span>Learn More</span>
                <span className="link-arrow">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stats-card">
            <span className="stats-icon">🏨</span>
            <span className="stats-number">{stats.totalBookings}</span>
            <span className="stats-label">Total Bookings</span>
          </div>
          <div className="stats-card">
            <span className="stats-icon">🎓</span>
            <span className="stats-number">{stats.totalAdmissions}</span>
            <span className="stats-label">Total Admissions</span>
          </div>
          <div className="stats-card">
            <span className="stats-icon">🛏️</span>
            <span className="stats-number">{stats.availableRooms}</span>
            <span className="stats-label">Available Rooms</span>
          </div>
          <div className="stats-card">
            <span className="stats-icon">👥</span>
            <span className="stats-number">{stats.activeStudents}</span>
            <span className="stats-label">Active Students</span>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="announcements-section">
        <div className="section-header">
          <h2 className="section-title">Latest Announcements</h2>
          <p className="section-subtitle">Stay updated with our latest news and events</p>
        </div>
        
        <div className="announcements-grid">
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`announcement-card ${announcement.type}`}>
              <div className="announcement-header">
                <span className="announcement-icon">{announcement.icon}</span>
                <span className="announcement-date">{new Date(announcement.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
              <h3 className="announcement-title">{announcement.title}</h3>
              <p className="announcement-content">{announcement.content}</p>
              <span className="announcement-tag">{announcement.type}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">What People Say</h2>
          <p className="section-subtitle">Trusted by thousands of students and parents</p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <span>{testimonial.avatar}</span>
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
              <span className={`testimonial-category ${testimonial.category}`}>
                {testimonial.category === 'hostel' ? '🏨 Hostel' : '🎓 School'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="section-header">
          <h2 className="section-title">Our Partners</h2>
          <p className="section-subtitle">Collaborating with leading institutions</p>
        </div>
        
        <div className="partners-grid">
          {partners.map((partner) => (
            <div key={partner.id} className="partner-card">
              <span className="partner-logo">{partner.logo}</span>
              <span className="partner-name">{partner.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-text">Join thousands of satisfied students and parents today</p>
          <div className="cta-buttons">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  <span className="btn-icon">📝</span>
                  Register Now
                </Link>
                <Link to="/hostel" className="btn btn-outline btn-large">
                  <span className="btn-icon">🏨</span>
                  Explore Hostels
                </Link>
              </>
            ) : (
              <button 
                className="btn btn-primary btn-large"
                onClick={() => navigate(user?.category === 'hostel' ? '/booking' : '/admission')}
              >
                <span className="btn-icon">🚀</span>
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;