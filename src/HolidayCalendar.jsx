
import { useEffect, useState } from "react";
import axios from "axios";
import "./HolidayCalendar.css";

export default function HolidayCalendar() {
  const [types, setTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [newType, setNewType] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const [form, setForm] = useState({
    holidayName: "",
    holidayDate: "",
    holidayTypeId: "",
    holidayLocationId: ""
  });

  // ✅ Load all data on initial load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Load holiday types
      const typeRes = await axios.get(
        `/api/hr/holidaymaster`,
        { withCredentials: true }
      );

      // Load holiday locations
      const locRes = await axios.get(
        `/api/hr/holidaylocation`,
        { withCredentials: true }
      );

      // Load holidays
      const holidayRes = await axios.get(
        `/api/hr/holiday`,
        { withCredentials: true }
      );

      setTypes(typeRes.data || []);
      setLocations(locRes.data || []);
      setHolidays(holidayRes.data || []);
    } catch (err) {
      console.log("Data load error:", err);
    }
  };

  // ✅ Add Holiday Type
  const addNewType = async () => {
    if (!newType.trim()) return;

    try {
      const res = await axios.post(
        `/api/hr/holidaymaster`,
        { holidayType: newType },
        { withCredentials: true }
      );

      if (res.data && res.data.htId) {
        setForm({ ...form, holidayTypeId: res.data.htId.toString() });
      }
      setNewType("");
      loadAllData();
    } catch (error) {
      console.error("Error adding type:", error);
    }
  };

  // ✅ Add Location
  const addNewLocation = async () => {
    if (!newLocation.trim()) return;

    try {
      const res = await axios.post(
        `/api/hr/holidaylocation`,
        { locationName: newLocation },
        { withCredentials: true }
      );

      if (res.data && res.data.hlId) {
        setForm({ ...form, holidayLocationId: res.data.hlId.toString() });
      }
      setNewLocation("");
      loadAllData();
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  // ✅ Save Holiday (Create or Update)
  const saveHoliday = async () => {
    if (!form.holidayName || !form.holidayDate) {
      alert("Enter name & date");
      return;
    }

    if (!form.holidayTypeId || !form.holidayLocationId) {
      alert("Select type & location");
      return;
    }

    try {
      if (isEditing && editingId) {
        // Update existing holiday
        await axios.put(
          `/api/hr/holiday/${editingId}`,
          {
            holidayName: form.holidayName,
            holidayDate: form.holidayDate,
            holidayTypeId: Number(form.holidayTypeId),
            holidayLocationId: Number(form.holidayLocationId)
          },
          { withCredentials: true }
        );
        alert("✅ Holiday Updated");
      } else {
        // Create new holiday
        await axios.post(
          `/api/hr/holiday`,
          {
            holidayName: form.holidayName,
            holidayDate: form.holidayDate,
            holidayTypeId: Number(form.holidayTypeId),
            holidayLocationId: Number(form.holidayLocationId)
          },
          { withCredentials: true }
        );
        alert("✅ Holiday Added");
      }

      // Reset form and reload data
      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Error saving holiday:", error);
      alert("Error saving holiday");
    }
  };

  // ✅ Edit Holiday
  const editHoliday = (holiday) => {
    console.log("Editing holiday:", holiday); // Debug log
    
    // Check if holiday has the correct ID field
    const holidayId = holiday.id || holiday.holidayId || holiday.hId;
    
    if (!holidayId) {
      console.error("No ID found in holiday object:", holiday);
      alert("Cannot edit: Holiday ID not found");
      return;
    }

    setForm({
      holidayName: holiday.holidayName || "",
      holidayDate: holiday.holidayDate || "",
      holidayTypeId: holiday.holidayTypeId ? holiday.holidayTypeId.toString() : "",
      holidayLocationId: holiday.holidayLocationId ? holiday.holidayLocationId.toString() : ""
    });
    setEditingId(holidayId);
    setIsEditing(true);
  };

  // ✅ Delete Holiday
  const deleteHoliday = async (holiday) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) {
      return;
    }

    try {
      // Get the correct ID field
      const holidayId = holiday.id || holiday.holidayId || holiday.hId;
      
      if (!holidayId) {
        console.error("No ID found for deletion:", holiday);
        alert("Cannot delete: Holiday ID not found");
        return;
      }

      console.log("Deleting holiday with ID:", holidayId); // Debug log
      
      await axios.delete(
        `/api/hr/holiday/${holidayId}`,
        { withCredentials: true }
      );
      alert("✅ Holiday Deleted");
      loadAllData();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      alert("Error deleting holiday");
    }
  };

  // ✅ Reset Form
  const resetForm = () => {
    setForm({
      holidayName: "",
      holidayDate: "",
      holidayTypeId: "",
      holidayLocationId: ""
    });
    setEditingId(null);
    setIsEditing(false);
  };

  // ✅ Get type name by ID
  const getTypeName = (typeId) => {
    const type = types.find(t => t.htId == typeId || t.id == typeId);
    return type ? type.holidayType || type.type : "Unknown";
  };

  // ✅ Get location name by ID
  const getLocationName = (locationId) => {
    const location = locations.find(l => l.hlId == locationId || l.id == locationId);
    return location ? location.locationName || location.name : "Unknown";
  };

  return (
    <div className="holiday-container">
      <div className="holiday-card">
        <h2>{isEditing ? "Edit Holiday" : "Add Holiday"}</h2>

        <div className="row">
          <input
            placeholder="Holiday Name"
            value={form.holidayName}
            onChange={e =>
              setForm({ ...form, holidayName: e.target.value })
            }
          />

          <input
            type="date"
            value={form.holidayDate}
            onChange={e =>
              setForm({ ...form, holidayDate: e.target.value })
            }
          />
        </div>

        {/* Holiday Type */}
        <div className="row">
          <select
            value={form.holidayTypeId}
            onChange={e =>
              setForm({ ...form, holidayTypeId: e.target.value })
            }
          >
            <option value="">Select Type</option>
            {types.map(t => (
              <option key={t.htId || t.id} value={t.htId || t.id}>
                {t.holidayType || t.type}
              </option>
            ))}
          </select>

          <input
            placeholder="Add new type"
            value={newType}
            onChange={e => setNewType(e.target.value)}
          />
          <button onClick={addNewType}>Add</button>
        </div>

        {/* Location */}
        <div className="row">
          <select
            value={form.holidayLocationId}
            onChange={e =>
              setForm({ ...form, holidayLocationId: e.target.value })
            }
          >
            <option value="">Select Location</option>
            {locations.map(l => (
              <option key={l.hlId || l.id} value={l.hlId || l.id}>
                {l.locationName || l.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Add new location"
            value={newLocation}
            onChange={e => setNewLocation(e.target.value)}
          />
          <button onClick={addNewLocation}>Add</button>
        </div>

        <div className="button-row">
          <button onClick={saveHoliday} className="save-btn">
            {isEditing ? "Update Holiday" : "Save Holiday"}
          </button>
          {isEditing && (
            <button onClick={resetForm} className="cancel-btn">
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Holiday List */}
      <div className="holiday-list">
        <h2>Holiday List</h2>
        {holidays.length === 0 ? (
          <p>No holidays found</p>
        ) : (
          <table className="holiday-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(holiday => {
                // Get unique ID for key - check multiple possible ID fields
                const holidayId = holiday.id || holiday.holidayId || holiday.hId || Math.random();
                
                return (
                  <tr key={holidayId}>
                    <td>{holiday.holidayName || holiday.name}</td>
                    <td>{holiday.holidayDate || holiday.date}</td>
                    <td>{getTypeName(holiday.holidayTypeId || holiday.typeId)}</td>
                    <td>{getLocationName(holiday.holidayLocationId || holiday.locationId)}</td>
                    <td>
                      <button 
                        onClick={() => editHoliday(holiday)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteHoliday(holiday)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}