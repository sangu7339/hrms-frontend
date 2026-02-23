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
      // min/max length safeguard (6-15)
      if (upperValue.length > 15) return;

      let usernameError = '';
      // Check min length
      if (upperValue.length > 0 && upperValue.length < 6) {
        usernameError = 'Employee ID must be at least 6 characters';
      } else if (upperValue.length > 15) {
        usernameError = 'Employee ID must be at most 15 characters';
      } else if (upperValue && !/^VPPL\d{2,13}$/.test(upperValue)) {
        usernameError = 'Allowed: VPPL followed by numbers (6-15 chars)';
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
 
    if (!/^VPPL\d{2,13}$/.test(username)) {
      alert('Invalid Employee ID or Password');
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
      .then(async result => {
        await fetch("/api/hr/holidaylocation", {
    credentials: "include"
  }).catch(() => {});
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
 
        alert('Invalid Employee ID or Password');
        this.setState({ error: 'Invalid Employee ID or Password' });
      })
      .catch(err => {
        alert('Invalid Employee ID or Password');
        this.setState({ error: 'Invalid Employee ID or Password' });
      });
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
  className={`login-input ${this.state.usernameError ? "input-error" : ""}`}
  placeholder="VPPL001"
  required
/>

{this.state.usernameError && (
  <div className="field-error" style={{ color: 'rgb(214, 19, 16)' }}>
    {this.state.usernameError}
  </div>
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