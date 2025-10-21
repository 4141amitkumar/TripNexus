import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="container">
        <div className="logo">
          <Link to="/find-trip">✈️ TripNexus</Link>
        </div>
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/find-trip">Find a Trip</NavLink></li>
            <li><NavLink to="/my-bookings">My Bookings</NavLink></li>
            <li><Link to="/" className="nav-button">Logout</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

