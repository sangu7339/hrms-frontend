
import React, { Component } from "react";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Axios configuration

axios.defaults.withCredentials = true;

export default class EmpProfile extends Component {
  state = {
    loading: true,
    error: null,
    data: null,
    editing: false,
    formData: {},
    profilePicture: null,
    activeTab: "personal",
    photographData: null,
    photographLoading: false,
  };

  componentDidMount() {
    this.fetchProfile();
    // Auto-refresh every 5 minutes
    this.refreshInterval = setInterval(this.fetchProfile, 300000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
    // Clean up blob URL to prevent memory leaks
    if (this.state.photographData && this.state.photographData !== "default") {
      URL.revokeObjectURL(this.state.photographData);
    }
  }

  fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/emp/profile`);
      this.setState({
        data: res.data,
        loading: false,
        formData: res.data,
      }, () => {
        // After profile is loaded, fetch the photograph
        this.fetchPhotograph(res.data.userId);
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      this.setState({
        error: "Failed to load profile. Please try again.",
        loading: false,
      });
    }
  };

  fetchPhotograph = async (userId) => {
    if (!userId) return;
    
    this.setState({ photographLoading: true });
    
    try {
      // Step 1: Get document list for the user
      const docRes = await axios.get(`${API_BASE_URL}/hr/search-doc/${userId}`);
      console.log("Document list:", docRes.data);
      
      // Step 2: Find photograph document
      const photographDoc = docRes.data.find(doc => doc.documentName === "photograph");
      
      if (photographDoc) {
        console.log("Found photograph document:", photographDoc);
        
        // Step 3: Download the photograph
        const imageRes = await axios.get(
          `${API_BASE_URL}/api/v1/users/${userId}/documents/${photographDoc.docId}/download`,
          { 
            responseType: 'blob',
            timeout: 10000 // 10 second timeout
          }
        );
        
        console.log("Image response:", imageRes);
        
        // Step 4: Create blob URL for the image
        const imageBlob = new Blob([imageRes.data], { type: imageRes.headers['content-type'] || 'image/jpeg' });
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Clean up previous blob URL if exists
        if (this.state.photographData && this.state.photographData !== "default") {
          URL.revokeObjectURL(this.state.photographData);
        }
        
        this.setState({
          photographData: imageUrl,
          photographLoading: false,
        });
      } else {
        console.log("No photograph document found");
        this.setState({
          photographData: "default",
          photographLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching photograph:", error);
      this.setState({
        photographData: "default",
        photographLoading: false,
      });
    }
  };

  handleEditToggle = () => {
    this.setState((prevState) => ({
      editing: !prevState.editing,
      formData: prevState.data,
    }));
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));
  };

  handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/emp/profile`, this.state.formData);
      this.setState({
        editing: false,
        data: this.state.formData,
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/emp/profile/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      this.setState((prevState) => ({
        data: { ...prevState.data, profilePicture: res.data.imageUrl },
      }));
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image.");
    }
  };

  handlePrint = () => {
    window.print();
  };

