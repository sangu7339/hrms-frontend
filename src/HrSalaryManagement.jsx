import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search, Download, Calendar, User, DollarSign, RefreshCw,
  Filter, X, Edit, Save, Trash2, Eye, TrendingUp, Users,
  ChevronDown, Zap, BarChart3, FileText
} from "lucide-react";
import "./HrSalaryManagement.css";

export default function HrSalaryManagement() {
  const [generateForm, setGenerateForm] = useState({ totalDay: "", actualDay: "", month: "", year: "" });
  const [searchForm, setSearchForm] = useState({ month: "", year: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [filteredResults, setFilteredResults] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewDetails, setViewDetails] = useState(null);

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  useEffect(() => {
    if (generateForm.month && generateForm.year) {
      const days = new Date(generateForm.year, generateForm.month, 0).getDate();
      setGenerateForm((prev) => ({ ...prev, totalDay: days, actualDay: days }));
    }
  }, [generateForm.month, generateForm.year]);

  useEffect(() => {
    if (result && searchUsername) {
      const filtered = result.filter(item => {
        if (!item) return false;
        return (item.employeeName || "").toLowerCase().includes(searchUsername.toLowerCase().trim());
      });
      setFilteredResults(filtered);
    } else {
      setFilteredResults(result);
    }
  }, [searchUsername, result]);

  const handleGenerateChange = (e) => {
    const { name, value } = e.target;
    if (name === "actualDay" && value > generateForm.totalDay) return;
    setGenerateForm({ ...generateForm, [name]: value });
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm({ ...searchForm, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "actualDay" && value > editForm.totalDay) return;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const clearUsernameFilter = () => { setSearchUsername(""); setFilteredResults(result); };

  const showError = (err) => {
    if (err?.response?.data) {
      const d = err.response.data;
      alert(typeof d === "string" ? d : d.message || JSON.stringify(d));
    } else {
      alert("Server error");
    }
  };

  const submitSalary = async () => {
    if (!generateForm.month || !generateForm.year) return alert("Select month & year");
    setLoading(true);
    try {
      // First, check if salaries already exist for this month/year
      const checkRes = await axios.get(
        `/api/salary/hr/month?month=${generateForm.month}&year=${generateForm.year}`,
        { withCredentials: true }
      );
      
      const monthLabel = months.find(m => m.value == generateForm.month)?.label;
      
      // If data exists and has records, salaries are already generated
      if (checkRes.data && checkRes.data.length > 0) {
        alert(`⚠️ Salaries already generated for ${monthLabel} ${generateForm.year}`);
        setLoading(false);
        return;
      }

      // If no existing records, proceed with generation
      await axios.post(`/api/salary/hr/month/all`, {
        totalDay: Number(generateForm.totalDay),
        month: Number(generateForm.month),
        year: Number(generateForm.year),
      }, { withCredentials: true });
      
      alert("Salaries generated successfully for all employees ✅");
      setGenerateForm({ totalDay: "", actualDay: "", month: "", year: "" });
      setResult(null); setFilteredResults(null); setSearchUsername("");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "";
      const monthLabel = months.find(m => m.value == generateForm.month)?.label;
      
      // Check if salaries already exist (error response)
      if (errorMsg.toLowerCase().includes("already") || errorMsg.toLowerCase().includes("exist")) {
        alert(`⚠️ Salaries already generated for ${monthLabel} ${generateForm.year}`);
      } else {
        showError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSalary = async () => {
    if (!searchForm.month || !searchForm.year) return alert("Select month & year");
    setSearchLoading(true);
    try {
      const res = await axios.get(
        `/api/salary/hr/month?month=${searchForm.month}&year=${searchForm.year}`,
        { withCredentials: true }
      );
      setResult(res.data || []); setFilteredResults(res.data || []);
      setEditingId(null); setViewDetails(null);
    } catch (err) { showError(err); setResult([]); setFilteredResults([]); }
    finally { setSearchLoading(false); }
  };

  const handleEdit = (record) => {
    setEditingId(record.salaryId);
    setEditForm({
      userId: record.userId || "", month: record.month || searchForm.month,
      year: record.year || searchForm.year, totalDay: record.totalDay || "",
      actualDay: record.actualDay || "", salaryId: record.salaryId
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.actualDay) return alert("Enter present days");
    if (!editForm.totalDay) return alert("Total days is required");
    try {
      await axios.put(`/api/salary/edit/${editForm.salaryId}`, {
        userId: Number(editForm.userId), month: Number(editForm.month),
        year: Number(editForm.year), totalDay: Number(editForm.totalDay),
        actualDay: Number(editForm.actualDay)
      }, { withCredentials: true });
      alert("Salary updated successfully ✅");
      setEditingId(null); setEditForm({});
      fetchSalary();
    } catch (err) { showError(err); }
  };

  const handleCancelEdit = () => { setEditingId(null); setEditForm({}); };
  const handleViewDetails = (record) => setViewDetails(record);
  const closeViewDetails = () => setViewDetails(null);

  const fetchAllSalary = async () => {
    if (!searchForm.month || !searchForm.year) return alert("Select month & year");
    setSearchLoading(true);
    try {
      const res = await axios.get(
        `/api/salary/hr/month?month=${searchForm.month}&year=${searchForm.year}`,
        { withCredentials: true }
      );
      setResult(res.data || []); setFilteredResults(res.data || []);
      setSearchUsername(""); setEditingId(null); setViewDetails(null);
    } catch (err) { showError(err); setResult([]); setFilteredResults([]); }
    finally { setSearchLoading(false); }
  };

  const exportToCSV = () => {
    const dataToExport = filteredResults || result || [];
    if (!dataToExport.length) return;
    const headers = ["Employee Name", "Total Days", "Present Days", "Gross Salary", "LOP", "Net Salary"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(item => {
        if (!item) return "";
        const netSalary = (item.grossSalary || 0) - (item.lop || 0);
        return [`"${item.employeeName || ""}"`, item.totalDay || 0, item.actualDay || 0, item.grossSalary || 0, item.lop || 0, netSalary].join(",");
      })
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = searchUsername
      ? `salary-${searchUsername}-${searchForm.month}-${searchForm.year}.csv`
      : `salary-all-${searchForm.month}-${searchForm.year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calcAttPct = (total, present) => {
    if (!total || total === 0) return 0;
    return Math.round(((present || 0) / total) * 100);
  };

  const displayResults = filteredResults || result || [];
  const hasSearchFilter = searchUsername.trim() !== "";
  const totalPayroll = displayResults.reduce((s, r) => s + ((r?.grossSalary || 0) - (r?.lop || 0)), 0);
  const totalLOP = displayResults.reduce((s, r) => s + (r?.lop || 0), 0);
  const selectedMonthLabel = months.find(m => m.value == searchForm.month)?.label;

  return (
    <div className="salary-management-container">

      {/* ── HEADER ── */}
      <div className="salary-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="salary-title">
            Salary <span>Management</span>
          </h1>
          <p className="salary-subtitle">Generate, review &amp; edit employee payroll records</p>
        </div>
        <div className="header-stats">
          {displayResults.length > 0 && (
            <>
              <div className="stats-card">
                <Users size={18} />
                <div>
                  <span className="stats-value">{displayResults.length}</span>
                  <span className="stats-label">{hasSearchFilter ? "Filtered" : "Employees"}</span>
                </div>
              </div>
              <div className="stats-card">
                <TrendingUp size={18} />
                <div>
                  <span className="stats-value">₹{(totalPayroll / 100000).toFixed(1)}L</span>
                  <span className="stats-label">Net Payroll</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="salary-content">

        {/* ── GENERATE SALARY CARD ── */}
        <div className="salary-card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon"><Zap size={16} /></div>
              Generate Monthly Salary for All Employees
            </div>
            <p className="card-subtitle">Create payroll records for all active employees in one click</p>
          </div>

          <div className="form-grid">
            {/* Month */}
            <div className="form-group">
              <label className="form-label">
                <Calendar size={12} /> Month
              </label>
              <div className="select-wrapper">
                <select className="form-select" name="month" value={generateForm.month} onChange={handleGenerateChange}>
                  <option value="">Select Month</option>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <span className="select-icon"><ChevronDown size={12} /></span>
              </div>
            </div>

            {/* Year */}
            <div className="form-group">
              <label className="form-label">
                <Calendar size={12} /> Year
              </label>
              <div className="select-wrapper">
                <select className="form-select" name="year" value={generateForm.year} onChange={handleGenerateChange}>
                  <option value="">Select Year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <span className="select-icon"><ChevronDown size={12} /></span>
              </div>
            </div>

            {/* Total Days
            <div className="form-group">
              <label className="form-label">
                <BarChart3 size={12} /> Total Working Days
              </label>
              <div className="input-wrapper">
                <input
                  className="form-input read-only-input"
                  name="totalDay"
                  type="number"
                  value={form.totalDay}
                  readOnly
                  placeholder="Auto-calculated"
                />
                <span className="input-suffix">days</span>
              </div>
            </div> */}

            {/* Attendance %
            {form.totalDay && form.actualDay && (
              <div className="form-group">
                <label className="form-label">
                  <TrendingUp size={12} /> Attendance Rate
                </label>
                <div className="input-wrapper">
                  <input
                    className="form-input read-only-input"
                    type="text"
                    value={`${calcAttPct(form.totalDay, form.actualDay)}%`}
                    readOnly
                  />
                </div> */}
                {/* <div className="percentage-badge">
                  {calcAttPct(form.totalDay, form.actualDay)}% attendance rate
                </div> */}
              {/* {/* </div>
            )} */}
          </div> 

          <div className="search-buttons">
            <button
              className={`primary-button${loading ? " button-loading" : ""}`}
              onClick={submitSalary}
              disabled={loading}
            >
              {loading
                ? <><RefreshCw size={14} className="spinner" /> Generating...</>
                : <><Zap size={14} /> Generate Salaries for All</>}
            </button>
          </div>

          <p className="note-text">
            Note: Present days shown are defaults. Actual attendance per employee can be edited individually after generation.
          </p>
        </div>

        {/* ── SEARCH / FILTER CARD ── */}
        <div className="salary-card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon"><Search size={16} /></div>
              Search Salary Records
            </div>
            <p className="card-subtitle">View and filter payroll records by period or employee</p>
          </div>

          <div className="form-grid">
            {/* Month */}
            <div className="form-group">
              <label className="form-label"><Calendar size={12} /> Month</label>
              <div className="select-wrapper">
                <select className="form-select" name="month" value={searchForm.month} onChange={handleSearchChange}>
                  <option value="">Select Month</option>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <span className="select-icon"><ChevronDown size={12} /></span>
              </div>
            </div>

            {/* Year */}
            <div className="form-group">
              <label className="form-label"><Calendar size={12} /> Year</label>
              <div className="select-wrapper">
                <select className="form-select" name="year" value={searchForm.year} onChange={handleSearchChange}>
                  <option value="">Select Year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <span className="select-icon"><ChevronDown size={12} /></span>
              </div>
            </div>

            {/* Employee Filter */}
            <div className="form-group">
              <div className="filter-header">
                <label className="form-label"><Filter size={12} /> Filter by Employee</label>
                {searchUsername && (
                  <button className="clear-filter-button" onClick={clearUsernameFilter} title="Clear filter">
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Search by name…"
                  value={searchUsername}
                  onChange={e => setSearchUsername(e.target.value)}
                  autoFocus
                />
                {searchUsername && (
                  <span className="active-filter-badge">
                    <Search size={9} />
                  </span>
                )}
              </div>
              {searchUsername && (
                <div className="filter-info">Filtering for: <strong>{searchUsername}</strong></div>
              )}
            </div>
          </div>

          <div className="search-buttons">
            <button
              className={`primary-button${searchLoading ? " button-loading" : ""}`}
              onClick={fetchAllSalary}
              disabled={searchLoading}
            >
              {searchLoading
                ? <><RefreshCw size={14} className="spinner" /> Loading...</>
                : <><Users size={14} /> View All Employees</>}
            </button>

            {searchUsername && (
              <button
                className={`secondary-button${searchLoading ? " button-loading" : ""}`}
                onClick={fetchSalary}
                disabled={searchLoading}
              >
                {searchLoading
                  ? <><RefreshCw size={14} className="spinner" /> Searching...</>
                  : <><Search size={14} /> Search Employee</>}
              </button>
            )}
          </div>
        </div>

        {/* ── RESULTS TABLE ── */}
        {displayResults.length > 0 && result !== null && (
          <div className="salary-card">
            <div className="results-header">
              <div>
                <h2 className="results-title">
                  Salary Records — {selectedMonthLabel} {searchForm.year}
                  {hasSearchFilter && (
                    <span className="filter-indicator">
                      <Filter size={11} />
                      Filtered: "{searchUsername}"
                      <button className="clear-filter-button-small" onClick={clearUsernameFilter}>
                        <X size={10} />
                      </button>
                    </span>
                  )}
                </h2>
                <p className="results-subtitle">
                  Showing {displayResults.length} employee{displayResults.length !== 1 ? "s" : ""}
                  {hasSearchFilter && result && ` (filtered from ${result.length} total)`}
                </p>
              </div>

              <div className="results-header-actions">
                {hasSearchFilter && result && result.length > displayResults.length && (
                  <button className="show-all-button" onClick={clearUsernameFilter}>
                    Show All {result.length}
                  </button>
                )}
                <button className="export-button" onClick={exportToCSV}>
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <div className="table-container">
                <table className="salary-table">
                  <thead>
                    <tr>
                      <th style={{ width: "26%" }}>Employee</th>
                      <th style={{ width: "11%", textAlign: "center" }}>Total Days</th>
                      <th style={{ width: "11%", textAlign: "center" }}>Present Days</th>
                      <th style={{ width: "18%", textAlign: "right" }}>Gross Salary</th>
                      <th style={{ width: "16%", textAlign: "right" }}>LOP Deduction</th>
                      <th style={{ width: "18%", textAlign: "right" }}>Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayResults.map((r, index) => {
                      if (!r) return null;
                      const netSalary = (r.grossSalary || 0) - (r.lop || 0);
                      const isEditing = editingId === r.salaryId;
                      const rowClass = isEditing ? "edit-row" : (index % 2 === 0 ? "even-row" : "odd-row");

                      return (
                        <tr
                          key={r.salaryId || index}
                          className={`${rowClass} salary-row`}
                          onClick={() => !isEditing && handleViewDetails(r)}
                        >
                          {/* Employee */}
                          <td className="table-cell">
                            <div className="employee-cell">
                              <div className="employee-avatar">
                                {r.employeeName?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div className="employee-info">
                                <span className="employee-name">{r.employeeName || "Unknown"}</span>
                                {!isEditing && (
                                  <div className="row-hover-actions">
                                    <button
                                      className="row-action-btn row-view-btn"
                                      onClick={e => { e.stopPropagation(); handleViewDetails(r); }}
                                      title="View Details"
                                    >
                                      <Eye size={11} /> View
                                    </button>
                                    <button
                                      className="row-action-btn row-edit-btn"
                                      onClick={e => { e.stopPropagation(); handleEdit(r); }}
                                      title="Edit Record"
                                    >
                                      <Edit size={11} /> Edit
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {isEditing ? (
                            <td className="table-cell" colSpan="5">
                              <div className="edit-form">
                                <div className="edit-form-grid">
                                  <div className="form-group" style={{ padding: 10 }}>
                                    <label className="form-label">Total Days</label>
                                    <input
                                      className="form-input"
                                      type="number"
                                      name="totalDay"
                                      value={editForm.totalDay}
                                      onChange={handleEditChange}
                                      min="1"
                                    />
                                  </div>
                                  <div className="form-group" style={{ padding: 10 }}>
                                    <label className="form-label">Present Days</label>
                                    <input
                                      className="form-input"
                                      type="number"
                                      name="actualDay"
                                      value={editForm.actualDay}
                                      onChange={handleEditChange}
                                      min="0"
                                      max={editForm.totalDay}
                                    />
                                  </div>
                                  <div className="form-group" style={{ padding: 10 }}>
                                    <label className="form-label">Month</label>
                                    <div className="select-wrapper">
                                      <select className="form-select" name="month" value={editForm.month} onChange={handleEditChange}>
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                      </select>
                                      <span className="select-icon"><ChevronDown size={11} /></span>
                                    </div>
                                  </div>
                                  <div className="form-group" style={{ padding: 10 }}>
                                    <label className="form-label">Year</label>
                                    <input
                                      className="form-input"
                                      type="number"
                                      name="year"
                                      value={editForm.year}
                                      onChange={handleEditChange}
                                      min="2020"
                                      max="2030"
                                    />
                                  </div>
                                </div>
                                <div className="edit-form-actions">
                                  <button className="save-button" onClick={e => { e.stopPropagation(); handleSaveEdit(); }}>
                                    <Save size={12} /> Save Changes
                                  </button>
                                  <button className="cancel-button" onClick={e => { e.stopPropagation(); handleCancelEdit(); }}>
                                    <X size={12} /> Cancel
                                  </button>
                                </div>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="table-cell number-cell">{r.totalDay || 0}</td>
                              <td className="table-cell number-cell">{r.actualDay || 0}</td>
                              <td className="table-cell">
                                <div className="amount-cell">
                                  <span className="currency">₹</span>
                                  {(r.grossSalary || 0).toLocaleString("en-IN")}
                                </div>
                              </td>
                              <td className="table-cell">
                                <div className="amount-cell" style={{ color: "var(--danger)", justifyContent: "flex-end" }}>
                                  <span className="currency">-₹</span>
                                  {(r.lop || 0).toLocaleString("en-IN")}
                                </div>
                              </td>
                              <td className="table-cell">
                                <div className="net-salary-cell">
                                  <span className="currency">₹</span>
                                  {netSalary.toLocaleString("en-IN")}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        )}

        {/* ── EMPTY STATE (after search, no results) ── */}
        {displayResults.length === 0 && result !== null && (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={48} />
            </div>
            <h3 className="empty-title">
              {hasSearchFilter ? `No records found for "${searchUsername}"` : "No records found"}
            </h3>
            <p className="empty-text">
              {hasSearchFilter
                ? "Try a different name or view all employees."
                : "No salary records exist for the selected month and year."}
            </p>
            {hasSearchFilter && (
              <button className="clear-filter-button-large" onClick={clearUsernameFilter}>
                <X size={14} /> Clear Filter
              </button>
            )}
          </div>
        )}

        {/* ── INITIAL STATE ── */}
        {result === null && (
          <div className="empty-state">
            <div className="empty-icon">
              <BarChart3 size={48} />
            </div>
            <h3 className="empty-title">Ready to view salary records</h3>
            <p className="empty-text">
              Select a month and year above, then click <strong>"View All Employees"</strong> to load payroll data.
            </p>
          </div>
        )}
      </div>

      {/* ── VIEW DETAILS MODAL ── */}
      {viewDetails && (
        <div className="modal-overlay" onClick={closeViewDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Salary Details</h2>
              <button className="modal-close" onClick={closeViewDetails}>×</button>
            </div>

            <div className="detail-grid">
              <div className="detail-item" style={{ gridColumn: "1 / -1", background: "var(--brand-light)", border: "1px solid rgba(255,107,44,0.2)" }}>
                <div className="detail-label">Employee Name</div>
                <div className="detail-value" style={{ fontFamily: "var(--font)", fontSize: 17, color: "var(--brand)" }}>
                  {viewDetails.employeeName || "Unknown"}
                </div>
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
                <div className="detail-value">₹ {(viewDetails.grossSalary || 0).toLocaleString("en-IN")}</div>
              </div>
              <div className="detail-item highlight-danger">
                <div className="detail-label">LOP Deduction</div>
                <div className="detail-value">-₹ {(viewDetails.lop || 0).toLocaleString("en-IN")}</div>
              </div>
              <div className="detail-item highlight-success" style={{ gridColumn: "1 / -1" }}>
                <div className="detail-label">Net Salary</div>
                <div className="detail-value" style={{ fontSize: 22 }}>
                  ₹ {((viewDetails.grossSalary || 0) - (viewDetails.lop || 0)).toLocaleString("en-IN")}
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
    </div>
  );
}