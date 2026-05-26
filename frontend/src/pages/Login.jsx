import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiShield, FiSettings, FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Determine login type from URL
  const loginType = location.pathname.replace('/login/', '') || 'user';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const getLoginConfig = () => {
    switch(loginType) {
      case 'manager':
        return {
          title: 'Manager Login',
          subtitle: 'Manage and approve workflow requests',
          icon: <FiShield size={64} />,
          bgColor: '#667eea',
          accentColor: '#5a67d8',
          demoEmail: 'manager@example.com',
          roleLabel: 'Manager'
        };
      case 'admin':
        return {
          title: 'Admin Login',
          subtitle: 'Complete system administration access',
          icon: <FiSettings size={64} />,
          bgColor: '#14b8a6',
          accentColor: '#0d9488',
          demoEmail: 'admin@example.com',
          roleLabel: 'Administrator'
        };
      default:
        return {
          title: 'User Login',
          subtitle: 'Submit and track your workflow requests',
          icon: <FiUser size={64} />,
          bgColor: '#4facfe',
          accentColor: '#3b82f6',
          demoEmail: 'user@example.com',
          roleLabel: 'User'
        };
    }
  };

  const config = getLoginConfig();

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-left" style={{ backgroundColor: config.bgColor }}>
        <div className="login-branding">
          <div className="brand-icon" style={{ color: 'white' }}>
            {config.icon}
          </div>
          <h1>Workflow System</h1>
          <p className="brand-subtitle">{config.subtitle}</p>
          
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-check">✓</div>
              <span>Secure Authentication</span>
            </div>
            <div className="feature-item">
              <div className="feature-check">✓</div>
              <span>Real-time Updates</span>
            </div>
            <div className="feature-item">
              <div className="feature-check">✓</div>
              <span>Role-based Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Welcome Back!</h2>
            <p>Sign in to your {config.roleLabel} account</p>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            <button
              className={`role-tab ${loginType === 'user' ? 'active' : ''}`}
              onClick={() => navigate('/login/user')}
              style={loginType === 'user' ? { borderBottomColor: config.bgColor, color: config.bgColor } : {}}
            >
              <FiUser /> User
            </button>
            <button
              className={`role-tab ${loginType === 'manager' ? 'active' : ''}`}
              onClick={() => navigate('/login/manager')}
              style={loginType === 'manager' ? { borderBottomColor: config.bgColor, color: config.bgColor } : {}}
            >
              <FiShield /> Manager
            </button>
            <button
              className={`role-tab ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => navigate('/login/admin')}
              style={loginType === 'admin' ? { borderBottomColor: config.bgColor, color: config.bgColor } : {}}
            >
              <FiSettings /> Admin
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-login" 
              disabled={loading}
              style={{ backgroundColor: config.bgColor }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="demo-credentials">
            <p className="demo-label">Demo Credentials:</p>
            <div className="demo-info" style={{ backgroundColor: `${config.bgColor}15`, borderLeft: `3px solid ${config.bgColor}` }}>
              <strong>{config.demoEmail}</strong>
              <span>password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
