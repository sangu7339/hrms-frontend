// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Search, Download, Calendar, User, DollarSign, RefreshCw, Filter, X, Edit, Save, Trash2, Eye } from "lucide-react";
// import "./HrSalaryManagement.css"; // Import the CSS file

// export default function HrSalaryManagement() {
//   const [form, setForm] = useState({
//     totalDay: "",
//     actualDay: "",
//     month: "",
//     year: "",
//   });
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [searchUsername, setSearchUsername] = useState("");
//   const [filteredResults, setFilteredResults] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({});
//   const [viewDetails, setViewDetails] = useState(null);
//   const months = [
//     { value: 1, label: "January" },
//     { value: 2, label: "February" },
//     { value: 3, label: "March" },
//     { value: 4, label: "April" },
//     { value: 5, label: "May" },
//     { value: 6, label: "June" },
//     { value: 7, label: "July" },
//     { value: 8, label: "August" },
//     { value: 9, label: "September" },
//     { value: 10, label: "October" },
//     { value: 11, label: "November" },
//     { value: 12, label: "December" },
//   ];
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);
  
//   useEffect(() => {
//     if (form.month && form.year) {
//       const days = new Date(form.year, form.month, 0).getDate();
//       setForm((prev) => ({
//         ...prev,
//         totalDay: days,
//         actualDay: days,
//       }));
//     }
//   }, [form.month, form.year]);

//   // Filter results when searchUsername changes
//   useEffect(() => {
//     if (result && searchUsername) {
//       const filtered = result.filter(item => {
//         if (!item) return false;
//         const employeeName = item.employeeName || "";
//         const searchTerm = searchUsername.toLowerCase().trim();
//         return employeeName.toLowerCase().includes(searchTerm);
//       });
//       setFilteredResults(filtered);
//     } else {
//       setFilteredResults(result);
//     }
//   }, [searchUsername, result]);
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "actualDay" && value > form.totalDay) return;
//     setForm({ ...form, [name]: value });
//   };
  
//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "actualDay" && value > editForm.totalDay) return;
//     setEditForm(prev => ({ ...prev, [name]: value }));
//   };
  
//   const handleSearchUsernameChange = (e) => {
//     setSearchUsername(e.target.value);
//   };
  
//   const clearUsernameFilter = () => {
//     setSearchUsername("");
//     setFilteredResults(result);
//   };
  
//   const showError = (err) => {
//     if (err?.response?.data) {
//       const d = err.response.data;
//       alert(typeof d === "string" ? d : d.message || JSON.stringify(d));
//     } else {
//       alert("Server error");
//     }
//   };
  
//   /* GENERATE SALARY FOR ALL EMPLOYEES - FIXED TO MATCH API DOC */
//   const submitSalary = async () => {
//     if (!form.month || !form.year) return alert("Select month & year");
//     setLoading(true);
//     try {
//       await axios.post(
//         `/api//salary/hr/month/all`,
//         {
//           totalDay: Number(form.totalDay),
//           month: Number(form.month),
//           year: Number(form.year),
//         },
//         { withCredentials: true }
//       );
//       alert("Salaries generated successfully for all employees ✅");
//       setForm({
//         totalDay: "",
//         actualDay: "",
//         month: "",
//         year: "",
//       });
//       // Clear the search results after generation
//       setResult(null);
//       setFilteredResults(null);
//     } catch (err) {
//       showError(err);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   /* SEARCH SALARY */
//   const fetchSalary = async () => {
//     if (!form.month || !form.year) return alert("Select month & year");
    
//     setSearchLoading(true);
//     try {
//       const params = new URLSearchParams({
//         month: form.month,
//         year: form.year,
//       });
      
//       const res = await axios.get(
//         `/api/salary/hr/month?${params.toString()}`,
//         { withCredentials: true }
//       );
//       setResult(res.data || []);
//       setFilteredResults(res.data || []);
//       setEditingId(null);
//       setViewDetails(null);
//     } catch (err) {
//       showError(err);
//       setResult([]);
//       setFilteredResults([]);
//     } finally {
//       setSearchLoading(false);
//     }
//   };
  
//   /* EDIT SALARY */
//   const handleEdit = (record) => {
//     setEditingId(record.salaryId);
//     setEditForm({
//       userId: record.userId || "",
//       month: record.month || form.month,
//       year: record.year || form.year,
//       totalDay: record.totalDay || "",
//       actualDay: record.actualDay || "",
//       salaryId: record.salaryId
//     });
//   };
  
//   const handleSaveEdit = async () => {
//     if (!editForm.actualDay) return alert("Enter present days");
//     if (!editForm.totalDay) return alert("Total days is required");
//     try {
//       await axios.put(
//         `/api/salary/edit/${editForm.salaryId}`,
//         {
//           userId: Number(editForm.userId),
//           month: Number(editForm.month),
//           year: Number(editForm.year),
//           totalDay: Number(editForm.totalDay),
//           actualDay: Number(editForm.actualDay)
//         },
//         { withCredentials: true }
//       );
//       alert("Salary updated successfully ✅");
//       setEditingId(null);
//       setEditForm({});
//       fetchSalary(); // Refresh the search results after edit
//     } catch (err) {
//       showError(err);
//     }
//   };
  
