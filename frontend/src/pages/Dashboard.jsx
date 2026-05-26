import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { FiFileText, FiCheckCircle, FiXCircle, FiClock, FiGrid, FiList, FiPlus } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_desc');
  const limit = 5;

  useEffect(() => {
    fetchDashboardData();
  }, [page, sortBy]);

  const fetchDashboardData = async () => {
    try {
      const endpoint = user.role === 'User' ? '/api/requests/my-requests' : '/api/requests';
      const response = await axios.get(`${endpoint}?limit=${limit}&page=${page}&sort=${sortBy}`);
      
      setRecentRequests(response.data.data || []);
      setTotalPages(response.data.pages || 1);
      
      console.log('Dashboard data:', response.data); // Debug log
      console.log('Total pages:', response.data.pages); // Debug log
      
      // Calculate stats - fetch all for stats
      const allRequests = await axios.get(`${endpoint}?limit=1000`);
      const requests = allRequests.data.data || [];
      
      setStats({
        total: requests.length,
        submitted: requests.filter(r => r.status === 'Submitted').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        rejected: requests.filter(r => r.status === 'Rejected').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // Reset to first page
  };

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace(' ', '-');
    return <span className={`badge badge-${statusClass}`}>{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    return <span className={`badge badge-${priority.toLowerCase()}`}>{priority}</span>;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's what's happening with your requests</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
            <FiFileText color="#1e40af" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
            <FiClock color="#92400e" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.submitted}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5' }}>
            <FiCheckCircle color="#065f46" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2' }}>
            <FiXCircle color="#991b1b" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header-row">
          <h2 className="card-header">Recent Requests</h2>
          <div className="header-actions">
            <div className="sort-dropdown">
              <label className="sort-label">Sort By:</label>
              <select value={sortBy} onChange={handleSortChange} className="form-select sort-select">
                <option value="created_desc">Newest First</option>
                <option value="created_asc">Oldest First</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="priority_high">Priority (High to Low)</option>
                <option value="priority_low">Priority (Low to High)</option>
                <option value="status_asc">Status (A-Z)</option>
              </select>
            </div>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <FiList />
              </button>
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <FiGrid />
              </button>
            </div>
            <Link to="/my-requests" className="btn btn-outline">View All</Link>
          </div>
        </div>

        {recentRequests.length === 0 ? (
          <div className="empty-state">
            <p>No requests found</p>
            {/* Only Users can create requests */}
            {user?.role === 'User' && (
              <Link to="/create-request" className="btn btn-primary">
                <FiPlus /> Create Your First Request
              </Link>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.title}</td>
                    <td>{request.category}</td>
                    <td>{getPriorityBadge(request.priority)}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{new Date(request.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/requests/${request.id}`} className="btn btn-outline btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid-container">
            {recentRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-card-header">
                  <span className="request-id">#{request.id}</span>
                  <div className="request-badges-inline">
                    {getPriorityBadge(request.priority)}
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                <h3 className="request-title">{request.title}</h3>
                <div className="request-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{request.category}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Created:</span>
                    <span className="meta-value">{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link to={`/requests/${request.id}`} className="btn btn-primary btn-block btn-sm">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Always show pagination info for debugging */}
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn btn-outline"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages} ({recentRequests.length} items)
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
