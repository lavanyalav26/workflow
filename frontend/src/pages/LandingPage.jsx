import { useNavigate } from 'react-router-dom';
import { FiUser, FiShield, FiSettings, FiCheckCircle } from 'react-icons/fi';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      type: 'user',
      title: 'User Portal',
      description: 'Submit and track your requests',
      icon: <FiUser size={48} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      features: [
        'Create new requests',
        'Track request status',
        'View request history',
        'Receive notifications'
      ]
    },
    {
      type: 'manager',
      title: 'Manager Portal',
      description: 'Review and approve requests',
      icon: <FiShield size={48} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      features: [
        'Review all requests',
        'Approve or reject',
        'Request clarifications',
        'Advanced filtering'
      ]
    },
    {
      type: 'admin',
      title: 'Admin Portal',
      description: 'Full system administration',
      icon: <FiSettings size={48} />,
      gradient: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
      features: [
        'Complete system access',
        'Close requests',
        'Reopen requests',
        'User management'
      ]
    }
  ];

  return (
    <div className="landing-page">
      <div className="landing-header">
        <h1>Workflow Management System</h1>
        <p>Choose your portal to get started</p>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <div key={role.type} className="role-card">
            <div className="role-card-header" style={{ background: role.gradient }}>
              <div className="role-icon">{role.icon}</div>
              <h2>{role.title}</h2>
              <p>{role.description}</p>
            </div>
            
            <div className="role-card-body">
              <ul className="features-list">
                {role.features.map((feature, index) => (
                  <li key={index}>
                    <FiCheckCircle /> {feature}
                  </li>
                ))}
              </ul>
              
              <button
                className="btn btn-primary btn-block"
                onClick={() => navigate(`/login/${role.type}`)}
              >
                Login as {role.title.split(' ')[0]}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="landing-footer">
        <p>© 2026 Workflow Management System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
