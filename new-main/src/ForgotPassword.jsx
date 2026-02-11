import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import Header from './components/Header';
import './ForgotPassword.css';

export default class ForgotPassword extends Component {
  state = {
    username: '',
    email: '',
    message: '',
    redirect: false,
    usernameError: ''
  };

  handleChange = (e) => {
    const { name, value } = e.target;

    /* ✅ EMPLOYEE ID VALIDATION ONLY */
    if (name === 'username') {
      const v = value.toUpperCase().slice(0, 8); // max 8 chars

      this.setState({
        username: v,
        usernameError:
          v.length === 0
            ? ''
            : /^VPPL\d{3,4}$/.test(v)
            ? ''
            : 'Employee ID must be VPPL001 or VPPL0001'
      });
      return;
    }

    // existing behavior untouched
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Block submit if Employee ID invalid
    if (this.state.usernameError) return;

    fetch('http://localhost:8080/forget-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.state.username,
        email: this.state.email
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();

        this.setState({
          message: 'Please check your registered email. We sent a new password.'
        });

        setTimeout(() => {
          this.setState({ redirect: true });
        }, 3000);
      })
      .catch(() => {
        this.setState({
          message: 'Employee ID and Registered Email do not match'
        });
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
              <h2>Forgot Password</h2>

              {/* Employee ID */}
              <label className="login-label">
                Employee ID <span className="required-star">*</span>
              </label>
              <input
                name="username"
                placeholder="VPPL001 or VPPL0001"
                value={this.state.username}
                onChange={this.handleChange}
                className="login-input"
                required
              />

              {this.state.usernameError && (
                <small className="error-message">
                  {this.state.usernameError}
                </small>
              )}

              {/* Registered Email */}
              <label className="login-label">Registered Email ID</label>
              <input
                type="email"
                name="email"
                placeholder="Enter Registered Email ID"
                value={this.state.email}
                onChange={this.handleChange}
                className="login-input"
                required
              />

              <button className="login-button">Submit</button>

              {this.state.message && (
                <div
                  className={`error-message ${
                    this.state.message.includes('check')
                      ? 'success'
                      : ''
                  }`}
                >
                  {this.state.message}
                </div>
              )}
            </form>
          </div>
        </div>

        <footer className="login-footer">
          © 2026 Venturebiz Promotions Private Limited. All rights reserved.
        </footer>
      </div>
    );
  }
}
