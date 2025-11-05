import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { canAccess } = useAuth();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeCollapse = () => {
    setIsCollapsed(true);
  };

  return (
    <nav className={`navbar navbar-expand-md navbar-dark ${styles.customNavbar}`}>
      <div className="container-fluid px-md-5" style={{ maxWidth: '66.6667%', margin: '0 auto' }}>
        <Link className={styles.navbarTitle} to="/" onClick={closeCollapse}>
          TONYDEV
        </Link>

        {/* Search bar */}
        {location.pathname === "/spotai" && (
          <form className="d-flex mx-auto" style={{ flex: 1, maxWidth: "500px" }}>
            <input 
              className="form-control me-2" 
              type="search" 
              placeholder="What do you want to play?" 
              aria-label="Search"
            />
            <button className="btn btn-outline-light" type="submit">Search</button>
          </form>
        )}
        
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
          <ul className={`navbar-nav ms-auto ${styles.workSans}`}>
              <li className="nav-item">
              {canAccess("reader") &&<Link 
                className={`${styles.navLink} nav-link ${location.pathname === '/reader' ? 'active' : ''}`} 
                to="/reader"
                onClick={closeCollapse}
              >
                Readers Page
              </Link>}
            </li>
            <li className="nav-item">
              <Link 
                className={`${styles.navLink} nav-link ${location.pathname === '/spending' ? 'active' : ''}`} 
                to="/spending"
                onClick={closeCollapse}
              >
                Spending Page
              </Link>
            </li>
            <li className="nav-item">
              {canAccess("wedding") &&<Link 
                className={`${styles.navLink} nav-link ${location.pathname === '/wedding' ? 'active' : ''}`} 
                to="/wedding"
                onClick={closeCollapse}
              >
                Wedding Page
              </Link>}
            </li>
            <li className="nav-item">
              {canAccess("spotai") &&<Link 
                className={`${styles.navLink} nav-link ${location.pathname === '/spotai' ? 'active' : ''}`} 
                to="/spotai"
                onClick={closeCollapse}
              >
                SpotAI
              </Link>}
            </li>
            {/* <li className="nav-item">
              <Link 
                className={`${styles.navLink} nav-link ${location.pathname === '/about' ? 'active' : ''}`} 
                to="/about"
                onClick={closeCollapse}
              >
                About
              </Link>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
};


export default Navigation;
