import { useEffect, useState } from "react";
import "./styles/AdminAdmissions.css";

function AdminAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [trashAdmissions, setTrashAdmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [formData, setFormData] = useState({});
  const [newFiles, setNewFiles] = useState({});
  
  const [viewTrash, setViewTrash] = useState(false);

  const fetchAdmissions = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/admissions");
      const data = await res.json();
      setAdmissions(data);
    } catch (err) {
      console.error("Error fetching admissions:", err);
    }
  };

  const fetchTrash = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/admissions/trash");
      const data = await res.json();
      setTrashAdmissions(data);
    } catch (err) {
      console.error("Error fetching trash:", err);
    }
  };

  useEffect(() => { 
    fetchAdmissions(); 
    fetchTrash();
  }, []);

  const formatRegNo = (id) => `NGS-REG-${String(id).padStart(3, '0')}`;

  const filterList = (list) => {
    const searchStr = searchTerm.toLowerCase();
    return list.filter((s) => {
        const regNo = formatRegNo(s.id).toLowerCase();
        return (
          s.student_name.toLowerCase().includes(searchStr) ||
          s.father_name.toLowerCase().includes(searchStr) ||
          regNo.includes(searchStr) ||
          s.contact_no.includes(searchStr)
        );
    });
  };

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 1 * 1024 * 1024; 
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please select an image (JPG or PNG).");
      e.target.value = "";
      return;
    }
    if (file.size > maxSize) {
      alert("File is too large. Maximum size allowed is 1MB.");
      e.target.value = "";
      return;
    }
    setNewFiles({ ...newFiles, [e.target.name]: file });
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`http://127.0.0.1:5000/admin/admissions/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAdmissions();
      if (selectedStudent && selectedStudent.id === id) {
        setSelectedStudent(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) { alert("Status update failed"); }
  };

  const saveChanges = async () => {
    try {
      const uploadData = new FormData();
      Object.keys(formData).forEach(key => {
        if (!key.endsWith('_path') && key !== 'father_signature') {
          uploadData.append(key, formData[key]);
        }
      });
      Object.keys(newFiles).forEach(key => {
        uploadData.append(key, newFiles[key]);
      });

      const res = await fetch(`http://127.0.0.1:5000/admin/admissions/${formData.id}`, {
        method: "PUT",
        body: uploadData 
      });

      if (res.ok) {
        setEditMode(false);
        setNewFiles({});
        fetchAdmissions();
        alert("Record and Images updated successfully!");
        setSelectedStudent(null);
      } else {
        const errData = await res.json();
        alert(errData.error || "Update failed");
      }
    } catch (err) { alert("Update failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Move this student to Recycle Bin? It will stay there for 30 days.")) return;
    await fetch(`http://127.0.0.1:5000/admin/admissions/${id}`, { method: "DELETE" });
    fetchAdmissions();
    fetchTrash();
  };

  const handleRestore = async (id) => {
    try {
        const res = await fetch(`http://127.0.0.1:5000/admin/admissions/${id}/restore`, { method: "PUT" });
        if(res.ok) {
            alert("Student restored successfully!");
            fetchAdmissions();
            fetchTrash();
        }
    } catch (err) { alert("Restore failed"); }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("PERMANENT ACTION: This will delete all data and images forever. Continue?")) return;
    try {
        const res = await fetch(`http://127.0.0.1:5000/admin/admissions/${id}/permanent`, { method: "DELETE" });
        if(res.ok) {
            alert("Record deleted permanently.");
            fetchTrash();
        }
    } catch (err) { alert("Delete failed"); }
  }

  return (
    <div className="admin-admission-container">
      {/* MAIN ADMISSIONS SECTION */}
      {!viewTrash ? (
        <>
          <header className="admin-header">
            <h2>📂 Admission Management System</h2>
            <p>Manage, Verify, and Edit Student Applications</p>
          </header>

          <div className="search-section">
            <input 
              type="text" 
              placeholder="Search by Name, Reg No..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-count">Showing {filterList(admissions).length} active records</span>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Father Name</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Verify</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterList(admissions).map((s) => (
                <tr key={s.id} className={s.status === "Verified" ? "row-verified" : ""}>
                  <td style={{fontWeight: 'bold', color: '#000'}}>{formatRegNo(s.id)}</td>
                  <td>{s.student_name}</td>
                  <td>{s.admission_class}</td>
                  <td>{s.father_name}</td>
                  <td>{s.contact_no}</td>
                  <td><span className={`status-badge ${s.status.toLowerCase()}`}>{s.status}</span></td>
                  <td>
                    <button className="verify-btn-sm" title="Verify" onClick={() => updateStatus(s.id, "Verified")}>✅</button>
                    <button className="reject-btn-sm" title="Reject" onClick={() => updateStatus(s.id, "Rejected")}>❌</button>
                  </td>
                  <td>
                    <button className="delete-btn-sm" title="Move to Trash" onClick={() => handleDelete(s.id)}>🗑️</button>
                    <button className="view-btn" onClick={() => { 
                        setSelectedStudent(s); 
                        setFormData(s); 
                        setEditMode(false); 
                        setShowDocs(false); 
                        setNewFiles({}); 
                    }}>Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* RECYCLE BIN ENTRY POINT AT BOTTOM */}
          <div style={{marginTop: '40px', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '20px'}}>
             <button className="delete-btn-sm" style={{width: 'auto', padding: '10px 20px'}} onClick={() => setViewTrash(true)}>
                🗑️ View Recycle Bin ({trashAdmissions.length})
             </button>
          </div>
        </>
      ) : (
        /* RECYCLE BIN SECTION */
        <div className="recycle-bin-view">
            <header className="admin-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>🗑️ Recycle Bin (Items stay for 30 days)</h2>
                <button className="view-btn" onClick={() => setViewTrash(false)}>⬅ Back to Admissions</button>
            </header>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Reg No</th>
                        <th>Student Name</th>
                        <th>Deleted On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {trashAdmissions.map((s) => (
                        <tr key={s.id}>
                            <td>{formatRegNo(s.id)}</td>
                            <td>{s.student_name}</td>
                            <td style={{color: '#888'}}>{s.deleted_at}</td>
                            <td>
                                <button className="verify-btn-sm" title="Restore" onClick={() => handleRestore(s.id)}>🔄 Restore</button>
                                <button className="reject-btn-sm" title="Delete Permanently" onClick={() => handlePermanentDelete(s.id)}>🔥 Permanent Delete</button>
                            </td>
                        </tr>
                    ))}
                    {trashAdmissions.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Recycle bin is empty.</td></tr>}
                </tbody>
            </table>
        </div>
      )}

      {/* MODAL SECTION - REMAINED UNCHANGED */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-nav">
              <button className={!showDocs ? "active" : ""} onClick={() => setShowDocs(false)}>Information</button>
              <button className={showDocs ? "active" : ""} onClick={() => setShowDocs(true)}>📂 Docs ({selectedStudent.student_name})</button>
              <button className="close-x" onClick={() => setSelectedStudent(null)}>×</button>
            </div>

            {!showDocs ? (
              <div className="modal-body">
                <div className="modal-header-actions">
                  <div className="header-titles">
                    <h3 style={{color: '#000', marginBottom: '5px'}}>{editMode ? "Editing Application" : "Student Profile"}</h3>
                    <span style={{color: '#666', fontWeight: 'bold'}}>Registration No: {formatRegNo(selectedStudent.id)}</span>
                  </div>
                  {!editMode ? (
                    <button className="edit-btn-top" onClick={() => setEditMode(true)}>✏️ Edit Record</button>
                  ) : (
                    <div className="edit-btns">
                        <button className="save-btn" onClick={saveChanges}>💾 Save Changes</button>
                        <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                  )}
                </div>

                <div className="details-grid">
                  {Object.keys(formData).map((key) => {
                    if (["id", "status", "deleted_at", "father_signature", "father_cnic_front_path", "father_cnic_back_path", "student_photos_path", "b_form_file_path", "school_cert_file_path"].includes(key)) return null;
                    const label = key.replace(/_/g, ' ').toUpperCase();
                    return (
                      <div className="detail-item" key={key}>
                        <label style={{color: '#555', fontWeight: 'bold'}}>{label}</label>
                        {editMode ? (
                          key.includes('date') || key === 'dob' ? (
                            <input type="date" name={key} value={formData[key] || ""} onChange={handleEditChange} />
                          ) : (
                            <input type="text" name={key} value={formData[key] || ""} onChange={handleEditChange} />
                          )
                        ) : ( 
                          <p style={{color: '#000000', fontWeight: '500', margin: '5px 0'}}>{formData[key] || "N/A"}</p> 
                        )}
                      </div>
                    );
                  })}
                </div>

                {editMode && (
                  <div className="edit-files-section">
                    <h4 style={{color: '#000'}}>Update Documents (Images Only, Max 1MB)</h4>
                    <div className="file-edit-grid">
                      <div className="file-input-group">
                        <label>Student Photo:</label>
                        <input type="file" name="student_photos" accept="image/*" onChange={handleFileChange} />
                        {newFiles.student_photos && <span className="file-name">✅ {newFiles.student_photos.name}</span>}
                      </div>
                      <div className="file-input-group">
                        <label>B-Form:</label>
                        <input type="file" name="b_form_file" accept="image/*" onChange={handleFileChange} />
                        {newFiles.b_form_file && <span className="file-name">✅ {newFiles.b_form_file.name}</span>}
                      </div>
                      <div className="file-input-group">
                        <label>CNIC Front:</label>
                        <input type="file" name="father_cnic_front" accept="image/*" onChange={handleFileChange} />
                        {newFiles.father_cnic_front && <span className="file-name">✅ {newFiles.father_cnic_front.name}</span>}
                      </div>
                      <div className="file-input-group">
                        <label>CNIC Back:</label>
                        <input type="file" name="father_cnic_back" accept="image/*" onChange={handleFileChange} />
                        {newFiles.father_cnic_back && <span className="file-name">✅ {newFiles.father_cnic_back.name}</span>}
                      </div>
                      <div className="file-input-group">
                        <label>School Certificate:</label>
                        <input type="file" name="school_cert_file" accept="image/*" onChange={handleFileChange} />
                        {newFiles.school_cert_file && <span className="file-name">✅ {newFiles.school_cert_file.name}</span>}
                      </div>
                      <div className="file-input-group">
                        <label>Update Signature:</label>
                        <input type="file" name="father_signature" accept="image/*" onChange={handleFileChange} />
                        {newFiles.father_signature && <span className="file-name">✅ {newFiles.father_signature.name}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="docs-view">
                <div className="docs-grid">
                    <div className="doc-card">
                        <label>Student Photo</label>
                        <img src={`http://127.0.0.1:5000/uploads/admissions/${selectedStudent.student_photos_path}`} alt="Student" />
                    </div>
                    <div className="doc-card">
                        <label>B-Form</label>
                        <img src={`http://127.0.0.1:5000/uploads/admissions/${selectedStudent.b_form_file_path}`} alt="BForm" />
                    </div>
                    <div className="doc-card">
                        <label>CNIC Front</label>
                        <img src={`http://127.0.0.1:5000/uploads/admissions/${selectedStudent.father_cnic_front_path}`} alt="CNIC Front" />
                    </div>
                    <div className="doc-card">
                        <label>CNIC Back</label>
                        <img src={`http://127.0.0.1:5000/uploads/admissions/${selectedStudent.father_cnic_back_path}`} alt="CNIC Back" />
                    </div>
                    <div className="doc-card">
                        <label>School Certificate</label>
                        <img src={`http://127.0.0.1:5000/uploads/admissions/${selectedStudent.school_cert_file_path}`} alt="School Cert" />
                    </div>
                    <div className="doc-card signature-card">
                        <label>Digital Signature</label>
                        <img 
                          src={selectedStudent.father_signature?.startsWith('data:') 
                               ? selectedStudent.father_signature 
                               : `http://127.0.0.1:5000/uploads/admissions/${selectedStudent.father_signature}`} 
                          alt="Signature" 
                          className="sig-img" 
                        />
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAdmissions;