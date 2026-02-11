import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from './components/Header';
import './Login.css';

export default class SetPassword extends Component {
  state = {
    oldpassword: '',
    newPassword: '',
    confirmPassword: '',
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    message: '',
    redirect: false
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  
  toggleConfirmPassword = () => {
    this.setState(prev => ({ showConfirmPassword: !prev.showConfirmPassword }));
  };

  handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation
    if (this.state.newPassword !== this.state.confirmPassword) {
      this.setState({ message: 'Passwords do not match' });
      return;
    }

    fetch('http://localhost:8080/set', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        oldpassword: this.state.oldpassword, // ✅ REQUIRED
        password: this.state.newPassword     // ✅ REQUIRED
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(msg => {
        // ✅ CLEAR SESSION
        sessionStorage.clear();
        localStorage.clear();

        this.setState({ message: msg });

        setTimeout(() => {
          this.setState({ redirect: true });
        }, 2000);
      })
      .catch(() => {
        this.setState({ message: 'Password reset failed' });
      });
  };

  render() {
    if (this.state.redirect) {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="login-page">
        <Header />

        <div className="login-main">
          <div className="login-right">
            <form className="login-box" onSubmit={this.handleSubmit}>
              <h2>Set New Password</h2>

              {/* TEMP PASSWORD */}
              <label className="login-label">Old Password</label>
              <div className="password-wrapper">
                <input
                  type={this.state.showOldPassword ? 'text' : 'password'}
                  name="oldpassword"
                  placeholder="Enter Old Password"
                  value={this.state.oldpassword}
                  onChange={this.handleChange}
                  className="login-input password-input"
                  required
                />
               
              </div>

              {/* NEW PASSWORD */}
              <label className="login-label">New Password</label>
              <div className="password-wrapper">
                <input
                  type={this.state.showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Enter New Password"
                  value={this.state.newPassword}
                  onChange={this.handleChange}
                  className="login-input password-input"
                  required
                />
                
              </div>

              {/* CONFIRM PASSWORD */}
              <label className="login-label">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={this.state.showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={this.state.confirmPassword}
                  onChange={this.handleChange}
                  className="login-input password-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={this.toggleConfirmPassword}
                >
                  {this.state.showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button className="login-button">
                Update Password
              </button>

              {this.state.message && (
                <p
                  style={{
                    marginTop: '12px',
                    color: this.state.message.toLowerCase().includes('success')
                      ? 'green'
                      : 'red'
                  }}
                >
                  {this.state.message}
                </p>
              )}
            </form>
          </div>
        </div>

        <footer className="login-footer">
          © 2026 Venturebiz Promotions Private Limited
        </footer>
      </div>
    );
  }
}
