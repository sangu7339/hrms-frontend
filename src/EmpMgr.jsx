// import React, { useState } from 'react';
// import axios from 'axios';
// export default function EmpMgr() {
//   const [username, setUsername] = useState('');
//   const [employeeData, setEmployeeData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch employee data by username
//   const fetchEmployeeByUsername = async () => {
//     if (!username.trim()) {
//       setError('Please enter a username');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setEmployeeData(null);

//     try {
//       const response = await axios.get(
//         `/api/hr/search?username=${username.toUpperCase()}`,
//         { withCredentials: true }
//       );
      
//       setEmployeeData(response.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch employee data');
//       setEmployeeData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Clear all data
//   const handleClear = () => {
//     setUsername('');
//     setEmployeeData(null);
//     setError(null);
//   };

//   return (
//     <div className="dashboard-content">
//       {/* WELCOME BANNER */}
//       <div className="welcome-banner">
//         <div className="welcome-text">
//           <h2>Employee Manager Information 👨‍💼</h2>
//           <p>View employee reporting structure and manager details</p>
//         </div>
//         <div className="quick-stats">
//           <div className="stat-card">
//             <div className="stat-icon">👥</div>
//             <div className="stat-info">
//               <div className="stat-label">Total Reports</div>
//               <div className="stat-value">
//                 {employeeData?.reportingEmployees?.length || 0}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* SEARCH SECTION */}
//       <div className="search-section">
//         <div className="section-header">
//           <h3>🔍 Search Employee by Username</h3>
//           <p>Enter employee username to view manager information</p>
//         </div>
        
//         {/* SEARCH FORM */}
//         <div className="search-form">
//           <div className="form-row">
//             <div className="form-group" style={{ gridColumn: 'span 2' }}>
//               <label>Employee Username</label>
//               <input
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder="Enter username (e.g., VPPL027)"
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter') {
//                     fetchEmployeeByUsername();
//                   }
//                 }}
//               />
//             </div>
//           </div>

//           <div className="form-actions">
//             <button
//               className="btn btn-primary"
//               onClick={fetchEmployeeByUsername}
//               disabled={loading || !username.trim()}
//             >
//               {loading ? "Searching..." : "🔍 Search Employee"}
//             </button>
//             <button
//               className="btn btn-secondary"
//               onClick={handleClear}
//             >
//               Clear
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ERROR MESSAGE */}
//       {error && (
//         <div className="alert-message" style={{
//           backgroundColor: '#fee',
//           color: '#c33',
//           padding: '16px',
//           borderRadius: '8px',
//           marginBottom: '20px',
//           border: '1px solid #fcc'
//         }}>
//           <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Error:</div>
//           <div>{error}</div>
//         </div>
//       )}

//       {/* EMPLOYEE DETAILS */}
//       {employeeData && (
//         <div className="employee-details-section">
//           <div className="section-header">
//             <div>
//               <h3>Employee Manager Details</h3>
//               <p>{employeeData.employeeName} ({employeeData.employeeUsername})</p>
//             </div>
//             <div className="header-actions">
//               <span className="employee-id">Employee ID: {employeeData.employeeId}</span>
//             </div>
//           </div>

//           <div className="details-grid">
//             {/* EMPLOYEE INFORMATION */}
//             <div className="detail-card">
//               <h4>👤 Employee Information</h4>
//               <div className="detail-content">
//                 <div className="detail-item">
//                   <span className="detail-label">Employee ID</span>
//                   <span className="detail-value">{employeeData.employeeId}</span>
//                 </div>
//                 <div className="detail-item">
//                   <span className="detail-label">Username</span>
//                   <span className="detail-value">
//                     <span className="username-badge">{employeeData.employeeUsername}</span>
//                   </span>
//                 </div>
//                 <div className="detail-item">
//                   <span className="detail-label">Full Name</span>
//                   <span className="detail-value">{employeeData.employeeName}</span>
//                 </div>
//                 <div className="detail-item">
//                   <span className="detail-label">Department</span>
//                   <span className="detail-value">{employeeData.employeeDepartment}</span>
//                 </div>
//                 <div className="detail-item">
//                   <span className="detail-label">Designation</span>
//                   <span className="detail-value">{employeeData.employeeDesignation}</span>
//                 </div>
//               </div>
//             </div>

