import api from "./api";
import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import { 
  FiHome, FiUser, FiDollarSign, FiCalendar, 
  FiLogOut, FiSettings, FiMenu, FiX, FiEye, FiEyeOff,
  FiUsers, FiClock, FiLock
} from "react-icons/fi";

import EmpProfile from "./EmpProfile";
import EmpSalary from "./EmpSalary";
import EmployeeHolidayCalendar from "./EmployeeHolidayCalendar";
import ReportingManager from "./ReportingManager";
import EmpLeaveManagement from "./EmpLeaveManagement";
import { FaRupeeSign } from "react-icons/fa";
import "./EmpDashboard.css";

export default class EmpDashboard extends Component {
  state = {
    activePage: "dashboard",
    showChangePassword: false,
    sidebarOpen: true,

    showNewPassword: false,
    showConfirmPassword: false,

    password: "",
    confirmPassword: "",
    message: "",
    logout: false,
    leaveBalance: [], // Store leave balance data
  };

  componentDidMount() {
    this.fetchLeaveBalance();
  }

  fetchLeaveBalance = async () => {
    try {
      const response = await fetch(`/api/leave-status/my-balance`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        this.setState({ leaveBalance: data });
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
    }
  };

  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  toggleMenu = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  toggleSidebar = () => {
    this.setState({ sidebarOpen: !this.state.sidebarOpen });
  };

  handleNavigation = (page) => {
    this.setState({ activePage: page, sidebarOpen: false });
  };

  logout = () => {
    fetch("/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => this.setState({ logout: true }));
  };

  submitPassword = () => {
    const { password, confirmPassword } = this.state;

    if (!password) {
      alert("New password is required");
      return;
    }

    if (!this.passwordRegex.test(password)) {
      alert("Password must be 8+ chars with uppercase, lowercase, number & special character");
      return;
    }

    if (!confirmPassword) {
      alert("Confirm password is required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    fetch("/password", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(() =>
        this.setState({
          message: "✓ Password changed successfully",
          showChangePassword: false,
          password: "",
          confirmPassword: "",
          newPasswordError: "",
          confirmPasswordError: "",
        })
      )
      .catch(() =>
        this.setState({ message: "✗ Failed to update password" })
      );
  };

  renderContent() {
    switch (this.state.activePage) {
      case "profile":
        return <EmpProfile />;
      case "salary":
        return <EmpSalary />;
      case "empleavemanagement":
        return <EmpLeaveManagement />;
      case "EmployeeHolidayCalendar":
        return <EmployeeHolidayCalendar />;
      case "reportingmanager":
        return <ReportingManager />;
      default:
        return this.renderDashboardHome();
    }
  }

  renderDashboardHome() {
    const { leaveBalance } = this.state;
    
    // Filter out LOP (Leave Without Pay) from display
    const visibleLeaves = leaveBalance.filter(leave => leave.leaveName !== 'LOP');
    
    return (
      <div className="dashboard-home">
        <div className="welcome-card">
          <h2>Welcome Back!</h2>
          <p>Here's your dashboard overview</p>
        </div>

        {/* Leave Balance Cards */}
        <div className="stats-grid">
          {visibleLeaves.map((leave) => (
            <div key={leave.leaveId} className="stat-card">
              <div className="stat-header">
                <h3>{leave.leaveName}</h3>
                <div className="leave-progress">
                  <div 
                    className="progress-bar"
                    style={{
                      width: `${(leave.availedDays / leave.totalLeave) * 100}%`,
                      backgroundColor: leave.leaveName === 'SL' ? '#ff6b6b' : '#4ecdc4'
                    }}
                  />
                </div>
              </div>
              <div className="stat-numbers">
                <div className="stat-item">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{leave.totalLeave}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Used</span>
                  <span className="stat-value">{leave.availedDays}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Balance</span>
                  <span className="stat-value highlight">{leave.remainingDays}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button 
              className="action-btn"
              onClick={() => this.handleNavigation("empleavemanagement")}
            >
              <FiClock size={24} />
              <span>Apply Leave</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => this.handleNavigation("salary")}
            >
              <FaRupeeSign size={24} />
              <span>View Payslip</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => this.handleNavigation("EmployeeHolidayCalendar")}
            >
              <FiCalendar size={24} />
              <span>Holiday Calendar</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => this.handleNavigation("reportingmanager")}
            >
              <FiUsers size={24} />
              <span>Reporting Manager</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.logout) return <Navigate to="/" replace />;

    const menuItems = [
      { key: "dashboard", label: "Dashboard", icon: <FiHome /> },
      { key: "profile", label: "My Profile", icon: <FiUser /> },
      { key: "salary", label: "Salary", icon: <FaRupeeSign /> },
      { key: "empleavemanagement", label: "Leave Management", icon: <FiClock /> },
      { key: "EmployeeHolidayCalendar", label: "Holiday Calendar", icon: <FiCalendar /> },
      { key: "reportingmanager", label: "Reporting Manager", icon: <FiUsers /> },
    ];

    return (
      <div className="emp-dashboard">
        {/* HEADER */}
        <header className="emp-header">
          <div className="header-left">
            {/* <button className="menu-toggle" onClick={this.toggleSidebar}>
              {this.state.sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button> */}
            <h3>HRMS PORTAL</h3>
          </div>

          <div className="header-profile-section">
            <div className="emp-profile-icon" onClick={this.toggleMenu}>
              <FiUser size={24} />
            </div>

            <button className="emp-logout-btn" onClick={this.logout}>
              <FiLogOut />
              <span className="logout-text">Logout</span>
            </button>

            {this.state.showMenu && (
              <div className="emp-profile-menu">
                <div
                  className="emp-menu-item"
                  onClick={() =>
                    this.setState({
                      showChangePassword: true,
                      showMenu: false,
                      message: "",
                    })
                  }
                >
                  <FiLock />
                  <span>Change Password</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* SIDEBAR OVERLAY */}
        {this.state.sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => this.setState({ sidebarOpen: false })}
          />
        )}

        {/* BODY */}
        <div className="emp-body">
          <aside
            className={`emp-sidebar ${
              this.state.sidebarOpen ? "open" : ""
            }`}
          >
            {/* <div className="sidebar-header">
              <h4>Navigation</h4>
            </div> */}
            {menuItems.map(({ key, label, icon }) => (
              <div
                key={key}
                className={`emp-side-item ${
                  this.state.activePage === key ? "active" : ""
                }`}
                onClick={() => this.handleNavigation(key)}
              >
                <span className="item-icon">{icon}</span>
                <span className="item-label">{label}</span>
              </div>
            ))}
          </aside>

          <main className="emp-content">{this.renderContent()}</main>
        </div>

        {/* FOOTER */}
        <footer className="emp-footer">
          <span>© 2026 VentureBiz - HR Management System</span>
        </footer>

        {/* CHANGE PASSWORD MODAL */}
        {this.state.showChangePassword && (
          <div className="emp-modal-overlay">
            <div className="emp-modal-box">
              <div className="modal-header">
                <h4>Change Password</h4>
                <button 
                  className="close-modal"
                  onClick={() =>
                    this.setState({
                      showChangePassword: false,
                      password: "",
                      confirmPassword: "",
                      message: "",
                      newPasswordError: "",
                      confirmPasswordError: "",
                    })
                  }
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="password-field">
                  <label>New Password</label>
                  
                  <div className="input-with-icon">
                    <input
                      type={this.state.showNewPassword ? "text" : "password"}
                      placeholder="Password must be 8+ chars with uppercase, lowercase, number & special character"
                      value={this.state.password}
                      maxLength={20}
                      onChange={(e) =>
                        this.setState({ password: e.target.value })
                      }
                    />
                    <button
                      className="toggle-visibility"
                      onClick={() =>
                        this.setState({
                          showNewPassword: !this.state.showNewPassword,
                        })
                      }
                    >
                      {this.state.showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                   
                  </div>
                  
                  {/* <div className="password-hint">
                    Must contain uppercase, lowercase, number & special character
                  </div> */}
                </div>
                <div className="password-field">
                  <label>Confirm Password</label>
                  <div className="input-with-icon">
                    <input
                      type={this.state.showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={this.state.confirmPassword}
                      maxLength={20}
                      onChange={(e) =>
                        this.setState({ confirmPassword: e.target.value })
                      }
                    />
                    <button
                    
                      className="toggle-visibility"
                      onClick={() =>
                        this.setState({
                          showConfirmPassword: !this.state.showConfirmPassword,
                        })
                      }
                    >
                      {this.state.showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-primary"
                  onClick={this.submitPassword}
                >
                  Update Password
                </button>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    this.setState({
                      showChangePassword: false,
                      password: "",
                      confirmPassword: "",
                      message: "",
                      newPasswordError: "",
                      confirmPasswordError: "",
                    })
                  }
                >
                  Cancel
                </button>
              </div>

              {this.state.message && (
                <p className={`message-text ${
                  this.state.message.includes("✓") ? "success" : "error"
                }`}>
                  {this.state.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}