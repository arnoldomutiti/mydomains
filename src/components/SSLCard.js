import React, { useState, useEffect } from 'react';
import { Lock, Shield, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../config';

function SSLCard({ domain }) {
  const [sslInfo, setSSLInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!domain) return;
    fetchSSL();
  }, [domain]);

  const fetchSSL = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ssl/${domain}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || 'Failed to check SSL');
      }

      setSSLInfo(data);
    } catch (err) {
      console.error("SSL Fetch Error:", err);
      setError(err.message || "Could not load SSL data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <Lock className="section-icon" size={20} />
        <h3 className="section-heading">SSL Certificate</h3>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Checking SSL Certificate...</span>
        </div>
      ) : error ? (
        <div className="error-state">
          <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
          {error}
          <button className="retry-btn" onClick={fetchSSL}>Retry</button>
        </div>
      ) : sslInfo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: sslInfo.valid ? 'var(--success-bg)' : 'var(--danger-bg)',
            borderRadius: 'var(--radius-md)'
          }}>
            {sslInfo.valid ? (
              <Shield size={24} style={{ color: 'var(--success-text)' }} />
            ) : (
              <AlertCircle size={24} style={{ color: 'var(--danger-text)' }} />
            )}
            <div>
              <div style={{
                fontWeight: 600,
                color: sslInfo.valid ? 'var(--success-text)' : 'var(--danger-text)'
              }}>
                {sslInfo.valid ? 'Valid Certificate' : 'Invalid Certificate'}
              </div>
              {sslInfo.valid && (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {sslInfo.daysRemaining} days remaining
                </div>
              )}
            </div>
          </div>

          <div className="detail-row">
            <span className="detail-label">Issuer:</span>
            <span className="detail-value">{sslInfo.issuer}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Valid From:</span>
            <span className="detail-value">{new Date(sslInfo.validFrom).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Valid To:</span>
            <span className="detail-value">{new Date(sslInfo.validTo).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Subject:</span>
            <span className="detail-value">{sslInfo.subject}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SSLCard;