//             {/* CURRENT MANAGER */}
//             <div className="detail-card">
//               <h4>👨‍💼 Reporting Manager</h4>
//               <div className="detail-content">
//                 <div className="detail-item">
//                   <span className="detail-label">Manager ID</span>
//                   <span className="detail-value">{employeeData.managerId}</span>
//                 </div>
//                 <div className="detail-item">
//                   <span className="detail-label">Username</span>
//                   <span className="detail-value">
//                     <span className="username-badge">{employeeData.managerUsername}</span>
//                   </span>
//                 </div>
//                 <div className="detail-item">
//                   <span className="detail-label">Full Name</span>
//                   <span className="detail-value">{employeeData.managerName}</span>
//                 </div>
//                 <div className="detail-item">
//                   <span className="detail-label">Department</span>
//                   <span className="detail-value">{employeeData.managerDepartment}</span>
//                 </div>
//                 <div className="detail-item">
//                   <span className="detail-label">Designation</span>
//                   <span className="detail-value">{employeeData.managerDesignation}</span>
//                 </div>
//               </div>
//             </div>

//             {/* REPORTING EMPLOYEES */}
//             {employeeData.reportingEmployees && employeeData.reportingEmployees.length > 0 && (
//               <div className="detail-card full-width">
//                 <h4>📋 Direct Reports ({employeeData.reportingEmployees.length})</h4>
//                 <p style={{ color: 'var(--gray-600)', marginBottom: '15px', fontSize: '14px' }}>
//                   Employees who report directly to {employeeData.employeeName}
//                 </p>
//                 <div className="results-table-container">
//                   <table className="results-table">
//                     <thead>
//                       <tr>
//                         <th>Employee ID</th>
//                         <th>Username</th>
//                         <th>Name</th>
//                         <th>Department</th>
//                         <th>Designation</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {employeeData.reportingEmployees.map((emp, index) => (
//                         <tr key={index}>
//                           <td>{emp.employeeId}</td>
//                           <td>
//                             <span className="username-badge">{emp.username}</span>
//                           </td>
//                           <td className="employee-name">{emp.name}</td>
//                           <td>{emp.department}</td>
//                           <td>{emp.designation}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* NO REPORTING EMPLOYEES MESSAGE */}
//             {employeeData.reportingEmployees && employeeData.reportingEmployees.length === 0 && (
//               <div className="detail-card full-width">
//                 <h4>📋 Direct Reports</h4>
//                 <div style={{ 
//                   textAlign: 'center', 
//                   padding: '30px',
//                   color: 'var(--gray-500)'
//                 }}>
//                   <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
//                   <h5 style={{ marginBottom: '10px' }}>No Direct Reports</h5>
//                   <p>{employeeData.employeeName} has no employees reporting directly.</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmpMgr() {
  const [username, setUsername] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch employee data by username
  const fetchEmployeeByUsername = async (searchUsername = username) => {
    const usernameToSearch = searchUsername.trim().toUpperCase();
    if (!usernameToSearch) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);
    setEmployeeData(null);

    try {
      // 👇 Updated endpoint to match your API
      const response = await axios.get(
        `http://localhost:8080/api/hr/mgr/search-by-username?username=${usernameToSearch}`,
        { withCredentials: true }
      );
      setEmployeeData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee data');
      setEmployeeData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load default employee on component mount
  useEffect(() => {
    const defaultUsername = 'VPPL002'; // Change if needed
    setUsername(defaultUsername);
    fetchEmployeeByUsername(defaultUsername);
  }, []);

  // Clear all data
  const handleClear = () => {
    setUsername('');
    setEmployeeData(null);
    setError(null);
  };

  return (
    <div className="dashboard-content">
      {/* WELCOME BANNER */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Employee Manager Information 👨‍💼</h2>
          <p>View employee reporting structure and manager details</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-label">Total Reports</div>
              <div className="stat-value">
                {employeeData?.reportingEmployees?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="search-section">
        <div className="section-header">
          <h3>🔍 Search Employee by Username</h3>
          <p>Enter employee username to view manager information</p>
        </div>

        <div className="search-form">
          <div className="form-row">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Employee Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g., VPPL027)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    fetchEmployeeByUsername();
                  }
                }}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={() => fetchEmployeeByUsername()}
              disabled={loading || !username.trim()}
            >
              {loading ? 'Searching...' : '🔍 Search Employee'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="alert-message error">
          <div className="alert-title">Error:</div>
          <div>{error}</div>
        </div>
      )}

      {/* LOADING INDICATOR */}
      {loading && (
        <div className="loading-skeleton">
          <div className="spinner">⏳</div>
          <p>Loading employee data...</p>
        </div>
      )}

      {/* PLACEHOLDER WHEN NO DATA */}
      {!loading && !employeeData && !error && (
        <div className="placeholder-message">
          <div className="placeholder-icon">👤</div>
          <h3>No Employee Selected</h3>
          <p>Enter a username above and click Search to view employee details.</p>
        </div>
      )}

      {/* EMPLOYEE DETAILS */}
      {!loading && employeeData && (
        <div className="employee-details-section">
          <div className="section-header">
            <div>
              <h3>Employee Manager Details</h3>
              <p>
                {employeeData.employeeName} ({employeeData.employeeUsername})
              </p>
            </div>
            <div className="header-actions">
              <span className="employee-id">Employee ID: {employeeData.employeeId}</span>
            </div>
          </div>

          <div className="details-grid">
            {/* EMPLOYEE INFORMATION CARD */}
            <div className="detail-card">
              <h4>👤 Employee Information</h4>
              <div className="detail-content">
                <div className="detail-item">
                  <span className="detail-label">Employee ID</span>
                  <span className="detail-value">{employeeData.employeeId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Username</span>
                  <span className="detail-value">
                    <span className="username-badge">{employeeData.employeeUsername}</span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{employeeData.employeeName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{employeeData.employeeDepartment}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Designation</span>
                  <span className="detail-value">{employeeData.employeeDesignation}</span>
                </div>
              </div>
            </div>

            {/* MANAGER INFORMATION CARD */}
            <div className="detail-card">
              <h4>👨‍💼 Reporting Manager</h4>
              <div className="detail-content">
                <div className="detail-item">
                  <span className="detail-label">Manager ID</span>
                  <span className="detail-value">{employeeData.managerId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Username</span>
                  <span className="detail-value">
                    <span className="username-badge">{employeeData.managerUsername}</span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{employeeData.managerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{employeeData.managerDepartment}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Designation</span>
                  <span className="detail-value">{employeeData.managerDesignation}</span>
                </div>
              </div>
            </div>

            {/* REPORTING EMPLOYEES */}
            <div className="detail-card full-width">
              <h4>
                📋 Direct Reports ({employeeData.reportingEmployees?.length || 0})
              </h4>
              {employeeData.reportingEmployees?.length > 0 ? (
                <>
                  <p className="table-caption">
                    Employees who report directly to {employeeData.employeeName}
                  </p>
                  <div className="table-responsive">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Employee ID</th>
                          <th>Username</th>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Designation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeData.reportingEmployees.map((emp, index) => (
                          <tr key={index}>
                            <td>{emp.employeeId}</td>
                            <td>
                              <span className="username-badge">{emp.username}</span>
                            </td>
                            <td className="employee-name">{emp.name}</td>
                            <td>{emp.department}</td>
                            <td>{emp.designation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h5>No Direct Reports</h5>
                  <p>{employeeData.employeeName} has no employees reporting directly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}