import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/AIFeeReminder.css";

const AIFeeReminder = () => {
  const [form, setForm] = useState({
    student_name: "",
    father_name: "",
    class_room: "",
    amount: "",
    due_date: "",
    fee_type: "School",
    tone: "formal",
    email: "",
    phone: "",
    admission_no: "",
    late_fee: "0",
    remarks: "",
    payment_method: "bank_transfer",
    bank_name: "Habib Bank Limited (HBL)",
    account_title: "",
    account_number: "",
    iban: "",
    easypaisa_number: "",
    jazzcash_number: ""
  });

  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [reminders, setReminders] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [reminderId, setReminderId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [sendCount, setSendCount] = useState(0);

  // Sample data for quick fill
  const sampleData = {
    student_name: "Rahul Sharma",
    father_name: "Rajesh Sharma",
    class_room: "Class 10-A / Room 204",
    amount: "5000",
    due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
    fee_type: "School",
    tone: "formal",
    email: "rahul.sharma@example.com",
    phone: "03001234567",
    admission_no: "ADM2024001",
    late_fee: "500",
    remarks: "Second reminder, please clear dues urgently",
    payment_method: "bank_transfer",
    bank_name: "Habib Bank Limited (HBL)",
    account_title: "NextGen School Jauharabad",
    account_number: "1234-5678-9012-3456",
    iban: "PK36 HABB 1234 5678 9012 3456",
    easypaisa_number: "03001234567",
    jazzcash_number: "03001234567"
  };

  useEffect(() => {
    fetchReminders();
    fetchRecycleBin();
    cleanupRecycleBin();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/ai/get-reminders');
      if (response.data.success) {
        setReminders(response.data.reminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const fetchRecycleBin = async () => {
    try {
      const response = await axios.get('http://localhost:5000/ai/get-recycle-bin');
      if (response.data.success) {
        setRecycleBin(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching recycle bin:', error);
    }
  };

  const cleanupRecycleBin = async () => {
    try {
      await axios.post('http://localhost:5000/ai/cleanup-recycle-bin');
    } catch (error) {
      console.error('Error cleaning recycle bin:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    const required = ['student_name', 'father_name', 'amount', 'due_date', 'email'];
    
    required.forEach(field => {
      if (!form[field]) {
        errors[field] = `${field.replace('_', ' ')} is required`;
      }
    });

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Invalid email format';
    }

    if (form.amount && (isNaN(form.amount) || parseFloat(form.amount) <= 0)) {
      errors.amount = 'Amount must be a positive number';
    }

    // Validate payment method specific fields
    if (form.payment_method === 'bank_transfer') {
      if (!form.account_title) errors.account_title = 'Account title is required';
      if (!form.account_number) errors.account_number = 'Account number is required';
    } else if (form.payment_method === 'easypaisa') {
      if (!form.easypaisa_number) errors.easypaisa_number = 'Easypaisa number is required';
    } else if (form.payment_method === 'jazzcash') {
      if (!form.jazzcash_number) errors.jazzcash_number = 'JazzCash number is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fillSampleData = () => {
    setForm(sampleData);
    setValidationErrors({});
    setEmailSent(false);
    setSendCount(0);
  };

  const clearForm = () => {
    setForm({
      student_name: "",
      father_name: "",
      class_room: "",
      amount: "",
      due_date: "",
      fee_type: "School",
      tone: "formal",
      email: "",
      phone: "",
      admission_no: "",
      late_fee: "0",
      remarks: "",
      payment_method: "bank_transfer",
      bank_name: "Habib Bank Limited (HBL)",
      account_title: "",
      account_number: "",
      iban: "",
      easypaisa_number: "",
      jazzcash_number: ""
    });
    setResult(null);
    setShowPreview(false);
    setEmailSent(false);
    setSendCount(0);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: null });
    }
    setEmailSent(false);
    setSendCount(0);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'form') {
      setShowRecycleBin(false);
    } else if (tab === 'history') {
      setShowRecycleBin(false);
      fetchReminders();
    } else if (tab === 'preview') {
      setShowRecycleBin(false);
    }
  };

  const toggleRecycleBin = () => {
    setShowRecycleBin(!showRecycleBin);
    if (!showRecycleBin) {
      fetchRecycleBin();
    }
  };

  const generatePreview = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/ai/generate-reminder', form);
      
      if (response.data.success) {
        setResult(response.data);
        setShowPreview(true);
        setActiveTab('preview');
        setShowRecycleBin(false);
        setEmailSent(false);
        setSendCount(0);
        
        const saveResponse = await axios.post('http://localhost:5000/ai/save-reminder', {
          ...form,
          message_subject: response.data.subject,
          message_body: response.data.body
        });
        
        if (saveResponse.data.success) {
          setReminderId(saveResponse.data.reminder_id);
          fetchReminders();
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error generating preview');
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!result) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/ai/send-email', {
        reminder_id: reminderId,
        email: form.email,
        subject: result.subject,
        body: result.body,
        fee_type: form.fee_type,
        payment_details: {
          method: form.payment_method,
          bank_name: form.bank_name,
          account_title: form.account_title,
          account_number: form.account_number,
          iban: form.iban,
          easypaisa_number: form.easypaisa_number,
          jazzcash_number: form.jazzcash_number
        }
      });
      
      if (response.data.success) {
        setSendCount(prev => prev + 1);
        setEmailSent(true);
        fetchReminders();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error sending email');
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (id) => {
    if (window.confirm('Move this reminder to recycle bin?')) {
      try {
        await axios.post('http://localhost:5000/ai/delete-reminder', { reminder_id: id });
        fetchReminders();
        fetchRecycleBin();
      } catch (error) {
        alert('Error deleting reminder');
      }
    }
  };

  const restoreReminder = async (recycleId) => {
    try {
      await axios.post('http://localhost:5000/ai/restore-reminder', { recycle_id: recycleId });
      fetchReminders();
      fetchRecycleBin();
    } catch (error) {
      alert('Error restoring reminder');
    }
  };

  const permanentDelete = async (recycleId) => {
    if (window.confirm('Permanently delete this item? This action cannot be undone.')) {
      try {
        await axios.post('http://localhost:5000/ai/permanent-delete', { recycle_id: recycleId });
        fetchRecycleBin();
      } catch (error) {
        alert('Error deleting item');
      }
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `Rs. ${num.toLocaleString('en-PK')}/-`;
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const LoadingSpinner = () => (
    <div className="smartcity-fee-spinner"></div>
  );

  const getInstitutionName = () => {
    return form.fee_type === 'School' 
      ? 'NextGen School Jauharabad' 
      : 'Smart City Hostel Jauharabad';
  };

  // Simple and professional email template with payment details
  const getEmailHTML = () => {
    if (!result) return '';
    
    const institution = getInstitutionName();
    const formattedAmount = formatCurrency(form.amount);
    const formattedDate = formatShortDate(form.due_date);
    const currentYear = new Date().getFullYear();
    
    // Get payment method display name
    const getPaymentMethodName = () => {
      switch(form.payment_method) {
        case 'bank_transfer': return 'Bank Transfer';
        case 'easypaisa': return 'Easypaisa';
        case 'jazzcash': return 'JazzCash';
        default: return 'Bank Transfer';
      }
    };

    // Get payment details HTML
    const getPaymentDetailsHTML = () => {
      switch(form.payment_method) {
        case 'bank_transfer':
          return `
            <tr>
              <td style="color: #666;">Bank Name:</td>
              <td style="font-weight: 600; color: #333;">${form.bank_name || 'Habib Bank Limited (HBL)'}</td>
            </tr>
            <tr>
              <td style="color: #666;">Account Title:</td>
              <td style="font-weight: 600; color: #333;">${form.account_title || institution}</td>
            </tr>
            <tr>
              <td style="color: #666;">Account Number:</td>
              <td style="font-weight: 600; color: #333;">${form.account_number || '1234-5678-9012-3456'}</td>
            </tr>
            ${form.iban ? `
            <tr>
              <td style="color: #666;">IBAN:</td>
              <td style="font-weight: 600; color: #333;">${form.iban}</td>
            </tr>
            ` : ''}
          `;
        
        case 'easypaisa':
          return `
            <tr>
              <td style="color: #666;">Easypaisa Number:</td>
              <td style="font-weight: 600; color: #333;">${form.easypaisa_number}</td>
            </tr>
            <tr>
              <td style="color: #666;">Account Title:</td>
              <td style="font-weight: 600; color: #333;">${institution}</td>
            </tr>
          `;
        
        case 'jazzcash':
          return `
            <tr>
              <td style="color: #666;">JazzCash Number:</td>
              <td style="font-weight: 600; color: #333;">${form.jazzcash_number}</td>
            </tr>
            <tr>
              <td style="color: #666;">Account Title:</td>
              <td style="font-weight: 600; color: #333;">${institution}</td>
            </tr>
          `;
        
        default:
          return '';
      }
    };
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4" style="background-color: #f4f4f4;">
          <tr>
            <td align="center" style="padding: 20px;">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #667eea; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${institution}</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Fee Reminder Notice</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Dear <strong>${form.father_name}</strong>,
                    </p>
                    
                    <div style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                      ${result.body.replace(/\n/g, '<br>')}
                    </div>
                    
                    <!-- Summary Table -->
                    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
                      <tr>
                        <td colspan="2" style="border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #333;">Payment Summary</td>
                      </tr>
                      <tr>
                        <td style="color: #666;">Student Name:</td>
                        <td style="font-weight: 600; color: #333;">${form.student_name}</td>
                      </tr>
                      <tr>
                        <td style="color: #666;">Father's Name:</td>
                        <td style="font-weight: 600; color: #333;">${form.father_name}</td>
                      </tr>
                      ${form.class_room ? `
                      <tr>
                        <td style="color: #666;">Class/Room:</td>
                        <td style="font-weight: 600; color: #333;">${form.class_room}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="color: #666;">Amount Due:</td>
                        <td style="font-weight: 700; color: #e53e3e;">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="color: #666;">Due Date:</td>
                        <td style="font-weight: 600; color: #e53e3e;">${formattedDate}</td>
                      </tr>
                      ${form.late_fee && parseFloat(form.late_fee) > 0 ? `
                      <tr>
                        <td style="color: #666;">Late Fee:</td>
                        <td style="font-weight: 600; color: #e53e3e;">${formatCurrency(form.late_fee)}</td>
                      </tr>
                      ` : ''}
                    </table>
                    
                    <!-- Payment Details -->
                    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 6px; margin-bottom: 25px;">
                      <tr>
                        <td colspan="2" style="border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #333;">Payment Method: ${getPaymentMethodName()}</td>
                      </tr>
                      ${getPaymentDetailsHTML()}
                    </table>
                    
                    <!-- Additional Remarks -->
                    ${form.remarks ? `
                    <div style="background-color: #fef9e7; border-left: 4px solid #ecc94b; padding: 12px 15px; border-radius: 4px; margin-bottom: 20px;">
                      <p style="color: #975a16; margin: 0;"><strong>Note:</strong> ${form.remarks}</p>
                    </div>
                    ` : ''}
                    
                    <!-- Contact -->
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 6px;">
                      <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">📞 Contact: 0300-1234567 | 📧 accounts@${institution.toLowerCase().replace(/\s/g, '')}.com</p>
                      <p style="color: #666; margin: 0; font-size: 14px;">🏢 Office: ${institution}, Jauharabad, Pakistan</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #333; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">This is an automated message from ${institution}. Please do not reply.</p>
                    <p style="color: #777; margin: 10px 0 0 0; font-size: 11px;">© ${currentYear} Smart City Portal, Jauharabad, Pakistan</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  return (
    <div className="smartcity-fee-container">
      <div className="smartcity-fee-header">
        <div className="smartcity-fee-title-wrapper">
          <span className="smartcity-fee-icon">💰</span>
          <h1 className="smartcity-fee-title">AI Fee Reminder Generator</h1>
        </div>
        <p className="smartcity-fee-subtitle">
          Create and send personalized fee reminders to parents via Email
        </p>
        <div className="institution-badge">
          {getInstitutionName()}
        </div>
      </div>

      {/* Tabs */}
      <div className="smartcity-fee-tabs">
        <button 
          className={`smartcity-fee-tab ${activeTab === 'form' && !showRecycleBin ? 'active' : ''}`}
          onClick={() => handleTabChange('form')}
        >
          <span className="tab-icon">📝</span>
          Reminder Form
        </button>
        <button 
          className={`smartcity-fee-tab ${activeTab === 'preview' && !showRecycleBin ? 'active' : ''}`}
          onClick={() => handleTabChange('preview')}
          disabled={!showPreview}
        >
          <span className="tab-icon">👁️</span>
          Preview & Send
        </button>
        <button 
          className={`smartcity-fee-tab ${activeTab === 'history' && !showRecycleBin ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          <span className="tab-icon">📋</span>
          Recent Reminders
        </button>
        <button 
          className={`smartcity-fee-tab recycle-bin-tab ${showRecycleBin ? 'active' : ''}`}
          onClick={toggleRecycleBin}
        >
          <span className="tab-icon">🗑️</span>
          Recycle Bin {recycleBin.length > 0 && `(${recycleBin.length})`}
        </button>
      </div>

      <div className="smartcity-fee-content">
        {/* Form Tab */}
        {activeTab === 'form' && !showRecycleBin && (
          <div className="smartcity-fee-form-section">
            <div className="smartcity-fee-form-header">
              <h2>Enter Reminder Details</h2>
              <div className="smartcity-fee-actions">
                <button className="smartcity-fee-sample-btn" onClick={fillSampleData}>
                  <span className="btn-icon">📋</span>
                  Fill Sample
                </button>
                <button className="smartcity-fee-clear-btn" onClick={clearForm}>
                  <span className="btn-icon">🗑️</span>
                  Clear All
                </button>
              </div>
            </div>

            <div className="smartcity-fee-form-grid">
              {/* Student Information */}
              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">👤</span>
                  Student Name *
                </label>
                <input
                  type="text"
                  name="student_name"
                  value={form.student_name}
                  onChange={handleChange}
                  placeholder="e.g., Rahul Sharma"
                  className={`smartcity-fee-input ${validationErrors.student_name ? 'error' : ''}`}
                />
                {validationErrors.student_name && (
                  <span className="error-text">{validationErrors.student_name}</span>
                )}
              </div>

              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">👨</span>
                  Father's Name *
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={form.father_name}
                  onChange={handleChange}
                  placeholder="e.g., Rajesh Sharma"
                  className={`smartcity-fee-input ${validationErrors.father_name ? 'error' : ''}`}
                />
                {validationErrors.father_name && (
                  <span className="error-text">{validationErrors.father_name}</span>
                )}
              </div>

              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">🏫</span>
                  Class/Room No.
                </label>
                <input
                  type="text"
                  name="class_room"
                  value={form.class_room}
                  onChange={handleChange}
                  placeholder="e.g., Class 10-A / Room 204"
                  className="smartcity-fee-input"
                />
              </div>

              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">🆔</span>
                  Admission No.
                </label>
                <input
                  type="text"
                  name="admission_no"
                  value={form.admission_no}
                  onChange={handleChange}
                  placeholder="e.g., ADM2024001"
                  className="smartcity-fee-input"
                />
              </div>

              {/* Fee Information */}
              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">💰</span>
                  Amount (PKR) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g., 5000"
                  className={`smartcity-fee-input ${validationErrors.amount ? 'error' : ''}`}
                />
                {validationErrors.amount && (
                  <span className="error-text">{validationErrors.amount}</span>
                )}
              </div>

              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">📅</span>
                  Due Date *
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  className={`smartcity-fee-input ${validationErrors.due_date ? 'error' : ''}`}
                />
                {validationErrors.due_date && (
                  <span className="error-text">{validationErrors.due_date}</span>
                )}
              </div>

              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">⚠️</span>
                  Late Fee (PKR)
                </label>
                <input
                  type="number"
                  name="late_fee"
                  value={form.late_fee}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  className="smartcity-fee-input"
                />
              </div>

              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">🏷️</span>
                  Fee Type
                </label>
                <select 
                  name="fee_type" 
                  value={form.fee_type} 
                  onChange={handleChange}
                  className="smartcity-fee-select"
                >
                  <option value="School">🏫 NextGen School Jauharabad</option>
                  <option value="Hostel">🏨 Smart City Hostel Jauharabad</option>
                </select>
              </div>

              {/* Contact Information */}
              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">📧</span>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g., parent@example.com"
                  className={`smartcity-fee-input ${validationErrors.email ? 'error' : ''}`}
                />
                {validationErrors.email && (
                  <span className="error-text">{validationErrors.email}</span>
                )}
              </div>

              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">📱</span>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g., 03001234567"
                  className="smartcity-fee-input"
                />
                <small className="field-hint">For record only</small>
              </div>

              {/* Tone Selection */}
              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">🎭</span>
                  Message Tone
                </label>
                <select 
                  name="tone" 
                  value={form.tone} 
                  onChange={handleChange}
                  className="smartcity-fee-select"
                >
                  <option value="formal">📜 Formal</option>
                  <option value="friendly">😊 Friendly</option>
                  <option value="strict">⚠️ Strict</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="smartcity-fee-form-group">
                <label className="smartcity-fee-label">
                  <span className="label-icon">💳</span>
                  Payment Method *
                </label>
                <select 
                  name="payment_method" 
                  value={form.payment_method} 
                  onChange={handleChange}
                  className="smartcity-fee-select"
                >
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                  <option value="easypaisa">📱 Easypaisa</option>
                  <option value="jazzcash">📱 JazzCash</option>
                </select>
              </div>

              {/* Bank Transfer Fields */}
              {form.payment_method === 'bank_transfer' && (
                <>
                  <div className="smartcity-fee-form-group">
                    <label className="smartcity-fee-label">
                      <span className="label-icon">🏦</span>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={form.bank_name}
                      onChange={handleChange}
                      placeholder="e.g., Habib Bank Limited (HBL)"
                      className="smartcity-fee-input"
                    />
                  </div>
                  <div className="smartcity-fee-form-group">
                    <label className="smartcity-fee-label">
                      <span className="label-icon">📝</span>
                      Account Title *
                    </label>
                    <input
                      type="text"
                      name="account_title"
                      value={form.account_title}
                      onChange={handleChange}
                      placeholder="e.g., NextGen School Jauharabad"
                      className={`smartcity-fee-input ${validationErrors.account_title ? 'error' : ''}`}
                    />
                    {validationErrors.account_title && (
                      <span className="error-text">{validationErrors.account_title}</span>
                    )}
                  </div>
                  <div className="smartcity-fee-form-group">
                    <label className="smartcity-fee-label">
                      <span className="label-icon">🔢</span>
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={form.account_number}
                      onChange={handleChange}
                      placeholder="e.g., 1234-5678-9012-3456"
                      className={`smartcity-fee-input ${validationErrors.account_number ? 'error' : ''}`}
                    />
                    {validationErrors.account_number && (
                      <span className="error-text">{validationErrors.account_number}</span>
                    )}
                  </div>
                  <div className="smartcity-fee-form-group">
                    <label className="smartcity-fee-label">
                      <span className="label-icon">🌐</span>
                      IBAN (Optional)
                    </label>
                    <input
                      type="text"
                      name="iban"
                      value={form.iban}
                      onChange={handleChange}
                      placeholder="e.g., PK36 HABB 1234 5678 9012 3456"
                      className="smartcity-fee-input"
                    />
                  </div>
                </>
              )}

              {/* Easypaisa Fields */}
              {form.payment_method === 'easypaisa' && (
                <div className="smartcity-fee-form-group">
                  <label className="smartcity-fee-label">
                    <span className="label-icon">📱</span>
                    Easypaisa Number *
                  </label>
                  <input
                    type="tel"
                    name="easypaisa_number"
                    value={form.easypaisa_number}
                    onChange={handleChange}
                    placeholder="e.g., 03001234567"
                    className={`smartcity-fee-input ${validationErrors.easypaisa_number ? 'error' : ''}`}
                  />
                  {validationErrors.easypaisa_number && (
                    <span className="error-text">{validationErrors.easypaisa_number}</span>
                  )}
                </div>
              )}

              {/* JazzCash Fields */}
              {form.payment_method === 'jazzcash' && (
                <div className="smartcity-fee-form-group">
                  <label className="smartcity-fee-label">
                    <span className="label-icon">📱</span>
                    JazzCash Number *
                  </label>
                  <input
                    type="tel"
                    name="jazzcash_number"
                    value={form.jazzcash_number}
                    onChange={handleChange}
                    placeholder="e.g., 03001234567"
                    className={`smartcity-fee-input ${validationErrors.jazzcash_number ? 'error' : ''}`}
                  />
                  {validationErrors.jazzcash_number && (
                    <span className="error-text">{validationErrors.jazzcash_number}</span>
                  )}
                </div>
              )}

              {/* Remarks */}
              <div className="smartcity-fee-form-group full-width">
                <label className="smartcity-fee-label">
                  <span className="label-icon">📝</span>
                  Additional Remarks
                </label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  placeholder="Any additional information or special instructions..."
                  className="smartcity-fee-textarea"
                  rows="3"
                />
              </div>
            </div>

            <div className="smartcity-fee-form-footer">
              <button 
                className="smartcity-fee-generate-btn" 
                onClick={generatePreview}
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : (
                  <>
                    <span className="btn-icon">✨</span>
                    Generate Preview
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && showPreview && result && !showRecycleBin && (
          <div className="smartcity-fee-preview-section">
            <div className="smartcity-fee-preview-header">
              <h2>Message Preview - {getInstitutionName()}</h2>
              <div className="smartcity-fee-preview-actions">
                <button 
                  className="smartcity-fee-edit-btn" 
                  onClick={() => handleTabChange('form')}
                >
                  <span className="btn-icon">✎</span>
                  Edit Details
                </button>
              </div>
            </div>

            <div className="smartcity-fee-recipient-info">
              <h3>Recipient Information</h3>
              <div className="recipient-grid">
                <div className="recipient-item">
                  <span className="recipient-label">To:</span>
                  <span className="recipient-value">{form.email}</span>
                </div>
                <div className="recipient-item">
                  <span className="recipient-label">Student:</span>
                  <span className="recipient-value">{form.student_name}</span>
                </div>
                <div className="recipient-item">
                  <span className="recipient-label">Parent:</span>
                  <span className="recipient-value">{form.father_name}</span>
                </div>
                <div className="recipient-item">
                  <span className="recipient-label">Amount:</span>
                  <span className="recipient-value amount">{formatCurrency(form.amount)}</span>
                </div>
                <div className="recipient-item">
                  <span className="recipient-label">Due Date:</span>
                  <span className="recipient-value date">{formatShortDate(form.due_date)}</span>
                </div>
                <div className="recipient-item">
                  <span className="recipient-label">Payment:</span>
                  <span className="recipient-value">{form.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : form.payment_method === 'easypaisa' ? '📱 Easypaisa' : '📱 JazzCash'}</span>
                </div>
              </div>
            </div>

            <div className="smartcity-fee-email-preview">
              <div className="email-header">
                <div className="email-subject">
                  <span className="subject-label">Subject:</span>
                  <span className="subject-value">{result.subject}</span>
                </div>
                <div className="email-from">
                  <span className="from-label">From:</span>
                  <span className="from-value">accounts@{getInstitutionName().toLowerCase().replace(/\s/g, '')}.com</span>
                </div>
              </div>
              <div className="email-body">
                <div className="email-content" dangerouslySetInnerHTML={{ __html: getEmailHTML() }} />
              </div>
            </div>

            <div className="smartcity-fee-send-options">
              <h3>Send Email</h3>
              <div className="send-buttons">
                <button 
                  className="smartcity-fee-send-email-btn"
                  onClick={sendEmail}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner /> : (
                    <>
                      <span className="btn-icon">📧</span>
                      Send Email {sendCount > 0 && `(Sent ${sendCount} time${sendCount > 1 ? 's' : ''})`}
                    </>
                  )}
                </button>
              </div>
            </div>

            {emailSent && (
              <div className="smartcity-fee-success-message">
                <span className="success-icon">✅</span>
                Email sent successfully to {form.email}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && !showRecycleBin && (
          <div className="smartcity-fee-history-section">
            <h2>Recent Reminders</h2>
            <div className="history-list">
              {reminders.length === 0 ? (
                <div className="no-history">No reminders found</div>
              ) : (
                reminders.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-icon">
                      {item.email_sent ? '📧' : '📧?'}
                    </div>
                    <div className="history-details">
                      <h4>{item.student_name} - {item.class_room || 'N/A'}</h4>
                      <p>{item.fee_type} Fee: {formatCurrency(item.amount)} due on {formatShortDate(item.due_date)}</p>
                      <span className="history-time">{formatShortDate(item.created_at)}</span>
                    </div>
                    <div className="history-status">
                      <span className={`status-badge ${item.email_sent ? 'success' : 'pending'}`}>
                        {item.email_sent ? 'Email Sent' : 'Pending'}
                      </span>
                    </div>
                    <button 
                      className="history-delete-btn"
                      onClick={() => deleteReminder(item.id)}
                      title="Move to Recycle Bin"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Recycle Bin */}
        {showRecycleBin && (
          <div className="smartcity-fee-recycle-bin">
            <div className="recycle-header">
              <h2>Recycle Bin</h2>
              <p>Items are automatically deleted after 30 days</p>
            </div>
            <div className="recycle-list">
              {recycleBin.length === 0 ? (
                <div className="no-items">Recycle bin is empty</div>
              ) : (
                recycleBin.map((item) => (
                  <div key={item.id} className="recycle-item">
                    <div className="recycle-icon">🗑️</div>
                    <div className="recycle-details">
                      <h4>{item.student_name}</h4>
                      <p>{item.fee_type} Fee: {formatCurrency(item.amount)}</p>
                      <span className="recycle-time">
                        Deleted: {formatShortDate(item.deleted_at)}
                      </span>
                      <span className="recycle-expiry">
                        Auto-delete: {formatShortDate(item.scheduled_delete)}
                      </span>
                    </div>
                    <div className="recycle-actions">
                      <button 
                        className="recycle-restore-btn"
                        onClick={() => restoreReminder(item.id)}
                        title="Restore"
                      >
                        ↩️ Restore
                      </button>
                      <button 
                        className="recycle-delete-btn"
                        onClick={() => permanentDelete(item.id)}
                        title="Permanently Delete"
                      >
                        ❌ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="smartcity-fee-stats">
        <div className="stat-card">
          <span className="stat-icon">📤</span>
          <div className="stat-info">
            <span className="stat-value">{reminders.length}</span>
            <span className="stat-label">Reminders</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📧</span>
          <div className="stat-info">
            <span className="stat-value">
              {reminders.filter(r => r.email_sent).length}
            </span>
            <span className="stat-label">Emails Sent</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div className="stat-info">
            <span className="stat-value">
              {reminders.filter(r => !r.email_sent).length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div className="stat-info">
            <span className="stat-value">
              {formatCurrency(reminders.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0))}
            </span>
            <span className="stat-label">Total Amount</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeeReminder;