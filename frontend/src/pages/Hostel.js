import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './css/Hostel.css';

const Hostel = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [hostels] = useState([
    {
      id: 1,
      name: 'Sunrise Student Hostel',
      location: 'Downtown, City Center',
      distance: '0.5 km from University',
      price: '$250/month',
      rating: 4.8,
      reviews: 124,
      type: 'boys',
      capacity: 120,
      availableRooms: 15,
      image: '🏨',
      features: ['Wi-Fi', 'AC Rooms', 'Mess', '24/7 Security', 'Study Room', 'Gym'],
      description: 'Modern hostel with all amenities, located close to the university. Perfect for students seeking comfort and convenience.',
      contact: '+1 234 567 890',
      email: 'sunrise@hostel.com',
      address: '123 University Ave, City Center'
    },
    {
      id: 2,
      name: 'Green Valley Girls Hostel',
      location: 'Green Valley, North Campus',
      distance: '1.2 km from University',
      price: '$280/month',
      rating: 4.9,
      reviews: 98,
      type: 'girls',
      capacity: 80,
      availableRooms: 8,
      image: '🏡',
      features: ['Wi-Fi', 'AC Rooms', 'Vegetarian Mess', 'Security', 'Common Room', 'Library'],
      description: 'Safe and secure environment for girl students with excellent facilities and caring staff.',
      contact: '+1 234 567 891',
      email: 'greenvalley@hostel.com',
      address: '456 Park Road, North Campus'
    },
    {
      id: 3,
      name: 'Central City Hostel',
      location: 'Central District',
      distance: '0.8 km from University',
      price: '$230/month',
      rating: 4.6,
      reviews: 156,
      type: 'co-ed',
      capacity: 150,
      availableRooms: 22,
      image: '🏤',
      features: ['Wi-Fi', 'Non-AC', 'Mess', 'Security', 'Sports Area', 'Laundry'],
      description: 'Affordable accommodation with basic amenities, popular among students on budget.',
      contact: '+1 234 567 892',
      email: 'central@hostel.com',
      address: '789 Main Street, Central District'
    },
    {
      id: 4,
      name: 'Luxury Executive Hostel',
      location: 'Riverside',
      distance: '2.5 km from University',
      price: '$350/month',
      rating: 4.9,
      reviews: 67,
      type: 'co-ed',
      capacity: 60,
      availableRooms: 5,
      image: '🏰',
      features: ['Wi-Fi', 'AC Rooms', 'Premium Mess', 'Gym', 'Swimming Pool', 'Study Lounge'],
      description: 'Premium hostel with luxury amenities for students who want the best living experience.',
      contact: '+1 234 567 893',
      email: 'luxury@hostel.com',
      address: '321 River View, Riverside'
    },
    {
      id: 5,
      name: 'Boys Pride Hostel',
      location: 'East End',
      distance: '1.8 km from University',
      price: '$240/month',
      rating: 4.7,
      reviews: 112,
      type: 'boys',
      capacity: 100,
      availableRooms: 12,
      image: '🏢',
      features: ['Wi-Fi', 'AC/Non-AC', 'Mess', 'Security', 'Game Room', 'Cafeteria'],
      description: 'Vibrant hostel community with great facilities and regular social events.',
      contact: '+1 234 567 894',
      email: 'boyspride@hostel.com',
      address: '567 East Avenue, East End'
    },
    {
      id: 6,
      name: 'Sakura Girls Hostel',
      location: 'Westside',
      distance: '1.5 km from University',
      price: '$260/month',
      rating: 4.8,
      reviews: 89,
      type: 'girls',
      capacity: 70,
      availableRooms: 7,
      image: '🏠',
      features: ['Wi-Fi', 'AC Rooms', 'Japanese Mess', 'Security', 'Yoga Room', 'Garden'],
      description: 'Unique hostel with Japanese-inspired design and healthy living focus.',
      contact: '+1 234 567 895',
      email: 'sakura@hostel.com',
      address: '890 West Boulevard, Westside'
    }
  ]);

  const [amenities] = useState([
    { id: 1, name: 'Free Wi-Fi', icon: '📶', count: 45 },
    { id: 2, name: 'AC Rooms', icon: '❄️', count: 32 },
    { id: 3, name: '24/7 Security', icon: '🛡️', count: 48 },
    { id: 4, name: 'Mess Facility', icon: '🍽️', count: 42 },
    { id: 5, name: 'Study Room', icon: '📚', count: 28 },
    { id: 6, name: 'Gym', icon: '💪', count: 18 },
    { id: 7, name: 'Laundry', icon: '🧺', count: 35 },
    { id: 8, name: 'Parking', icon: '🅿️', count: 25 }
  ]);

  const [reviews] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      avatar: '👨',
      rating: 5,
      comment: 'Great place to stay! Very clean and the staff is extremely helpful. Highly recommended!',
      hostel: 'Sunrise Student Hostel',
      date: '2 days ago'
    },
    {
      id: 2,
      name: 'Priya Patel',
      avatar: '👩',
      rating: 5,
      comment: 'Safe environment for girls. The wardens are very caring and food is good.',
      hostel: 'Green Valley Girls Hostel',
      date: '1 week ago'
    },
    {
      id: 3,
      name: 'Ahmed Khan',
      avatar: '👨',
      rating: 4,
      comment: 'Good value for money. Location is perfect for students.',
      hostel: 'Central City Hostel',
      date: '3 days ago'
    }
  ]);

  const [faqs] = useState([
    {
      id: 1,
      question: 'What documents are required for booking?',
      answer: 'You need your student ID, government ID proof, passport size photos, and admission letter.'
    },
    {
      id: 2,
      question: 'Is food included in the price?',
      answer: 'Most hostels offer meal plans. The details are mentioned in each hostel\'s description.'
    },
    {
      id: 3,
      question: 'Can I get a refund if I cancel?',
      answer: 'Cancellation policies vary by hostel. Please check the terms before booking.'
    },
    {
      id: 4,
      question: 'Is there a curfew?',
      answer: 'Most hostels have a curfew for security. Timings vary and are mentioned in hostel details.'
    }
  ]);

  const [openFaq, setOpenFaq] = useState(null);

  const filters = [
    { id: 'all', label: 'All Hostels', icon: '🏘️' },
    { id: 'boys', label: 'Boys Hostel', icon: '👨' },
    { id: 'girls', label: 'Girls Hostel', icon: '👩' },
    { id: 'co-ed', label: 'Co-ed', icon: '👥' }
  ];

  const filteredHostels = hostels.filter(hostel => {
    const matchesFilter = activeFilter === 'all' || hostel.type === activeFilter;
    const matchesSearch = hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hostel.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (hostel) => {
    setSelectedHostel(hostel);
    setShowModal(true);
  };

  const handleBookNow = (hostel) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to book a hostel' } });
    } else {
      navigate('/booking', { state: { selectedHostel: hostel } });
    }
  };

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="hostel-page">
      {/* Hero Section */}
      <section className="hostel-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title animate-slide-down">
            Find Your Perfect <span className="highlight">Student Home</span>
          </h1>
          <p className="hero-subtitle animate-slide-up">
            Discover comfortable and affordable hostel accommodations near your campus
          </p>
          
          {/* Search Bar */}
          <div className="search-container animate-fade-in">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by hostel name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{hostels.length}+</span>
              <span className="stat-label">Hostels</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{hostels.reduce((acc, h) => acc + h.availableRooms, 0)}+</span>
              <span className="stat-label">Rooms</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Happy Students</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filters-header">
            <h2>Browse by Type</h2>
            <p>Find hostels that match your preferences</p>
          </div>
          
          <div className="filters-grid">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-label">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="amenities-section">
        <div className="amenities-container">
          <div className="amenities-header">
            <h3>Popular Amenities</h3>
            <p>Most requested features by students</p>
          </div>
          
          <div className="amenities-grid">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="amenity-card">
                <span className="amenity-icon">{amenity.icon}</span>
                <div className="amenity-info">
                  <span className="amenity-name">{amenity.name}</span>
                  <span className="amenity-count">{amenity.count}+ hostels</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hostels Grid */}
      <section className="hostels-section">
        <div className="hostels-container">
          <div className="section-header">
            <h2 className="section-title">Available Hostels</h2>
            <p className="section-subtitle">Choose from our verified partner hostels</p>
          </div>

          {filteredHostels.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🏨</span>
              <h3>No hostels found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="hostels-grid">
              {filteredHostels.map((hostel) => (
                <div key={hostel.id} className="hostel-card">
                  <div className="hostel-image">
                    <span className="hostel-emoji">{hostel.image}</span>
                    <span className={`hostel-type-badge ${hostel.type}`}>
                      {hostel.type === 'boys' ? '👨 Boys' : hostel.type === 'girls' ? '👩 Girls' : '👥 Co-ed'}
                    </span>
                    <span className="hostel-rating">
                      <span className="rating-star">★</span>
                      {hostel.rating} ({hostel.reviews})
                    </span>
                  </div>
                  
                  <div className="hostel-content">
                    <h3 className="hostel-name">{hostel.name}</h3>
                    
                    <div className="hostel-location">
                      <span className="location-icon">📍</span>
                      <span>{hostel.location}</span>
                    </div>
                    
                    <div className="hostel-distance">
                      <span className="distance-icon">🚶</span>
                      <span>{hostel.distance}</span>
                    </div>
                    
                    <div className="hostel-features">
                      {hostel.features.slice(0, 4).map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                      {hostel.features.length > 4 && (
                        <span className="feature-tag more">+{hostel.features.length - 4}</span>
                      )}
                    </div>
                    
                    <div className="hostel-footer">
                      <div className="hostel-price">
                        <span className="price">{hostel.price}</span>
                        <span className="price-period">/month</span>
                      </div>
                      
                      <div className="hostel-actions">
                        <button 
                          className="details-btn"
                          onClick={() => handleViewDetails(hostel)}
                        >
                          Details
                        </button>
                        <button 
                          className="book-btn"
                          onClick={() => handleBookNow(hostel)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                    
                    <div className="availability-badge">
                      <span className="availability-dot"></span>
                      {hostel.availableRooms} rooms available
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section">
        <div className="why-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Our Hostels?</h2>
            <p className="section-subtitle">Benefits you'll love</p>
          </div>
          
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">✅</div>
              <h3>Verified Properties</h3>
              <p>All hostels are thoroughly verified for safety and quality</p>
            </div>
            <div className="why-card">
              <div className="why-icon">💰</div>
              <h3>Best Price Guarantee</h3>
              <p>We ensure you get the most competitive rates</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🛡️</div>
              <h3>Secure Booking</h3>
              <p>Your payments and information are always safe</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🤝</div>
              <h3>24/7 Support</h3>
              <p>Our team is always ready to assist you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="reviews-section">
        <div className="reviews-container">
          <div className="section-header">
            <h2 className="section-title">What Students Say</h2>
            <p className="section-subtitle">Recent reviews from our residents</p>
          </div>
          
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-avatar">{review.avatar}</div>
                  <div className="reviewer-info">
                    <h4>{review.name}</h4>
                    <p>{review.hostel}</p>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
                
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
                
                <p className="review-comment">"{review.comment}"</p>
              </div>
            ))}
          </div>
          
          <div className="reviews-more">
            <Link to="/reviews" className="more-link">
              See all reviews <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Everything you need to know about hostel booking</p>
          </div>
          
          <div className="faq-grid">
            {faqs.map((faq) => (
              <div key={faq.id} className={`faq-item ${openFaq === faq.id ? 'active' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(faq.id)}>
                  <span>{faq.question}</span>
                  <span className="faq-icon">{openFaq === faq.id ? '−' : '+'}</span>
                </button>
                <div className={`faq-answer ${openFaq === faq.id ? 'show' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Find Your Home?</h2>
          <p className="cta-text">Join thousands of students who found their perfect accommodation through us</p>
          <div className="cta-buttons">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="cta-btn-primary">
                  <span className="btn-icon">📝</span>
                  Register Now
                </Link>
                <Link to="/contact" className="cta-btn-secondary">
                  <span className="btn-icon">📞</span>
                  Contact Us
                </Link>
              </>
            ) : (
              <button 
                className="cta-btn-primary"
                onClick={() => navigate('/booking')}
              >
                <span className="btn-icon">🚀</span>
                Start Booking
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Hostel Details Modal */}
      {showModal && selectedHostel && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            
            <div className="modal-header">
              <span className="modal-emoji">{selectedHostel.image}</span>
              <h2>{selectedHostel.name}</h2>
            </div>
            
            <div className="modal-body">
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="info-label">📍 Location</span>
                  <span className="info-value">{selectedHostel.location}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">🚶 Distance</span>
                  <span className="info-value">{selectedHostel.distance}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">💰 Price</span>
                  <span className="info-value">{selectedHostel.price}/month</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">🏷️ Type</span>
                  <span className="info-value type-badge">{selectedHostel.type}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">📊 Rating</span>
                  <span className="info-value rating">
                    ★ {selectedHostel.rating} ({selectedHostel.reviews} reviews)
                  </span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">🛏️ Available</span>
                  <span className="info-value available">{selectedHostel.availableRooms} rooms</span>
                </div>
              </div>
              
              <div className="modal-description">
                <h3>About this Hostel</h3>
                <p>{selectedHostel.description}</p>
              </div>
              
              <div className="modal-features">
                <h3>Amenities</h3>
                <div className="features-list">
                  {selectedHostel.features.map((feature, index) => (
                    <span key={index} className="feature-badge">✓ {feature}</span>
                  ))}
                </div>
              </div>
              
              <div className="modal-contact">
                <h3>Contact Information</h3>
                <p><span className="contact-icon">📞</span> {selectedHostel.contact}</p>
                <p><span className="contact-icon">✉️</span> {selectedHostel.email}</p>
                <p><span className="contact-icon">📍</span> {selectedHostel.address}</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button 
                className="modal-book"
                onClick={() => {
                  setShowModal(false);
                  handleBookNow(selectedHostel);
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hostel;