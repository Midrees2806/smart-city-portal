import { useEffect, useState } from "react";
import "./styles/AdminBookings.css";

function AdminBookings() {
  const [data, setData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocs, setSelectedDocs] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null); 
  const [activeTab, setActiveTab] = useState("info"); 
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  // Recycle Bin States
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [trashedData, setTrashedData] = useState([]);

  // Function to generate registration number
  const generateRegNo = (id) => {
    return `HST-REG-${String(id).padStart(3, '0')}`;
  };

  useEffect(() => {
    fetchBookings();
    fetchRooms();
    fetchTrash(); // Load trash count on mount
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    fetch("http://127.0.0.1:5000/admin/bookings")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  const fetchRooms = () => {
    fetch("http://127.0.0.1:5000/admin/rooms_detailed")
      .then((res) => res.json())
      .then((d) => setRooms(d))
      .catch((err) => console.error("Room fetch error:", err));
  };

  const fetchTrash = () => {
    fetch("http://127.0.0.1:5000/admin/recycle_bin")
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setTrashedData(d);
        } else {
          console.error("Expected array but got:", d);
          setTrashedData([]); 
        }
      })
      .catch((err) => {
        console.error("Trash fetch error:", err);
        setTrashedData([]); 
      });
  };

  const handleRestore = (id) => {
    fetch(`http://127.0.0.1:5000/admin/restore/${id}`, { method: "PATCH" })
      .then((res) => res.json())
      .then((result) => {
        fetchTrash();    
        fetchBookings(); 
        fetchRooms();    
      })
      .catch((err) => console.error("Restore error:", err));
  };

  const handlePermanentDelete = (id) => {
    if (!window.confirm("This action CANNOT be undone. Delete permanently?")) return;
    fetch(`http://127.0.0.1:5000/admin/permanent_delete/${id}`, { method: "DELETE" }).then(() => {
      fetchTrash();
    });
  };

  const handleEditRoomChange = (roomNo) => {
    const selectedRoom = rooms.find((r) => r.room_number === roomNo);
    if (selectedRoom) {
      fetch(`http://127.0.0.1:5000/rooms/${selectedRoom.room_id}/beds`)
        .then((res) => res.json())
        .then((beds) => {
          setAvailableBeds(beds);
          setFormData((prev) => ({ ...prev, room_number: roomNo }));
        });
    }
  };

  const handleVerify = (id) => {
    fetch(`http://127.0.0.1:5000/admin/verify/${id}`, { method: "PATCH" }).then(
      async (res) => {
        const result = await res.json();
        if (res.status === 409) {
          alert(result.message);
        } else {
          fetchBookings();
          fetchRooms();
        }
      }
    );
  };

  // NEW: Handle Reject function
  const handleReject = (id) => {
    if (!window.confirm("Are you sure you want to reject this application?")) return;
    
    // You can create a new endpoint for rejection or update status to 'Rejected'
    fetch(`http://127.0.0.1:5000/admin/reject/${id}`, { method: "PATCH" })
      .then(async (res) => {
        const result = await res.json();
        if (res.ok) {
          alert("Application rejected successfully");
          fetchBookings();
          fetchRooms();
        } else {
          alert(result.message || "Error rejecting application");
        }
      })
      .catch((err) => console.error("Reject error:", err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Move this resident to Recycle Bin?")) return;
    fetch(`http://127.0.0.1:5000/admin/bookings/${id}`, { method: "DELETE" })
      .then(() => {
        fetchBookings();
        fetchRooms();    
        fetchTrash();    
        alert("Moved to Trash.");
      })
      .catch((err) => console.error("Delete error:", err));
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setFormData({ ...item });
    handleEditRoomChange(item.room_number);
  };

  const handleUpdate = () => {
    const uploadData = new FormData();
    const textFields = [
      "student_name", "father_name", "cnic", "contact", "email",
      "profession", "institute_name", "emergency_contact_name",
      "emergency_contact", "address", "check_in_date",
      "room_number", "bed_id", "has_vehicle",
      "vehicle_type", "vehicle_number",
    ];

    textFields.forEach((field) => {
      uploadData.append(field, formData[field] || "");
    });

    if (formData.new_photo) uploadData.append("photo", formData.new_photo);
    if (formData.new_cnic_front) uploadData.append("cnic_front", formData.new_cnic_front);
    if (formData.new_cnic_back) uploadData.append("cnic_back", formData.new_cnic_back);
    if (formData.new_proof) uploadData.append("proof_profession", formData.new_proof);
    if (formData.new_voucher) uploadData.append("fee_voucher", formData.new_voucher);
    if (formData.new_signature) uploadData.append("signature", formData.new_signature);

    fetch(`http://127.0.0.1:5000/admin/bookings/${editId}`, {
      method: "PUT",
      body: uploadData,
    })
      .then(() => {
        setEditId(null);
        fetchBookings();
        fetchRooms();
        alert("Resident record and bed assignment updated!");
      })
      .catch((err) => console.error("Update failed:", err));
  };

  const filteredData = data.filter(
    (item) =>
      (item.student_name && item.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.cnic && item.cnic.includes(searchTerm))
  );

  const pendingCount = data.filter((item) => item.status !== "Verified").length;

  return (
    <div className="admin-container">
      <h2 className="dashboard-title">Smart City Hostel Administration</h2>

      <div className="stats-bar">
        <div className="stat-card residents">
          <small>Total Residents</small>
          <h3>{data.length}</h3>
        </div>
        <div className={`stat-card ${pendingCount > 0 ? "pending" : "neutral"}`}>
          <small>Pending Verification</small>
          <h3>{pendingCount}</h3>
        </div>
        
        {/* Recycle Bin Trigger - Professional Appearance */}
        <div 
            className="stat-card recycle-bin-trigger" 
            style={{ cursor: "pointer", background: "#f8fafc", border: "1px solid #cbd5e1", transition: "all 0.2s" }}
            onClick={() => { setShowRecycleBin(true); fetchTrash(); }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "#94a3b8"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
        >
          <small style={{ color: "#64748b", fontWeight: "600" }}>Recycle Bin (Items will automatically deleted after 30 days)</small>
          <h3 style={{color: "#1e293b", marginTop: "5px"}}>🗑️ {trashedData.length} Items</h3>
        </div>
      </div>

      <div className="content-wrapper">
        <input
          placeholder="🔍 Search by student name or CNIC..."
          className="search-input"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {editId && (
          <div className="edit-form-container">
            <h4 style={{ marginTop: 0, color: "#1e40af" }}>
              Editing Resident: {formData.student_name}
            </h4>
            <div className="form-grid">
              <div><label>Room Number</label><select className="form-input" value={formData.room_number} onChange={(e) => handleEditRoomChange(e.target.value)}>{rooms.map((r) => (<option key={r.room_id} value={r.room_number}>Room {r.room_number}</option>))}</select></div>
              <div><label>Bed Number</label><select className="form-input" value={formData.bed_id} onChange={(e) => setFormData({ ...formData, bed_id: e.target.value })}><option value={formData.bed_id}>{formData.bed_id} (Current)</option>{availableBeds.map((b) => (<option key={b.id} value={b.bed_number}>{b.bed_number} ({b.status})</option>))}</select></div>
              <div><label>Name</label><input className="form-input" value={formData.student_name || ""} onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} /></div>
              <div><label>Father's Name</label><input className="form-input" value={formData.father_name || ""} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} /></div>
              <div><label>CNIC</label><input className="form-input" value={formData.cnic || ""} onChange={(e) => setFormData({ ...formData, cnic: e.target.value })} /></div>
              <div><label>Contact</label><input className="form-input" value={formData.contact || ""} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} /></div>
              <div><label>Email</label><input className="form-input" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div><label>Profession</label><input className="form-input" value={formData.profession || ""} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} /></div>
              <div><label>Institute/Workplace</label><input className="form-input" value={formData.institute_name || ""} onChange={(e) => setFormData({ ...formData, institute_name: e.target.value })} /></div>
              <div><label>Check-in Date</label><input className="form-input" type="date" value={formData.check_in_date || ""} onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })} /></div>
              <div><label>Emerg. Contact Name</label><input className="form-input" value={formData.emergency_contact_name || ""} onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })} /></div>
              <div><label>Emerg. Contact No.</label><input className="form-input" value={formData.emergency_contact || ""} onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })} /></div>
              <div><label>Has Vehicle?</label><select className="form-input" value={formData.has_vehicle || "No"} onChange={(e) => setFormData({ ...formData, has_vehicle: e.target.value })}><option value="Yes">Yes</option><option value="No">No</option></select></div>
              {formData.has_vehicle === "Yes" && (<><div><label>Vehicle Type</label><input className="form-input" value={formData.vehicle_type || ""} onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })} /></div><div><label>Plate Number</label><input className="form-input" value={formData.vehicle_number || ""} onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })} /></div></>)}
              <div style={{ gridColumn: "span 2" }}><label>Address</label><textarea className="form-input" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
            </div>

            <div className="doc-upload-box">
              <p style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "14px" }}>Update Documents (Select only to change)</p>
              <div className="upload-grid">
                <div><small>Photo</small><br/><input type="file" onChange={(e) => setFormData({ ...formData, new_photo: e.target.files[0] })} /></div>
                <div><small>CNIC Front</small><br/><input type="file" onChange={(e) => setFormData({ ...formData, new_cnic_front: e.target.files[0] })} /></div>
                <div><small>CNIC Back</small><br/><input type="file" onChange={(e) => setFormData({ ...formData, new_cnic_back: e.target.files[0] })} /></div>
                <div><small>Proof</small><br/><input type="file" onChange={(e) => setFormData({ ...formData, new_proof: e.target.files[0] })} /></div>
                <div><small>Voucher</small><br/><input type="file" onChange={(e) => setFormData({ ...formData, new_voucher: e.target.files[0] })} /></div>
                <div><small>Signature</small><br/><input type="file" onChange={(e) => setFormData({ ...formData, new_signature: e.target.files[0] })} /></div>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button onClick={handleUpdate} className="btn-primary">Save Changes</button>
              <button onClick={() => setEditId(null)} className="btn-secondary" style={{ marginLeft: "10px" }}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center" }}>Fetching Resident Records...</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reg No.</th> {/* NEW COLUMN */}
                  <th>Resident Details</th>
                  <th>Professional Info</th>
                  <th>Room & Bed</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    {/* NEW: Registration Number */}
                    <td>
                      <span style={{ 
                        background: "#e0f2fe", 
                        padding: "4px 8px", 
                        borderRadius: "4px", 
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#0369a1",
                        whiteSpace: "nowrap"
                      }}>
                        {generateRegNo(item.id)}
                      </span>
                    </td>
                    <td>
                      <strong>{item.student_name}</strong>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{item.cnic} | {item.contact}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", fontWeight: "600" }}>{item.profession}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{item.institute_name}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600" }}>Room {item.room_number}</div>
                      <div style={{ fontSize: "11px", color: "#475569" }}>{item.bed_id}</div>
                    </td>
                    <td>
                      <span className="status-badge" style={{ 
                        backgroundColor: item.status === "Verified" ? "#dcfce7" : 
                                        item.status === "Rejected" ? "#fee2e2" : "#fef3c7", 
                        color: item.status === "Verified" ? "#166534" : 
                               item.status === "Rejected" ? "#991b1b" : "#92400e" 
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => { setSelectedProfile(item); setActiveTab("info"); }} 
                        style={{ cursor: "pointer", border: "1px solid #1e40af", background: "#eff6ff", color: "#1e40af", borderRadius: "4px", padding: "2px 8px", marginRight: "5px" }}>
                        👤 Profile
                      </button>
                      <button onClick={() => startEdit(item)} className="btn-text-edit">Edit</button>
                      
                      {/* Show Verify button only if not Verified */}
                      {item.status !== "Verified" && item.status !== "Rejected" && (
                        <button onClick={() => handleVerify(item.id)} className="btn-text-verify">Verify</button>
                      )}
                      
                      {/* NEW: Reject button - show only if not Verified and not Rejected */}
                      {item.status !== "Verified" && item.status !== "Rejected" && (
                        <button onClick={() => handleReject(item.id)} className="btn-text-reject" 
                          style={{ 
                            background: "none", 
                            border: "none", 
                            color: "#dc2626", 
                            cursor: "pointer", 
                            marginLeft: "5px",
                            fontSize: "14px"
                          }}>
                          Reject
                        </button>
                      )}
                      
                      <button onClick={() => handleDelete(item.id)} className="btn-text-delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="room-visualizer-section">
        <h3 className="section-title">Hostel Occupancy Map</h3>
        <div className="room-grid">
          {rooms.map((room) => (
            <div key={room.room_id} className="room-box">
              <div className="room-header">Room {room.room_number}</div>
              <div className="bed-row">
                {room.beds.map((bed) => (
                  <div key={bed.id} className={`bed-indicator ${bed.status}`}>
                    <small>{bed.bed_number.split("-")[1]}</small>
                    <span className="bed-label">{bed.status === "occupied" ? "Occupied" : "Free"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RECYCLE BIN MODAL (Refined Professional Look) --- */}
      {showRecycleBin && (
        <div className="modal-overlay" style={{ backdropFilter: "blur(4px)" }}>
          <div className="modal-content" style={{ maxWidth: "850px", background: "white", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px" }}>
                <div>
                    <h2 style={{ color: "#0f172a", margin: 0, fontSize: "1.5rem" }}>Recycle Bin</h2>
                    <p style={{ color: "#64748b", fontSize: "13px", margin: "5px 0 0 0" }}>Managed storage for deleted resident profiles</p>
                </div>
                <button onClick={() => setShowRecycleBin(false)} style={{ background: "#f1f5f9", border: "none", color: "#64748b", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>CLOSE</button>
            </div>
            
            <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", padding: "10px 15px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>⚠️</span>
                <p style={{ color: "#9a3412", fontSize: "12px", margin: 0, fontWeight: "500" }}>Records in the recycle bin are automatically purged after 30 days. Restoring a resident will re-allocate their previous bed if available.</p>
            </div>

            <div className="table-responsive" style={{ maxHeight: "50vh", border: "1px solid #f1f5f9", borderRadius: "8px" }}>
                <table className="admin-table">
                    <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                            <th style={{ background: "#f8fafc", color: "#475569", textAlign: "left" }}>Resident Information</th>
                            <th style={{ background: "#f8fafc", color: "#475569", textAlign: "left" }}>Previous Assignment</th>
                            <th style={{ background: "#f8fafc", color: "#475569", textAlign: "center" }}>Management Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(trashedData) && trashedData.length === 0 ? (
                            <tr><td colSpan="3" style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>No deleted records found.</td></tr>
                        ) : (
                            Array.isArray(trashedData) && trashedData.map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "12px 15px" }}>
                                        <div style={{ color: "#1e293b", fontWeight: "600" }}>{item.student_name}</div>
                                        <div style={{ color: "#64748b", fontSize: "11px" }}>CNIC: {item.cnic}</div>
                                    </td>
                                    <td style={{ padding: "12px 15px", color: "#334155" }}>
                                        <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>Room {item.room_number}</span>
                                        <span style={{ marginLeft: "5px", color: "#94a3b8", fontSize: "12px" }}>{item.bed_id}</span>
                                    </td>
                                    <td style={{ padding: "12px 15px", textAlign: "center" }}>
                                        <button 
                                            onClick={() => handleRestore(item.id)} 
                                            style={{ padding: "6px 14px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "6px", marginRight: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                                        >
                                            Restore
                                        </button>
                                        <button 
                                            onClick={() => handlePermanentDelete(item.id)} 
                                            style={{ padding: "6px 14px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                                        >
                                            Delete Permanently
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: "15px", textAlign: "right", color: "#94a3b8", fontSize: "11px" }}>
                Total Items in Bin: {trashedData.length}
            </div>
          </div>
        </div>
      )}

      {/* --- DOCUMENTS MODAL --- */}
      {selectedDocs && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setSelectedDocs(null)} className="btn-danger" style={{ float: "right" }}>CLOSE</button>
            <h2 style={{ borderBottom: "1px solid #334155", paddingBottom: "15px", color: "white" }}>Documents: {selectedDocs.student_name}</h2>
            <div className="doc-card-container">
              <DocCard title="Profile Photo" src={selectedDocs.photo_path} />
              <DocCard title="CNIC Front" src={selectedDocs.cnic_front_path} />
              <DocCard title="CNIC Back" src={selectedDocs.cnic_back_path} />
              <DocCard title="Resident Signature" src={selectedDocs.signature_path} isSignature />
              <DocCard title="Deposit Voucher" src={selectedDocs.voucher_path} />
              <DocCard title="Occupation Proof" src={selectedDocs.proof_path} />
            </div>
          </div>
        </div>
      )}

      {/* --- FULL PROFILE MODAL --- */}
      {selectedProfile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px", width: "95%" }}>
            <button onClick={() => setSelectedProfile(null)} className="btn-danger" style={{ float: "right" }}>CLOSE</button>
            <h2 style={{ color: "#070708", marginBottom: "20px" }}>Resident Profile: {selectedProfile.student_name}</h2>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #334155" }}>
                <button onClick={() => setActiveTab("info")} style={{ padding: "10px 20px", background: activeTab === "info" ? "#1e40af" : "transparent", color: "#070708", border: "none", cursor: "pointer", borderRadius: "4px 4px 0 0" }}>Personal Information</button>
                <button onClick={() => setActiveTab("docs")} style={{ padding: "10px 20px", background: activeTab === "docs" ? "#1e40af" : "transparent", color: "#070708", border: "none", cursor: "pointer", borderRadius: "4px 4px 0 0" }}>Uploaded Documents</button>
            </div>
            <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "10px" }}>
                {activeTab === "info" ? (
                    <div className="profile-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", color: "#070708" }}>
                        <InfoItem label="Full Name" value={selectedProfile.student_name} />
                        <InfoItem label="Father Name" value={selectedProfile.father_name} />
                        <InfoItem label="CNIC Number" value={selectedProfile.cnic} />
                        <InfoItem label="Contact No" value={selectedProfile.contact} />
                        <InfoItem label="Email Address" value={selectedProfile.email} />
                        <InfoItem label="Profession" value={selectedProfile.profession} />
                        <InfoItem label="Institute/Office" value={selectedProfile.institute_name} />
                        <InfoItem label="Check-in Date" value={selectedProfile.check_in_date} />
                        <InfoItem label="Room & Bed" value={`Room ${selectedProfile.room_number} (Bed ${selectedProfile.bed_id})`} />
                        <InfoItem label="Status" value={selectedProfile.status} />
                        <InfoItem label="Emergency Contact" value={`${selectedProfile.emergency_contact_name} (${selectedProfile.emergency_contact})`} />
                        <InfoItem label="Vehicle" value={selectedProfile.has_vehicle === "Yes" ? `${selectedProfile.vehicle_type} - ${selectedProfile.vehicle_number}` : "None"} />
                        <div style={{ gridColumn: "span 2" }}><InfoItem label="Permanent Address" value={selectedProfile.address} /></div>
                    </div>
                ) : (
                    <div className="doc-card-container">
                        <DocCard title="Profile Photo" src={selectedProfile.photo_path} /><DocCard title="CNIC Front" src={selectedProfile.cnic_front_path} /><DocCard title="CNIC Back" src={selectedProfile.cnic_back_path} /><DocCard title="Resident Signature" src={selectedProfile.signature_path} isSignature /><DocCard title="Deposit Voucher" src={selectedProfile.voucher_path} /><DocCard title="Occupation Proof" src={selectedProfile.proof_path} />
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const InfoItem = ({ label, value }) => (
    <div style={{ borderBottom: "1px solid #334155", paddingBottom: "8px" }}>
        <small style={{ color: "#94a3b8", display: "block", marginBottom: "2px", fontSize: "10px", textTransform: "uppercase" }}>{label}</small>
        <span style={{ fontWeight: "500" }}>{value || "N/A"}</span>
    </div>
);

const DocCard = ({ title, src, isSignature }) => (
  <div className="doc-card">
    <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "10px", fontWeight: "600", textTransform: "uppercase" }}>{title}</p>
    {src ? (
      <img src={`http://127.0.0.1:5000/uploads/${src}`} width="100%" style={{ background: isSignature ? "white" : "transparent", borderRadius: "4px" }} alt={title} />
    ) : (
      <div style={{ padding: "20px", textAlign: "center", color: "#475569", border: "1px dashed #334155" }}>No file uploaded</div>
    )}
  </div>
);

export default AdminBookings;