//   const handleCancelEdit = () => {
//     setEditingId(null);
//     setEditForm({});
//   };
  
//   /* VIEW SALARY DETAILS */
//   const handleViewDetails = (record) => {
//     setViewDetails(record);
//   };
  
//   const closeViewDetails = () => {
//     setViewDetails(null);
//   };
  
//   /* SEARCH ALL EMPLOYEES */
//   const fetchAllSalary = async () => {
//     if (!form.month || !form.year) return alert("Select month & year");
    
//     setSearchLoading(true);
//     try {
//       const res = await axios.get(
//         `/api/salary/hr/month?month=${form.month}&year=${form.year}`,
//         { withCredentials: true }
//       );
//       setResult(res.data || []);
//       setFilteredResults(res.data || []);
//       setSearchUsername("");
//       setEditingId(null);
//       setViewDetails(null);
//     } catch (err) {
//       showError(err);
//       setResult([]);
//       setFilteredResults([]);
//     } finally {
//       setSearchLoading(false);
//     }
//   };
  
//   /* EXPORT TO CSV */
//   const exportToCSV = () => {
//     const dataToExport = filteredResults || result || [];
//     if (!dataToExport || dataToExport.length === 0) return;
    
//     const headers = ["Employee Name", "Total Days", "Present Days", "Gross Salary", "LOP", "Net Salary"];
//     const csvContent = [
//       headers.join(","),
//       ...dataToExport.map(item => {
//         if (!item) return "";
//         const netSalary = (item.grossSalary || 0) - (item.lop || 0);
//         return [
//           `"${item.employeeName || ""}"`,
//           item.totalDay || 0,
//           item.actualDay || 0,
//           item.grossSalary || 0,
//           item.lop || 0,
//           netSalary
//         ].join(",");
//       })
//     ].join("\n");
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     const filename = searchUsername
//       ? `salary-report-${searchUsername}-${form.month}-${form.year}.csv`
//       : `salary-report-all-${form.month}-${form.year}.csv`;
//     a.download = filename;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };
  
//   const calculateAttendancePercentage = (total, present) => {
//     if (!total || total === 0) return 0;
//     return Math.round(((present || 0) / total) * 100);
//   };
  
//   const displayResults = filteredResults || result || [];
//   const hasSearchFilter = searchUsername.trim() !== "";
  
//   return (
//     <div className="salary-management-container">
//       <div className="salary-header">
//         <div>
//           <h1 className="salary-title">Salary Management</h1>
//           <p className="salary-subtitle">Generate, edit and manage employee salaries</p>
//         </div>
//         <div className="header-stats">
//           {displayResults.length > 0 && (
//             <div className="stats-card">
//               <Calendar size={20} />
//               <div>
//                 <span className="stats-value">
//                   {displayResults.length}
//                 </span>
//                 <span className="stats-label">
//                   {hasSearchFilter ? "Filtered Records" : "Total Records"}
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="salary-content">
//         {/* GENERATE SALARY CARD */}
//         <div className="salary-card">
//           <div className="card-header">
//             <div className="card-title">
//               <DollarSign size={20} />
//               <span>Generate Monthly Salary for All Employees</span>
//             </div>
//             <div className="card-subtitle">
//               Create salary records for all employees
//             </div>
//           </div>
//           <div className="form-grid">
//             <div className="form-group">
//               <label className="form-label">Month</label>
//               <div className="select-wrapper">
//                 <select
//                   className="form-select"
//                   name="month"
//                   value={form.month}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Month</option>
//                   {months.map((m) => (
//                     <option key={m.value} value={m.value}>
//                       {m.label}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="select-icon">▼</div>
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="form-label">Year</label>
//               <div className="select-wrapper">
//                 <select
//                   className="form-select"
//                   name="year"
//                   value={form.year}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Year</option>
//                   {years.map((y) => (
//                     <option key={y} value={y}>
//                       {y}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="select-icon">▼</div>
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="form-label">
//                 Total Working Days
//               </label>
//               <div className="input-wrapper">
//                 <input
//                   className="form-input"
//                   type="number"
//                   name="totalDay"
//                   value={form.totalDay}
//                   onChange={handleChange}
//                   placeholder="Auto-calculated"
//                   readOnly
//                 />
//                 <div className="input-suffix">days</div>
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="form-label">
//                 Default Present Days
//               </label>
//               <div className="input-wrapper">
//                 <input
//                   className="form-input"
//                   type="number"
//                   name="actualDay"
//                   value={form.actualDay}
//                   onChange={handleChange}
//                   min="0"
//                   max={form.totalDay}
//                   placeholder="Default equals total days"
//                 />
//                 <div className="input-suffix">days</div>
//               </div>
//               {form.totalDay && form.actualDay && (
//                 <div className="percentage-badge">
//                   {calculateAttendancePercentage(form.totalDay, form.actualDay)}% attendance
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="card-footer">
//             <button
//               className={`primary-button ${loading ? 'button-loading' : ''}`}
//               onClick={submitSalary}
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <RefreshCw size={16} className="spinner" />
//                   Generating...
//                 </>
//               ) : (
//                 <>
//                   <DollarSign size={16} />
//                   Generate Salaries for All
//                 </>
//               )}
//             </button>
//             <div className="note-text">
//               Note: Present days are defaults only. Actual days per employee can be edited individually.
//             </div>
//           </div>
//         </div>
//         {/* SEARCH SALARY CARD */}
//         <div className="salary-card">
//           <div className="card-header">
//             <div className="card-title">
//               <Search size={20} />
//               <span>Search Salary Records</span>
//             </div>
//             <div className="card-subtitle">
//               View salary records by month and year
//             </div>
//           </div>
//           <div className="form-grid">
//             <div className="form-group">
//               <label className="form-label">Month</label>
//               <div className="select-wrapper">
//                 <select
//                   className="form-select"
//                   name="month"
//                   value={form.month}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Month</option>
//                   {months.map((m) => (
//                     <option key={m.value} value={m.value}>
//                       {m.label}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="select-icon">▼</div>
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="form-label">Year</label>
//               <div className="select-wrapper">
//                 <select
//                   className="form-select"
//                   name="year"
//                   value={form.year}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Year</option>
//                   {years.map((y) => (
//                     <option key={y} value={y}>
//                       {y}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="select-icon">▼</div>
//               </div>
//             </div>
//             <div className="form-group">
//               <div className="filter-header">
//                 <label className="form-label">
//                   <Filter size={14} />
//                   Filter by Employee Name (Optional)
//                 </label>
//                 {searchUsername && (
//                   <button
//                     className="clear-filter-button"
//                     onClick={clearUsernameFilter}
//                     title="Clear filter"
//                   >
//                     <X size={12} />
//                   </button>
//                 )}
//               </div>
//               <div className="input-wrapper">
//                 <input
//                   className="form-input"
//                   value={searchUsername}
//                   onChange={handleSearchUsernameChange}
//                   placeholder="Enter employee name..."
//                 />
//                 {searchUsername && (
//                   <div className="active-filter-badge">
//                     <Filter size={12} />
//                   </div>
//                 )}
//               </div>
//               {searchUsername && (
//                 <div className="filter-info">
//                   Filtering for: <strong>{searchUsername}</strong>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="search-buttons">
//             <button
//               className={`secondary-button ${searchLoading ? 'button-loading' : ''}`}
//               onClick={fetchAllSalary}
//               disabled={searchLoading}
//             >
//               {searchLoading ? (
//                 <>
//                   <RefreshCw size={16} className="spinner" />
//                   Loading...
//                 </>
//               ) : (
//                 <>
//                   <Search size={16} />
//                   View All Employees
//                 </>
//               )}
//             </button>
            