  exportToPDF = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp/profile/export/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "employee-profile.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to export PDF.");
    }
  };

  maskAccountNumber = (accNum) => {
    if (!accNum || accNum.length < 4) return "-";
    return `****${accNum.slice(-4)}`;
  };

  formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length !== 3) return "-";
    try {
      const [year, month, day] = dateArray;
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  formatCurrency = (value) => {
    if (!value && value !== 0) return "-";
    return `₹ ${Number(value).toLocaleString("en-IN")}`;
  };

  render() {
    const { 
      loading, 
      error, 
      data, 
      editing, 
      formData, 
      activeTab,
      photographData,
      photographLoading 
    } = this.state;

    if (loading) return <ProfileSkeleton />;
    if (error) return <ErrorMessage message={error} onRetry={this.fetchProfile} />;
    if (!data) return null;

    // Prepare photograph URL
    let photographUrl;
    if (photographData && photographData !== "default") {
      photographUrl = photographData;
    } else {
      // Fallback to default avatar if no photograph found
      const initials = `${data.firstName?.charAt(0) || ''}${data.lastName?.charAt(0) || ''}`;
      photographUrl = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><circle cx='60' cy='60' r='60' fill='%234f46e5'/><text x='50%' y='55%' text-anchor='middle' fill='white' font-size='48' font-family='Arial, sans-serif' dy='.3em'>${initials}</text></svg>`;
    }

    return (
      <div style={styles.container} className="profile-container">
        {/* Header with Actions */}
        <div style={styles.header}>
          <div style={styles.titleSection}>
            <h2 style={styles.mainTitle}>My Profile</h2>
            {data.employmentStatus && (
              <div style={getStatusStyle(data.employmentStatus)}>
                {data.employmentStatus}
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <EditForm
            formData={formData}
            onChange={this.handleInputChange}
            onSave={this.handleSave}
            onCancel={this.handleEditToggle}
          />
        )}

        {/* Profile Picture */}
        <div style={styles.profilePictureSection}>
          <div style={styles.profilePictureContainer}>
            <div style={styles.profilePictureWrapper}>
              {photographLoading ? (
                <div style={styles.photographLoading}>
                  Loading photo...
                </div>
              ) : (
                <img
                  src={photographUrl}
                  alt="Profile"
                  style={styles.profilePicture}
                  onError={(e) => {
                    // Fallback to default avatar on image load error
                    const initials = `${data.firstName?.charAt(0) || ''}${data.lastName?.charAt(0) || ''}`;
                    e.target.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><circle cx='60' cy='60' r='60' fill='%234f46e5'/><text x='50%' y='55%' text-anchor='middle' fill='white' font-size='48' font-family='Arial, sans-serif' dy='.3em'>${initials}</text></svg>`;
                  }}
                />
              )}
            </div>
          </div>
          <div style={styles.profileSummary}>
            <h3 style={styles.name}>
              {data.firstName} {data.lastName}
            </h3>
            <p style={styles.designation}>{data.designationName}</p>
            <p style={styles.department}>{data.departmentName}</p>
            <p style={styles.employeeId}>Employee ID: {data.userId || "N/A"}</p>
          </div>
        </div>

        {/* Enhanced Tabs Navigation */}
        <div style={styles.tabContainer} className="no-print">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              style={
                activeTab === tab.id
                  ? { ...styles.tab, ...styles.activeTab }
                  : styles.tab
              }
              onClick={() => this.setState({ activeTab: tab.id })}
            >
              <span style={styles.tabIcon}>{TAB_ICONS[tab.id]}</span>
              <span style={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Sections */}
        <div style={styles.sectionsContainer}>
          {/* Personal Details */}
          {(activeTab === "personal" || activeTab === "all") && (
            <Section title="Personal Details" icon="👤">
              <Field
                label="First Name"
                value={data.firstName}
                editing={editing}
                name="firstName"
                onChange={this.handleInputChange}
                formValue={formData.firstName}
              />
              <Field
                label="Last Name"
                value={data.lastName}
                editing={editing}
                name="lastName"
                onChange={this.handleInputChange}
                formValue={formData.lastName}
              />
              <Field
                label="Gender"
                value={data.gender}
                editing={editing}
                name="gender"
                type="select"
                options={["MALE", "FEMALE", "OTHER"]}
                onChange={this.handleInputChange}
                formValue={formData.gender}
              />
              <Field
                label="Date of Birth"
                value={this.formatDate(data.dob)}
                editing={editing}
                name="dob"
                type="date"
                onChange={this.handleInputChange}
                formValue={formData.dob}
              />
              <Field
                label="Phone Number"
                value={data.phoneNumber}
                editing={editing}
                name="phoneNumber"
                onChange={this.handleInputChange}
                formValue={formData.phoneNumber}
              />
              <Field
                label="Email"
                value={data.emailId}
                editing={editing}
                name="emailId"
                type="email"
                onChange={this.handleInputChange}
                formValue={formData.emailId}
              />
              <Field
                label="Blood Group"
                value={data.bloodGroup}
                editing={editing}
                name="bloodGroup"
                type="select"
                options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
                onChange={this.handleInputChange}
                formValue={formData.bloodGroup}
              />
              <Field
                label="Address"
                value={data.address1}
                editing={editing}
                name="address1"
                type="textarea"
                onChange={this.handleInputChange}
                formValue={formData.address1}
                fullWidth
              />
            </Section>
          )}

          {/* Job Details */}
          {(activeTab === "job" || activeTab === "all") && (
            <Section title="Job Details" icon="💼">
              <Field
                label="Employee ID"
                value={data.userId}
                editing={false}
              />
              <Field
                label="Work Location"
                value={data.workLocation}
                editing={editing}
                name="workLocation"
                onChange={this.handleInputChange}
                formValue={formData.workLocation}
              />
              <Field
                label="Date of Joining"
                value={this.formatDate(data.dateOfJoining)}
                editing={editing}
                name="dateOfJoining"
                type="date"
                onChange={this.handleInputChange}
                formValue={formData.dateOfJoining}
              />
              <Field
                label="Department"
                value={data.departmentName}
                editing={false}
              />
              <Field
                label="Designation"
                value={data.designationName}
                editing={false}
              />
            </Section>
          )}

          {/* Salary Details */}
          {(activeTab === "salary" || activeTab === "all") && (
            <Section title="Salary Details" icon="💰">
              <Field
                label="CTC (Cost to Company)"
                value={this.formatCurrency(data.ctc)}
                editing={editing}
                name="ctc"
                type="number"
                onChange={this.handleInputChange}
                formValue={formData.ctc}
              />
              <Field
                label="Basic Salary"
                value={this.formatCurrency(data.basic)}
                editing={editing}
                name="basic"
                type="number"
                onChange={this.handleInputChange}
                formValue={formData.basic}
              />
              <Field
                label="HRA (House Rent Allowance)"
                value={this.formatCurrency(data.hra)}
                editing={editing}
                name="hra"
                type="number"
                onChange={this.handleInputChange}
                formValue={formData.hra}
              />
              <Field
                label="Conveyance Allowance"
                value={this.formatCurrency(data.conveyanceAllowance)}
                editing={editing}
                name="conveyanceAllowance"
                type="number"
                onChange={this.handleInputChange}
                formValue={formData.conveyanceAllowance}
              />
            </Section>
          )}

          {/* Bank Details */}
          {(activeTab === "bank" || activeTab === "all") && (
            <Section title="Bank Details" icon="🏦">
              <Field
                label="Bank Name"
                value={data.bankName}
                editing={editing}
                name="bankName"
                onChange={this.handleInputChange}
                formValue={formData.bankName}
              />
              <Field
                label="Account Number"
                value={this.maskAccountNumber(data.accountNumber)}
                editing={editing}
                name="accountNumber"
                onChange={this.handleInputChange}
                formValue={formData.accountNumber}
                maskable
              />
              <Field
                label="IFSC Code"
                value={data.ifsc}
                editing={editing}
                name="ifsc"
                onChange={this.handleInputChange}
                formValue={formData.ifsc}
              />
              <Field
                label="Branch Name"
                value={data.branchName}
                editing={editing}
                name="branchName"
                onChange={this.handleInputChange}
                formValue={formData.branchName}
              />
              <Field
                label="Beneficiary Name"
                value={data.beneficiaryName}
                editing={editing}
                name="beneficiaryName"
                onChange={this.handleInputChange}
                formValue={formData.beneficiaryName}
              />
            </Section>
          )}

          {/* Emergency Contact */}
          {(activeTab === "emergency" || activeTab === "all") && (
            <Section title="Emergency Contact" icon="🚨">
              <Field
                label="Contact Name"
                value={data.emergencyContactName}
                editing={editing}
                name="emergencyContactName"
                onChange={this.handleInputChange}
                formValue={formData.emergencyContactName}
              />
              <Field
                label="Contact Number"
                value={data.emergencyPhoneNumber}
                editing={editing}
                name="emergencyPhoneNumber"
                onChange={this.handleInputChange}
                formValue={formData.emergencyPhoneNumber}
              />
            </Section>
          )}

          {/* Statutory Details */}
          {(activeTab === "statutory" || activeTab === "all") && (
            <Section title="Statutory Details" icon="📋">
              <Field
                label="PF / UAN Number"
                value={data.pfUan}
                editing={editing}
                name="pfUan"
                onChange={this.handleInputChange}
                formValue={formData.pfUan}
              />
              <Field
                label="ESI Number"
                value={data.esi === "yes" ? "Yes" : "No"}
                editing={editing}
                name="esi"
                type="select"
                options={["yes", "no"]}
                onChange={this.handleInputChange}
                formValue={formData.esi}
              />
              <Field
                label="MIN"
                value={data.min === "yes" ? "Yes" : "No"}
                editing={editing}
                name="min"
                type="select"
                options={["yes", "no"]}
                onChange={this.handleInputChange}
                formValue={formData.min}
              />
              <Field
                label="PAN Number"
                value={data.panNumber}
                editing={editing}
                name="panNumber"
                onChange={this.handleInputChange}
                formValue={formData.panNumber}
              />
              <Field
                label="Aadhaar Number"
                value={data.aadhaarNumber ? `**** **** ${data.aadhaarNumber.slice(-4)}` : "-"}
                editing={editing}
                name="aadhaarNumber"
                onChange={this.handleInputChange}
                formValue={formData.aadhaarNumber}
                maskable
              />
            </Section>
          )}
        </div>
      </div>
    );
  }
}

