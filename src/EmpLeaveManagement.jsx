import api from "./api";
import React, { Component } from 'react';
import axios from 'axios';
import './EmpLeaveManagement.css';

export default class EmpLeaveManagement extends Component {
  state = {
    leaveTypes: [],
    myLeaves: [],
    teamLeaves: [],
    loading: false,
    activeTab: 'apply', // 'apply', 'my', 'team'
    leaveId: '',
    startDate: '',
    endDate: '',
    reason: '',
    rejectReason: '',
    selectedLeave: null,
    showRejectModal: false,
    message: { type: '', text: '' },
    calculatedDays: 0
  };

  componentDidMount() {
    this.loadAllData();
  }

  /* ================= LOAD APIs ================= */
  loadAllData = async () => {
    try {
      this.setState({ loading: true });
      await Promise.all([
        this.loadLeaveTypes(),
        this.loadMyLeaves(),
        this.loadTeamLeaves()
      ]);
    } catch (error) {
      this.showMessage('error', 'Failed to load data');
    } finally {
      this.setState({ loading: false });
    }
  };

  loadLeaveTypes = async () => {
    try {
      const res = await axios.get('/leave-master/all');
      this.setState({
        leaveTypes: res.data.filter(l => l.leaveName !== 'LOP')
      });
    } catch (error) {
      console.error('Error loading leave types:', error);
    }
  };

  loadMyLeaves = async () => {
    try {
      const res = await axios.get('/leave-record/myLeaves');
      this.setState({ myLeaves: res.data });
    } catch (error) {
      console.error('Error loading my leaves:', error);
    }
  };

  loadTeamLeaves = async () => {
    try {
      const res = await axios.get('/leave-record/teamLeaves');
      this.setState({ teamLeaves: res.data });
    } catch (error) {
      console.error('Error loading team leaves:', error);
    }
  };

  /* ================= CALCULATE DAYS ================= */
  calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    let start, end;
    
