import { useEffect, useState } from "react";

function RoomSelector({ onBedSelect }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [beds, setBeds] = useState([]);
  const [activeBedId, setActiveBedId] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error("Rooms error:", err));
  }, []);

  const loadBeds = (room) => {
    setSelectedRoom(room);
    setActiveBedId(null); // Reset selection when room changes
    fetch(`http://127.0.0.1:5000/rooms/${room.room_id}/beds`)
      .then((res) => res.json())
      .then((data) => setBeds(data))
      .catch((err) => console.error("Beds error:", err));
  };

  const handleBedClick = (bed) => {
    if (bed.status === "free") {
      setActiveBedId(bed.id);
      onBedSelect(bed);
    }
  };

  return (
    <div style={{ marginTop: "20px", fontFamily: "sans-serif" }}>
      <h3 style={{ borderLeft: "4px solid #1e40af", paddingLeft: "10px" }}>Floor Plan - Select a Room</h3>

      {/* ROOM GRID */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", 
        gap: "15px", 
        background: "#f0f2f5", 
        padding: "20px", 
        borderRadius: "12px" 
      }}>
        {rooms.map((room) => (
          <div
            key={room.room_id}
            onClick={() => loadBeds(room)}
            style={{
              padding: "15px",
              cursor: "pointer",
              borderRadius: "8px",
              background: selectedRoom?.room_id === room.room_id ? "#1e40af" : "white",
              color: selectedRoom?.room_id === room.room_id ? "white" : "#333",
              border: "2px solid",
              borderColor: room.status === "full" ? "#FF7C7C" : room.status === "partial" ? "#7CB9E8" : "#7CFC9A",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <div style={{ fontSize: "12px", fontWeight: "bold" }}>ROOM</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{room.room_number}</div>
            <div style={{ fontSize: "11px", marginTop: "5px" }}>
              {room.free_beds} / {room.total_beds} Free
            </div>
          </div>
        ))}
      </div>

      {/* BED LAYOUT (Visualized as a physical room) */}
      {selectedRoom && (
        <div style={{ marginTop: "30px", animation: "fadeIn 0.5s" }}>
          <h4 style={{ textAlign: "center" }}>Inside Room {selectedRoom.room_number}</h4>
          
          <div style={{
            margin: "0 auto",
            maxWidth: "400px",
            background: "#fff",
            border: "3px solid #333",
            borderRadius: "10px",
            padding: "40px 20px 20px 20px",
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px"
          }}>
            {/* The "Door" Indicator */}
            <div style={{
              position: "absolute",
              top: "-2px",
              left: "40%",
              width: "60px",
              height: "5px",
              background: "#eee",
              border: "2px solid #333",
              textAlign: "center",
              fontSize: "10px",
              fontWeight: "bold"
            }}>DOOR</div>

            {beds.map((bed) => (
              <div
                key={bed.id}
                onClick={() => handleBedClick(bed)}
                style={{
                  height: "80px",
                  borderRadius: "4px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: bed.status === "free" ? "pointer" : "not-allowed",
                  background: activeBedId === bed.id ? "#1e40af" : bed.status === "free" ? "#d1fae5" : "#fee2e2",
                  color: activeBedId === bed.id ? "white" : "#333",
                  border: activeBedId === bed.id ? "2px solid #000" : "1px solid #ccc",
                  boxShadow: bed.status === "free" ? "0 4px 0 #10b981" : "0 4px 0 #ef4444",
                  position: "relative"
                }}
              >
                {/* Visual Bed Pillow */}
                <div style={{ 
                    width: "80%", 
                    height: "15px", 
                    background: "rgba(0,0,0,0.1)", 
                    position: "absolute", 
                    top: "5px", 
                    borderRadius: "2px" 
                }}></div>
                {bed.bed_number}
                <span style={{ fontSize: "9px" }}>{bed.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: "13px", color: "#666", marginTop: "10px" }}>
            * Green beds are available for booking.
          </p>
        </div>
      )}
    </div>
  );
}

export default RoomSelector;