// Helper Components (unchanged from your code)
const ProfileSkeleton = () => (
  <div style={styles.container}>
    <div style={skeletonStyles.header}>
      <div style={skeletonStyles.title}></div>
      <div style={skeletonStyles.actions}></div>
    </div>
    <div style={skeletonStyles.profileSection}>
      <div style={skeletonStyles.avatar}></div>
      <div style={skeletonStyles.info}>
        <div style={skeletonStyles.line}></div>
        <div style={skeletonStyles.line}></div>
        <div style={skeletonStyles.line}></div>
      </div>
    </div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} style={skeletonStyles.section}>
        <div style={skeletonStyles.sectionTitle}></div>
        <div style={skeletonStyles.grid}>
          {[1, 2, 3, 4].map((j) => (
            <div key={j} style={skeletonStyles.field}></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div style={errorStyles.container}>
    <div style={errorStyles.icon}>⚠️</div>
    <h3 style={errorStyles.title}>Error Loading Profile</h3>
    <p style={errorStyles.message}>{message}</p>
    <button style={errorStyles.retryButton} onClick={onRetry}>
      Retry
    </button>
  </div>
);

const EditForm = ({ formData, onChange, onSave, onCancel }) => (
  <div style={editFormStyles.container}>
    <h3 style={editFormStyles.title}>Edit Profile</h3>
    <div style={editFormStyles.form}>
      <div style={editFormStyles.formGroup}>
        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName || ""}
          onChange={onChange}
          style={editFormStyles.input}
        />
      </div>
      <div style={editFormStyles.formGroup}>
        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName || ""}
          onChange={onChange}
          style={editFormStyles.input}
        />
      </div>
      <div style={editFormStyles.formGroup}>
        <label>Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber || ""}
          onChange={onChange}
          style={editFormStyles.input}
        />
      </div>
      <div style={editFormStyles.formGroup}>
        <label>Email</label>
        <input
          type="email"
          name="emailId"
          value={formData.emailId || ""}
          onChange={onChange}
          style={editFormStyles.input}
        />
      </div>
      <div style={editFormStyles.formGroup}>
        <label>Address</label>
        <textarea
          name="address1"
          value={formData.address1 || ""}
          onChange={onChange}
          style={editFormStyles.textarea}
          rows="3"
        />
      </div>
    </div>
    <div style={editFormStyles.buttons}>
      <button style={editFormStyles.saveButton} onClick={onSave}>
        Save Changes
      </button>
      <button style={editFormStyles.cancelButton} onClick={onCancel}>
        Cancel
      </button>
    </div>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div style={styles.section} className="print-section">
    <div style={styles.sectionHeader}>
      {icon && <span style={styles.sectionIcon}>{icon}</span>}
      <h3 style={styles.sectionTitle}>{title}</h3>
    </div>
    <div style={styles.grid}>{children}</div>
  </div>
);

