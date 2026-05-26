import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiHome, FiFileText, FiList, FiPlusCircle, FiLogOut, FiUser, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button onClick={toggleMobileMenu} className="mobile-menu-toggle">
          <FiMenu />
        </button>
        <h2>Workflow System</h2>
        <button onClick={toggleTheme} className="theme-toggle-mobile" title={isDark ? 'Light Mode' : 'Dark Mode'}>
          {isDark ? <FiSun /> : <FiMoon />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Workflow System</h2>
          <div className="sidebar-header-actions">
            <button onClick={toggleTheme} className="theme-toggle-sidebar" title={isDark ? 'Light Mode' : 'Dark Mode'}>
              {isDark ? <FiSun /> : <FiMoon />}
            </button>
            <button onClick={closeMobileMenu} className="mobile-menu-toggle">
              <FiX />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={closeMobileMenu}>
            <FiHome /> Dashboard
          </Link>

          <Link to="/my-requests" className={`nav-item ${isActive('/my-requests') ? 'active' : ''}`} onClick={closeMobileMenu}>
            <FiFileText /> My Requests
          </Link>

          {(user?.role === 'Manager' || user?.role === 'Admin') && (
            <Link to="/all-requests" className={`nav-item ${isActive('/all-requests') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <FiList /> All Requests
            </Link>
          )}

          {/* Only Users can create requests */}
          {user?.role === 'User' && (
            <Link to="/create-request" className={`nav-item ${isActive('/create-request') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <FiPlusCircle /> Create Request
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <FiUser />
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-danger btn-logout">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
