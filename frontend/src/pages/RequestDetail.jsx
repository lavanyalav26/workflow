import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { FiArrowLeft, FiUser, FiCalendar, FiTag } from 'react-icons/fi';
import './RequestDetail.css';

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [logs, setLogs] = useState([]);
  const [allowedTransitions, setAllowedTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRequestDetails();
    fetchRequestLogs();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const response = await axios.get(`/api/requests/${id}`);
      setRequest(response.data.data);
      setAllowedTransitions(response.data.allowedTransitions || []);
    } catch (error) {
      console.error('Error fetching request:', error);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestLogs = async () => {
    try {
      const response = await axios.get(`/api/requests/${id}/logs`);
      setLogs(response.data.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.patch(`/api/requests/${id}/status`, {
        status: newStatus,
        comment: comment || undefined
      });

      setSuccess(`Status changed to ${newStatus} successfully`);
      setComment('');
      
      // Refresh data
      await fetchRequestDetails();
      await fetchRequestLogs();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace(' ', '-');
    return <span className={`badge badge-${statusClass}`}>{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    return <span className={`badge badge-${priority.toLowerCase()}`}>{priority}</span>;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': '#3b82f6',
      'Approved': '#10b981',
      'Rejected': '#ef4444',
      'Needs Clarification': '#f59e0b',
      'Closed': '#6b7280',
      'Reopened': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="card">
        <div className="alert alert-error">Request not found</div>
      </div>
    );
  }

  return (
    <div className="request-detail">
      <button onClick={() => navigate(-1)} className="btn btn-outline back-btn">
        <FiArrowLeft /> Back
      </button>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card">
            <div className="request-header">
              <div>
                <h1>{request.title}</h1>
                <div className="request-meta">
                  <span><FiUser /> {request.user_name || 'Unknown'}</span>
                  <span><FiCalendar /> {new Date(request.created_at).toLocaleString()}</span>
                  <span><FiTag /> {request.category}</span>
                </div>
              </div>
              <div className="request-badges">
                {getStatusBadge(request.status)}
                {getPriorityBadge(request.priority)}
              </div>
            </div>

            <div className="request-description">
              <h3>Description</h3>
              <p>{request.description}</p>
            </div>
          </div>

          {/* Action Logs Timeline */}
          <div className="card">
            <h2 className="card-header">Activity Timeline</h2>
            <div className="timeline">
              {logs.map((log, index) => (
                <div key={log.id} className="timeline-item">
                  <div 
                    className="timeline-marker" 
                    style={{ backgroundColor: getStatusColor(log.new_status) }}
                  />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-status">
                        {log.old_status ? `${log.old_status} → ` : ''}
                        <strong>{log.new_status}</strong>
                      </span>
                      <span className="timeline-date">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="timeline-body">
                      <p>
                        <strong>{log.changed_by_name || 'System'}</strong> ({log.role})
                      </p>
                      {log.comment && (
                        <p className="timeline-comment">{log.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="detail-sidebar">
          <div className="card">
            <h3 className="card-header">Actions</h3>
            
            {allowedTransitions.length > 0 ? (
              <>
                <div className="form-group">
                  <label className="form-label">Comment (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-textarea"
                    placeholder="Add a comment about this action..."
                    rows={3}
                  />
                </div>

                <div className="action-buttons">
                  {allowedTransitions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={actionLoading}
                      className={`btn btn-block ${
                        status === 'Approved' ? 'btn-success' :
                        status === 'Rejected' ? 'btn-danger' :
                        status === 'Closed' ? 'btn-secondary' :
                        'btn-warning'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-actions">No actions available for this request</p>
            )}
          </div>

          <div className="card">
            <h3 className="card-header">Request Info</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Request ID</span>
                <span className="info-value">#{request.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Category</span>
                <span className="info-value">{request.category}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Priority</span>
                <span className="info-value">{getPriorityBadge(request.priority)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value">{getStatusBadge(request.status)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created</span>
                <span className="info-value">
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated</span>
                <span className="info-value">
                  {new Date(request.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
