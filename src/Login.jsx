//import api from "./api";
import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import Header from './components/Header';
import loginBg from './assets/login-bg.jpeg';

//console.log("/api"); // should print http://localhost:8080



export default class Login extends Component {
  state = {
    username: '',
    password: '',
    showPassword: false,
    redirectTo: null,
    error: '',
    usernameError: ''
  };

  /* ================= INPUT HANDLER ================= */
  handleChange = (e) => {
    const { name, value } = e.target;

    /* -------- EMPLOYEE ID -------- */
    if (name === 'username') {
      const upperValue = value.toUpperCase();

      // max length safeguard (VPPL0001 = 8)
      if (upperValue.length > 8) return;

      let usernameError = '';

      if (upperValue.length >= 7 && !/^VPPL\d{3,4}$/.test(upperValue)) {
        usernameError = 'Format must be VPPL001 or VPPL0001';
      }

      this.setState({
        username: upperValue,
        usernameError
      });
      return;
    }

    /* -------- PASSWORD (NO VALIDATION) -------- */
    if (name === 'password') {
      this.setState({ password: value });
    }
  };

  togglePassword = () => {
    this.setState(prev => ({ showPassword: !prev.showPassword }));
  };

  /* ================= LOGIN ================= */
  handleLogin = (e) => {
    e.preventDefault();
    this.setState({ error: '' });

    const { username, password, usernameError } = this.state;

    if (!username) {
      this.setState({ error: 'Employee ID is required' });
      return;
    }

    if (!password) {
      this.setState({ error: 'Password is required' });
      return;
    }

    if (usernameError) return;

    if (!/^VPPL\d{3,4}$/.test(username)) {
      this.setState({
        error: 'Employee ID format must be VPPL001 or VPPL0001'
      });
      return;
    }

  fetch(`/api/user/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
})
      .then(res => {
        if (!res.ok) throw new Error('Invalid username or password');
        return res.json();
      })
      .then(result => {
        const msg = result.message || '';

        if (msg.includes('status : 0')) {
          sessionStorage.clear();
          localStorage.clear();
          this.setState({ redirectTo: '/set-password' });
          return;
        }

        if (msg.startsWith('1')) {
          sessionStorage.setItem('loggedIn', 'true');
          sessionStorage.setItem('role', 'HR');
          this.setState({ redirectTo: '/hr-dashboard' });
          return;
        }

        if (msg.startsWith('2')) {
          sessionStorage.setItem('loggedIn', 'true');
          sessionStorage.setItem('role', 'EMP');
          this.setState({ redirectTo: '/emp-dashboard' });
          return;
        }

        this.setState({ error: 'Invalid username or password' });
      })
      .catch(err => this.setState({ error: err.message }));
  };

  render() {
    if (this.state.redirectTo) {
      return <Navigate to={this.state.redirectTo} replace />;
    }

    return (
      <div className="login-page">
        <Header />

        <div
          className="login-main"
          style={{ backgroundImage: `url(${loginBg})` }}
        >
          <div className="login-left" />

          <div className="login-right">
            <form className="login-box" onSubmit={this.handleLogin}>
              <h2>Login</h2>
              <p className="login-subtitle">
                Enter your credentials to access your account
              </p>

              <label className="login-label">
                Employee ID <span className="required-star">*</span>
              </label>
              <input
                name="username"
                value={this.state.username}
                onChange={this.handleChange}
                className="login-input"
                placeholder="VPPL001 or VPPL0001"
                required
              />
              {this.state.usernameError && (
                <small className="error-message">
                  {this.state.usernameError}
                </small>
              )}

              <label className="login-label">
                Password <span className="required-star">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={this.state.showPassword ? 'text' : 'password'}
                  name="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  className="login-input password-input"
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={this.togglePassword}
                  tabIndex={-1}
                >
                  {this.state.showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button className="login-button">Login</button>

              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>

              {this.state.error && (
                <div className="error-message">{this.state.error}</div>
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

