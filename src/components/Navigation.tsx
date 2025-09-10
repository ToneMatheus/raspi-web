import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeCollapse = () => {
    setIsCollapsed(true);
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={closeCollapse}>
          Raspi-Web
        </Link>

        {/* Search bar */}
        <form className="d-flex mx-auto" style={{ flex: 1, maxWidth: "500px" }}>
          <input 
            className="form-control me-2" 
            type="search" 
            placeholder="What do you want to play?" 
            aria-label="Search"
          />
          <button className="btn btn-outline-light" type="submit">Search</button>
        </form>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
                onClick={closeCollapse}
              >
                Wedding Page
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/spotai' ? 'active' : ''}`} 
                to="/spotai"
                onClick={closeCollapse}
              >
                SpotAI
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} 
                to="/about"
                onClick={closeCollapse}
              >
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