const Field = ({
  label,
  value,
  editing,
  name,
  type = "text",
  options,
  onChange,
  formValue,
  fullWidth = false,
  maskable = false,
}) => (
  <div style={fullWidth ? styles.fullWidthField : styles.field}>
    <label style={styles.label}>{label}:</label>
    {editing ? (
      <div style={styles.editInput}>
        {type === "select" ? (
          <select
            name={name}
            value={formValue || ""}
            onChange={onChange}
            style={styles.select}
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={formValue || ""}
            onChange={onChange}
            style={styles.textarea}
            rows="3"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formValue || ""}
            onChange={onChange}
            style={styles.input}
          />
        )}
      </div>
    ) : (
      <div style={styles.value}>
        {maskable && label.includes("Account") ? `**** **** ${value?.slice(-4) || ""}` : value || "-"}
      </div>
    )}
  </div>
);

// Constants
const TABS = [
  { id: "personal", label: "Personal" },
  { id: "job", label: "Job" },
  { id: "salary", label: "Salary" },
  { id: "bank", label: "Bank" },
  { id: "emergency", label: "Emergency" },
  { id: "statutory", label: "Statutory" },
  { id: "all", label: "View All" },
];

const TAB_ICONS = {
  personal: "👤",
  job: "💼",
  salary: "💰",
  bank: "🏦",
  emergency: "🚨",
  statutory: "📋",
  all: "📊",
};

