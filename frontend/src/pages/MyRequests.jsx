import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiList, FiPlus } from 'react-icons/fi';
import './MyRequests.css';

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('created_desc'); // Sort option

  useEffect(() => {
    fetchRequests();
  }, [page, sortBy]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/requests/my-requests?page=${page}&limit=10&sort=${sortBy}`);
      setRequests(response.data.data || []);
      setTotalPages(response.data.pages || 1);
      
      console.log('My Requests - Total Pages:', response.data.pages);
      console.log('My Requests - Current Page:', page);
      console.log('My Requests - Data:', response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
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
    <div className="my-requests">
      <div className="page-header">
        <h1>My Requests</h1>
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
          {/* Only Users can create requests */}
          {user?.role === 'User' && (
            <Link to="/create-request" className="btn btn-primary">
              <FiPlus /> Create New Request
            </Link>
          )}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>You haven't created any requests yet</p>
            {/* Only Users can create requests */}
            {user?.role === 'User' && (
              <Link to="/create-request" className="btn btn-primary">
                <FiPlus /> Create Your First Request
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            {viewMode === 'list' ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>#{request.id}</td>
                        <td>{request.title}</td>
                        <td>{request.category}</td>
                        <td>{getPriorityBadge(request.priority)}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/requests/${request.id}`} className="btn btn-outline btn-sm">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid-container">
                {requests.map((request) => (
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
          </div>

          {/* Pagination - Always show */}
          <div className="pagination">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages} ({requests.length} items)
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyRequests;
