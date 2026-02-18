import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./css/Admission.css";

function Admission() {
  const sigPad = useRef({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [form, setForm] = useState({
    admission_class: "",
    admission_date: "",
    student_name: "",
    gender: "",
    dob: "",
    religion: "",
    b_form_no: "",
    father_name: "",
    father_cnic: "",
    father_occupation: "",
    mother_name: "",
    mother_education: "",
    monthly_income: "",
    contact_no: "",
    home_address: "",
    postal_address: "",
    has_disability: "no",
    major_disability: "",
    additional_disability: "",
    disability_cert_no: "",
    emergency_contact: "",
    prev_school_details: "",
    leaving_reason: "",
    email: "",
    father_signature: "" 
  });

  const [files, setFiles] = useState({
    father_cnic_front: null,
    father_cnic_back: null,
    student_photos: null,
    b_form_file: null,
    school_cert_file: null
  });

  const [preview, setPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files (JPG, PNG) are allowed.");
        e.target.value = "";
        return;
      }
      if (file.size > 1024 * 1024) {
        alert("File size must be less than 1 MB.");
        e.target.value = "";
        return;
      }
      setFiles({ ...files, [e.target.name]: file });
      if (errors[e.target.name]) {
        setErrors({ ...errors, [e.target.name]: false });
      }
    }
  };

  const clearSignature = () => {
    sigPad.current.clear();
    setForm({ ...form, father_signature: "" });
  };

  const saveSignature = () => {
    if (!sigPad.current.isEmpty()) {
      const signatureData = sigPad.current.getCanvas().toDataURL("image/png");
      setForm({ ...form, father_signature: signatureData });
    }
  };

  const validateForm = () => {
    let newErrors = {};
    const cnicRegex = /^\d{13}$/;
    const mobileRegex = /^03\d{9}$/;
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    const optionalFields = [
      "major_disability", 
      "additional_disability", 
      "disability_cert_no", 
      "prev_school_details", 
      "leaving_reason"
    ];

    Object.keys(form).forEach(key => {
      if (!form[key] && !optionalFields.includes(key)) {
        newErrors[key] = true;
      }
    });

    Object.keys(files).forEach(key => {
      if (!files[key]) {
        newErrors[key] = true;
      } else {
        if (files[key].size > 1024 * 1024 || !files[key].type.startsWith("image/")) {
          newErrors[key] = true;
        }
      }
    });

    if (form.father_cnic && !cnicRegex.test(form.father_cnic)) newErrors.father_cnic = true;
    if (form.contact_no && !mobileRegex.test(form.contact_no)) newErrors.contact_no = true;
    if (form.emergency_contact && !mobileRegex.test(form.emergency_contact)) newErrors.emergency_contact = true;
    if (form.email && !gmailRegex.test(form.email)) newErrors.email = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setPreview(true);
      window.scrollTo(0, 0);
    } else {
      alert("Please fix the highlighted fields. Ensure all uploads are IMAGES and under 1MB.");
    }
  };

  const submitForm = async () => {
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    Object.keys(files).forEach(key => {
      if (files[key]) formData.append(key, files[key]);
    });

    try {
      const res = await fetch("http://127.0.0.1:5000/admission", {
        method: "POST",
        body: formData
      });
      if(res.ok) {
        setSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        const data = await res.json();
        alert(data.message || "Submission failed.");
      }
    } catch (err) {
      alert("Submission failed. Check backend connection.");
    }
  };

  if (submitted) return (
    <div className="admsn-page">
      <div className="admsn-container" style={{padding: "100px 20px", textAlign: "center"}}>
        <h1 className="admsn-success-title">Admission Successfully Submitted!</h1>
        <p className="admsn-success-message">
          Thank you for showing trust in <strong>Next Gen School</strong>. Your application has been received successfully. 
          You will receive a confirmation email shortly as our team is currently working on validating your information and documents. 
          Thank you for your cooperation!
        </p>
        <p className="admsn-success-footer">
          <strong>Next Gen School Team</strong>
        </p>
        <button 
          className="admsn-preview-btn admsn-mt-4" 
          onClick={() => window.location.reload()}
        >
          Back to Admission Form
        </button>
      </div>
    </div>
  );

  return (
    <div className="admsn-page">
      <div className="admsn-container">
        <header className="admsn-header">
          <h1>Next Gen Education System</h1>
          <p>Online Admission Portal</p>
        </header>

        {!preview ? (
          <form className="admsn-form">
            <div className="admsn-section">
              <h3 className="admsn-section-title">
                <span className="admsn-section-icon">📚</span> Academic Information
              </h3>
              <div className="admsn-grid-2">
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.admission_class ? 'admsn-label-error' : ''}`}>
                    Admission in Class <span className="admsn-required">*</span>
                  </label>
                  <select 
                    name="admission_class" 
                    className={`admsn-select ${errors.admission_class ? 'admsn-input-error' : ''}`} 
                    value={form.admission_class} 
                    onChange={handleChange}
                  >
                    <option value="">Select Class</option>
                    <option value="Play Group">Play Group</option>
                    <option value="Nursery">Nursery</option>
                    <option value="Prep">Prep</option>
                    <option value="KG">KG</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i+1} value={`Grade ${i+1}`}>Grade {i+1}</option>
                    ))}
                  </select>
                </div>
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.admission_date ? 'admsn-label-error' : ''}`}>
                    Date of Admission <span className="admsn-required">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="admission_date" 
                    className={`admsn-input ${errors.admission_date ? 'admsn-input-error' : ''}`} 
                    value={form.admission_date} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            <div className="admsn-section">
              <h3 className="admsn-section-title">
                <span className="admsn-section-icon">👤</span> Student Personal Details
              </h3>
              <div className="admsn-field admsn-full-width">
                <label className={`admsn-label ${errors.student_name ? 'admsn-label-error' : ''}`}>
                  Student's Full Name <span className="admsn-required">*</span>
                </label>
                <input 
                  name="student_name" 
                  className={`admsn-input ${errors.student_name ? 'admsn-input-error' : ''}`} 
                  value={form.student_name} 
                  placeholder="Enter full legal name" 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="admsn-grid-3">
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.gender ? 'admsn-label-error' : ''}`}>
                    Gender <span className="admsn-required">*</span>
                  </label>
                  <select 
                    name="gender" 
                    className={`admsn-select ${errors.gender ? 'admsn-input-error' : ''}`} 
                    value={form.gender} 
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.dob ? 'admsn-label-error' : ''}`}>
                    Date of Birth <span className="admsn-required">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="dob" 
                    className={`admsn-input ${errors.dob ? 'admsn-input-error' : ''}`} 
                    value={form.dob} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.religion ? 'admsn-label-error' : ''}`}>
                    Religion <span className="admsn-required">*</span>
                  </label>
                  <input 
                    name="religion" 
                    className={`admsn-input ${errors.religion ? 'admsn-input-error' : ''}`} 
                    value={form.religion} 
                    placeholder="e.g. Islam" 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admsn-field admsn-grid-span-2">
                  <label className={`admsn-label ${errors.b_form_no ? 'admsn-label-error' : ''}`}>
                    B-Form / Smart Card No <span className="admsn-required">*</span>
                  </label>
                  <input 
                    name="b_form_no" 
                    className={`admsn-input ${errors.b_form_no ? 'admsn-input-error' : ''}`} 
                    value={form.b_form_no} 
                    placeholder="13 digits (no dashes)" 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            <div className="admsn-section">
              <h3 className="admsn-section-title">
                <span className="admsn-section-icon">👪</span> Parent / Guardian Information
              </h3>
              <div className="admsn-grid-3">
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.father_name ? 'admsn-label-error' : ''}`}>
                    Father's Name <span className="admsn-required">*</span>
                  </label>
                  <input 
                    name="father_name" 
                    className={`admsn-input ${errors.father_name ? 'admsn-input-error' : ''}`} 
                    value={form.father_name} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.father_cnic ? 'admsn-label-error' : ''}`}>
                    Father's CNIC <span className="admsn-required">*</span>
                  </label>
                  <input 
                    name="father_cnic" 
                    className={`admsn-input ${errors.father_cnic ? 'admsn-input-error' : ''}`} 
                    value={form.father_cnic} 
                    placeholder="13 digits (no dashes)" 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.father_occupation ? 'admsn-label-error' : ''}`}>
                    Father's Occupation <span className="admsn-required">*</span>
                  </label>
                  <input 
                    name="father_occupation" 
                    className={`admsn-input ${errors.father_occupation ? 'admsn-input-error' : ''}`} 
                    value={form.father_occupation} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.mother_name ? 'admsn-label-error' : ''}`}>
                    Mother's Name <span className="admsn-required">*</span>
                  </label>
                  <input 
                    name="mother_name" 
                    className={`admsn-input ${errors.mother_name ? 'admsn-input-error' : ''}`} 
                    value={form.mother_name} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.mother_education ? 'admsn-label-error' : ''}`}>
                    Mother's Education <span className="admsn-required">*</span>
                  </label>
                  <input 
                    name="mother_education" 
                    className={`admsn-input ${errors.mother_education ? 'admsn-input-error' : ''}`} 
                    value={form.mother_education} 
                    placeholder="e.g. Masters" 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.monthly_income ? 'admsn-label-error' : ''}`}>
                    Monthly Income <span className="admsn-required">*</span>
                  </label>
                  <input 
                    name="monthly_income" 
                    className={`admsn-input ${errors.monthly_income ? 'admsn-input-error' : ''}`} 
                    value={form.monthly_income} 
                    placeholder="PKR" 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admsn-field">
                  <label className={`admsn-label ${errors.contact_no ? 'admsn-label-error' : ''}`}>
                    Contact No <span className="admsn-required">*</span>
                  </label>
                  <input 
                    name="contact_no" 
                    className={`admsn-input ${errors.contact_no ? 'admsn-input-error' : ''}`} 
                    value={form.contact_no} 
                    placeholder="03XXXXXXXXX" 
                    onChange={handleChange} 
                  />
                </div>
                <div className="admsn-field admsn-full-width">
                  <label className={`admsn-label ${errors.email ? 'admsn-label-error' : ''}`}>
                    Email Address <span className="admsn-required">*</span>
                    <span className="admsn-hint">(@gmail.com only)</span>
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    className={`admsn-input ${errors.email ? 'admsn-input-error' : ''}`} 
                    value={form.email} 
                    placeholder="example@gmail.com" 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            <div className="admsn-section">
              <h3 className="admsn-section-title">
                <span className="admsn-section-icon">📍</span> Address Information
              </h3>
              <div className="admsn-field admsn-full-width">
                <label className={`admsn-label ${errors.home_address ? 'admsn-label-error' : ''}`}>
                  Home Address <span className="admsn-required">*</span>
                </label>
                <input 
                  name="home_address" 
                  className={`admsn-input ${errors.home_address ? 'admsn-input-error' : ''}`} 
                  value={form.home_address} 
                  placeholder="Complete home address" 
                  onChange={handleChange} 
                />
              </div>
              <div className="admsn-field admsn-full-width">
                <label className={`admsn-label ${errors.postal_address ? 'admsn-label-error' : ''}`}>
                  Postal Address <span className="admsn-required">*</span>
                </label>
                <input 
                  name="postal_address" 
                  className={`admsn-input ${errors.postal_address ? 'admsn-input-error' : ''}`} 
                  value={form.postal_address} 
                  placeholder="Mailing address" 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="admsn-section">
              <h3 className="admsn-section-title">
                <span className="admsn-section-icon">🏥</span> Health & Emergency
              </h3>
              <div className="admsn-field">
                <label className="admsn-label">
                  Does the student have any disability? <span className="admsn-required">*</span>
                </label>
                <select 
                  name="has_disability" 
                  className="admsn-select" 
                  value={form.has_disability} 
                  onChange={handleChange}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              
              {form.has_disability === "yes" && (
                <div className="admsn-grid-3 admsn-fade-in">
                  <div className="admsn-field">
                    <label className="admsn-label">Major Disability Type</label>
                    <input 
                      name="major_disability" 
                      className="admsn-input" 
                      value={form.major_disability} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="admsn-field">
                    <label className="admsn-label">Additional Disability</label>
                    <input 
                      name="additional_disability" 
                      className="admsn-input" 
                      value={form.additional_disability} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="admsn-field">
                    <label className="admsn-label">Certificate No</label>
                    <input 
                      name="disability_cert_no" 
                      className="admsn-input" 
                      value={form.disability_cert_no} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              )}
              
              <div className="admsn-field">
                <label className={`admsn-label ${errors.emergency_contact ? 'admsn-label-error' : ''}`}>
                  Emergency Contact No <span className="admsn-required">*</span>
                </label>
                <input 
                  name="emergency_contact" 
                  className={`admsn-input ${errors.emergency_contact ? 'admsn-input-error' : ''}`} 
                  value={form.emergency_contact} 
                  placeholder="03XXXXXXXXX" 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="admsn-section">
              <h3 className="admsn-section-title">
                <span className="admsn-section-icon">📖</span> Previous Schooling
              </h3>
              <div className="admsn-field admsn-full-width">
                <label className="admsn-label">Previous School Details</label>
                <input 
                  name="prev_school_details" 
                  className="admsn-input" 
                  value={form.prev_school_details} 
                  placeholder="School name and city" 
                  onChange={handleChange} 
                />
              </div>
              <div className="admsn-field admsn-full-width">
                <label className="admsn-label">Reason for leaving</label>
                <input 
                  name="leaving_reason" 
                  className="admsn-input" 
                  value={form.leaving_reason} 
                  placeholder="Reason for transfer" 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="admsn-section admsn-document-section">
              <h3 className="admsn-section-title">
                <span className="admsn-section-icon">📎</span> Required Documents
                <span className="admsn-document-hint">(Images only, max 1MB) *</span>
              </h3>
              
              <div className="admsn-grid-3">
                <div className="admsn-file-box">
                  <label className={`admsn-file-label ${errors.father_cnic_front ? 'admsn-label-error' : ''}`}>
                    <span className="admsn-file-icon">🆔</span>
                    Father CNIC (Front) <span className="admsn-required">*</span>
                  </label>
                  <input 
                    type="file" 
                    name="father_cnic_front" 
                    accept="image/*" 
                    className={`admsn-file-input ${errors.father_cnic_front ? 'admsn-input-error' : ''}`} 
                    onChange={handleFileChange} 
                  />
                </div>
                
                <div className="admsn-file-box">
                  <label className={`admsn-file-label ${errors.father_cnic_back ? 'admsn-label-error' : ''}`}>
                    <span className="admsn-file-icon">🆔</span>
                    Father CNIC (Back) <span className="admsn-required">*</span>
                  </label>
                  <input 
                    type="file" 
                    name="father_cnic_back" 
                    accept="image/*" 
                    className={`admsn-file-input ${errors.father_cnic_back ? 'admsn-input-error' : ''}`} 
                    onChange={handleFileChange} 
                  />
                </div>

                <div className="admsn-file-box admsn-full-width">
                  <label className={`admsn-file-label ${errors.father_signature ? 'admsn-label-error' : ''}`}>
                    <span className="admsn-file-icon">✍️</span>
                    Father/Guardian Signature <span className="admsn-required">*</span>
                  </label>
                  <div className={`admsn-signature-pad ${errors.father_signature ? 'admsn-input-error' : ''}`}>
                    <SignatureCanvas 
                      ref={sigPad}
                      penColor="black"
                      canvasProps={{ width: 500, height: 150, className: "admsn-signature-canvas" }}
                      onEnd={saveSignature}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={clearSignature} 
                    className="admsn-clear-signature"
                  >
                    Clear Signature
                  </button>
                </div>

                <div className="admsn-file-box">
                  <label className={`admsn-file-label ${errors.student_photos ? 'admsn-label-error' : ''}`}>
                    <span className="admsn-file-icon">📸</span>
                    Student Photos <span className="admsn-required">*</span>
                  </label>
                  <input 
                    type="file" 
                    name="student_photos" 
                    accept="image/*" 
                    className={`admsn-file-input ${errors.student_photos ? 'admsn-input-error' : ''}`} 
                    onChange={handleFileChange} 
                  />
                </div>
                
                <div className="admsn-file-box">
                  <label className={`admsn-file-label ${errors.b_form_file ? 'admsn-label-error' : ''}`}>
                    <span className="admsn-file-icon">📄</span>
                    B-Form Copy <span className="admsn-required">*</span>
                  </label>
                  <input 
                    type="file" 
                    name="b_form_file" 
                    accept="image/*" 
                    className={`admsn-file-input ${errors.b_form_file ? 'admsn-input-error' : ''}`} 
                    onChange={handleFileChange} 
                  />
                </div>
                
                <div className="admsn-file-box">
                  <label className={`admsn-file-label ${errors.school_cert_file ? 'admsn-label-error' : ''}`}>
                    <span className="admsn-file-icon">🎓</span>
                    School Certificate <span className="admsn-required">*</span>
                  </label>
                  <input 
                    type="file" 
                    name="school_cert_file" 
                    accept="image/*" 
                    className={`admsn-file-input ${errors.school_cert_file ? 'admsn-input-error' : ''}`} 
                    onChange={handleFileChange} 
                  />
                </div>
              </div>
            </div>

            <div className="admsn-terms">
              <input 
                type="checkbox" 
                id="admsn-terms-checkbox" 
                className="admsn-terms-checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="admsn-terms-checkbox" className="admsn-terms-label">
                I agree to the terms and conditions and verify that all provided information is correct.
              </label>
            </div>

            <button 
              type="button" 
              className="admsn-preview-btn" 
              onClick={handleReview}
              disabled={!termsAccepted}
            >
              Review Application
            </button>
          </form>
        ) : (
          <div className="admsn-preview-card">
            <header className="admsn-preview-header">
              <h2>Application Review</h2>
              <p>Please verify all details before final submission</p>
            </header>
            
            <div className="admsn-preview-grid">
                <h4 className="admsn-preview-section-title">Academic & Personal</h4>
                <div className="admsn-preview-item"><strong>Admission Class:</strong> {form.admission_class}</div>
                <div className="admsn-preview-item"><strong>Admission Date:</strong> {form.admission_date}</div>
                <div className="admsn-preview-item"><strong>Student Name:</strong> {form.student_name}</div>
                <div className="admsn-preview-item"><strong>Gender:</strong> {form.gender}</div>
                <div className="admsn-preview-item"><strong>DOB:</strong> {form.dob}</div>
                <div className="admsn-preview-item"><strong>Religion:</strong> {form.religion}</div>
                <div className="admsn-preview-item"><strong>B-Form No:</strong> {form.b_form_no}</div>

                <h4 className="admsn-preview-section-title">Parental Information</h4>
                <div className="admsn-preview-item"><strong>Father Name:</strong> {form.father_name}</div>
                <div className="admsn-preview-item"><strong>Father CNIC:</strong> {form.father_cnic}</div>
                <div className="admsn-preview-item"><strong>Father Occupation:</strong> {form.father_occupation}</div>
                <div className="admsn-preview-item"><strong>Mother Name:</strong> {form.mother_name}</div>
                <div className="admsn-preview-item"><strong>Mother Education:</strong> {form.mother_education}</div>
                <div className="admsn-preview-item"><strong>Monthly Income:</strong> {form.monthly_income}</div>
                <div className="admsn-preview-item"><strong>Contact:</strong> {form.contact_no}</div>
                <div className="admsn-preview-item"><strong>Email:</strong> {form.email}</div>

                <h4 className="admsn-preview-section-title">Address & Health</h4>
                <div className="admsn-preview-item admsn-full-width"><strong>Home Address:</strong> {form.home_address}</div>
                <div className="admsn-preview-item admsn-full-width"><strong>Postal Address:</strong> {form.postal_address}</div>
                <div className="admsn-preview-item"><strong>Emergency Contact:</strong> {form.emergency_contact}</div>
                <div className="admsn-preview-item"><strong>Has Disability:</strong> {form.has_disability.toUpperCase()}</div>
                {form.has_disability === "yes" && (
                  <>
                    <div className="admsn-preview-item"><strong>Major Disability:</strong> {form.major_disability}</div>
                    <div className="admsn-preview-item"><strong>Additional Disability:</strong> {form.additional_disability}</div>
                    <div className="admsn-preview-item"><strong>Cert No:</strong> {form.disability_cert_no}</div>
                  </>
                )}

                <h4 className="admsn-preview-section-title">History & Signature</h4>
                <div className="admsn-preview-item admsn-full-width"><strong>Prev School:</strong> {form.prev_school_details || "N/A"}</div>
                <div className="admsn-preview-item admsn-full-width"><strong>Leaving Reason:</strong> {form.leaving_reason || "N/A"}</div>
                <div className="admsn-preview-item admsn-full-width">
                  <strong>Father's Signature:</strong>
                  {form.father_signature ? (
                    <img src={form.father_signature} alt="Signature" className="admsn-signature-preview" />
                  ) : "Not Provided"}
                </div>

                <h4 className="admsn-preview-section-title">Uploaded Documents</h4>
                <div className="admsn-preview-item admsn-full-width admsn-no-border">
                  <div className="admsn-file-preview-grid">
                    {Object.entries(files).map(([key, file]) => (
                      file && (
                        <div key={key} className="admsn-file-thumb">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={key} 
                            className="admsn-thumb-img"
                          />
                          <span className="admsn-thumb-label">{key.replace(/_/g, ' ')}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
            </div>

            <div className="admsn-preview-actions">
              <button className="admsn-confirm-btn" onClick={submitForm}>Final Submit</button>
              <button className="admsn-edit-btn" onClick={() => setPreview(false)}>Edit Application</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admission;