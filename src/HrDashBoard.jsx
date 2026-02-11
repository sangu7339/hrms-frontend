
import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import "./HrDashBoard.css";
/* LOGO */
import ventureBizLogo from "./assets/venturebiz_logo.png";

/* MODULES */
import HrEmployeeManagement from "./HrEmployeeManagement";
import HrSalaryManagement from "./HrSalaryManagement";
import Department from "./Department";
import EmpMgr from "./EmpMgr"; // ADD THIS IMPORT
import HrLeaveManagement from "./HrLeaveManagement";
import HolidayCalendar from "./HolidayCalendar";
import CtcPer from "./CtcPer";
export default function HrDashBoard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logout, setLogout] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  /* PASSWORD */
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  /* ACTIVE PAGE */
  const [activePage, setActivePage] = useState("dashboard");

  /* ADVANCED SEARCH STATES */
  const [searchParams, setSearchParams] = useState({
    username: "",
    firstName: "",
    departmentName: "",
    designationName: "",
    startDate: "",
    endDate: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

  const profileRef = useRef(null);

  /* CLOSE PROFILE MENU */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (logout) return <Navigate to="/" replace />;

  /* UPDATE PASSWORD */
  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!strongPasswordRegex.test(newPassword)) {
      alert(
        "Password must be 8–16 characters with uppercase, lowercase, number & special character"
      );
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `/api/password`,
        { password: newPassword },
        { withCredentials: true }
      );
      alert("Password updated successfully");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  /* ADVANCED SEARCH EMPLOYEES */
  const searchEmployees = async () => {
    try {
      setLoadingSearch(true);
      const params = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `/api/hr/search?${params.toString()}`,
        { withCredentials: true }
      );
      
      setSearchResults(response.data);
      setSelectedEmployee(null);
      setDocuments([]);
      setShowEmployeeDetails(false);
      
      if (response.data.length === 0) {
        alert("No employees found with the specified criteria");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to search employees");
    } finally {
      setLoadingSearch(false);
    }
  };

  /* FETCH EMPLOYEE DOCUMENTS */
  const fetchEmployeeDocuments = async (userId) => {
    try {
      setLoadingDocuments(true);
      const response = await axios.get(
        `/api/hr/search-doc/${userId || 7}`,
        { withCredentials: true }
      );
      setDocuments(response.data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      alert("Failed to fetch employee documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  /* VIEW EMPLOYEE DETAILS */
  const viewEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    fetchEmployeeDocuments(7);
    setShowEmployeeDetails(true);
  };

  /* DOWNLOAD DOCUMENT */
  const downloadDocument = async (docPath, documentName) => {
    try {
      const response = await axios.get(
        `/api/${docPath}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download document. Please try again.");
    }
  };

  /* RESET SEARCH */
  const resetSearch = () => {
    setSearchParams({
      username: "",
      firstName: "",
      departmentName: "",
      designationName: "",
      startDate: "",
      endDate: "",
    });
    setSearchResults([]);
    setSelectedEmployee(null);
    setDocuments([]);
    setShowEmployeeDetails(false);
  };

  /* FORMAT DATE */
  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 3) return "N/A";
    const [year, month, day] = dateArray;
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };

  /* CONTENT SWITCH - UPDATED TO INCLUDE MANAGER */
  const renderContent = () => {
    switch (activePage) {
      case "employee":
        return <HrEmployeeManagement />;
      case "department":
        return <Department />;
      case "salary":
        return <HrSalaryManagement />;
case "ctc":
  return <CtcPer />;

      case "manager": // ADD THIS CASE
        return <EmpMgr />;
case "leave":
  return <HrLeaveManagement />;
case "holidaycalendar":
  return <HolidayCalendar />;   
      case "dashboard":
        return (
          <div className="dashboard-content">
            {/* WELCOME BANNER */}
            <div className="welcome-banner">
              <div className="welcome-text">
                <h2>Welcome to HR Dashboard 👋</h2>
                <p>Manage employees, departments, and search employee records</p>
              </div>
             
            </div>

            {/* ADVANCED SEARCH SECTION */}
            <div className="search-section">
              <div className="section-header">
                <h3>🔍 Advanced Employee Search</h3>
                <p>Search employees by multiple criteria</p>
              </div>
              
              {/* SEARCH FORM */}
              <div className="search-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      placeholder="e.g., vbz001"
                      value={searchParams.username}
                      onChange={(e) => setSearchParams({
                        ...searchParams,
                        username: e.target.value
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      placeholder="e.g., John"
                      value={searchParams.firstName}
                      onChange={(e) => setSearchParams({
                        ...searchParams,
                        firstName: e.target.value
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      placeholder="e.g., Finance"
                      value={searchParams.departmentName}
                      onChange={(e) => setSearchParams({
                        ...searchParams,
                        departmentName: e.target.value
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Designation</label>
                    <input
                      type="text"
                      placeholder="e.g., Analyst"
                      value={searchParams.designationName}
                      onChange={(e) => setSearchParams({
                        ...searchParams,
                        designationName: e.target.value
                      })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group date-range">
                    <label>Joining Date Range</label>
                    <div className="date-inputs">
                      <input
                        type="date"
                        value={searchParams.startDate}
                        onChange={(e) => setSearchParams({
                          ...searchParams,
                          startDate: e.target.value
                        })}
                        placeholder="Start Date"
                      />
                      <span className="date-separator">to</span>
                      <input
                        type="date"
                        value={searchParams.endDate}
                        onChange={(e) => setSearchParams({
                          ...searchParams,
                          endDate: e.target.value
                        })}
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={searchEmployees}
                    disabled={loadingSearch}
                  >
                    {loadingSearch ? "Searching..." : "🔍 Search Employees"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={resetSearch}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* SEARCH RESULTS */}
            {searchResults.length > 0 && !showEmployeeDetails && (
              <div className="results-section">
                <div className="section-header">
                  <div>
                    <h3>Search Results</h3>
                    <p>{searchResults.length} employee(s) found</p>
                  </div>
                  <button 
                    className="btn btn-ghost"
                    onClick={resetSearch}
                  >
                    Clear Results
                  </button>
                </div>

                <div className="results-table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Date of Joining</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((employee, index) => (
                        <tr key={index}>
                          <td>
                            <span className="username-badge">{employee.username}</span>
                          </td>
                          <td className="employee-name">
                            {employee.firstName} {employee.lastName}
                          </td>
                          <td>{employee.departmentName}</td>
                          <td>{employee.designationName}</td>
                          <td>{formatDate(employee.dateOfJoining)}</td>
                          <td>
                            <button 
                              className="btn btn-view"
                              onClick={() => viewEmployeeDetails(employee)}
                            >
                              📄 View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* EMPLOYEE DETAILS VIEW */}
            {selectedEmployee && showEmployeeDetails && (
              <div className="employee-details-section">
                <div className="section-header">
                  <div>
                    <h3>Employee Details</h3>
                    <p>{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                  </div>
                  <div className="header-actions">
                    <span className="employee-id">ID: {selectedEmployee.username}</span>
                    <button 
                      className="btn btn-ghost"
                      onClick={() => setShowEmployeeDetails(false)}
                    >
                      ← Back to Results
                    </button>
                  </div>
                </div>

                <div className="details-grid">
                  {/* PERSONAL DETAILS */}
                  <div className="detail-card">
                    <h4>👤 Personal Information</h4>
                    <div className="detail-content">
                      <div className="detail-item">
                        <span className="detail-label">Full Name</span>
                        <span className="detail-value">{selectedEmployee.firstName} {selectedEmployee.middleName} {selectedEmployee.lastName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{selectedEmployee.emailId}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{selectedEmployee.phoneNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date of Birth</span>
                        <span className="detail-value">{formatDate(selectedEmployee.dob)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Gender</span>
                        <span className="detail-value">{selectedEmployee.gender}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Marital Status</span>
                        <span className="detail-value">{selectedEmployee.maritalStatus}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Blood Group</span>
                        <span className="detail-value">{selectedEmployee.bloodGroup}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Nationality</span>
                        <span className="detail-value">{selectedEmployee.nationality}</span>
                      </div>
                    </div>
                  </div>

                  {/* EMPLOYMENT DETAILS */}
                  <div className="detail-card">
                    <h4>💼 Employment Information</h4>
                    <div className="detail-content">
                      <div className="detail-item">
                        <span className="detail-label">Department</span>
                        <span className="detail-value">{selectedEmployee.departmentName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Designation</span>
                        <span className="detail-value">{selectedEmployee.designationName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Work Location</span>
                        <span className="detail-value">{selectedEmployee.workLocation}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date of Joining</span>
                        <span className="detail-value">{formatDate(selectedEmployee.dateOfJoining)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">PF UAN</span>
                        <span className="detail-value">{selectedEmployee.pfUan}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">ESI</span>
                        <span className="detail-value">{selectedEmployee.esi}</span>
                      </div>
                    </div>
                  </div>

                  {/* FINANCIAL DETAILS */}
                  <div className="detail-card">
                    <h4>💰 Financial Information</h4>
                    <div className="detail-content">
                      <div className="detail-item">
                        <span className="detail-label">CTC</span>
                        <span className="detail-value highlight">₹{selectedEmployee.ctc?.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Basic Salary</span>
                        <span className="detail-value">₹{selectedEmployee.basic?.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">HRA</span>
                        <span className="detail-value">₹{selectedEmployee.hra?.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Conveyance Allowance</span>
                        <span className="detail-value">₹{selectedEmployee.conveyanceAllowance?.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">PF</span>
                        <span className="detail-value">₹{selectedEmployee.pf?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* BANK DETAILS */}
                  <div className="detail-card">
                    <h4>🏦 Bank Information</h4>
                    <div className="detail-content">
                      <div className="detail-item">
                        <span className="detail-label">Bank Name</span>
                        <span className="detail-value">{selectedEmployee.bankName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Account Number</span>
                        <span className="detail-value">{selectedEmployee.accountNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">IFSC Code</span>
                        <span className="detail-value">{selectedEmployee.ifsc}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Branch</span>
                        <span className="detail-value">{selectedEmployee.branchName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Beneficiary Name</span>
                        <span className="detail-value">{selectedEmployee.beneficiaryName}</span>
                      </div>
                    </div>
                  </div>

                  {/* IDENTITY DETAILS */}
                  <div className="detail-card">
                    <h4>🆔 Identity Information</h4>
                    <div className="detail-content">
                      <div className="detail-item">
                        <span className="detail-label">PAN Number</span>
                        <span className="detail-value">{selectedEmployee.panNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Aadhaar Number</span>
                        <span className="detail-value">{selectedEmployee.aadhaarNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="detail-card">
                    <h4>📍 Address</h4>
                    <div className="detail-content">
                      <div className="detail-item">
                        <span className="detail-label">Address Line 1</span>
                        <span className="detail-value">{selectedEmployee.address1}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Address Line 2</span>
                        <span className="detail-value">{selectedEmployee.address2}</span>
                      </div>
                    </div>
                  </div>

                  {/* EMERGENCY CONTACT */}
                  <div className="detail-card">
                    <h4>🚨 Emergency Contact</h4>
                    <div className="detail-content">
                      <div className="detail-item">
                        <span className="detail-label">Contact Name</span>
                        <span className="detail-value">{selectedEmployee.emergencyContactName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone Number</span>
                        <span className="detail-value">{selectedEmployee.emergencyPhoneNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Relation</span>
                        <span className="detail-value">{selectedEmployee.emergencyContactRelation}</span>
                      </div>
                    </div>
                  </div>

                  {/* DOCUMENTS */}
                  {documents.length > 0 && (
                    <div className="detail-card full-width">
                      <h4>📎 Employee Documents</h4>
                      {loadingDocuments ? (
                        <div className="loading-state">Loading documents...</div>
                      ) : (
                        <div className="documents-grid">
                          {documents.map((doc, index) => (
                            <div key={index} className="document-item">
                              <div className="document-info">
                                <div className="document-icon">📄</div>
                                <div className="document-details">
                                  <div className="document-name">{doc.documentName}</div>
                                  <div className="document-id">ID: {doc.docId}</div>
                                </div>
                              </div>
                              <button
                                className="btn btn-download"
                                onClick={() => downloadDocument(doc.docPath, doc.documentName)}
                                disabled={loadingDocuments}
                              >
                                📥 Download
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - UPDATED TO INCLUDE MANAGER */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <img src={ventureBizLogo} alt="VB Logo" />
            <span>HRMS PORTAL</span>
          </div>

          <nav className="sidebar-nav">
            {[
              ["dashboard", "Dashboard", "📊"],
              ["employee", "Employee Management", "👥"],
              ["department", "Department Management", "🏢"],
              ["salary", "Salary Management", "💰"],
              ["manager", "Manager Management", "👨‍💼"], // ADD THIS LINE
              ["leave", "Leave Management", "🏖️"],
              ["holidaycalendar","Hoilday Calendar", "🌴"],
              ["ctc", "Set CTC %", "💹"],
            ].map(([key, label, icon]) => (
              <button
                key={key}
                className={`side-item ${activePage === key ? "active" : ""}`}
                onClick={() => {
                  setActivePage(key);
                  setSidebarOpen(false);
                  resetSearch();
                }}
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content-area">
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1>HR Dashboard</h1>
          </div>

          <div className="header-right">
            <div className="profile-dropdown" ref={profileRef}>
              <div
                className="profile"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="avatar">HR</div>
                <span>HR Admin</span>
              </div>

              {profileMenuOpen && (
                <div className="profile-menu">
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setShowPasswordModal(true);
                      setProfileMenuOpen(false);
                    }}
                  >
                    🔒 Change Password
                  </button>
                </div>
              )}
            </div>

            <button className="logout-btn" onClick={() => setLogout(true)}>
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-main">{renderContent()}</main>

        <footer className="app-fixed-footer">©️ 2026 VentureBiz HRMS</footer>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <h3>Update Password</h3>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                maxLength={16}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-field">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  maxLength={16}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  className="eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={updatePassword}
                disabled={loading}
              >
                {loading ? "Saving..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}