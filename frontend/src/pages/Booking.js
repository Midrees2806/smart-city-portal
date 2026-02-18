import React, { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./css/Booking.css";

function Booking() {
  const [form, setForm] = useState({
    student_name: "",
    father_name: "",
    cnic: "",
    contact: "",
    email: "",
    profession: "",
    institute_name: "",
    emergency_contact_name: "",
    emergency_contact: "",
    address: "",
    check_in_date: "",
    has_vehicle: "No",
    vehicle_type: "",
    vehicle_number: "",
  });

  const [files, setFiles] = useState({
    photo: null,
    cnic_front: null,
    cnic_back: null,
    proof_profession: null,
    fee_voucher: null,
  });

  const [roomsData, setRoomsData] = useState([]); 
  const [selectedBed, setSelectedBed] = useState(null);
  const [signatureBlob, setSignatureBlob] = useState(null);
  const [preview, setPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({}); // New state for field highlighting

  const sigPad = useRef(null);
  const BED_PRICE = 4500;

  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/admin/rooms_detailed");
        const data = await res.json();
        setRoomsData(data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };
    fetchBeds();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["cnic", "contact", "emergency_contact"].includes(name)) {
      if (value !== "" && !/^\d+$/.test(value)) return;
    }
    setForm({ ...form, [name]: value });
    // Remove error border when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    setFiles({ ...files, [name]: e.target.files[0] });
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const validate = () => {
    let newErrors = {};
    const pakPhoneRegex = /^03\d{9}$/;
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    // Required Text Fields
    const requiredFields = ["student_name", "father_name", "cnic", "contact", "email", "profession", "institute_name", "emergency_contact_name", "emergency_contact", "address", "check_in_date"];
    requiredFields.forEach(field => {
      if (!form[field]) newErrors[field] = true;
    });

    // File fields
    Object.keys(files).forEach(key => {
      if (!files[key]) newErrors[key] = true;
    });

    // Vehicle logic
    if (form.has_vehicle === "Yes") {
      if (!form.vehicle_type) newErrors.vehicle_type = true;
      if (!form.vehicle_number) newErrors.vehicle_number = true;
    }

    if (!selectedBed) newErrors.bed_selection = true;
    if (sigPad.current.isEmpty()) newErrors.signature = true;
    if (!termsAccepted) newErrors.terms = true;

    setErrors(newErrors);

    // Specific logic alerts
    if (Object.keys(newErrors).length > 0) return "Please fill all required fields highlighted in red.";
    if (form.cnic.length !== 13) return "CNIC must be exactly 13 digits.";
    if (!pakPhoneRegex.test(form.contact)) return "Contact must start with 03 and be 11 digits.";
    if (!pakPhoneRegex.test(form.emergency_contact)) return "Guardian contact must start with 03 and be 11 digits.";
    if (!gmailRegex.test(form.email)) return "Please enter a valid @gmail.com address.";

    return null;
  };

  const handleGoToPreview = async () => {
    const error = validate();
    if (error) { alert(error); return; }
    
    const canvas = sigPad.current.getCanvas();
    const sigData = canvas.toDataURL("image/png");
    const response = await fetch(sigData);
    const blob = await response.blob();
    setSignatureBlob(blob);
    setPreview(true);
    window.scrollTo(0,0);
  };

  const submitForm = async () => {
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append("bed_id", selectedBed.id);
    formData.append("room_number", selectedBed.room);
    formData.append("price", BED_PRICE);
    Object.keys(files).forEach(key => formData.append(key, files[key]));
    formData.append("signature", signatureBlob, "signature.png");

    try {
      const res = await fetch("http://127.0.0.1:5000/booking", { method: "POST", body: formData });
      if (res.ok) setSubmitted(true);
      else alert("Submission failed. This bed might have just been taken.");
    } catch (err) {
      alert("Server error.");
    }
  };

  const renderPreviewImage = (file) => {
    if (!file) return null;
    return <img src={URL.createObjectURL(file)} alt="preview" className="img-thumbnail" />;
  };

  if (submitted) return (
    <div className="booking-container" style={{padding: "100px", textAlign: "center"}}>
      <h1 style={{color: "#1e40af"}}>Booking Successfully Submitted!</h1>
      <p><b>Welcome to Smart City Hostel! Thank you for your trust.</b><br />Your documents and details are currently under verification. You will receive a formal confirmation email once the process is finalized.<br/>Thank you for your cooperation!<br/><b>Smart City Hostel Team</b></p>
      <button className="primary-btn" style={{width: "200px", marginTop: "20px"}} onClick={() => window.location.reload()}>Back to Home</button>
    </div>
  );

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Smart City Hostel</h1>
        <p>Premium Living Experience | 30 Luxury Rooms | Secure Parking</p>
      </div>

      {!preview ? (
        <div className="booking-form-wrapper">
          <div className="form-grid">
            <div className="section-card">
              <h3 className="section-title">1. Resident Information</h3>
              <div className="input-group">
                <label>Student Full Name <span className="req">*</span></label>
                <input className={errors.student_name ? "error-border" : ""} name="student_name" value={form.student_name} onChange={handleChange} placeholder="Enter full name" />
              </div>
              <div className="input-group">
                <label>Father's Name <span className="req">*</span></label>
                <input className={errors.father_name ? "error-border" : ""} name="father_name" value={form.father_name} onChange={handleChange} placeholder="Enter father's name" />
              </div>
              
              <div className="grid-2-col">
                <div className="input-group">
                    <label>CNIC (13 Digits) <span className="req">*</span></label>
                    <input className={errors.cnic ? "error-border" : ""} name="cnic" value={form.cnic} onChange={handleChange} placeholder="42101..." maxLength={13} />
                </div>
                <div className="input-group">
                    <label>Contact Number (03xx...) <span className="req">*</span></label>
                    <input className={errors.contact ? "error-border" : ""} name="contact" value={form.contact} onChange={handleChange} placeholder="03001234567" maxLength={11} />
                </div>
              </div>

              <div className="input-group">
                <label>Email Address (@gmail.com only) <span className="req">*</span></label>
                <input className={errors.email ? "error-border" : ""} type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@gmail.com" />
              </div>

              <div className="grid-2-col">
                <div className="input-group">
                    <label>Profession <span className="req">*</span></label>
                    <select className={errors.profession ? "error-border" : ""} name="profession" value={form.profession} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="Student">Student</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Institute / Office Name <span className="req">*</span></label>
                    <input className={errors.institute_name ? "error-border" : ""} name="institute_name" value={form.institute_name} onChange={handleChange} placeholder="Uni or Company Name" />
                </div>
              </div>

              <div className="input-group">
                <label>Permanent Home Address <span className="req">*</span></label>
                <textarea className={errors.address ? "error-border" : ""} name="address" value={form.address} onChange={handleChange} placeholder="Complete address" rows={2} />
              </div>

              <div className="input-group" style={{background: "#f0f9ff", padding: "15px", borderRadius: "10px", marginTop: "10px"}}>
                <label>Vehicle Parking Required?</label>
                <div className="radio-group">
                  <label className="radio-item">
                    <input type="radio" name="has_vehicle" value="Yes" checked={form.has_vehicle === "Yes"} onChange={handleChange} /> Yes
                  </label>
                  <label className="radio-item">
                    <input type="radio" name="has_vehicle" value="No" checked={form.has_vehicle === "No"} onChange={handleChange} /> No
                  </label>
                </div>

                {form.has_vehicle === "Yes" && (
                  <div style={{marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px"}}>
                    <div className="grid-2-col">
                        <div className="input-group">
                        <label>Vehicle Type <span className="req">*</span></label>
                        <select className={errors.vehicle_type ? "error-border" : ""} name="vehicle_type" value={form.vehicle_type} onChange={handleChange}>
                            <option value="">Select Type</option>
                            <option value="Bike">Bike</option>
                            <option value="Car">Car</option>
                        </select>
                        </div>
                        <div className="input-group">
                        <label>Plate Number <span className="req">*</span></label>
                        <input className={errors.vehicle_number ? "error-border" : ""} name="vehicle_number" value={form.vehicle_number} onChange={handleChange} placeholder="ABC-123" />
                        </div>
                    </div>
                  </div>
                )}
              </div>

              <h3 className="section-title" style={{marginTop: "30px"}}>2. Emergency Contact (Guardian)</h3>
              <div className="input-group">
                <label>Guardian Name <span className="req">*</span></label>
                <input className={errors.emergency_contact_name ? "error-border" : ""} name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} placeholder="Full Name" />
              </div>
              <div className="grid-2-col">
                <div className="input-group">
                    <label>Guardian Contact (03xx...) <span className="req">*</span></label>
                    <input className={errors.emergency_contact ? "error-border" : ""} name="emergency_contact" value={form.emergency_contact} onChange={handleChange} placeholder="03xx-xxxxxxx" maxLength={11} />
                </div>
                <div className="input-group">
                    <label>Check-in Date <span className="req">*</span></label>
                    <input className={errors.check_in_date ? "error-border" : ""} type="date" name="check_in_date" value={form.check_in_date} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3 className="section-title">3. Room Selection & Verification</h3>
              
              <label style={{fontSize: "14px", fontWeight: "600", color: "#334155"}}>Select Bed (Rent: PKR {BED_PRICE}/mo) <span className="req">*</span></label>
              <div className={`room-grid-container ${errors.bed_selection ? "error-border" : ""}`} style={{marginBottom: "20px", marginTop: "8px"}}>
                <div className="rooms-list">
                  {roomsData.map((room) => (
                    <div key={room.room_id} className="room-card">
                      <strong>Room {room.room_number}</strong>
                      <div className="bed-row">
                        {room.beds.map(bed => {
                          const isOccupied = bed.status === "occupied" || bed.status === "Reserved";
                          return (
                            <button 
                              key={bed.bed_number}
                              type="button"
                              disabled={isOccupied}
                              className={`bed-btn ${selectedBed?.id === bed.bed_number ? 'selected' : ''} ${isOccupied ? 'occupied' : 'free'}`}
                              onClick={() => {
                                setSelectedBed({id: bed.bed_number, room: room.room_number});
                                setErrors({...errors, bed_selection: false});
                              }}
                            >
                              {bed.bed_number.split('-')[1]} {isOccupied ? '(N/A)' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Profile Picture <span className="req">*</span></label>
                <input className={errors.photo ? "error-border" : ""} type="file" name="photo" onChange={handleFileChange} accept="image/*" />
              </div>
              <div className="input-group">
                <label>CNIC (Front & Back) <span className="req">*</span></label>
                <div className="grid-2-col">
                    <input className={errors.cnic_front ? "error-border" : ""} type="file" name="cnic_front" onChange={handleFileChange} accept="image/*" />
                    <input className={errors.cnic_back ? "error-border" : ""} type="file" name="cnic_back" onChange={handleFileChange} accept="image/*" />
                </div>
              </div>
              <div className="input-group">
                <label>Proof of Study/Work (ID Card) <span className="req">*</span></label>
                <input className={errors.proof_profession ? "error-border" : ""} type="file" name="proof_profession" onChange={handleFileChange} accept="image/*" />
              </div>
              <div className="input-group">
                <label>Deposit Receipt <span className="req">*</span></label>
                <input className={errors.fee_voucher ? "error-border" : ""} type="file" name="fee_voucher" onChange={handleFileChange} accept="image/*" />
              </div>

              <label style={{fontSize: "14px", fontWeight: "600", color: "#334155"}}>Applicant Signature <span className="req">*</span></label>
              <div className={`sig-container ${errors.signature ? "error-border" : ""}`}>
                <SignatureCanvas ref={sigPad} onBegin={() => setErrors({...errors, signature: false})} canvasProps={{width: 450, height: 130, className: "sigPad"}} />
              </div>
              <button type="button" onClick={() => sigPad.current.clear()} className="clear-sig-btn">Clear Signature</button>
            </div>
          </div>

          <div className="form-footer">
            <div className={`terms-container ${errors.terms ? "error-border" : ""}`}>
              <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => {setTermsAccepted(e.target.checked); setErrors({...errors, terms: false})}} style={{width: "20px", height: "20px"}} />
              <label htmlFor="terms">
                I certify that the information provided is accurate. I agree to abide by the hostel's code of conduct and parking regulations. I understand that the security deposit is subject to the hostel's refund policy. <span className="req">*</span>
              </label>
            </div>
            <button className="primary-btn submit-full-width" onClick={handleGoToPreview}>REVIEW BOOKING DETAILS</button>
          </div>
        </div>
      ) : (
        /* PREVIEW SCREEN */
        <div className="preview-container">
          <h2 className="preview-heading">Review Registration</h2>
          <div className="preview-grid">
            <div className="preview-box">
              <h3 className="section-title">Personal Details</h3>
              <p><strong>Full Name:</strong> {form.student_name}</p>
              <p><strong>Father's Name:</strong> {form.father_name}</p>
              <p><strong>CNIC:</strong> {form.cnic}</p>
              <p><strong>Contact:</strong> {form.contact}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Profession:</strong> {form.profession} at {form.institute_name}</p>
              <p><strong>Address:</strong> {form.address}</p>
              
              <h3 className="section-title" style={{marginTop: "20px"}}>Guardian & Stay</h3>
              <p><strong>Guardian:</strong> {form.emergency_contact_name} ({form.emergency_contact})</p>
              <p><strong>Check-in:</strong> {form.check_in_date}</p>
              <p><strong>Room Assigned:</strong> {selectedBed.id}</p>
              <p><strong>Monthly Rent:</strong> PKR {BED_PRICE}</p>
              <p><strong>Vehicle:</strong> {form.has_vehicle === "Yes" ? `${form.vehicle_type} (${form.vehicle_number})` : "None"}</p>
            </div>

            <div className="preview-box image-previews">
              <h3 className="section-title">Uploaded Documents</h3>
              <div className="image-grid">
                <div className="img-item">
                  <label>Profile Photo</label>
                  {renderPreviewImage(files.photo)}
                </div>
                <div className="img-item">
                  <label>CNIC Front</label>
                  {renderPreviewImage(files.cnic_front)}
                </div>
                <div className="img-item">
                  <label>CNIC Back</label>
                  {renderPreviewImage(files.cnic_back)}
                </div>
                <div className="img-item">
                  <label>Proof of ID</label>
                  {renderPreviewImage(files.proof_profession)}
                </div>
                <div className="img-item">
                  <label>Fee Voucher</label>
                  {renderPreviewImage(files.fee_voucher)}
                </div>
                <div className="img-item">
                  <label>Signature</label>
                  {signatureBlob && <img src={URL.createObjectURL(signatureBlob)} alt="sig" className="img-thumbnail" />}
                </div>
              </div>
            </div>
          </div>

          <div className="preview-actions">
            <button className="primary-btn confirm-btn" onClick={submitForm}>CONFIRM & FINALIZE</button>
            <button className="primary-btn edit-btn" onClick={() => setPreview(false)}>BACK TO EDIT</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;