import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './css/School.css';

const School = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');

  const [schools] = useState([
    {
      id: 1,
      name: 'Delhi Public School',
      location: 'City Center',
      board: 'CBSE',
      level: 'senior-secondary',
      grades: 'Nursery - Class 12',
      rating: 4.9,
      reviews: 245,
      fees: '$500/month',
      image: '🏫',
      type: 'co-ed',
      established: 1985,
      students: 2500,
      teachers: 120,
      features: ['Smart Classrooms', 'Sports Complex', 'Science Labs', 'Library', 'Transport', 'Cafeteria'],
      description: 'One of the premier educational institutions with a focus on holistic development and academic excellence.',
      contact: '+1 234 567 890',
      email: 'admissions@dps.edu',
      address: '123 Education Avenue, City Center',
      website: 'www.dps.edu',
      achievements: ['Best School Award 2023', 'National Sports Championship', '100% Board Results']
    },
    {
      id: 2,
      name: 'St. Mary\'s Convent',
      location: 'Green Valley',
      board: 'ICSE',
      level: 'secondary',
      grades: 'Class 1 - Class 10',
      rating: 4.8,
      reviews: 189,
      fees: '$450/month',
      image: '⛪',
      type: 'girls',
      established: 1978,
      students: 1800,
      teachers: 95,
      features: ['Computer Labs', 'Music Room', 'Art Studio', 'Playground', 'Library', 'Medical Room'],
      description: 'A prestigious institution known for its disciplined environment and strong academic foundation.',
      contact: '+1 234 567 891',
      email: 'info@stmarys.edu',
      address: '456 Peace Road, Green Valley',
      website: 'www.stmarys.edu',
      achievements: ['Best Girls School Award', 'Cultural Excellence Trophy', 'Green School Certificate']
    },
    {
      id: 3,
      name: 'National Public School',
      location: 'Riverside',
      board: 'CBSE',
      level: 'senior-secondary',
      grades: 'Nursery - Class 12',
      rating: 4.7,
      reviews: 312,
      fees: '$550/month',
      image: '🏛️',
      type: 'co-ed',
      established: 1992,
      students: 3200,
      teachers: 150,
      features: ['Swimming Pool', 'Auditorium', 'Robotics Lab', 'Smart Classes', 'Hostel', 'Sports Ground'],
      description: 'Modern infrastructure with emphasis on technology-enabled learning and overall personality development.',
      contact: '+1 234 567 892',
      email: 'admissions@nps.edu',
      address: '789 River View, Riverside',
      website: 'www.nps.edu',
      achievements: ['Innovation in Education Award', 'Tech-Savvy School Award', 'Sports Excellence']
    },
    {
      id: 4,
      name: 'Little Flower School',
      location: 'East End',
      board: 'State Board',
      level: 'primary',
      grades: 'Nursery - Class 5',
      rating: 4.6,
      reviews: 98,
      fees: '$300/month',
      image: '🌸',
      type: 'co-ed',
      established: 2005,
      students: 600,
      teachers: 35,
      features: ['Activity Rooms', 'Play Area', 'Story Corner', 'Art & Craft', 'Day Care', 'Transport'],
      description: 'A nurturing environment for young learners with focus on foundational skills and creative development.',
      contact: '+1 234 567 893',
      email: 'info@littleflower.edu',
      address: '321 East Avenue, East End',
      website: 'www.littleflower.edu',
      achievements: ['Best Primary School', 'Innovative Teaching Methods', 'Parent Choice Award']
    },
    {
      id: 5,
      name: 'International Indian School',
      location: 'Westside',
      board: 'IB',
      level: 'senior-secondary',
      grades: 'Class 6 - Class 12',
      rating: 4.9,
      reviews: 167,
      fees: '$800/month',
      image: '🌍',
      type: 'co-ed',
      established: 2010,
      students: 1200,
      teachers: 85,
      features: ['IB Curriculum', 'Global Exchange', 'Advanced Labs', 'Sports Academy', 'Counseling', 'Career Guidance'],
      description: 'International curriculum with global perspective, preparing students for top universities worldwide.',
      contact: '+1 234 567 894',
      email: 'admissions@iis.edu',
      address: '567 Global Drive, Westside',
      website: 'www.iis.edu',
      achievements: ['IB School of the Year', 'University Placements Record', 'International Collaboration']
    },
    {
      id: 6,
      name: 'Kendriya Vidyalaya',
      location: 'North Campus',
      board: 'CBSE',
      level: 'senior-secondary',
      grades: 'Class 1 - Class 12',
      rating: 4.5,
      reviews: 278,
      fees: '$350/month',
      image: '🏢',
      type: 'co-ed',
      established: 1980,
      students: 2200,
      teachers: 110,
      features: ['Library', 'Sports Facilities', 'Computer Labs', 'Science Labs', 'Canteen', 'Medical Room'],
      description: 'Central government school with affordable fees and quality education across all streams.',
      contact: '+1 234 567 895',
      email: 'kv@edu.in',
      address: '890 North Avenue, North Campus',
      website: 'www.kv.edu',
      achievements: ['Academic Excellence Award', 'Sports Championship', 'Cultural Fest Winner']
    }
  ]);

  const [boards] = useState([
    { id: 1, name: 'CBSE', icon: '📚', count: 28 },
    { id: 2, name: 'ICSE', icon: '📖', count: 15 },
    { id: 3, name: 'IB', icon: '🌐', count: 8 },
    { id: 4, name: 'State Board', icon: '🏛️', count: 22 }
  ]);

  const [levels] = useState([
    { id: 'all', label: 'All Levels', icon: '🎓' },
    { id: 'primary', label: 'Primary School', icon: '🧒' },
    { id: 'secondary', label: 'Secondary School', icon: '👦' },
    { id: 'senior-secondary', label: 'Senior Secondary', icon: '👨' }
  ]);

  const [facilities] = useState([
    { id: 1, name: 'Smart Classrooms', icon: '💻', count: 42 },
    { id: 2, name: 'Sports Complex', icon: '⚽', count: 38 },
    { id: 3, name: 'Science Labs', icon: '🔬', count: 45 },
    { id: 4, name: 'Library', icon: '📚', count: 48 },
    { id: 5, name: 'Transport', icon: '🚌', count: 35 },
    { id: 6, name: 'Hostel', icon: '🏨', count: 18 }
  ]);

  const [testimonials] = useState([
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Parent',
      avatar: '👩',
      rating: 5,
      comment: 'My daughter has been studying at DPS for 5 years. The teachers are amazing and the facilities are top-notch!',
      school: 'Delhi Public School'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      role: 'Parent',
      avatar: '👨',
      rating: 5,
      comment: 'St. Mary\'s has provided excellent education to my daughter. The values they instill are commendable.',
      school: 'St. Mary\'s Convent'
    },
    {
      id: 3,
      name: 'Anita Desai',
      role: 'Teacher',
      avatar: '👩‍🏫',
      rating: 5,
      comment: 'Working at NPS has been a wonderful experience. The school truly cares about student development.',
      school: 'National Public School'
    }
  ]);

  const [achievements] = useState([
    {
      id: 1,
      title: 'Academic Excellence',
      description: '95% of our students score above 90% in board exams',
      icon: '🏆',
      color: '#ffd700'
    },
    {
      id: 2,
      title: 'Sports Champions',
      description: 'Won 15 inter-school championships this year',
      icon: '⚽',
      color: '#48bb78'
    },
    {
      id: 3,
      title: 'Cultural Heritage',
      description: 'Recognized for preserving cultural values',
      icon: '🎭',
      color: '#f59e0b'
    },
    {
      id: 4,
      title: 'Innovation Hub',
      description: 'Awarded for best STEM education program',
      icon: '💡',
      color: '#667eea'
    }
  ]);

  const [faqs] = useState([
    {
      id: 1,
      question: 'What is the admission process?',
      answer: 'The admission process typically includes filling an application form, submitting documents, and an interaction with the student and parents.'
    },
    {
      id: 2,
      question: 'What documents are required?',
      answer: 'Birth certificate, previous school records, transfer certificate, passport size photos, and address proof.'
    },
    {
      id: 3,
      question: 'Is there an entrance test?',
      answer: 'Most schools conduct a basic assessment to understand the student\'s learning level. This varies by school and grade.'
    },
    {
      id: 4,
      question: 'When does the admission season start?',
      answer: 'Admissions typically start in January for the academic year beginning in April/May.'
    }
  ]);

  const [openFaq, setOpenFaq] = useState(null);

  const filters = [
    { id: 'all', label: 'All Schools', icon: '🏫' },
    { id: 'co-ed', label: 'Co-ed', icon: '👥' },
    { id: 'boys', label: 'Boys School', icon: '👨' },
    { id: 'girls', label: 'Girls School', icon: '👩' }
  ];

  const filteredSchools = schools.filter(school => {
    const matchesFilter = activeFilter === 'all' || school.type === activeFilter;
    const matchesLevel = selectedLevel === 'all' || school.level === selectedLevel;
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.board.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesLevel && matchesSearch;
  });

  const handleViewDetails = (school) => {
    setSelectedSchool(school);
    setShowModal(true);
  };

  const handleApplyNow = (school) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to apply for admission' } });
    } else {
      navigate('/admission', { state: { selectedSchool: school } });
    }
  };

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="school-page">
      {/* Hero Section */}
      <section className="school-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title animate-slide-down">
            Find the Perfect <span className="highlight">School</span>
          </h1>
          <p className="hero-subtitle animate-slide-up">
            Discover top-rated schools and secure your child's future with quality education
          </p>
          
          {/* Search Bar */}
          <div className="search-container animate-fade-in">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by school name, location or board..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{schools.length}+</span>
              <span className="stat-label">Schools</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">15,000+</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filters-header">
            <h2>Browse by Category</h2>
            <p>Find schools that match your preferences</p>
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

          {/* Level Filters */}
          <div className="level-filters">
            {levels.map((level) => (
              <button
                key={level.id}
                className={`level-btn ${selectedLevel === level.id ? 'active' : ''}`}
                onClick={() => setSelectedLevel(level.id)}
              >
                <span className="level-icon">{level.icon}</span>
                <span className="level-label">{level.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Boards Section */}
      <section className="boards-section">
        <div className="boards-container">
          <div className="boards-header">
            <h3>Popular Education Boards</h3>
            <p>Choose from various curriculum options</p>
          </div>
          
          <div className="boards-grid">
            {boards.map((board) => (
              <div key={board.id} className="board-card">
                <span className="board-icon">{board.icon}</span>
                <div className="board-info">
                  <span className="board-name">{board.name}</span>
                  <span className="board-count">{board.count} schools</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="facilities-section">
        <div className="facilities-container">
          <div className="facilities-header">
            <h3>School Facilities</h3>
            <p>Modern amenities for holistic development</p>
          </div>
          
          <div className="facilities-grid">
            {facilities.map((facility) => (
              <div key={facility.id} className="facility-card">
                <span className="facility-icon">{facility.icon}</span>
                <div className="facility-info">
                  <span className="facility-name">{facility.name}</span>
                  <span className="facility-count">{facility.count}+ schools</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools Grid */}
      <section className="schools-section">
        <div className="schools-container">
          <div className="section-header">
            <h2 className="section-title">Top Rated Schools</h2>
            <p className="section-subtitle">Choose from our verified partner institutions</p>
          </div>

          {filteredSchools.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🏫</span>
              <h3>No schools found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="schools-grid">
              {filteredSchools.map((school) => (
                <div key={school.id} className="school-card">
                  <div className="school-image">
                    <span className="school-emoji">{school.image}</span>
                    <span className={`school-type-badge ${school.type}`}>
                      {school.type === 'boys' ? '👨 Boys' : school.type === 'girls' ? '👩 Girls' : '👥 Co-ed'}
                    </span>
                    <span className="school-rating">
                      <span className="rating-star">★</span>
                      {school.rating} ({school.reviews})
                    </span>
                  </div>
                  
                  <div className="school-content">
                    <h3 className="school-name">{school.name}</h3>
                    
                    <div className="school-location">
                      <span className="location-icon">📍</span>
                      <span>{school.location}</span>
                    </div>
                    
                    <div className="school-board">
                      <span className="board-icon">📚</span>
                      <span>{school.board} • {school.grades}</span>
                    </div>
                    
                    <div className="school-features">
                      {school.features.slice(0, 4).map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                      {school.features.length > 4 && (
                        <span className="feature-tag more">+{school.features.length - 4}</span>
                      )}
                    </div>
                    
                    <div className="school-footer">
                      <div className="school-fees">
                        <span className="fees">{school.fees}</span>
                        <span className="fees-period">(approx)</span>
                      </div>
                      
                      <div className="school-actions">
                        <button 
                          className="details-btn"
                          onClick={() => handleViewDetails(school)}
                        >
                          Details
                        </button>
                        <button 
                          className="apply-btn"
                          onClick={() => handleApplyNow(school)}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                    
                    <div className="establishment-badge">
                      <span className="est-icon">📅</span>
                      Est. {school.established} • {school.students}+ Students
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section">
        <div className="achievements-container">
          <div className="section-header">
            <h2 className="section-title">Our Achievements</h2>
            <p className="section-subtitle">Recognition of our commitment to excellence</p>
          </div>
          
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-card" style={{ borderTopColor: achievement.color }}>
                <div className="achievement-icon" style={{ background: `${achievement.color}20`, color: achievement.color }}>
                  {achievement.icon}
                </div>
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header">
            <h2 className="section-title">What Parents Say</h2>
            <p className="section-subtitle">Real experiences from our community</p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{testimonial.comment}</p>
                <div className="testimonial-footer">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                    <p className="testimonial-school">{testimonial.school}</p>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="star">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Everything you need to know about school admissions</p>
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
          <h2 className="cta-title">Ready to Begin the Journey?</h2>
          <p className="cta-text">Join thousands of parents who found the perfect school for their children</p>
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
                onClick={() => navigate('/admission')}
              >
                <span className="btn-icon">🚀</span>
                Start Application
              </button>
            )}
          </div>
        </div>
      </section>

      {/* School Details Modal */}
      {showModal && selectedSchool && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            
            <div className="modal-header">
              <span className="modal-emoji">{selectedSchool.image}</span>
              <h2>{selectedSchool.name}</h2>
            </div>
            
            <div className="modal-body">
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="info-label">📍 Location</span>
                  <span className="info-value">{selectedSchool.location}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">📚 Board</span>
                  <span className="info-value">{selectedSchool.board}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">💰 Fees</span>
                  <span className="info-value">{selectedSchool.fees}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">🏷️ Type</span>
                  <span className="info-value type-badge">{selectedSchool.type}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">📊 Rating</span>
                  <span className="info-value rating">
                    ★ {selectedSchool.rating} ({selectedSchool.reviews} reviews)
                  </span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">📅 Established</span>
                  <span className="info-value">{selectedSchool.established}</span>
                </div>
              </div>
              
              <div className="modal-description">
                <h3>About the School</h3>
                <p>{selectedSchool.description}</p>
              </div>
              
              <div className="modal-stats">
                <div className="stat-box">
                  <span className="stat-number">{selectedSchool.students}</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{selectedSchool.teachers}</span>
                  <span className="stat-label">Teachers</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{selectedSchool.grades}</span>
                  <span className="stat-label">Grades</span>
                </div>
              </div>
              
              <div className="modal-features">
                <h3>Facilities</h3>
                <div className="features-list">
                  {selectedSchool.features.map((feature, index) => (
                    <span key={index} className="feature-badge">✓ {feature}</span>
                  ))}
                </div>
              </div>
              
              <div className="modal-achievements">
                <h3>Achievements</h3>
                <div className="achievements-list">
                  {selectedSchool.achievements.map((achievement, index) => (
                    <span key={index} className="achievement-badge">🏆 {achievement}</span>
                  ))}
                </div>
              </div>
              
              <div className="modal-contact">
                <h3>Contact Information</h3>
                <p><span className="contact-icon">📞</span> {selectedSchool.contact}</p>
                <p><span className="contact-icon">✉️</span> {selectedSchool.email}</p>
                <p><span className="contact-icon">📍</span> {selectedSchool.address}</p>
                <p><span className="contact-icon">🌐</span> {selectedSchool.website}</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button 
                className="modal-apply"
                onClick={() => {
                  setShowModal(false);
                  handleApplyNow(selectedSchool);
                }}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default School;