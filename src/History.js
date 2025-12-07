import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './History.css';

const LOGS_API_URL = process.env.REACT_APP_LOGS_API_URL || 'http://localhost:3002';

function History() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchHistory(true);
    fetchStats();
  }, [page]);

  // Poll history and stats every 2 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHistory();
      fetchStats();
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [page]);

  const fetchHistory = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch(`${LOGS_API_URL}/api/history?page=${page}&limit=50`);
      const data = await response.json();
      setHistory(data.data);
      setPagination(data.pagination);
      if (showLoading) setLoading(false);
    } catch (error) {
      console.error('Error fetching history:', error);
      if (showLoading) setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${LOGS_API_URL}/api/history/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all history? This cannot be undone!')) {
      return;
    }

    try {
      await fetch(`${LOGS_API_URL}/api/history`, {
        method: 'DELETE',
      });
      fetchHistory(true);
      fetchStats();
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getActionIcon = (action) => {
    return action === 'increase' ? '⬆️' : '⬇️';
  };

  const getActionClass = (action) => {
    return action === 'increase' ? 'increase' : 'decrease';
  };

  const getReasonLabel = (reason) => {
    const labels = {
      'manual_click': 'Manual Click',
      'auto_click': 'Auto Click',
      'purchase_upgrade': 'Purchase Upgrade'
    };
    return labels[reason] || reason;
  };

  if (loading && history.length === 0) {
    return (
      <div className="History">
        <div className="history-header">
          <h1>📜 Click History</h1>
          <Link to="/" className="btn-back">← Back to Clicker</Link>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="History">
      <div className="history-header">
        <h1>📜 Click History</h1>
        <div className="header-actions">
          <button onClick={clearHistory} className="btn-clear">Clear History</button>
          <Link to="/" className="btn-back">← Back to Clicker</Link>
        </div>
      </div>

      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-label">Total Events</div>
            <div className="stat-value">{stats.totalEvents}</div>
          </div>
          <div className="stat-card increase">
            <div className="stat-label">Increases</div>
            <div className="stat-value">{stats.totalIncreases}</div>
          </div>
          <div className="stat-card decrease">
            <div className="stat-label">Decreases</div>
            <div className="stat-value">{stats.totalDecreases}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Net Change</div>
            <div className="stat-value">{stats.totalValueChange}</div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Amount</th>
              <th>Old Value</th>
              <th>New Value</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No history found. Start clicking!</td>
              </tr>
            ) : (
              history.map((event) => (
                <tr key={event.id}>
                  <td className="time-cell">{formatDate(event.createdAt)}</td>
                  <td className={`action-cell ${getActionClass(event.action)}`}>
                    {getActionIcon(event.action)} {event.action}
                  </td>
                  <td className={`amount-cell ${getActionClass(event.action)}`}>
                    {event.action === 'increase' ? '+' : '-'}{event.amount}
                  </td>
                  <td>{event.oldValue}</td>
                  <td>{event.newValue}</td>
                  <td className="reason-cell">{getReasonLabel(event.reason)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn-page"
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
            className="btn-page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default History;
