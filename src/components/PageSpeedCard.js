import React, { useState, useEffect } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../config';

function PageSpeedCard({ domain }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!domain) return;
    fetchPageSpeed();
  }, [domain]);

  const fetchPageSpeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pagespeed/${domain}`);
      if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Server Error: ${res.status} ${errText}`);
      }
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("PageSpeed Fetch Error:", err);
      setError("Could not load PageSpeed data");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--success-text)';
    if (score >= 50) return 'var(--warning-post)';
    return 'var(--danger-text)';
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <Zap className="section-icon" size={20} />
        <h3 className="section-heading">PageSpeed Insights (Mobile)</h3>
      </div>

      {loading ? (
        <div className="loading-state">
            <div className="spinner"></div>
            <span>Analyzing Performance...</span>
        </div>
      ) : error ? (
        <div className="error-state">
            <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
            {error}
            <button className="retry-btn" onClick={fetchPageSpeed}>Retry</button>
        </div>
      ) : metrics ? (
        <div className="pagespeed-grid">
            <div className="score-circle-container">
                <div
                    className="score-circle"
                    style={{
                        background: `conic-gradient(${getScoreColor(metrics.score)} ${metrics.score * 3.6}deg, var(--bg-card-secondary) 0deg)`
                    }}
                >
                    <div className="score-inner">
                        <span className="score-value">{Math.round(metrics.score)}</span>
                    </div>
                </div>
                <span className="score-label">Performance Score</span>
            </div>

            <div className="metrics-list">
                <div className="metric-item">
                    <span className="metric-label">First Contentful Paint</span>
                    <span className="metric-value">{metrics.fcp}</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Largest Contentful Paint</span>
                    <span className="metric-value">{metrics.lcp}</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Cumulative Layout Shift</span>
                    <span className="metric-value">{metrics.cls}</span>
                </div>
                 <div className="metric-item">
                    <span className="metric-label">Speed Index</span>
                    <span className="metric-value">{metrics.speedIndex}</span>
                </div>
            </div>
        </div>
      ) : null}
    </div>
  );
}

export default PageSpeedCard;
