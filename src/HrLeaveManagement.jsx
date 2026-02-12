import { useEffect, useState } from "react";
import axios from "axios";
import "./HrLeaveManagement.css";


/* ================= AXIOS CONFIGURATION ================= */
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default function HrLeaveManagement() {
  /* ================= STATE MANAGEMENT ================= */
  // Leave Master States
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ leaveName: "", noOfDays: "" });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // LOP States
  const [lopForm, setLopForm] = useState({
    userName: "",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  // UI States
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [activeTab, setActiveTab] = useState("leaveMaster"); // leaveMaster or lop

  /* ================= FETCH LEAVES ================= */
  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/leave-master/all");
      setLeaves(res.data);
    } catch (err) {
      showNotification("Error fetching leaves: " + err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  /* ================= NOTIFICATION SYSTEM ================= */
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  /* ================= INPUT HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleLopChange = (e) => {
    const { name, value } = e.target;
    setLopForm({ ...lopForm, [name]: value });
  };

  /* ================= LEAVE MASTER OPERATIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.leaveName.trim() || !form.noOfDays) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    if (Number(form.noOfDays) <= 0) {
      showNotification("Number of days must be greater than 0", "error");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        leaveId: editId ?? undefined,
        leaveName: form.leaveName.trim(),
        noOfDays: Number(form.noOfDays)
      };

      if (editId) {
        await api.put(`/leave-master/updateLeaveMaster/${editId}`, payload);
        showNotification("Leave type updated successfully!", "success");
      } else {
        await api.post("/leave-master/create", payload);
        showNotification("Leave type created successfully!", "success");
      }

      setForm({ leaveName: "", noOfDays: "" });
      setEditId(null);
      fetchLeaves();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to save leave type",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (leave) => {
    setForm({
      leaveName: leave.leaveName,
      noOfDays: leave.noOfDays
    });
    setEditId(leave.leaveId);
    setActiveTab("leaveMaster");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave type? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/leave-master/deleteLeaveMaster/${id}`);
      showNotification("Leave type deleted successfully", "success");
      fetchLeaves();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to delete leave type",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({ leaveName: "", noOfDays: "" });
    setEditId(null);
  };

  /* ================= LOP OPERATIONS ================= */
  const submitLOP = async (e) => {
    e.preventDefault();

    if (!lopForm.userName.trim() || !lopForm.fromDate || !lopForm.toDate || !lopForm.reason.trim()) {
      showNotification("Please fill in all LOP fields", "error");
      return;
    }

    // Validate dates
    const from = new Date(lopForm.fromDate);
    const to = new Date(lopForm.toDate);
    if (from > to) {
      showNotification("From date cannot be after To date", "error");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        userName: lopForm.userName.trim(),
        fromDate: lopForm.fromDate,
        toDate: lopForm.toDate,
        reason: lopForm.reason.trim()
      };

      await api.post("/leave-record/update-lop", payload);
      showNotification("LOP recorded successfully and notification sent!", "success");
      setLopForm({ userName: "", fromDate: "", toDate: "", reason: "" });
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to record LOP",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FILTERING ================= */
  const filteredLeaves = leaves.filter(leave =>
    leave.leaveName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= STATISTICS ================= */
  const totalLeaveTypes = leaves.length;
  const totalDaysAvailable = leaves.reduce((sum, leave) => sum + leave.noOfDays, 0);

  /* ================= RENDER ================= */
  return (
    <div className="hr-leave-container">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          <span className="notification-icon">
            {notification.type === "success" ? "✓" : "⚠"}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => setNotification({ show: false, message: "", type: "" })}
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="hr-leave-header">
        <h2>HR Leave Management System</h2>
        <p>Manage leave types and Loss of Pay (LOP) records efficiently</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Leave Types</h3>
          <p className="stat-value">{totalLeaveTypes}</p>
        </div>
        <div className="stat-card">
          <h3>Total Days Available</h3>
          <p className="stat-value">{totalDaysAvailable}</p>
        </div>
        <div className="stat-card">
          <h3>Active Session</h3>
          <p className="stat-value">HR Admin</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "leaveMaster" ? "active" : ""}`}
          onClick={() => setActiveTab("leaveMaster")}
        >
          <span className="tab-icon">📋</span>
          Leave Master
        </button>
        <button
          className={`tab-btn ${activeTab === "lop" ? "active" : ""}`}
          onClick={() => setActiveTab("lop")}
        >
          <span className="tab-icon">⚠️</span>
          Record LOP
        </button>
      </div>

      {/* Leave Master Tab */}
      {activeTab === "leaveMaster" && (
        <>
          {/* Leave Master Form */}
          <div className="leave-form-container">
            <div className="form-header">
              <h3>{editId ? "Edit Leave Type" : "Add New Leave Type"}</h3>
              {editId && (
                <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="leave-form">
              <div className="form-group">
                <label htmlFor="leaveName">Leave Type Name *</label>
                <input
                  id="leaveName"
                  type="text"
                  name="leaveName"
                  placeholder="e.g., Annual Leave, Sick Leave"
                  value={form.leaveName}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="noOfDays">Number of Days *</label>
                <input
                  id="noOfDays"
                  type="number"
                  name="noOfDays"
                  placeholder="e.g., 15"
                  value={form.noOfDays}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className={`btn ${editId ? "update-btn" : "btn-primary"}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <span>{editId ? "Update Leave Type" : "Add Leave Type"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Leave Master Table */}
          <div className="table-section">
            <div className="table-header">
              <h3>Leave Types Directory</h3>
              <div className="table-actions">
                <input
                  type="text"
                  className="search-box"
                  placeholder="🔍 Search leave types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="hr-leave-table-wrapper">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading">Loading leave types...</p>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <h4>No Leave Types Found</h4>
                  <p>
                    {searchTerm
                      ? "No leave types match your search criteria"
                      : "Start by adding your first leave type above"}
                  </p>
                </div>
              ) : (
                <table className="hr-leave-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Leave Type</th>
                      <th>Days Allocated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.map((leave) => (
                      <tr key={leave.leaveId}>
                        <td>#{leave.leaveId}</td>
                        <td>
                          <strong>{leave.leaveName}</strong>
                        </td>
                        <td>
                          <span className="days-badge">{leave.noOfDays} days</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() => handleEdit(leave)}
                              disabled={isLoading}
                            >
                              Edit
                            </button>
                            
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* LOP Tab */}
      {activeTab === "lop" && (
        <div className="leave-form-container">
          <div className="form-header">
            <h3>Record Loss of Pay (LOP)</h3>
          </div>
          <form onSubmit={submitLOP} className="lop-form">
            <div className="form-group">
              <label htmlFor="userName">Employee Username *</label>
              <input
                id="userName"
                type="text"
                name="userName"
                placeholder="e.g., VPPL038"
                value={lopForm.userName}
                onChange={handleLopChange}
                required
              />
              <small className="form-help">Enter the employee's system username</small>
            </div>

            <div className="form-group">
              <label htmlFor="fromDate">From Date *</label>
              <input
                id="fromDate"
                type="date"
                name="fromDate"
                value={lopForm.fromDate}
                onChange={handleLopChange}
                max={lopForm.toDate || undefined}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="toDate">To Date *</label>
              <input
                id="toDate"
                type="date"
                name="toDate"
                value={lopForm.toDate}
                onChange={handleLopChange}
                min={lopForm.fromDate || undefined}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="reason">Reason for LOP *</label>
              <textarea
                id="reason"
                name="reason"
                placeholder="Enter detailed reason for Loss of Pay..."
                value={lopForm.reason}
                onChange={handleLopChange}
                rows="4"
                maxLength={500}
                required
              />
              <small className="form-help">
                {lopForm.reason.length}/500 characters
              </small>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Recording LOP..." : "Record LOP & Send Notification"}
              </button>
            </div>
          </form>

      
        </div>
      )}
    </div>
  );
}