//             {searchUsername && (
//               <button
//                 className={`tertiary-button ${searchLoading ? 'button-loading' : ''}`}
//                 onClick={fetchSalary}
//                 disabled={searchLoading || !searchUsername.trim()}
//               >
//                 {searchLoading ? (
//                   <>
//                     <RefreshCw size={16} className="spinner" />
//                     Searching...
//                   </>
//                 ) : (
//                   <>
//                     <User size={16} />
//                     Search Specific Employee
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//         {/* RESULTS SECTION - Only shown when explicitly searched */}
//         {displayResults.length > 0 && result !== null && (
//           <div className="salary-card">
//             <div className="results-header">
//               <div>
//                 <h3 className="results-title">
//                   Salary Records for {months.find(m => m.value == form.month)?.label} {form.year}
//                   {hasSearchFilter && (
//                     <span className="filter-indicator">
//                       <Filter size={14} />
//                       Filtered by: "{searchUsername}"
//                       <button
//                         className="clear-filter-button-small"
//                         onClick={clearUsernameFilter}
//                         title="Clear filter"
//                       >
//                         <X size={12} />
//                       </button>
//                     </span>
//                   )}
//                 </h3>
//                 <p className="results-subtitle">
//                   Showing {displayResults.length} employee{displayResults.length !== 1 ? 's' : ''}
//                   {hasSearchFilter && result && ` (filtered from ${result.length} total)`}
//                 </p>
//               </div>
//               <div className="results-header-actions">
//                 {hasSearchFilter && result && result.length > displayResults.length && (
//                   <button
//                     className="show-all-button"
//                     onClick={fetchAllSalary}
//                   >
//                     Show All {result.length} Employees
//                   </button>
//                 )}
//                 <button className="export-button" onClick={exportToCSV}>
//                   <Download size={16} />
//                   Export CSV
//                 </button>
//               </div>
//             </div>
//             <div className="table-container">
//               <table className="salary-table">
//                 <thead>
//                   <tr>
//                     <th className="table-header">Employee</th>
//                     <th className="table-header">Total Days</th>
//                     <th className="table-header">Present Days</th>
//                     <th className="table-header">Gross Salary</th>
//                     <th className="table-header">LOP Deduction</th>
//                     <th className="table-header">Net Salary</th>
//                     <th className="table-header">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {displayResults.map((r, index) => {
//                     if (!r) return null;
//                     const netSalary = (r.grossSalary || 0) - (r.lop || 0);
                    
//                     const isEditing = editingId === r.salaryId;
//                     const rowClass = isEditing ? 'edit-row' : (index % 2 === 0 ? 'even-row' : 'odd-row');
                    