    // Handle array format from API: [year, month, day]
    if (Array.isArray(startDate) && Array.isArray(endDate)) {
      // Note: Month is 0-indexed in JavaScript Date, so subtract 1
      start = new Date(startDate[0], startDate[1] - 1, startDate[2]);
      end = new Date(endDate[0], endDate[1] - 1, endDate[2]);
    } 
    // Handle string format from form: "YYYY-MM-DD"
    else if (typeof startDate === 'string' && typeof endDate === 'string') {
      start = new Date(startDate);
      end = new Date(endDate);
    } 
    // Handle mixed or invalid formats
    else {
      return 0;
    }
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    
    // Calculate difference in days (inclusive of both start and end dates)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 to include both start and end dates
  };

  /* ================= DATE HELPER METHODS ================= */
  formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return '-';
    
    const [year, month, day] = dateArray;
    
    // Validate the date values
    if (!year || !month || !day) return '-';
    
    // Create date object (month is 0-indexed)
    const date = new Date(year, month - 1, day);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  convertToDateArray = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return [
      date.getFullYear(),
      date.getMonth() + 1, // JavaScript months are 0-indexed
      date.getDate()
    ];
  };

  /* ================= APPLY LEAVE ================= */
  applyLeave = async () => {
    const { leaveId, startDate, endDate, reason, leaveTypes } = this.state;

    // Validation
    if (!leaveId || !startDate || !endDate || !reason.trim()) {
      this.showMessage('error', 'Please fill all required fields');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.showMessage('error', 'Invalid date format');
      return;
    }
    
    // Check if start date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day
    
    if (start < today) {
      this.showMessage('error', 'Start date cannot be in the past');
      return;
    }

    if (start > end) {
      this.showMessage('error', 'End date must be after start date');
      return;
    }
    
    // Calculate days and check against leave type limit
    const days = this.calculateDays(startDate, endDate);
    const selectedLeaveType = leaveTypes.find(lt => lt.leaveId === leaveId);
    
    if (selectedLeaveType && days > selectedLeaveType.noOfDays) {
      this.showMessage('error', `Selected leave type allows maximum ${selectedLeaveType.noOfDays} days`);
      return;
    }

    try {
      this.setState({ loading: true });
      
      const requestData = {
        leaveId,
        startDate: this.convertToDateArray(startDate),
        endDate: this.convertToDateArray(endDate),
        reason: reason.trim()
      };

      console.log('Sending leave application:', requestData);

      await axios.post(`/api/leave-record/applyLeave`, requestData);

      this.showMessage('success', 'Leave application submitted successfully!');
      
      // Reset form
      this.setState({
        leaveId: '',
        startDate: '',
        endDate: '',
        reason: '',
        calculatedDays: 0
      });

      // Refresh data
      await this.loadMyLeaves();
    } catch (error) {
      console.error('Error applying leave:', error);
      this.showMessage('error', error.response?.data?.message || 'Failed to apply leave');
    } finally {
      this.setState({ loading: false });
    }
  };

  /* ================= APPROVE LEAVE ================= */
  approveLeave = async (recId, status) => {
    if (status !== 1) {
      this.showMessage('error', 'Only pending leaves can be approved');
      return;
    }

    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return;
    }

    try {
      await axios.put(
        `/api/leave-record/approve/${recId}`,
        {}
      );
      
      this.showMessage('success', 'Leave approved successfully!');
      await this.loadTeamLeaves();
      await this.loadMyLeaves();
    } catch (error) {
      console.error('Error approving leave:', error);
      this.showMessage('error', error.response?.data?.message || 'Failed to approve leave');
    }
  };

  /* ================= REJECT LEAVE ================= */
  rejectLeave = async () => {
    const { selectedLeave, rejectReason } = this.state;

    if (!selectedLeave || selectedLeave.status !== 1) {
      this.showMessage('error', 'Only pending leaves can be rejected');
      return;
    }

    if (!rejectReason.trim()) {
      this.showMessage('error', 'Please enter a reason for rejection');
      return;
    }

    try {
      await axios.put(
        `/api/leave-record/reject/${selectedLeave.recId}`,
        { reasonForReject: rejectReason.trim() }
      );
      
      this.showMessage('success', 'Leave rejected successfully!');
      this.setState({
        rejectReason: '',
        showRejectModal: false,
        selectedLeave: null
      });
      
      await this.loadTeamLeaves();
      await this.loadMyLeaves();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      this.showMessage('error', error.response?.data?.message || 'Failed to reject leave');
    }
  };

  /* ================= HELPER METHODS ================= */
  showMessage = (type, text) => {
    this.setState({
      message: { type, text }
    });
    setTimeout(() => {
      this.setState({ message: { type: '', text: '' } });
    }, 5000);
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value }, () => {
      // Recalculate days when startDate or endDate changes
      if (name === 'startDate' || name === 'endDate') {
        const { startDate, endDate } = this.state;
        if (startDate && endDate) {
          const days = this.calculateDays(startDate, endDate);
          this.setState({ calculatedDays: days });
        } else {
          this.setState({ calculatedDays: 0 });
        }
      }
    });
  };

  statusText = (status) => {
    const statusMap = {
      1: { text: 'PENDING', className: 'status-pending' },
      2: { text: 'APPROVED', className: 'status-approved' },
      3: { text: 'REJECTED', className: 'status-rejected' }
    };
    return statusMap[status] || { text: '-', className: '' };
  };

  openRejectModal = (leave) => {
    this.setState({
      selectedLeave: leave,
      rejectReason: '',
      showRejectModal: true
    });
  };

  /* ================= RENDER METHODS ================= */
  renderHeader = () => (
    <div className="leave-header">
      <div className="header-content">
        <h1 className="page-title">Leave Management</h1>
        <p className="page-subtitle">Manage your leave applications and approvals</p>
      </div>
      <div className="header-actions">
        <button
          className="refresh-btn"
          onClick={this.loadAllData}
          disabled={this.state.loading}
        >
          <span className="refresh-icon">↻</span>
          Refresh Data
        </button>
      </div>
    </div>
  );

  renderTabs = () => (
    <div className="tab-navigation">
      <button
        className={`tab-btn ${this.state.activeTab === 'apply' ? 'active' : ''}`}
        onClick={() => this.setState({ activeTab: 'apply' })}
      >
        <span className="tab-icon">+</span>
        Apply Leave
      </button>
      <button
        className={`tab-btn ${this.state.activeTab === 'my' ? 'active' : ''}`}
        onClick={() => this.setState({ activeTab: 'my' })}
      >
        <span className="tab-icon">📋</span>
        My Leaves
      </button>
      <button
        className={`tab-btn ${this.state.activeTab === 'team' ? 'active' : ''}`}
        onClick={() => this.setState({ activeTab: 'team' })}
      >
        <span className="tab-icon">👥</span>
        Team Leaves
      </button>
    </div>
  );

  renderMessage = () => {
    const { message } = this.state;
    if (!message.text) return null;

    return (
      <div className={`message-container ${message.type}`}>
        <div className="message-content">
          <span className="message-icon">
            {message.type === 'success' ? '✓' : '!'}
          </span>
          {message.text}
        </div>
      </div>
    );
  };

  renderApplyLeave = () => {
    const { leaveId, startDate, endDate, reason, leaveTypes, loading, calculatedDays } = this.state;
    const selectedLeaveType = leaveTypes.find(lt => lt.leaveId === leaveId);
    const maxDays = selectedLeaveType?.noOfDays || 0;
    const exceedsLimit = calculatedDays > maxDays && maxDays > 0;

    return (
      <div className="section-container">
        <div className="section-header">
          <h2>Apply for Leave</h2>
          <p className="section-subtitle">Submit a new leave request with required details</p>
        </div>

        <div className="form-container">
          {/* Leave Type */}
          <div className="form-group">
            <label className="form-label">
              Leave Type <span className="required">*</span>
            </label>
            <select
              name="leaveId"
              value={leaveId}
              onChange={this.handleChange}
              className="form-select"
              disabled={loading}
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map(l => (
                <option key={l.leaveId} value={l.leaveId}>
                  {l.leaveName} (Max: {l.noOfDays} days)
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={this.handleChange}
                className="form-input"
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={this.handleChange}
                className="form-input"
                disabled={loading}
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Days</label>
              <div className={`days-display ${exceedsLimit ? 'days-display-warning' : ''}`}>
                <span className="days-count">{calculatedDays}</span>
                <span className="days-text">
                  day{calculatedDays !== 1 ? 's' : ''}
                  {exceedsLimit && (
                    <span style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'var(--danger)',
                      marginTop: '4px',
                      fontWeight: '500'
                    }}>
                      Exceeds limit by {calculatedDays - maxDays} days
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="form-group">
            <label className="form-label">
              Reason <span className="required">*</span>
            </label>
            <textarea
              name="reason"
              value={reason}
              onChange={this.handleChange}
              className="form-textarea"
              placeholder="Please provide a detailed reason for your leave..."
              rows="4"
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => this.setState({
                leaveId: '',
                startDate: '',
                endDate: '',
                reason: '',
                calculatedDays: 0
              })}
              disabled={loading}
            >
              Clear Form
            </button>
            <button
              className="btn btn-primary"
              onClick={this.applyLeave}
              disabled={loading || exceedsLimit}
            >
              {loading ? 'Submitting...' : 'Apply Leave'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  renderMyLeaves = () => {
    const { myLeaves, loading } = this.state;

    return (
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2>My Leave History</h2>
            <p className="section-subtitle">Track your leave applications and status</p>
          </div>
          <div className="section-actions">
            <button
              className="btn-refresh-small"
              onClick={this.loadMyLeaves}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {myLeaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Leave Applications</h3>
            <p>You haven't applied for any leaves yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave ID</th>
                  <th>Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map(leave => {
                  const status = this.statusText(leave.status);
                  const days = this.calculateDays(leave.startDate, leave.endDate);
                  const leaveType = this.state.leaveTypes.find(lt => lt.leaveId === leave.leaveId);
                  
                  return (
                    <tr key={leave.recId}>
                      <td className="text-center">#{leave.recId}</td>
                      <td>{leaveType?.leaveName || 'Unknown'}</td>
                      <td>{this.formatDate(leave.startDate)}</td>
                      <td>{this.formatDate(leave.endDate)}</td>
                      <td className="text-center">{days} days</td>
                      <td>
                        <span className={`status-badge ${status.className}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  renderTeamLeaves = () => {
    const { teamLeaves, loading, rejectReason, showRejectModal, selectedLeave } = this.state;

    return (
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2>Team Leave Requests</h2>
            <p className="section-subtitle">Review and manage leave requests from your team</p>
          </div>
          <div className="section-actions">
            <button
              className="btn-refresh-small"
              onClick={this.loadTeamLeaves}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {teamLeaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Team Requests</h3>
            <p>There are no pending leave requests from your team</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamLeaves.map(leave => {
                  const status = this.statusText(leave.status);
                  const days = this.calculateDays(leave.startDate, leave.endDate);
                  
                  return (
                    <tr key={leave.recId}>
                      <td>
                        <div className="employee-info">
                          <div className="employee-avatar">
                            {leave.employeeName?.charAt(0) || 'E'}
                          </div>
                          <div className="employee-details">
                            <div className="employee-name">{leave.employeeName}</div>
                            <div className="employee-id">ID: {leave.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td>{this.formatDate(leave.startDate)}</td>
                      <td>{this.formatDate(leave.endDate)}</td>
                      <td className="text-center">{days} days</td>
                      <td>
                        <span className={`status-badge ${status.className}`}>
                          {status.text}
                        </span>
                      </td>
                      <td>
                        {leave.status === 1 ? (
                          <div className="action-buttons">
                            <button
                              className="btn-action approve"
                              onClick={() => this.approveLeave(leave.recId, leave.status)}
                              disabled={loading}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-action reject"
                              onClick={() => this.openRejectModal(leave)}
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="action-text">
                            {leave.status === 2 ? '✔ Approved' : '❌ Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedLeave && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Reject Leave Request</h3>
                <button
                  className="modal-close"
                  onClick={() => this.setState({ showRejectModal: false })}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="leave-details">
                  <div className="detail-row">
                    <span className="detail-label">Employee:</span>
                    <span className="detail-value">{selectedLeave.employeeName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Dates:</span>
                    <span className="detail-value">
                      {this.formatDate(selectedLeave.startDate)} to {this.formatDate(selectedLeave.endDate)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">
                      {this.calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Reason for Rejection <span className="required">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => this.setState({ rejectReason: e.target.value })}
                    className="form-textarea"
                    placeholder="Please provide a reason for rejecting this leave request..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => this.setState({ showRejectModal: false })}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={this.rejectLeave}
                  disabled={!rejectReason.trim()}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { loading, activeTab } = this.state;

    return (
      <div className="leave-management-container">
        {this.renderHeader()}
        {this.renderMessage()}
        {this.renderTabs()}

        {loading && activeTab === 'apply' && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        <div className="content-wrapper">
          {activeTab === 'apply' && this.renderApplyLeave()}
          {activeTab === 'my' && this.renderMyLeaves()}
          {activeTab === 'team' && this.renderTeamLeaves()}
        </div>
      </div>
    );
  }
}
