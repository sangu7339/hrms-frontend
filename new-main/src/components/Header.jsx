import React from 'react';
import './Header.css';
import logo from '../assets/venturebiz_logo.png';

const Header = ({ title = 'Venturebiz Promotions Pvt. Ltd.' }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <img src={logo} alt="Venturebiz Logo" className="header-logo" />
        <h1 className="header-title">{title}</h1>
      </div>
    </header>
  );
};

export default Header;
