import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/About.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [stats] = useState({
    yearsOfService: 8,
    totalUsers: 15000,
    partnerInstitutions: 45,
    citiesServed: 12,
    successfulPlacements: 2500,
    satisfactionRate: 94
  });

  const [teamMembers] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Founder & CEO',
      department: 'Executive',
      bio: 'Former education administrator with 20+ years of experience in shaping young minds.',
      avatar: '👩‍⚕️',
      social: { linkedin: '#', twitter: '#', email: 'sarah@smartcity.com' }
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      role: 'Head of Education',
      department: 'Academics',
      bio: 'PhD in Educational Leadership, passionate about innovative learning methods.',
      avatar: '👨‍🏫',
      social: { linkedin: '#', twitter: '#', email: 'michael@smartcity.com' }
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Student Services Director',
      department: 'Operations',
      bio: 'Dedicated to creating the best experience for students and parents.',
      avatar: '👩‍💼',
      social: { linkedin: '#', twitter: '#', email: 'emily@smartcity.com' }
    },
    {
      id: 4,
      name: 'David Kumar',
      role: 'Technical Lead',
      department: 'Technology',
      bio: 'Building secure and scalable solutions for educational institutions.',
      avatar: '👨‍💻',
      social: { linkedin: '#', twitter: '#', email: 'david@smartcity.com' }
    }
  ]);

  const [milestones] = useState([
    {
      id: 1,
      year: '2016',
      title: 'The Beginning',
      description: 'Smart City Portal was founded with a vision to digitize educational services.',
      icon: '🚀',
      color: '#667eea'
    },
    {
      id: 2,
      year: '2018',
      title: 'First Milestone',
      description: 'Reached 1000+ successful hostel bookings and school admissions.',
      icon: '🎯',
      color: '#48bb78'
    },
    {
      id: 3,
      year: '2020',
      title: 'Expansion',
      description: 'Expanded to 5 major cities, partnered with 20+ institutions.',
      icon: '🌍',
      color: '#f59e0b'
    },
    {
      id: 4,
      year: '2022',
      title: 'Digital Innovation',
      description: 'Launched AI-powered recommendation system for students.',
      icon: '🤖',
      color: '#ec4899'
    },
    {
      id: 5,
      year: '2024',
      title: 'Today',
      description: 'Serving 15,000+ students across 12 cities with 45+ partners.',
      icon: '🏆',
      color: '#8b5cf6'
    }
  ]);

  const [values] = useState([
    {
      id: 1,
      title: 'Excellence',
      description: 'We strive for excellence in every service we provide.',
      icon: '⭐',
      color: '#ffd700'
    },
    {
      id: 2,
      title: 'Integrity',
      description: 'Honest and transparent dealings with all stakeholders.',
      icon: '🤝',
      color: '#48bb78'
    },
    {
      id: 3,
      title: 'Innovation',
      description: 'Constantly evolving to meet modern educational needs.',
      icon: '💡',
      color: '#667eea'
    },
    {
      id: 4,
      title: 'Student First',
      description: 'Every decision puts student welfare at the forefront.',
      icon: '👥',
      color: '#f59e0b'
    }
  ]);

  const [testimonials] = useState([
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Parent',
      content: 'The transparency and ease of use of this platform is remarkable. My daughter got admission in her dream school!',
      avatar: '👩',
      rating: 5
    },
    {
      id: 2,
      name: 'Rahul Verma',
      role: 'Student',
      content: 'Found the perfect hostel through this portal. The verification process was smooth and secure.',
      avatar: '👨',
      rating: 5
    },
    {
      id: 3,
      name: 'Dr. Anita Desai',
      role: 'School Principal',
      content: 'Partnering with Smart City Portal has streamlined our admission process significantly.',
      avatar: '👩‍🏫',
      rating: 5
    }
  ]);

  const [partners] = useState([
    { id: 1, name: 'Delhi Public Schools', logo: '🏫', type: 'School' },
    { id: 2, name: 'Amity University', logo: '🏛️', type: 'University' },
    { id: 3, name: 'St. Xavier\'s Institutions', logo: '⛪', type: 'School' },
    { id: 4, name: 'IIT Alumni Council', logo: '🎓', type: 'Association' },
    { id: 5, name: 'National Skill Development', logo: '⚙️', type: 'Government' },
    { id: 6, name: 'Education Ministry', logo: '🏛️', type: 'Government' }
  ]);

  const [faqs] = useState([
    {
      id: 1,
      question: 'What services does Smart City Portal provide?',
      answer: 'We provide two main services: Hostel Booking for students looking for accommodation, and School Admission services for parents seeking quality education for their children.'
    },
    {
      id: 2,
      question: 'How secure is my personal information?',
      answer: 'We use bank-level encryption and secure authentication methods to protect your data. All information is stored securely and never shared with third parties without consent.'
    },
    {
      id: 3,
      question: 'Is there a fee for using your services?',
      answer: 'Registration and browsing are completely free. Nominal service fees may apply for confirmed bookings/admissions, which are clearly displayed before any transaction.'
    },
    {
      id: 4,
      question: 'How do I verify the authenticity of listings?',
      answer: 'All partner institutions and hostels undergo thorough verification before being listed on our platform. We regularly audit and update our listings.'
    },
    {
      id: 5,
      question: 'What support do you provide?',
      answer: 'We offer 24/7 customer support via email and phone. Our team is always ready to assist with any queries or issues.'
    }
  ]);

  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title animate-slide-down">
            About <span className="highlight">Smart City Portal</span>
          </h1>
          <p className="hero-subtitle animate-slide-up">
            Bridging the gap between students and quality education since 2016
          </p>
          <div className="hero-stats animate-fade-in">
            <div className="stat-circle">
              <span className="stat-number">{stats.yearsOfService}+</span>
              <span className="stat-label">Years</span>
            </div>
            <div className="stat-circle">
              <span className="stat-number">{stats.totalUsers.toLocaleString()}+</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-circle">
              <span className="stat-number">{stats.partnerInstitutions}+</span>
              <span className="stat-label">Partners</span>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="tabs-section">
        <div className="tabs-container">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'mission' ? 'active' : ''}`}
              onClick={() => setActiveTab('mission')}
            >
              <span className="tab-icon">🎯</span>
              Our Mission
            </button>
            <button 
              className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`}
              onClick={() => setActiveTab('vision')}
            >
              <span className="tab-icon">👁️</span>
              Our Vision
            </button>
            <button 
              className={`tab-btn ${activeTab === 'story' ? 'active' : ''}`}
              onClick={() => setActiveTab('story')}
            >
              <span className="tab-icon">📖</span>
              Our Story
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'mission' && (
              <div className="mission-content animate-fade">
                <h3>Empowering Education Through Technology</h3>
                <p>Our mission is to simplify the process of finding quality education and accommodation for students across the country. We believe that every student deserves access to the best educational opportunities without the hassle of complex admission processes.</p>
                <div className="mission-grid">
                  <div className="mission-card">
                    <span className="mission-icon">🎓</span>
                    <h4>Quality Education</h4>
                    <p>Connecting students with top-tier educational institutions</p>
                  </div>
                  <div className="mission-card">
                    <span className="mission-icon">🏠</span>
                    <h4>Safe Accommodation</h4>
                    <p>Providing verified and secure hostel options</p>
                  </div>
                  <div className="mission-card">
                    <span className="mission-icon">🤝</span>
                    <h4>Student Support</h4>
                    <p>24/7 assistance for all your educational needs</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'vision' && (
              <div className="vision-content animate-fade">
                <h3>Shaping the Future of Education</h3>
                <p>We envision a future where every student can access quality education regardless of their location or background. By leveraging technology, we aim to create a seamless ecosystem connecting students, parents, and educational institutions.</p>
                <div className="vision-stats">
                  <div className="vision-stat">
                    <span className="stat-value">50k+</span>
                    <span className="stat-label">Students by 2025</span>
                  </div>
                  <div className="vision-stat">
                    <span className="stat-value">100+</span>
                    <span className="stat-label">Partner Institutions</span>
                  </div>
                  <div className="vision-stat">
                    <span className="stat-value">30+</span>
                    <span className="stat-label">Cities</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'story' && (
              <div className="story-content animate-fade">
                <h3>From a Simple Idea to Reality</h3>
                <p>Smart City Portal started in 2016 when our founder, Dr. Sarah Johnson, noticed the difficulties students faced in finding reliable accommodation and navigating school admissions. What began as a small initiative has now grown into a trusted platform serving thousands of students nationwide.</p>
                <div className="story-timeline">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="timeline-item">
                      <div className="timeline-marker" style={{ background: milestone.color }}>
                        <span className="timeline-icon">{milestone.icon}</span>
                      </div>
                      <div className="timeline-content">
                        <span className="timeline-year">{milestone.year}</span>
                        <h4>{milestone.title}</h4>
                        <p>{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="section-header">
          <h2 className="section-title">Our Core Values</h2>
          <p className="section-subtitle">The principles that guide everything we do</p>
        </div>
        
        <div className="values-grid">
          {values.map((value) => (
            <div key={value.id} className="value-card">
              <div className="value-icon" style={{ background: `${value.color}20`, color: value.color }}>
                {value.icon}
              </div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-header">
          <h2 className="section-title">Meet Our Team</h2>
          <p className="section-subtitle">Dedicated professionals working for your success</p>
        </div>
        
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-card">
              <div className="team-avatar">
                <span>{member.avatar}</span>
              </div>
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
              <div className="team-social">
                <a href={member.social.linkedin} className="social-link" target="_blank" rel="noopener noreferrer">
                  <span className="social-icon">in</span>
                </a>
                <a href={member.social.twitter} className="social-link" target="_blank" rel="noopener noreferrer">
                  <span className="social-icon">𝕏</span>
                </a>
                <a href={`mailto:${member.social.email}`} className="social-link">
                  <span className="social-icon">✉️</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-background"></div>
        <div className="stats-content">
          <div className="stats-grid-large">
            <div className="stats-item">
              <span className="stats-icon">🏆</span>
              <span className="stats-number">{stats.successfulPlacements}</span>
              <span className="stats-label">Successful Placements</span>
            </div>
            <div className="stats-item">
              <span className="stats-icon">⭐</span>
              <span className="stats-number">{stats.satisfactionRate}%</span>
              <span className="stats-label">Satisfaction Rate</span>
            </div>
            <div className="stats-item">
              <span className="stats-icon">🌆</span>
              <span className="stats-number">{stats.citiesServed}</span>
              <span className="stats-label">Cities Served</span>
            </div>
            <div className="stats-item">
              <span className="stats-icon">🤝</span>
              <span className="stats-number">{stats.partnerInstitutions}</span>
              <span className="stats-label">Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">What People Say</h2>
          <p className="section-subtitle">Real experiences from our community</p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">{testimonial.content}</p>
              <div className="testimonial-footer">
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
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
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="section-header">
          <h2 className="section-title">Our Partners</h2>
          <p className="section-subtitle">Trusted by leading institutions</p>
        </div>
        
        <div className="partners-grid">
          {partners.map((partner) => (
            <div key={partner.id} className="partner-card">
              <span className="partner-logo">{partner.logo}</span>
              <span className="partner-name">{partner.name}</span>
              <span className="partner-type">{partner.type}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Find answers to common queries</p>
        </div>
        
        <div className="faq-container">
          {faqs.map((faq) => (
            <div key={faq.id} className={`faq-item ${openFaq === faq.id ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(faq.id)}>
                <span className="faq-icon">{openFaq === faq.id ? '−' : '+'}</span>
                <span>{faq.question}</span>
              </button>
              <div className={`faq-answer ${openFaq === faq.id ? 'show' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Your Journey?</h2>
          <p className="cta-text">Join thousands of students who have found their perfect educational path through us</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn-primary">
              <span className="btn-icon">📝</span>
              Get Started
            </Link>
            <Link to="/contact" className="cta-btn-secondary">
              <span className="btn-icon">📞</span>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="about-footer-note">
        <p>© 2024 Smart City Portal. All rights reserved. | Made with ❤️ for students</p>
      </div>
    </div>
  );
};

export default About;