//                     return (
//                       <React.Fragment key={r.salaryId || index}>
//                         <tr className={rowClass}>
//                           <td className="table-cell">
//                             <div className="employee-cell">
//                               <div className="employee-avatar">
//                                 {r.employeeName?.charAt(0) || 'U'}
//                               </div>
//                               <div>
//                                 <div className="employee-name">{r.employeeName || 'Unknown'}</div>
//                               </div>
//                             </div>
//                           </td>
                          
//                           {isEditing ? (
//                             <td colSpan="6" className="table-cell">
//                               <div className="edit-form">
//                                 <div className="edit-form-grid">
//                                   <div className="form-group">
//                                     <label className="form-label">Total Days</label>
//                                     <input
//                                       type="number"
//                                       className="form-input"
//                                       name="totalDay"
//                                       value={editForm.totalDay || ''}
//                                       onChange={handleEditChange}
//                                       min="1"
//                                       max="31"
//                                     />
//                                   </div>
//                                   <div className="form-group">
//                                     <label className="form-label">Present Days</label>
//                                     <input
//                                       type="number"
//                                       className="form-input"
//                                       name="actualDay"
//                                       value={editForm.actualDay || ''}
//                                       onChange={handleEditChange}
//                                       min="0"
//                                       max={editForm.totalDay || 31}
//                                     />
//                                   </div>
//                                   <div className="form-group">
//                                     <label className="form-label">Month</label>
//                                     <div className="select-wrapper">
//                                       <select
//                                         className="form-select"
//                                         name="month"
//                                         value={editForm.month || ''}
//                                         onChange={handleEditChange}
//                                       >
//                                         {months.map((m) => (
//                                           <option key={m.value} value={m.value}>
//                                             {m.label}
//                                           </option>
//                                         ))}
//                                       </select>
//                                     </div>
//                                   </div>
//                                   <div className="form-group">
//                                     <label className="form-label">Year</label>
//                                     <input
//                                       type="number"
//                                       className="form-input"
//                                       name="year"
//                                       value={editForm.year || ''}
//                                       onChange={handleEditChange}
//                                     />
//                                   </div>
//                                 </div>
//                                 <div className="edit-form-actions">
//                                   <button className="save-button" onClick={handleSaveEdit}>
//                                     <Save size={14} />
//                                     Save Changes
//                                   </button>
//                                   <button className="cancel-button" onClick={handleCancelEdit}>
//                                     <X size={14} />
//                                     Cancel
//                                   </button>
//                                 </div>
//                               </div>
//                             </td>
//                           ) : (
//                             <>
//                               <td className="table-cell">
//                                 <div className="number-cell">{r.totalDay || 0}</div>
//                               </td>
//                               <td className="table-cell">
//                                 <div className="number-cell">{r.actualDay || 0}</div>
//                               </td>
//                               <td className="table-cell">
//                                 <div className="amount-cell">
//                                   <span className="currency">₹</span>
//                                   {(r.grossSalary || 0).toLocaleString('en-IN')}
//                                 </div>
//                               </td>
//                               <td className="table-cell">
//                                 <div style={{color: '#ef4444'}} className="amount-cell">
//                                   -₹{(r.lop || 0).toLocaleString('en-IN')}
//                                 </div>
//                               </td>
//                               <td className="table-cell">
//                                 <div className="net-salary-cell">
//                                   <span className="currency">₹</span>
//                                   {netSalary.toLocaleString('en-IN')}
//                                 </div>
//                               </td>
//                               <td className="table-cell">
//                                 <div className="action-buttons">
//                                   <button className="view-button" onClick={() => handleViewDetails(r)}>
//                                     <Eye size={14} />
//                                   </button>
//                                   <button className="edit-button" onClick={() => handleEdit(r)}>
//                                     <Edit size={14} />
//                                   </button>
//                                 </div>
//                               </td>
//                             </>
//                           )}
//                         </tr>
//                       </React.Fragment>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//             <div className="table-footer">
//               <div className="summary">
//                 <div className="summary-item">
//                   <span className="summary-label">Records:</span>
//                   <span className="summary-value">
//                     {displayResults.length} {hasSearchFilter ? 'filtered' : 'total'}
//                   </span>
//                 </div>
//                 <div className="summary-item">
//                   <span className="summary-label">Total LOP:</span>
//                   <span style={{color: '#ef4444'}} className="summary-value">
//                     ₹{displayResults.reduce((sum, r) => sum + (r?.lop || 0), 0).toLocaleString('en-IN')}
//                   </span>
//                 </div>
//                 <div className="summary-item">
//                   <span className="summary-label">Total Payroll:</span>
//                   <span style={{color: '#10b981'}} className="summary-value">
//                     ₹{displayResults.reduce((sum, r) => sum + ((r?.grossSalary || 0) - (r?.lop || 0)), 0).toLocaleString('en-IN')}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//         {/* VIEW DETAILS MODAL */}
//         {viewDetails && (
//           <div className="modal-overlay" onClick={closeViewDetails}>
//             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h2 className="modal-title">Salary Details</h2>
//                 <button className="modal-close" onClick={closeViewDetails}>
//                   ×
//                 </button>
//               </div>
//               <div className="detail-grid">
//                 <div className="detail-item">
//                   <div className="detail-label">Employee Name</div>
//                   <div className="detail-value">{viewDetails.employeeName || 'Unknown'}</div>
//                 </div>
//                 <div className="detail-item">
//                   <div className="detail-label">Month</div>
//                   <div className="detail-value">{months.find(m => m.value == viewDetails.month)?.label || viewDetails.month}</div>
//                 </div>
//                 <div className="detail-item">
//                   <div className="detail-label">Year</div>
//                   <div className="detail-value">{viewDetails.year}</div>
//                 </div>
//                 <div className="detail-item">
//                   <div className="detail-label">Total Days</div>
//                   <div className="detail-value">{viewDetails.totalDay || 0}</div>
//                 </div>
//                 <div className="detail-item">
//                   <div className="detail-label">Present Days</div>
//                   <div className="detail-value">{viewDetails.actualDay || 0}</div>
//                 </div>
//                 <div className="detail-item">
//                   <div className="detail-label">Gross Salary</div>
//                   <div className="detail-value">₹ {(viewDetails.grossSalary || 0).toLocaleString('en-IN')}</div>
//                 </div>
//                 <div className="detail-item">
//                   <div className="detail-label">LOP Deduction</div>
//                   <div style={{color: '#ef4444'}} className="detail-value">
//                     -₹ {(viewDetails.lop || 0).toLocaleString('en-IN')}
//                   </div>
//                 </div>
//                 <div className="detail-item">
//                   <div className="detail-label">Net Salary</div>
//                   <div style={{color: '#10b981'}} className="detail-value">
//                     ₹ {((viewDetails.grossSalary || 0) - (viewDetails.lop || 0)).toLocaleString('en-IN')}
//                   </div>
//                 </div>
//                 <div className="detail-item">
//                   <div className="detail-label">Salary ID</div>
//                   <div className="detail-value">{viewDetails.salaryId}</div>
//                 </div>
//                 <div className="detail-item">
//                   <div className="detail-label">User ID</div>
//                   <div className="detail-value">{viewDetails.userId}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//         {/* EMPTY STATES */}
//         {displayResults.length === 0 && result !== null && (
//           <div className="empty-state">
//             <Search size={48} className="empty-icon" />
//             <h3 className="empty-title">
//               {hasSearchFilter
//                 ? `No records found for "${searchUsername}"`
//                 : "No records found"}
//             </h3>
//             <p className="empty-text">
//               {hasSearchFilter
//                 ? "Try searching with a different name or view all employees."
//                 : "No salary records found for the selected month and year."}
//             </p>
//             {hasSearchFilter && (
//               <button
//                 className="clear-filter-button-large"
//                 onClick={clearUsernameFilter}
//               >
//                 <X size={16} />
//                 Clear Filter
//               </button>
//             )}
//           </div>
//         )}
//         {/* NO RESULTS STATE - Only show when not searched yet */}
//         {result === null && (
//           <div className="empty-state">
//             <Search size={48} className="empty-icon" />
//             <h3 className="empty-title">Search Salary Records</h3>
//             <p className="empty-text">
//               Select a month and year above and click "View All Employees" to see salary records.
//               You can optionally filter by employee name.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Download, Calendar, User, DollarSign, RefreshCw, Filter, X, Edit, Save, Trash2, Eye } from "lucide-react";
import "./HrSalaryManagement.css"; // Import the CSS file
export default function HrSalaryManagement() {
  const [form, setForm] = useState({
    totalDay: "",
    actualDay: "",
    month: "",
    year: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [filteredResults, setFilteredResults] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewDetails, setViewDetails] = useState(null);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);
  
  useEffect(() => {
    if (form.month && form.year) {
      const days = new Date(form.year, form.month, 0).getDate();
      setForm((prev) => ({
        ...prev,
        totalDay: days,
        actualDay: days,
      }));
    }
  }, [form.month, form.year]);

  // Filter results when searchUsername changes
  useEffect(() => {
    if (result && searchUsername) {
      const filtered = result.filter(item => {
        if (!item) return false;
        const employeeName = item.employeeName || "";
        const searchTerm = searchUsername.toLowerCase().trim();
        return employeeName.toLowerCase().includes(searchTerm);
      });
      setFilteredResults(filtered);
    } else {
      setFilteredResults(result);
    }
  }, [searchUsername, result]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "actualDay" && value > form.totalDay) return;
    setForm({ ...form, [name]: value });
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "actualDay" && value > editForm.totalDay) return;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearchUsernameChange = (e) => {
    setSearchUsername(e.target.value);
  };
  
  const clearUsernameFilter = () => {
    setSearchUsername("");
    setFilteredResults(result);
  };
  
  const showError = (err) => {
    if (err?.response?.data) {
      const d = err.response.data;
      alert(typeof d === "string" ? d : d.message || JSON.stringify(d));
    } else {
      alert("Server error");
    }
  };
  
  /* GENERATE SALARY FOR ALL EMPLOYEES - FIXED TO MATCH API DOC */
  const submitSalary = async () => {
    if (!form.month || !form.year) return alert("Select month & year");
    setLoading(true);
    try {
      await axios.post(
        `/api/salary/hr/month/all`,
        {
          totalDay: Number(form.totalDay),
          month: Number(form.month),
          year: Number(form.year),
        },
        { withCredentials: true }
      );
      alert("Salaries generated successfully for all employees ✅");
      setForm({
        totalDay: "",
        actualDay: "",
        month: "",
        year: "",
      });
      if (form.month && form.year) {
        fetchSalary();
      }
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };
  
  /* SEARCH SALARY */
  const fetchSalary = async () => {
    if (!form.month || !form.year) return alert("Select month & year");
    
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        month: form.month,
        year: form.year,
      });
      
      const res = await axios.get(
        `/api/salary/hr/month?${params.toString()}`,
        { withCredentials: true }
      );
      setResult(res.data || []);
      setFilteredResults(res.data || []);
      setEditingId(null);
      setViewDetails(null);
    } catch (err) {
      showError(err);
      setResult([]);
      setFilteredResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  /* EDIT SALARY */
  const handleEdit = (record) => {
    setEditingId(record.salaryId);
    setEditForm({
      userId: record.userId || "",
      month: record.month || form.month,
      year: record.year || form.year,
      totalDay: record.totalDay || "",
      actualDay: record.actualDay || "",
      salaryId: record.salaryId
    });
  };
  
  const handleSaveEdit = async () => {
    if (!editForm.actualDay) return alert("Enter present days");
    if (!editForm.totalDay) return alert("Total days is required");
    try {
      await axios.put(
        `/api/salary/edit/${editForm.salaryId}`,
        {
          userId: Number(editForm.userId),
          month: Number(editForm.month),
          year: Number(editForm.year),
          totalDay: Number(editForm.totalDay),
          actualDay: Number(editForm.actualDay)
        },
        { withCredentials: true }
      );
      alert("Salary updated successfully ✅");
      setEditingId(null);
      setEditForm({});
      fetchSalary();
    } catch (err) {
      showError(err);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };
  
  /* VIEW SALARY DETAILS */
  const handleViewDetails = (record) => {
    setViewDetails(record);
  };
  
  const closeViewDetails = () => {
    setViewDetails(null);
  };
  
  /* SEARCH ALL EMPLOYEES */
  const fetchAllSalary = async () => {
    if (!form.month || !form.year) return alert("Select month & year");
    
    setSearchLoading(true);
    try {
      const res = await axios.get(
        `/api/salary/hr/month?month=${form.month}&year=${form.year}`,
        { withCredentials: true }
      );
      setResult(res.data || []);
      setFilteredResults(res.data || []);
      setSearchUsername("");
      setEditingId(null);
      setViewDetails(null);
    } catch (err) {
      showError(err);
      setResult([]);
      setFilteredResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  /* EXPORT TO CSV */
  const exportToCSV = () => {
    const dataToExport = filteredResults || result || [];
    if (!dataToExport || dataToExport.length === 0) return;
    
    const headers = ["Employee Name", "Total Days", "Present Days", "Gross Salary", "LOP", "Net Salary"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(item => {
        if (!item) return "";
        const netSalary = (item.grossSalary || 0) - (item.lop || 0);
        return [
          `"${item.employeeName || ""}"`,
          item.totalDay || 0,
          item.actualDay || 0,
          item.grossSalary || 0,
          item.lop || 0,
          netSalary
        ].join(",");
      })
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = searchUsername
      ? `salary-report-${searchUsername}-${form.month}-${form.year}.csv`
      : `salary-report-all-${form.month}-${form.year}.csv`;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const calculateAttendancePercentage = (total, present) => {
    if (!total || total === 0) return 0;
    return Math.round(((present || 0) / total) * 100);
  };
  
  const displayResults = filteredResults || result || [];
  const hasSearchFilter = searchUsername.trim() !== "";
  
  return (
    <div className="salary-management-container">
      <div className="salary-header">
        <div>
          <h1 className="salary-title">Salary Management</h1>
          <p className="salary-subtitle">Generate, edit and manage employee salaries</p>
        </div>
        <div className="header-stats">
          {displayResults.length > 0 && (
            <div className="stats-card">
              <Calendar size={20} />
              <div>
                <span className="stats-value">
                  {displayResults.length}
                </span>
                <span className="stats-label">
                  {hasSearchFilter ? "Filtered Records" : "Total Records"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="salary-content">
        {/* GENERATE SALARY CARD */}
        <div className="salary-card">
          <div className="card-header">
            <div className="card-title">
              <DollarSign size={20} />
              <span>Generate Monthly Salary for All Employees</span>
            </div>
            <div className="card-subtitle">
              Create salary records for all employees
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Month</label>
              <div className="select-wrapper">
                <select
                  className="form-select"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                >
                  <option value="">Select Month</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <div className="select-icon">▼</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <div className="select-wrapper">
                <select
                  className="form-select"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="select-icon">▼</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Total Working Days
              </label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="number"
                  name="totalDay"
                  value={form.totalDay}
                  onChange={handleChange}
                  placeholder="Auto-calculated"
                  readOnly
                />
                <div className="input-suffix">days</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Default Present Days
              </label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="number"
                  name="actualDay"
                  value={form.actualDay}
                  onChange={handleChange}
                  min="0"
                  max={form.totalDay}
                  placeholder="Default equals total days"
                />
                <div className="input-suffix">days</div>
              </div>
              {form.totalDay && form.actualDay && (
                <div className="percentage-badge">
                  {calculateAttendancePercentage(form.totalDay, form.actualDay)}% attendance
                </div>
              )}
            </div>
          </div>
          <div className="card-footer">
            <button
              className={`primary-button ${loading ? 'button-loading' : ''}`}
              onClick={submitSalary}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spinner" />
                  Generating...
                </>
              ) : (
                <>
                  <DollarSign size={16} />
                  Generate Salaries for All
                </>
              )}
            </button>
            <div className="note-text">
              Note: Present days are defaults only. Actual days per employee can be edited individually.
            </div>
          </div>
        </div>
        {/* SEARCH SALARY CARD */}
        <div className="salary-card">
          <div className="card-header">
            <div className="card-title">
              <Search size={20} />
              <span>Search Salary Records</span>
            </div>
            <div className="card-subtitle">
              View salary records by month and year
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Month</label>
              <div className="select-wrapper">
                <select
                  className="form-select"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                >
                  <option value="">Select Month</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <div className="select-icon">▼</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <div className="select-wrapper">
                <select
                  className="form-select"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="select-icon">▼</div>
              </div>
            </div>
            <div className="form-group">
              <div className="filter-header">
                <label className="form-label">
                  <Filter size={14} />
                  Filter by Employee Name (Optional)
                </label>
                {searchUsername && (
                  <button
                    className="clear-filter-button"
                    onClick={clearUsernameFilter}
                    title="Clear filter"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  value={searchUsername}
                  onChange={handleSearchUsernameChange}
                  placeholder="Enter employee name..."
                />
                {searchUsername && (
                  <div className="active-filter-badge">
                    <Filter size={12} />
                  </div>
                )}
              </div>
              {searchUsername && (
                <div className="filter-info">
                  Filtering for: <strong>{searchUsername}</strong>
                </div>
              )}
            </div>
          </div>
          <div className="search-buttons">
            <button
              className={`secondary-button ${searchLoading ? 'button-loading' : ''}`}
              onClick={fetchAllSalary}
              disabled={searchLoading}
            >
              {searchLoading ? (
                <>
                  <RefreshCw size={16} className="spinner" />
                  Loading...
                </>
              ) : (
                <>
                  <Search size={16} />
                  View All Employees
                </>
              )}
            </button>
            
            {searchUsername && (
              <button
                className={`tertiary-button ${searchLoading ? 'button-loading' : ''}`}
                onClick={fetchSalary}
                disabled={searchLoading || !searchUsername.trim()}
              >
                {searchLoading ? (
                  <>
                    <RefreshCw size={16} className="spinner" />
                    Searching...
                  </>
                ) : (
                  <>
                    <User size={16} />
                    Search Specific Employee
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {/* RESULTS SECTION */}
        {displayResults.length > 0 && (
          <div className="salary-card">
            <div className="results-header">
              <div>
                <h3 className="results-title">
                  Salary Records for {months.find(m => m.value == form.month)?.label} {form.year}
                  {hasSearchFilter && (
                    <span className="filter-indicator">
                      <Filter size={14} />
                      Filtered by: "{searchUsername}"
                      <button
                        className="clear-filter-button-small"
                        onClick={clearUsernameFilter}
                        title="Clear filter"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </h3>
                <p className="results-subtitle">
                  Showing {displayResults.length} employee{displayResults.length !== 1 ? 's' : ''}
                  {hasSearchFilter && result && ` (filtered from ${result.length} total)`}
                </p>
              </div>
              <div className="results-header-actions">
                {hasSearchFilter && result && result.length > displayResults.length && (
                  <button
                    className="show-all-button"
                    onClick={fetchAllSalary}
                  >
                    Show All {result.length} Employees
                  </button>
                )}
                <button className="export-button" onClick={exportToCSV}>
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="salary-table">
                <thead>
                  <tr>
                    <th className="table-header">Employee</th>
                    <th className="table-header">Total Days</th>
                    <th className="table-header">Present Days</th>
                    <th className="table-header">Gross Salary</th>
                    <th className="table-header">LOP Deduction</th>
                    <th className="table-header">Net Salary</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayResults.map((r, index) => {
                    if (!r) return null;
                    const netSalary = (r.grossSalary || 0) - (r.lop || 0);
                    
                    const isEditing = editingId === r.salaryId;
                    const rowClass = isEditing ? 'edit-row' : (index % 2 === 0 ? 'even-row' : 'odd-row');
                    
                    return (
                      <React.Fragment key={r.salaryId || index}>
                        <tr className={rowClass}>
                          <td className="table-cell">
                            <div className="employee-cell">
                              <div className="employee-avatar">
                                {r.employeeName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="employee-name">{r.employeeName || 'Unknown'}</div>
                              </div>
                            </div>
                          </td>
                          
                          {isEditing ? (
                            <td colSpan="6" className="table-cell">
                              <div className="edit-form">
                                <div className="edit-form-grid">
                                  <div className="form-group">
                                    <label className="form-label">Total Days</label>
                                    <input
                                      type="number"
                                      className="form-input"
                                      name="totalDay"
                                      value={editForm.totalDay || ''}
                                      onChange={handleEditChange}
                                      min="1"
                                      max="31"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Present Days</label>
                                    <input
                                      type="number"
                                      className="form-input"
                                      name="actualDay"
                                      value={editForm.actualDay || ''}
                                      onChange={handleEditChange}
                                      min="0"
                                      max={editForm.totalDay || 31}
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Month</label>
                                    <div className="select-wrapper">
                                      <select
                                        className="form-select"
                                        name="month"
                                        value={editForm.month || ''}
                                        onChange={handleEditChange}
                                      >
                                        {months.map((m) => (
                                          <option key={m.value} value={m.value}>
                                            {m.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Year</label>
                                    <input
                                      type="number"
                                      className="form-input"
                                      name="year"
                                      value={editForm.year || ''}
                                      onChange={handleEditChange}
                                    />
                                  </div>
                                </div>
                                <div className="edit-form-actions">
                                  <button className="save-button" onClick={handleSaveEdit}>
                                    <Save size={14} />
                                    Save Changes
                                  </button>
                                  <button className="cancel-button" onClick={handleCancelEdit}>
                                    <X size={14} />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="table-cell">
                                <div className="number-cell">{r.totalDay || 0}</div>
                              </td>
                              <td className="table-cell">
                                <div className="number-cell">{r.actualDay || 0}</div>
                              </td>
                              <td className="table-cell">
                                <div className="amount-cell">
                                  <span className="currency">₹</span>
                                  {(r.grossSalary || 0).toLocaleString('en-IN')}
                                </div>
                              </td>
                              <td className="table-cell">
                                <div style={{color: '#ef4444'}} className="amount-cell">
                                  -₹{(r.lop || 0).toLocaleString('en-IN')}
                                </div>
                              </td>
                              <td className="table-cell">
                                <div className="net-salary-cell">
                                  <span className="currency">₹</span>
                                  {netSalary.toLocaleString('en-IN')}
                                </div>
                              </td>
                              <td className="table-cell">
                                <div className="action-buttons">
                                  <button className="view-button" onClick={() => handleViewDetails(r)}>
                                    <Eye size={14} />
                                  </button>
                                  <button className="edit-button" onClick={() => handleEdit(r)}>
                                    <Edit size={14} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <div className="summary">
                <div className="summary-item">
                  <span className="summary-label">Records:</span>
                  <span className="summary-value">
                    {displayResults.length} {hasSearchFilter ? 'filtered' : 'total'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total LOP:</span>
                  <span style={{color: '#ef4444'}} className="summary-value">
                    ₹{displayResults.reduce((sum, r) => sum + (r?.lop || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Payroll:</span>
                  <span style={{color: '#10b981'}} className="summary-value">
                    ₹{displayResults.reduce((sum, r) => sum + ((r?.grossSalary || 0) - (r?.lop || 0)), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* VIEW DETAILS MODAL */}
        {viewDetails && (
          <div className="modal-overlay" onClick={closeViewDetails}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Salary Details</h2>
                <button className="modal-close" onClick={closeViewDetails}>
                  ×
                </button>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Employee Name</div>
                  <div className="detail-value">{viewDetails.employeeName || 'Unknown'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Month</div>
                  <div className="detail-value">{months.find(m => m.value == viewDetails.month)?.label || viewDetails.month}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Year</div>
                  <div className="detail-value">{viewDetails.year}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Total Days</div>
                  <div className="detail-value">{viewDetails.totalDay || 0}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Present Days</div>
                  <div className="detail-value">{viewDetails.actualDay || 0}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Gross Salary</div>
                  <div className="detail-value">₹ {(viewDetails.grossSalary || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">LOP Deduction</div>
                  <div style={{color: '#ef4444'}} className="detail-value">
                    -₹ {(viewDetails.lop || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Net Salary</div>
                  <div style={{color: '#10b981'}} className="detail-value">
                    ₹ {((viewDetails.grossSalary || 0) - (viewDetails.lop || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Salary ID</div>
                  <div className="detail-value">{viewDetails.salaryId}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">User ID</div>
                  <div className="detail-value">{viewDetails.userId}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* EMPTY STATES */}
        {displayResults.length === 0 && result !== null && (
          <div className="empty-state">
            <Search size={48} className="empty-icon" />
            <h3 className="empty-title">
              {hasSearchFilter
                ? `No records found for "${searchUsername}"`
                : "No records found"}
            </h3>
            <p className="empty-text">
              {hasSearchFilter
                ? "Try searching with a different name or view all employees."
                : "No salary records found for the selected month and year."}
            </p>
            {hasSearchFilter && (
              <button
                className="clear-filter-button-large"
                onClick={clearUsernameFilter}
              >
                <X size={16} />
                Clear Filter
              </button>
            )}
          </div>
        )}
        {/* NO RESULTS STATE */}
        {result === null && (
          <div className="empty-state">
            <Search size={48} className="empty-icon" />
            <h3 className="empty-title">Search Salary Records</h3>
            <p className="empty-text">
              Select a month and year above to view salary records.
              You can optionally filter by employee name.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}