// Enhanced Styles with photograph loading state
const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  mainTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0",
  },
  profilePictureSection: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginBottom: "40px",
    padding: "25px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    flexWrap: "wrap",
  },
  profilePictureContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  profilePictureWrapper: {
    position: "relative",
    width: "120px",
    height: "120px",
  },
  profilePicture: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #e2e8f0",
    backgroundColor: "#4f46e5",
  },
  photographLoading: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    border: "4px dashed #d1d5db",
    color: "#6b7280",
    fontSize: "14px",
  },
  profileSummary: {
    flex: "1",
  },
  name: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  designation: {
    fontSize: "18px",
    color: "#3b82f6",
    fontWeight: "600",
    margin: "0 0 5px 0",
  },
  department: {
    fontSize: "16px",
    color: "#64748b",
    margin: "0 0 5px 0",
  },
  employeeId: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "10px 0 0 0",
  },
  // Enhanced Tab Container
  tabContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "30px",
    overflowX: "auto",
    padding: "10px 0",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    padding: "15px",
    border: "1px solid #e2e8f0",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "#f1f5f9",
    border: "2px solid transparent",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    color: "#475569",
    minWidth: "120px",
    justifyContent: "center",
    ":hover": {
      backgroundColor: "#e2e8f0",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    },
  },
  activeTab: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#2563eb",
    boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)",
    ":hover": {
      backgroundColor: "#2563eb",
      boxShadow: "0 6px 8px rgba(59, 130, 246, 0.3)",
    },
  },
  tabIcon: {
    fontSize: "16px",
  },
  tabLabel: {
    fontSize: "14px",
    fontWeight: "600",
  },
  sectionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  section: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "25px",
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "15px",
  },
  sectionIcon: {
    fontSize: "20px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "25px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fullWidthField: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "16px",
    color: "#1e293b",
    fontWeight: "500",
    padding: "8px 0",
    minHeight: "40px",
  },
  editInput: {
    marginTop: "4px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "all 0.2s",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
    },
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "80px",
    fontFamily: "inherit",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
};

