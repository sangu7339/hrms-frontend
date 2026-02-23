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

  // Leave Master Errors
  const [leaveNameError, setLeaveNameError] = useState("");
  const [noOfDaysError, setNoOfDaysError] = useState("");

  // LOP States
  const [lopForm, setLopForm] = useState({
    userName: "",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  // LOP Errors
  const [userNameError, setUserNameError] = useState("");
  const [dateError, setDateError] = useState("");
  const [reasonError, setReasonError] = useState("");

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
  let { name, value } = e.target;

  // Leave Name → only letters & space
  if (name === "leaveName") {
    value = value.replace(/[^A-Za-z\s]/g, "");
    if (value.trim() === "") {
      setLeaveNameError("");
    } else if (!/^[A-Za-z\s]+$/.test(value)) {
      setLeaveNameError("Leave name must contain only letters and spaces");
    } else if (value.length < 2) {
      setLeaveNameError("Leave name must be at least 2 characters");
    } else {
      setLeaveNameError("");
    }
  }

  // Number of Days → numeric only + max 366
  if (name === "noOfDays") {
    value = value.replace(/\D/g, "");

    if (value.length > 3) return;
    
    if (value === "") {
      setNoOfDaysError("");
    } else {
      const numValue = Number(value);
      if (numValue < 1) {
        setNoOfDaysError("Number of days must be at least 1");
      } else if (numValue > 366) {
        setNoOfDaysError("Number of days cannot exceed 366");
        value = "366";
      } else {
        setNoOfDaysError("");
      }
    }
  }

  setForm({ ...form, [name]: value });
};

  const handleLopChange = (e) => {
  let { name, value } = e.target;

  // Username pattern → 4 letters + 3 digits (vppl001)
  if (name === "userName") {
    value = value.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (value.length <= 4) {
      value = value.replace(/[^a-z]/g, "");
    }

    if (value.length > 4) {
      const letters = value.substring(0, 4).replace(/[^a-z]/g, "");
      const numbers = value.substring(4).replace(/\D/g, "");
      value = letters + numbers;
    }

    if (value.length > 7) return;

    // Set error based on validation
    if (value === "") {
      setUserNameError("");
    } else if (value.length < 7) {
      setUserNameError("Format must be like vppl001 (4 letters + 3 digits)");
    } else if (!/^[a-z]{4}\d{3}$/.test(value)) {
      setUserNameError("Format must be like vppl001 (4 letters + 3 digits)");
    } else {
      setUserNameError("");
    }
  }

  setLopForm({ ...lopForm, [name]: value });
};

  /* ================= LEAVE MASTER OPERATIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let hasError = false;

    if (!form.leaveName.trim()) {
      setLeaveNameError("Leave name is required");
      hasError = true;
    } else if (form.leaveName.trim().length < 2) {
      setLeaveNameError("Leave name must be at least 2 characters");
      hasError = true;
    }

    if (!form.noOfDays) {
      setNoOfDaysError("Number of days is required");
      hasError = true;
    } else {
      const numDays = Number(form.noOfDays);
      if (numDays < 1) {
        setNoOfDaysError("Number of days must be at least 1");
        hasError = true;
      } else if (numDays > 366) {
        setNoOfDaysError("Number of days cannot exceed 366");
        hasError = true;
      }
    }

    if (hasError) return;

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
      setLeaveNameError("");
      setNoOfDaysError("");
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
    setLeaveNameError("");
    setNoOfDaysError("");
  };

  /* ================= LOP OPERATIONS ================= */
  const submitLOP = async (e) => {
    e.preventDefault();

    // Validate required fields
    let hasError = false;

    if (!lopForm.userName.trim()) {
      setUserNameError("Employee username is required");
      hasError = true;
    }

    if (!lopForm.reason.trim()) {
      setReasonError("Reason is required");
      hasError = true;
    } else if (lopForm.reason.trim().length < 10) {
      setReasonError("Reason must be at least 10 characters");
      hasError = true;
    }

    if (!lopForm.fromDate || !lopForm.toDate) {
      setDateError("Both From Date and To Date are required");
      hasError = true;
    } else {
      const from = new Date(lopForm.fromDate);
      const to = new Date(lopForm.toDate);
      if (from > to) {
        setDateError("From date cannot be after To date");
        hasError = true;
      } else {
        setDateError("");
      }
    }
    
    if (hasError) return;

    const usernameRegex = /^[a-z]{4}\d{3}$/;
    if (!usernameRegex.test(lopForm.userName)) {
      setUserNameError("Format must be like vppl001 (4 letters + 3 digits)");
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
      setUserNameError("");
      setDateError("");
      setReasonError("");
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
                <label htmlFor="leaveName">Leave Type Name <span className="required">*</span></label>
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
                {leaveNameError && (
                  <div className="field-error" style={{ color: 'rgb(214, 19, 16)', fontSize: '12px', marginTop: '4px' }}>
                    {leaveNameError}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="noOfDays">Number of Days <span className="required">*</span></label>
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
                {noOfDaysError && (
                  <div className="field-error" style={{ color: 'rgb(214, 19, 16)', fontSize: '12px', marginTop: '4px' }}>
                    {noOfDaysError}
                  </div>
                )}
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
                  placeholder=" Search leave types..."
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
                        <td>{leave.leaveId}</td>
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
              <label htmlFor="userName">Employee Username <span className="required">*</span></label>
              <input
                id="userName"
                type="text"
                name="userName"
                placeholder="e.g., VPPL038"
                value={lopForm.userName}
                onChange={handleLopChange}
                required
              />
              {userNameError && (
                <div className="field-error" style={{ color: 'rgb(214, 19, 16)', fontSize: '12px', marginTop: '4px' }}>
                  {userNameError}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fromDate">From Date <span className="required">*</span></label>
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
              <label htmlFor="toDate">To Date <span className="required">*</span></label>
              <input
                id="toDate"
                type="date"
                name="toDate"
                value={lopForm.toDate}
                onChange={handleLopChange}
                min={lopForm.fromDate || undefined}
                required
              />
              {dateError && (
                <div className="field-error" style={{ color: 'rgb(214, 19, 16)', fontSize: '12px', marginTop: '4px' }}>
                  {dateError}
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="reason">Reason for LOP <span className="required">*</span></label>
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
              {reasonError && (
                <div className="field-error" style={{ color: 'rgb(214, 19, 16)', fontSize: '12px', marginTop: '4px' }}>
                  {reasonError}
                </div>
              )}
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