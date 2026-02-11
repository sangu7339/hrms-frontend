import api from "./api";
import { useEffect, useState } from "react";
import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
//const api = axios.create({
//  baseURL: "",
//  withCredentials: true,
//});

export default function ReportingManager() {
  const [role, setRole] = useState("");
  const [manager, setManager] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load user profile to determine role
      const profileRes = await api.get("/emp/profile");
      const designation = profileRes.data.designationName;
      setRole(designation);

      // Load My Manager
      try {
        const mgrRes = await api.get("/hr/mgr/emp/my-manager");
        setManager(mgrRes.data);
      } catch (mgrErr) {
        if (mgrErr.response?.status === 400) {
          setManager(null);
        } else {
          console.error("Manager fetch error", mgrErr);
        }
      }

      // Load My Employees
      try {
        const empRes = await api.get("/hr/mgr/mgr/my-employees");
        setEmployees(empRes.data || []);
      } catch (empErr) {
        console.error("Employees fetch error", empErr);
        setEmployees([]);
      }
    } catch (err) {
      setError("Failed to load reporting structure");
      console.error("Profile load error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading reporting structure...</p>
      </div>
    );
  }

  /* ================= ERROR STATE ================= */
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Error Loading Data</h2>
        <p style={styles.errorText}>{error}</p>
        <button 
          style={styles.retryButton}
          onClick={loadAllData}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Reporting Structure</h1>
          <p style={styles.subtitle}>
            View your manager and employees reporting to you
          </p>
        </div>
        <div style={styles.badge}>
          {role === "MANAGER" ? "👔 Manager View" : "👤 Employee View"}
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* ================= LEFT COLUMN: MY MANAGER ================= */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.icon}>👤</span>
            My Manager
          </h2>
          
          {manager ? (
            <div 
              style={styles.managerCard}
              onClick={() => setSelectedPerson({
                id: manager.managerId,
                name: manager.managerName,
                username: manager.managerUsername,
                designation: manager.designation,
                department: manager.department,
              })}
            >
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {manager.managerName?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.cardHeaderInfo}>
                  <h3 style={styles.cardName}>{manager.managerName}</h3>
                  <p style={styles.cardUsername}>@{manager.managerUsername}</p>
                </div>
              </div>
              
              <div style={styles.cardDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Designation</span>
                  <span style={styles.designationBadge}>{manager.designation}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Department</span>
                  <span style={styles.departmentBadge}>{manager.department}</span>
                </div>
              </div>
              
              <div style={styles.clickHint}>
                <small>Click to view details</small>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📋</div>
              <p style={styles.emptyText}>No manager assigned yet</p>
            </div>
          )}
        </section>

        {/* ================= RIGHT COLUMN: MY TEAM ================= */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.icon}>👥</span>
            My Team
            <span style={styles.teamCount}>({employees.length})</span>
          </h2>

          {employees.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👥</div>
              <p style={styles.emptyText}>No employees reporting to you</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Designation</th>
                    <th style={styles.th}>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr 
                      key={e.employeeId} 
                      style={styles.tableRow}
                      onClick={() => setSelectedPerson({
                        id: e.employeeId,
                        name: e.employeeName,
                        username: e.employeeUsername,
                        designation: e.designation,
                        department: e.department,
                      })}
                    >
                      <td style={styles.td}>
                        <div style={styles.employeeCell}>
                          <div style={styles.employeeAvatar}>
                            {e.employeeName?.charAt(0).toUpperCase()}
                          </div>
                          <span style={styles.employeeName}>{e.employeeName}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.username}>@{e.employeeUsername}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.designationBadge}>{e.designation}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.departmentBadge}>{e.department}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ================= DETAIL MODAL ================= */}
      {selectedPerson && (
        <div 
          style={styles.modalOverlay} 
          onClick={() => setSelectedPerson(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalAvatar}>
                {selectedPerson.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={styles.modalTitle}>{selectedPerson.name}</h2>
                <p style={styles.modalSubtitle}>@{selectedPerson.username}</p>
              </div>
              <button 
                style={styles.closeButton}
                onClick={() => setSelectedPerson(null)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.modalDetail}>
                <span style={styles.modalLabel}>Employee ID:</span>
                <span style={styles.modalValue}>{selectedPerson.id}</span>
              </div>
              <div style={styles.modalDetail}>
                <span style={styles.modalLabel}>Designation:</span>
                <span style={styles.designationBadge}>{selectedPerson.designation}</span>
              </div>
              <div style={styles.modalDetail}>
                <span style={styles.modalLabel}>Department:</span>
                <span style={styles.departmentBadge}>{selectedPerson.department}</span>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={styles.modalActionButton}
                onClick={() => setSelectedPerson(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    flexWrap: "wrap",
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    margin: 0,
    fontWeight: 400,
  },
  badge: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "8px 20px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    height: "fit-content",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 40,
    alignItems: "start",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: "#2d3748",
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    fontSize: 24,
  },
  teamCount: {
    fontSize: 18,
    color: "#718096",
    fontWeight: 400,
    marginLeft: 8,
  },
  
  /* ================= MANAGER CARD ================= */
  managerCard: {
    background: "white",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 12px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)",
    },
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: "2px solid #f7fafc",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    flexShrink: 0,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 20,
    fontWeight: 600,
    color: "#2d3748",
    margin: "0 0 4px 0",
    textTransform: "capitalize",
  },
  cardUsername: {
    fontSize: 14,
    color: "#718096",
    margin: 0,
    fontFamily: "monospace",
  },
  cardDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#f7fafc",
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: 500,
  },
  clickHint: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px dashed #e2e8f0",
    textAlign: "center",
    color: "#718096",
    fontSize: 12,
  },

  /* ================= BADGES ================= */
  designationBadge: {
    background: "#e6fffa",
    color: "#047857",
    padding: "4px 12px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    display: "inline-block",
  },
  departmentBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "4px 12px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    display: "inline-block",
  },

  /* ================= TABLE ================= */
  tableContainer: {
    background: "white",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
    maxHeight: "500px",
    overflowY: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    background: "#f7fafc",
    position: "sticky",
    top: 0,
  },
  th: {
    padding: "16px 20px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    color: "#4a5568",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "2px solid #e2e8f0",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    transition: "background-color 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f7fafc",
    },
  },
  td: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#2d3748",
  },
  employeeCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 600,
    flexShrink: 0,
  },
  employeeName: {
    fontWeight: 500,
    color: "#2d3748",
    textTransform: "capitalize",
  },
  username: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#718096",
    background: "#f7fafc",
    padding: "4px 8px",
    borderRadius: 4,
  },

  /* ================= EMPTY STATE ================= */
  emptyState: {
    background: "white",
    borderRadius: 12,
    padding: "60px 40px",
    textAlign: "center",
    border: "2px dashed #e2e8f0",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
    margin: 0,
  },

  /* ================= MODAL ================= */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
    animation: "modalSlideIn 0.3s ease-out",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "24px 24px 16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderBottom: "1px solid #e2e8f0",
    position: "relative",
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#2d3748",
    margin: "0 0 4px 0",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#718096",
    margin: 0,
    fontFamily: "monospace",
  },
  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    fontSize: "28px",
    color: "#718096",
    cursor: "pointer",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      background: "#f7fafc",
    },
  },
  modalContent: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  modalDetail: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
  },
  modalLabel: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: 500,
  },
  modalValue: {
    fontSize: 14,
    color: "#2d3748",
    fontWeight: 600,
    fontFamily: "monospace",
  },
  modalFooter: {
    padding: "16px 24px 24px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "right",
  },
  modalActionButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "10px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 0.9,
    },
  },

  /* ================= LOADING STATE ================= */
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: 20,
  },
  spinner: {
    width: 50,
    height: 50,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: 16,
    color: "#718096",
    fontWeight: 500,
  },

  /* ================= ERROR STATE ================= */
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    textAlign: "center",
    padding: "40px",
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: "#2d3748",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 24,
  },
  retryButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 0.9,
    },
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 900px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 600px) {
    .header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .badge {
      align-self: flex-start;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    .modal {
      width: 90%;
    }
  }
`;
document.head.appendChild(styleSheet);