// Status Style Function (unchanged)
const getStatusStyle = (status) => {
  const base = {
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  switch (status?.toLowerCase()) {
    case "active":
      return { ...base, backgroundColor: "#d1fae5", color: "#065f46" };
    case "inactive":
      return { ...base, backgroundColor: "#fee2e2", color: "#991b1b" };
    case "on leave":
      return { ...base, backgroundColor: "#fef3c7", color: "#92400e" };
    default:
      return { ...base, backgroundColor: "#e5e7eb", color: "#374151" };
  }
};

// Skeleton Styles (unchanged)
const skeletonStyles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },
  title: {
    width: "200px",
    height: "32px",
    backgroundColor: "#e2e8f0",
    borderRadius: "6px",
    animation: "pulse 1.5s infinite",
  },
  actions: {
    width: "300px",
    height: "40px",
    backgroundColor: "#e2e8f0",
    borderRadius: "6px",
    animation: "pulse 1.5s infinite",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginBottom: "40px",
    padding: "25px",
    backgroundColor: "white",
    borderRadius: "12px",
  },
  avatar: {
    width: "120px",
    height: "120px",
    backgroundColor: "#e2e8f0",
    borderRadius: "50%",
    animation: "pulse 1.5s infinite",
  },
  info: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  line: {
    height: "20px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    animation: "pulse 1.5s infinite",
    ":nth-child(1)": { width: "60%" },
    ":nth-child(2)": { width: "40%" },
    ":nth-child(3)": { width: "50%" },
  },
  section: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "25px",
  },
  sectionTitle: {
    width: "150px",
    height: "24px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    marginBottom: "25px",
    animation: "pulse 1.5s infinite",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "25px",
  },
  field: {
    height: "60px",
    backgroundColor: "#e2e8f0",
    borderRadius: "6px",
    animation: "pulse 1.5s infinite",
  },
};

// Error Styles (unchanged)
const errorStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    textAlign: "center",
    padding: "40px",
  },
  icon: {
    fontSize: "48px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#dc2626",
    margin: "0 0 10px 0",
  },
  message: {
    fontSize: "16px",
    color: "#6b7280",
    margin: "0 0 25px 0",
    maxWidth: "400px",
  },
  retryButton: {
    padding: "12px 30px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#2563eb",
    },
  },
};

// Edit Form Styles (unchanged)
const editFormStyles = {
  container: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "1px solid #3b82f6",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 25px 0",
    paddingBottom: "15px",
    borderBottom: "2px solid #f1f5f9",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  input: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "all 0.2s",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
  textarea: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "inherit",
    ":focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
  buttons: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
  },
  saveButton: {
    padding: "12px 30px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#059669",
    },
  },
  cancelButton: {
    padding: "12px 30px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#dc2626",
    },
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @media print {
    .no-print { display: none !important; }
    .print-section { break-inside: avoid; }
    body { background: white !important; }
    .profile-container { max-width: 100% !important; padding: 0 !important; }
    .action-buttons { display: none !important; }
    .tab-container { display: none !important; }
    .upload-button { display: none !important; }
    .edit-input { display: none !important; }
  }
  
  /* Scrollbar styling for tabs */
  .tab-container::-webkit-scrollbar {
    height: 6px;
  }
  
  .tab-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  .tab-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .tab-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;
document.head.appendChild(styleSheet);

export { styles };