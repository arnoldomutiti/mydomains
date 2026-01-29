
import React, { useState, useEffect } from 'react';
import { ExternalLink, Building2, User, Shield, Lock, ArrowLeft, Network, Moon, Sun, Globe, Search, Database, Clock, Zap, FileSearch, Bug, Plus, AlertCircle, Trash2, LayoutDashboard, Bell, Download, Filter, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import './App.css';

// --- External Tools Data ---
const EXTERNAL_TOOLS = [
  {
    name: "SSL Labs Test",
    desc: "Analyzes the SSL configuration of a server and grades it",
    url: "https://www.ssllabs.com/ssltest/",
    icon: Lock
  },
  {
    name: "Virus Total",
    desc: "Checks a URL against multiple antivirus engines",
    url: "https://www.virustotal.com",
    icon: Bug
  },
  {
    name: "Shodan",
    desc: "Search engine for Internet-connected devices",
    url: "https://www.shodan.io",
    icon: Search
  },
  {
    name: "Page Speed Insights",
    desc: "Checks performance, accessibility and SEO on mobile + desktop",
    url: "https://pagespeed.web.dev/",
    icon: Zap
  },
  {
    name: "Web Check",
    desc: "View literally everything about a website",
    url: "https://web-check.xyz",
    icon: Globe
  },
  {
    name: "Archive",
    desc: "View previous versions of a site via the Internet Archive",
    url: "https://archive.org",
    icon: Clock
  },
  {
    name: "URLScan",
    desc: "Scans a URL and provides information about the page",
    url: "https://urlscan.io",
    icon: FileSearch
  },
  {
    name: "Sucuri SiteCheck",
    desc: "Checks a URL against blacklists and known threats",
    url: "https://sitecheck.sucuri.net",
    icon: Shield
  }
];

// --- Export Utility Functions ---
const exportToCSV = (domains, showModal) => {
  if (!domains || domains.length === 0) {
    showModal('Export Failed', 'No domains to export', 'error');
    return;
  }

  // Prepare CSV data
  const headers = ['Domain Name', 'Status', 'Created Date', 'Expiry Date', 'Registrar'];
  const rows = domains.map(domain => [
    domain.name,
    domain.status,
    domain.created || domain.created_date || 'N/A',
    domain.expires || domain.expiry_date || 'N/A',
    domain.registrar || 'N/A'
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `domains-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToExcel = (domains, showModal) => {
  if (!domains || domains.length === 0) {
    showModal('Export Failed', 'No domains to export', 'error');
    return;
  }

  // Prepare data for Excel
  const data = domains.map(domain => ({
    'Domain Name': domain.name,
    'Status': domain.status,
    'Created Date': domain.created || domain.created_date || 'N/A',
    'Expiry Date': domain.expires || domain.expiry_date || 'N/A',
    'Registrar': domain.registrar || 'N/A',
    'Days Until Expiry': calculateDaysUntilExpiry(domain.expires || domain.expiry_date)
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Domains');

  // Auto-size columns
  const maxWidth = data.reduce((acc, row) => {
    Object.keys(row).forEach((key, i) => {
      const value = String(row[key]);
      acc[i] = Math.max(acc[i] || 10, value.length + 2, key.length + 2);
    });
    return acc;
  }, []);

  worksheet['!cols'] = maxWidth.map(w => ({ width: Math.min(w, 50) }));

  // Generate Excel file
  XLSX.writeFile(workbook, `domains-export-${new Date().toISOString().split('T')[0]}.xlsx`);
};

const calculateDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate || expiryDate === 'N/A') return 'N/A';

  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  return diffDays;
};

// --- Import Utility Functions ---
const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const domains = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    const domain = {
      name: values[0],
      registrar: values[1] || null
    };

    if (domain.name && domain.name.includes('.')) {
      domains.push(domain);
    }
  }

  return domains;
};

const parseExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const domains = jsonData.map(row => ({
          name: row['Domain Name'] || row['domain'] || row['Domain'] || '',
          registrar: row['Registrar'] || row['registrar'] || null
        })).filter(d => d.name && d.name.includes('.'));

        resolve(domains);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// --- Custom Modal Component ---
function CustomModal({ isOpen, onClose, title, message, type = 'info', onConfirm }) {
  if (!isOpen) return null;

  const isConfirm = type === 'confirm';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header modal-${type}`}>
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          {isConfirm ? (
            <>
              <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-primary" onClick={() => {
                onConfirm();
                onClose();
              }}>
                Confirm
              </button>
            </>
          ) : (
            <button className="modal-btn modal-btn-primary" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Initial Mock Data ---
const INITIAL_DOMAINS = [
  {
    id: 1,
    name: "example.com",
    created: "1995-08-14",
    expires: "2024-08-13",
    status: "Active",
    registrar: "GoDaddy"
  },
  {
    id: 2,
    name: "mybusiness.net",
    created: "2010-03-21",
    expires: "2025-03-21",
    status: "Active",
    registrar: "Namecheap"
  },
  {
    id: 3,
    name: "startup.io",
    created: "2021-11-05",
    expires: "2024-11-05",
    status: "Active",
    registrar: "Gandi"
  },
  {
    id: 4,
    name: "portfolio.dev",
    created: "2023-01-15",
    expires: "2024-01-15",
    status: "Expired",
    registrar: "Google Domains"
  },
  {
    id: 5,
    name: "shop-online.store",
    created: "2022-06-30",
    expires: "2025-06-30",
    status: "Active",
    registrar: "GoDaddy"
  }
];

// --- Notification Component ---
function NotificationDropdown({ domains, isOpen: externalIsOpen, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const actualIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsOpen(!isOpen);
    }
  };
  const [sslData, setSslData] = useState({});

  // Top 50 cached domains to exclude from notifications
  const TOP_50_DOMAINS = [
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'reddit.com', 'wikipedia.org', 'amazon.com', 'ebay.com',
    'netflix.com', 'microsoft.com', 'apple.com', 'zoom.us', 'tiktok.com',
    'whatsapp.com', 'pinterest.com', 'yahoo.com', 'twitch.tv', 'discord.com',
    'github.com', 'stackoverflow.com', 'wordpress.com', 'tumblr.com', 'shopify.com',
    'paypal.com', 'adobe.com', 'salesforce.com', 'dropbox.com', 'slack.com',
    'medium.com', 'quora.com', 'vimeo.com', 'cloudflare.com', 'nvidia.com',
    'spotify.com', 'airbnb.com', 'uber.com', 'booking.com', 'tripadvisor.com',
    'expedia.com', 'yelp.com', 'imdb.com', 'cnn.com', 'bbc.com',
    'nytimes.com', 'espn.com', 'walmart.com', 'target.com', 'bestbuy.com'
  ];

  // Fetch SSL data for all domains when component mounts or domains change
  useEffect(() => {
    const fetchAllSSL = async () => {
      const sslResults = {};
      for (const domain of domains) {
        try {
          const res = await fetch(`http://localhost:5000/api/ssl/${domain.name}`);
          const data = await res.json();
          if (res.ok) {
            sslResults[domain.name] = data;
          }
        } catch (err) {
          // Silently fail for SSL checks
        }
      }
      setSslData(sslResults);
    };

    if (domains.length > 0) {
      fetchAllSSL();
    }
  }, [domains]);

  const notifications = domains.reduce((acc, domain) => {
    // Skip top 50 cached domains
    if (TOP_50_DOMAINS.includes(domain.name)) {
      return acc;
    }

    // Check domain expiry
    const expiryDateStr = domain.expires || domain.expiry_date;
    if (expiryDateStr && expiryDateStr !== 'N/A') {
      const expiryDate = new Date(expiryDateStr);
      const today = new Date();
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (domain.status === 'Expired' || diffDays < 0) {
        acc.push({
          id: `domain-${domain.id || domain.name}`,
          type: 'expired',
          title: `Domain Expired: ${domain.name}`,
          message: 'This domain has expired. Renew immediately.',
          urgent: true
        });
      } else if (diffDays <= 30) {
        acc.push({
          id: `domain-${domain.id || domain.name}`,
          type: 'expiring',
          title: `Domain Expiring: ${domain.name}`,
          message: `Expires in ${diffDays} days.`,
          urgent: false
        });
      }
    }

    // Check SSL certificate expiry
    const ssl = sslData[domain.name];
    if (ssl && ssl.valid) {
      const daysRemaining = ssl.daysRemaining;

      if (daysRemaining < 0) {
        acc.push({
          id: `ssl-${domain.id || domain.name}`,
          type: 'expired',
          title: `SSL Expired: ${domain.name}`,
          message: 'SSL certificate has expired.',
          urgent: true
        });
      } else if (daysRemaining <= 30) {
        acc.push({
          id: `ssl-${domain.id || domain.name}`,
          type: 'expiring',
          title: `SSL Expiring: ${domain.name}`,
          message: `SSL expires in ${daysRemaining} days.`,
          urgent: daysRemaining <= 7
        });
      }
    }

    return acc;
  }, []);

  return (
    <div className="notification-container">
      <button
        className="notification-btn"
        onClick={handleToggle}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {actualIsOpen && (
        <>
            <div className="notification-overlay" onClick={handleToggle}></div>
            <div className="notification-menu">
            <div className="notification-header">
              <span>Notifications</span>
              <button
                onClick={handleToggle}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                  width: '1.5rem',
                  height: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 'auto'
                }}
              >
                &times;
              </button>
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="notification-empty">No new notifications</div>
                ) : (
                    notifications.map((notif, idx) => (
                    <div key={`${notif.id}-${idx}`} className={`notification-item ${notif.urgent ? 'urgent' : ''}`}>
                        <div className="notification-icon">
                            <AlertCircle size={16} />
                        </div>
                        <div className="notification-content">
                            <div className="notification-title">{notif.title}</div>
                            <div className="notification-desc">{notif.message}</div>
                        </div>
                    </div>
                    ))
                )}
            </div>
            </div>
        </>
      )}
    </div>
  );
}

// --- Notification Preferences Modal ---
function NotificationPreferences({ isOpen, onClose, user }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch current preferences
  useEffect(() => {
    if (isOpen && user) {
      fetchPreferences();
    }
  }, [isOpen, user]);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmailNotifications(data.emailNotifications);
        setSmsNotifications(data.smsNotifications);
        setPhone(data.phone || '');
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailNotifications,
          smsNotifications,
          phone
        })
      });

      if (res.ok) {
        setMessage({ text: 'Preferences saved successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        setMessage({ text: 'Failed to save preferences', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error saving preferences', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'email' })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Test email sent! Check your inbox.', type: 'success' });
      } else {
        setMessage({ text: `Email test failed: ${data.error}`, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error sending test email', type: 'error' });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestSMS = async () => {
    if (!phone) {
      setMessage({ text: 'Please enter a phone number first', type: 'error' });
      return;
    }
    setTestingSMS(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'sms' })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Test SMS sent! Check your phone.', type: 'success' });
      } else {
        setMessage({ text: `SMS test failed: ${data.error}`, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error sending test SMS', type: 'error' });
    } finally {
      setTestingSMS(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-overlay" onClick={onClose}></div>
      <div className="notification-preferences-modal">
        <div className="modal-header">
          <h2>Notification Preferences</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="preference-section">
            <div className="preference-row">
              <div className="preference-info">
                <h3>Email Notifications</h3>
                <p>Receive domain and SSL expiry alerts via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {emailNotifications && (
              <button
                className="test-btn"
                onClick={handleTestEmail}
                disabled={testingEmail}
              >
                {testingEmail ? 'Sending...' : 'Send Test Email'}
              </button>
            )}
          </div>

          <div className="preference-section">
            <div className="preference-row">
              <div className="preference-info">
                <h3>SMS Notifications</h3>
                <p>Receive alerts via text message</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {smsNotifications && (
              <>
                <input
                  type="tel"
                  className="phone-input"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <button
                  className="test-btn"
                  onClick={handleTestSMS}
                  disabled={testingSMS || !phone}
                >
                  {testingSMS ? 'Sending...' : 'Send Test SMS'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </>
  );
}

// --- SSL Certificate Card ---
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
      const res = await fetch(`http://localhost:5000/api/ssl/${domain}`);
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

// --- PageSpeed Insights Card ---
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
      const res = await fetch(`http://localhost:5000/api/pagespeed/${domain}`);
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
    if (score >= 50) return 'var(--warning-post)'; // You might need to add this var or use hex
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

// --- Export/Import Dropdown ---
function ExportDropdown({ domains, onImport, showModal, isOpen: externalIsOpen, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useState(null);

  // Use external control if provided, otherwise use internal state
  const actualIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(domains, showModal);
    handleToggle();
  };

  const handleExportExcel = () => {
    exportToExcel(domains, showModal);
    handleToggle();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      let domains = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        domains = parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        domains = await parseExcel(file);
      } else {
        showModal('Invalid File', 'Please upload a CSV or Excel file', 'error');
        return;
      }

      if (domains.length === 0) {
        showModal('Import Failed', 'No valid domains found in file', 'error');
        return;
      }

      onImport(domains);
      handleToggle();
    } catch (err) {
      console.error('Import error:', err);
      showModal('Import Error', 'Failed to import file: ' + err.message, 'error');
    }

    event.target.value = '';
  };

  const triggerFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = handleImport;
    input.click();
  };

  return (
    <div className="export-dropdown-container">
      <button
        className="export-btn"
        onClick={handleToggle}
        aria-label="Export/Import domains"
      >
        <Download size={20} />
      </button>

      {actualIsOpen && (
        <>
          <div className="notification-overlay" onClick={handleToggle}></div>
          <div className="dropdown-menu export-menu">
            <div className="dropdown-header">Import</div>
            <div className="dropdown-item" onClick={triggerFileInput}>
              <Plus size={16} />
              <span>Import from File</span>
            </div>

            {domains && domains.length > 0 && (
              <>
                <div className="dropdown-header" style={{ marginTop: '0.5rem' }}>Export</div>
                <div className="dropdown-item" onClick={handleExportCSV}>
                  <Download size={16} />
                  <span>Export as CSV</span>
                </div>
                <div className="dropdown-item" onClick={handleExportExcel}>
                  <Download size={16} />
                  <span>Export as Excel</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// --- User Profile Dropdown ---
function UserDropdown({ user, onLogout, onOpenSettings, onOpenNotifications, onOpenExport, notificationCount, darkMode, onToggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsOpen(false);
    onOpenSettings();
  };

  const handleNotificationsClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onOpenNotifications();
  };

  const handleExportClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onOpenExport();
  };

  const handleDarkModeToggle = (e) => {
    e.stopPropagation();
    onToggleDarkMode();
  };

  return (
    <div className="user-dropdown-container">
      <div
        className="user-profile"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          <User size={20} />
        </div>
        <div className="user-info">
          <span className="user-name">{user.name || "User"}</span>
          <span className="user-role">Admin</span>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="dropdown-menu">
            <div className="dropdown-item mobile-only-menu-item" onClick={handleNotificationsClick}>
              <Bell size={16} style={{ marginRight: '8px' }} />
              Notifications
              {notificationCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--danger-text)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: '700'
                }}>
                  {notificationCount}
                </span>
              )}
            </div>
            <div className="dropdown-item mobile-only-menu-item" onClick={handleExportClick}>
              <Download size={16} style={{ marginRight: '8px' }} />
              Export/Import
            </div>
            <div className="dropdown-item mobile-only-menu-item" onClick={handleDarkModeToggle}>
              {darkMode ? <Sun size={16} style={{ marginRight: '8px' }} /> : <Moon size={16} style={{ marginRight: '8px' }} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </div>
            <div className="dropdown-item" onClick={handleSettingsClick}>
              <Bell size={16} style={{ marginRight: '8px' }} />
              Notification Settings
            </div>
            <div className="dropdown-item" onClick={onLogout}>
              Logout
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeDomain, setActiveDomain] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotificationPreferences, setShowNotificationPreferences] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [showMobileExport, setShowMobileExport] = useState(false);

  // Initialize from localStorage or default to false
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [domains, setDomains] = useState(INITIAL_DOMAINS);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    expiryRange: 'all', // all, 30days, 60days, 90days, expired
    sortBy: 'none', // none, registrar-asc, registrar-desc, expiry-asc, expiry-desc, ssl-expiry
    sslExpiry: 'all' // all, expiring, valid, expired
  });
  const [sslDataCache, setSslDataCache] = useState({});

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const showModal = (title, message, type = 'info', onConfirm = null) => {
    setModal({ isOpen: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  };

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch domains on login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchDomains();
    }
  }, [isAuthenticated, currentUser]);

  // Fetch SSL data for all domains for filtering
  useEffect(() => {
    const fetchAllSSL = async () => {
      const sslResults = {};
      for (const domain of domains) {
        try {
          const res = await fetch(`http://localhost:5000/api/ssl/${domain.name}`);
          const data = await res.json();
          if (res.ok) {
            sslResults[domain.name] = data;
          }
        } catch (err) {
          // Silently fail for SSL checks
        }
      }
      setSslDataCache(sslResults);
    };

    if (domains.length > 0) {
      fetchAllSSL();
    }
  }, [domains]);

  const fetchDomains = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/domains', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Map API fields to UI expected fields
        const mappedData = data.map(d => ({
          ...d,
          expires: d.expiry_date || d.expires || "N/A",
          created: d.created_date || d.created || "N/A"
        }));
        setDomains(mappedData);
      } else {
        console.error("Failed to fetch domains:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Failed to fetch domains", err);
    }
  };

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Handle Login Logic
  const handleLoginObj = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        return { success: true };
      } else {
        return { error: data.error || "Login failed" };
      }
    } catch (err) {
      return { error: "Failed to connect to server" };
    }
  };

  const handleRegisterObj = async (name, email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/register', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        return { success: true };
      } else {
        return { error: data.error || "Registration failed" };
      }
    } catch (err) {
      return { error: "Failed to connect to server" };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setDomains([]); // Clear domains on logout
  };

  const handleAddDomain = () => {
    setShowAddModal(true);
  };

  const handleDeleteDomain = async (domainId) => {
    showModal(
      'Confirm Delete',
      'Are you sure you want to delete this domain?',
      'confirm',
      async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/domains/${domainId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            setDomains(prev => prev.filter(d => d.id !== domainId));
            showModal('Success', 'Domain deleted successfully', 'success');
          } else {
            showModal('Error', 'Failed to delete domain', 'error');
          }
        } catch (err) {
          console.error('Error deleting domain:', err);
          showModal('Error', 'Error deleting domain', 'error');
        }
      }
    );
  };

  const handleImportDomains = async (importedDomains) => {
    const token = localStorage.getItem('token');
    let successCount = 0;
    let failCount = 0;

    for (const domainData of importedDomains) {
      try {
        const res = await fetch(`http://localhost:5000/api/whois/${domainData.name}`);
        const data = await res.json();

        if (data.status !== 1 || data.domain_registered === 'no') {
          failCount++;
          continue;
        }

        const newDomain = {
          name: domainData.name,
          created_date: data.create_date || "N/A",
          expiry_date: data.expiry_date || "N/A",
          status: (data.domain_status && data.domain_status.length > 0) ? "Active" : "Unknown",
          registrar: (data.domain_registrar && data.domain_registrar.registrar_name) ? data.domain_registrar.registrar_name : domainData.registrar,
          fullDetails: data
        };

        const saveRes = await fetch('http://localhost:5000/api/domains', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newDomain)
        });

        if (saveRes.ok) {
          const savedData = await saveRes.json();
          setDomains(prev => [...prev, { ...newDomain, id: savedData.id, created: newDomain.created_date, expires: newDomain.expiry_date }]);
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Failed to import ${domainData.name}:`, err);
        failCount++;
      }
    }

    showModal('Import Complete', `Successfully imported: ${successCount}\nFailed: ${failCount}`, successCount > 0 ? 'success' : 'error');
  };

  // Top 50 cached domains to exclude from notifications
  const TOP_50_DOMAINS = [
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'reddit.com', 'wikipedia.org', 'amazon.com', 'ebay.com',
    'netflix.com', 'microsoft.com', 'apple.com', 'zoom.us', 'tiktok.com',
    'whatsapp.com', 'pinterest.com', 'yahoo.com', 'twitch.tv', 'discord.com',
    'github.com', 'stackoverflow.com', 'wordpress.com', 'tumblr.com', 'shopify.com',
    'paypal.com', 'adobe.com', 'salesforce.com', 'dropbox.com', 'slack.com',
    'medium.com', 'quora.com', 'vimeo.com', 'cloudflare.com', 'nvidia.com',
    'spotify.com', 'airbnb.com', 'uber.com', 'booking.com', 'tripadvisor.com',
    'expedia.com', 'yelp.com', 'imdb.com', 'cnn.com', 'bbc.com',
    'nytimes.com', 'espn.com', 'walmart.com', 'target.com', 'bestbuy.com'
  ];

  // Calculate notification count (excluding top 50 cached domains)
  const notificationCount = domains.reduce((count, domain) => {
    // Skip top 50 cached domains
    if (TOP_50_DOMAINS.includes(domain.name)) {
      return count;
    }

    const expiryDateStr = domain.expires || domain.expiry_date;
    if (expiryDateStr && expiryDateStr !== 'N/A') {
      const expiryDate = new Date(expiryDateStr);
      const today = new Date();
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (domain.status === 'Expired' || diffDays < 0 || diffDays <= 30) {
        count++;
      }
    }

    const ssl = sslDataCache[domain.name];
    if (ssl && ssl.valid) {
      const daysRemaining = ssl.daysRemaining;
      if (daysRemaining < 0 || daysRemaining <= 30) {
        count++;
      }
    }

    return count;
  }, 0);

  // Filter and sort domains based on search query and filter options
  const filteredDomains = (() => {
    // Step 1: Apply search query filter
    let filtered = domains.filter(domain => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        domain.name?.toLowerCase().includes(query) ||
        domain.registrar?.toLowerCase().includes(query) ||
        domain.status?.toLowerCase().includes(query)
      );
    });

    // Step 2: Apply expiry range filter
    if (filterOptions.expiryRange !== 'all') {
      filtered = filtered.filter(domain => {
        const expiryDateStr = domain.expires || domain.expiry_date;
        if (!expiryDateStr || expiryDateStr === 'N/A') return false;

        const expiryDate = new Date(expiryDateStr);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filterOptions.expiryRange) {
          case '30days':
            return diffDays >= 0 && diffDays <= 30;
          case '60days':
            return diffDays >= 0 && diffDays <= 60;
          case '90days':
            return diffDays >= 0 && diffDays <= 90;
          case 'expired':
            return diffDays < 0 || domain.status === 'Expired';
          default:
            return true;
        }
      });
    }

    // Step 3: Apply SSL expiry filter
    if (filterOptions.sslExpiry !== 'all') {
      filtered = filtered.filter(domain => {
        const ssl = sslDataCache[domain.name];

        if (!ssl) return filterOptions.sslExpiry === 'all';

        const daysRemaining = ssl.daysRemaining;

        switch (filterOptions.sslExpiry) {
          case 'expiring':
            return daysRemaining >= 0 && daysRemaining <= 30;
          case 'valid':
            return daysRemaining > 30;
          case 'expired':
            return daysRemaining < 0;
          default:
            return true;
        }
      });
    }

    // Step 4: Apply sorting
    if (filterOptions.sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        switch (filterOptions.sortBy) {
          case 'registrar-asc':
            return (a.registrar || '').localeCompare(b.registrar || '');
          case 'registrar-desc':
            return (b.registrar || '').localeCompare(a.registrar || '');
          case 'expiry-asc': {
            const dateA = new Date(a.expires || a.expiry_date || 0);
            const dateB = new Date(b.expires || b.expiry_date || 0);
            return dateA - dateB;
          }
          case 'expiry-desc': {
            const dateA = new Date(a.expires || a.expiry_date || 0);
            const dateB = new Date(b.expires || b.expiry_date || 0);
            return dateB - dateA;
          }
          case 'ssl-expiry': {
            const sslA = sslDataCache[a.name];
            const sslB = sslDataCache[b.name];
            const daysA = sslA ? sslA.daysRemaining : 999999;
            const daysB = sslB ? sslB.daysRemaining : 999999;
            return daysA - daysB;
          }
          default:
            return 0;
        }
      });
    }

    return filtered;
  })();

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={handleLoginObj}
        onRegister={handleRegisterObj}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div className={`app-container ${activeDomain ? 'view-detailed' : 'view-simple'}`}>
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-brand">
          <img src="/images/logo-secondary.png" alt="Domain Central" className="nav-logo" />
        </div>

        <div className="nav-right">
          {/* Quick Add Button */}
          {!activeDomain && (
            <button
              className="quick-add-btn"
              onClick={handleAddDomain}
              aria-label="Add new domain"
              title="Add new domain"
            >
              <Plus size={18} />
            </button>
          )}

          {/* Search Bar */}
          {!activeDomain && domains.length > 0 && (
            <div className="top-search-bar">
              <Search size={18} className="top-search-icon" />
              <input
                type="text"
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="top-search-input"
              />
              {searchQuery && (
                <button
                  className="top-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
          )}

          {/* Filter Button */}
          {!activeDomain && domains.length > 0 && (
            <div className="filter-container">
              <button
                className={`filter-btn ${(filterOptions.expiryRange !== 'all' || filterOptions.sortBy !== 'none' || filterOptions.sslExpiry !== 'all') ? 'filter-active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Filter domains"
                title="Filter and sort"
              >
                <Filter size={18} />
              </button>

              {showFilters && (
                <>
                  <div className="notification-overlay" onClick={() => setShowFilters(false)}></div>
                  <div className="filter-dropdown">
                    <div className="filter-section">
                      <label className="filter-label">Domain Expiry</label>
                      <select
                        className="filter-select"
                        value={filterOptions.expiryRange}
                        onChange={(e) => setFilterOptions({ ...filterOptions, expiryRange: e.target.value })}
                      >
                        <option value="all">All Domains</option>
                        <option value="30days">Expiring in 30 days</option>
                        <option value="60days">Expiring in 60 days</option>
                        <option value="90days">Expiring in 90 days</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    <div className="filter-section">
                      <label className="filter-label">SSL Certificate</label>
                      <select
                        className="filter-select"
                        value={filterOptions.sslExpiry}
                        onChange={(e) => setFilterOptions({ ...filterOptions, sslExpiry: e.target.value })}
                      >
                        <option value="all">All Certificates</option>
                        <option value="expiring">Expiring in 30 days</option>
                        <option value="valid">Valid (30+ days)</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    <div className="filter-section">
                      <label className="filter-label">Sort By</label>
                      <select
                        className="filter-select"
                        value={filterOptions.sortBy}
                        onChange={(e) => setFilterOptions({ ...filterOptions, sortBy: e.target.value })}
                      >
                        <option value="none">Default Order</option>
                        <option value="registrar-asc">Registrar (A-Z)</option>
                        <option value="registrar-desc">Registrar (Z-A)</option>
                        <option value="expiry-asc">Expiry Date (Soonest)</option>
                        <option value="expiry-desc">Expiry Date (Latest)</option>
                        <option value="ssl-expiry">SSL Expiry (Soonest)</option>
                      </select>
                    </div>

                    <div className="filter-actions">
                      <button
                        className="filter-reset-btn"
                        onClick={() => {
                          setFilterOptions({
                            expiryRange: 'all',
                            sortBy: 'none',
                            sslExpiry: 'all'
                          });
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <NotificationDropdown
            domains={domains}
            isOpen={showMobileNotifications}
            onToggle={() => setShowMobileNotifications(!showMobileNotifications)}
          />

          {!activeDomain && (
            <ExportDropdown
              domains={domains}
              onImport={handleImportDomains}
              showModal={showModal}
              isOpen={showMobileExport}
              onToggle={() => setShowMobileExport(!showMobileExport)}
            />
          )}

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <UserDropdown
            user={currentUser || {}}
            onLogout={handleLogout}
            onOpenSettings={() => setShowNotificationPreferences(true)}
            onOpenNotifications={() => setShowMobileNotifications(!showMobileNotifications)}
            onOpenExport={() => setShowMobileExport(!showMobileExport)}
            notificationCount={notificationCount}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        </div>
      </div>

      {activeDomain ? (
        <>
          {/* ... Detailed View ... */}
          <div className="content-area">
            <DetailedDashboard domain={activeDomain} onBack={() => setActiveDomain(null)} />
          </div>

          <div className="sidebar-area">
            <div className="section-card sticky-sidebar">
              <h3 className="section-heading" style={{ marginBottom: '1.5rem' }}>External Tools</h3>
              <div className="tools-grid">
                {EXTERNAL_TOOLS.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tool-item"
                  >
                    <div className="tool-icon-small">
                      <tool.icon size={16} />
                    </div>
                    <div className="tool-info">
                      <h4 className="tool-title-small">{tool.name}</h4>
                      <p className="tool-desc-small">{tool.desc}</p>
                    </div>
                    <ExternalLink size={14} className="tool-link-icon" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Empty State or Dashboard Grid */}
          {domains.length === 0 ? (
            <EmptyState onAdd={handleAddDomain} />
          ) : filteredDomains.length === 0 ? (
            <div className="empty-search-state">
              <Search size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No domains found</h3>
              <p>No domains match your search "{searchQuery}"</p>
              <button className="btn-secondary" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="dashboard-grid">
              {filteredDomains.map(domain => (
                <SimpleCard
                  key={domain.id}
                  domain={domain}
                  onViewDetails={() => {
                    setActiveDomain(domain);
                    setShowAddModal(false);
                  }}
                  onDelete={() => handleDeleteDomain(domain.id)}
                />
              ))}
              <div className="add-domain-card" onClick={handleAddDomain}>
                <div className="add-domain-icon">
                  <Plus size={32} />
                </div>
                <span className="add-domain-text">Add New Domain</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Domain Modal */}
      <AddDomainModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        token={localStorage.getItem('token')}
        onAddDomain={(newDomain) => setDomains(prev => [...prev, newDomain])}
        showModal={showModal}
      />

      {/* Custom Modal Dialog */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
      />

      {/* Notification Preferences Modal */}
      <NotificationPreferences
        isOpen={showNotificationPreferences}
        onClose={() => setShowNotificationPreferences(false)}
        user={currentUser}
      />
    </div>
  );
}

// --- Password Strength Component ---
function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength++;
    if (pass.length > 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  let strengthClass = 'strength-weak';
  let text = 'Weak';

  if (strength > 2) { strengthClass = 'strength-medium'; text = 'Medium'; }
  if (strength > 4) { strengthClass = 'strength-strong'; text = 'Strong'; }

  return (
    <div className="password-strength-container">
      <div className="strength-meter">
        <div className={`strength-bar ${strengthClass}`}></div>
      </div>
      <div className={`strength-text text-${strengthClass.split('-')[1]}`}>
        {text}
      </div>
    </div>
  );
}

// --- Auth Component ---
function AuthPage({ onLogin, onRegister, darkMode, setDarkMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); // For registration success

  // Reset state on toggle
  useEffect(() => {
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
    setShowConfetti(false);
  }, [isLogin]);

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    const email = urlParams.get('email');

    if (token && name && email) {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, '/');

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ name, email }));

      // Call the login handler
      onLogin({ token, user: { name, email } });
    }
  }, [onLogin]);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 chars";

    if (!isLogin && !formData.name) newErrors.name = "Name is required";

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400); // Reset shake
      return;
    }

    // Call parent handler
    if (isLogin) {
      const result = await onLogin(formData.email, formData.password);
      if (result && result.error) {
        setErrors({ form: result.error });
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
      }
    } else {
      const result = await onRegister(formData.name, formData.email, formData.password);
      if (result && result.error) {
         setErrors({ form: result.error });
         setIsShaking(true);
         setTimeout(() => setIsShaking(false), 400);
      } else if (result && result.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000); // Hide confetti after 2 seconds
      }
    }
  };

  return (
    <div className="auth-container">
      {showConfetti && <div className="confetti-effect">🎉 Account Created! 🎉</div>}
      <div className="theme-toggle-container">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className={`auth-card ${isShaking ? 'shake' : ''}`}>
        <div className="auth-logo-container">
          <img src="/images/logo-primary.png" alt="Domain Central" className="auth-logo" />
        </div>
        <div className="auth-header">
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Enter your credentials to access your domains' : 'Sign up to start managing your digital assets'}
          </p>
        </div>

        {errors.form && (
          <div className="error-message" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <AlertCircle size={14} /> {errors.form}
          </div>
        )}

        <div className="auth-form">
          <button className="social-btn" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
             </svg>
            Continue with Google
          </button>

          <div className="divider">or</div>

          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                className={`auth-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <div className="error-message"><AlertCircle size={14} /> {errors.name}</div>}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className={`auth-input ${errors.email ? 'input-error' : ''}`}
              placeholder="name@company.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            {errors.email && <div className="error-message"><AlertCircle size={14} /> {errors.email}</div>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className={`auth-input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
             />
             {!isLogin && <PasswordStrengthMeter password={formData.password} />}
             {errors.password && <div className="error-message"><AlertCircle size={14} /> {errors.password}</div>}
          </div>

          <button className="primary-btn" onClick={handleSubmit}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div className="toggle-auth">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            className="toggle-link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Empty State Component ---
function EmptyState({ onAdd }) {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrapper">
        <LayoutDashboard size={40} />
      </div>
      <h2 className="empty-title">No Domains Yet</h2>
      <p className="empty-desc">
        Your dashboard is looking a bit empty. Add your first domain to start tracking WHOIS data, expiry dates, and security status.
      </p>
      <button className="primary-btn" onClick={onAdd} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
        <Plus size={18} style={{ marginRight: '0.5rem' }} />
        Add Your First Domain
      </button>
    </div>
  );
}

// --- Add Domain Modal (Refined) ---
function AddDomainModal({ isOpen, onClose, onAddDomain, token, showModal }) {
  // Start with one empty input
  const [inputs, setInputs] = useState(['']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const updateInput = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (index) => {
    if (inputs.length > 1) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const handleBulkAdd = async () => {
    // Filter valid domains
    const domains = inputs
      .map(d => d.trim())
      .filter(d => d.length > 0 && d.includes('.'));

    if (domains.length === 0) {
      showModal('Validation Error', 'Please enter at least one valid domain.', 'error');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    setProgress(0);

    let completed = 0;

    for (const domainName of domains) {
      setLogs(prev => [...prev, { name: domainName, status: 'Testing...', type: 'loading' }]);

      try {
        const res = await fetch(`http://localhost:5000/api/whois/${domainName}`);
        const data = await res.json();

        if (data.status !== 1 || data.domain_registered === 'no') {
           throw new Error(data.domain_registered === 'no' ? "Available (Not Registered)" : "Invalid/Fetch Error");
        }

        const newDomain = {
            name: domainName,
            created_date: data.create_date || "N/A",
            expiry_date: data.expiry_date || "N/A",
            status: (data.domain_status && data.domain_status.length > 0) ? "Active" : "Unknown",
            registrar: (data.domain_registrar && data.domain_registrar.registrar_name) ? data.domain_registrar.registrar_name : null,
            fullDetails: data
        };

        const saveRes = await fetch('http://localhost:5000/api/domains', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newDomain)
        });

        if (!saveRes.ok) {
          const errorData = await saveRes.json();
          if (saveRes.status === 409) {
            throw new Error("Domain already exists");
          }
          throw new Error(errorData.error || "Database Save Failed");
        }

        const savedData = await saveRes.json();

        onAddDomain({ ...newDomain, id: savedData.id, created: newDomain.created_date, expires: newDomain.expiry_date });

        setLogs(prev => prev.map(l => l.name === domainName ? {
          name: domainName,
          status: 'Added successfully',
          type: 'success'
        } : l));

      } catch (err) {
        setLogs(prev => prev.map(l => l.name === domainName ? { name: domainName, status: err.message, type: 'error' } : l));
      }
      
      completed++;
      setProgress((completed / domains.length) * 100);
    }

    setIsProcessing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Domains</h3>
          <button className="close-btn" onClick={onClose}>
             <ArrowLeft size={20} />
          </button>
        </div>

        <div className="modal-body">
           {!isProcessing && logs.length === 0 ? (
             <>
               <div className="input-list">
                 {inputs.map((val, idx) => (
                   <div key={idx} className="input-row">
                     <input 
                       className="modal-input" 
                       placeholder="example.com"
                       value={val}
                       autoFocus={idx === inputs.length - 1} // Auto-focus new inputs
                       onChange={(e) => updateInput(idx, e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && idx === inputs.length - 1) addInput();
                       }}
                     />
                     {inputs.length > 1 && (
                       <button className="icon-btn" onClick={() => removeInput(idx)}>
                         <Trash2 size={18} />
                       </button>
                     )}
                   </div>
                 ))}
               </div>
               
               {inputs.length < 5 && (
                 <button className="add-input-btn" onClick={addInput}>
                   <Plus size={16} /> Add Another Domain
                 </button>
               )}
               <p className="input-hint" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
                 Max 5 domains at a time
               </p>
             </>
           ) : (
               <div className="progress-section">
                   <div className="progress-container">
                       <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                   </div>
                   <div className="status-list">
                       {logs.map((log, idx) => (
                           <div key={idx} className="status-item">
                               <span style={{ fontWeight: 500 }}>{log.name}</span>
                               <span className={log.type === 'success' ? 'status-success' : log.type === 'error' ? 'status-error' : 'status-loading'}>
                                   {log.status}
                               </span>
                           </div>
                       ))}
                   </div>
               </div>
           )}
        </div>

        <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
           <button className="secondary-button" onClick={onClose} disabled={isProcessing}>Close</button>
           {!isProcessing && logs.length === 0 && (
               <button className="primary-btn" onClick={handleBulkAdd} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                   Add Domains
               </button>
           )}
           {!isProcessing && logs.length > 0 && (
               <button className="primary-btn" onClick={() => { setLogs([]); setInputs(['']); }} style={{ width: 'auto' }}>
                   Add More
               </button>
           )}
        </div>
      </div>
    </div>
  );
}

// --- Helper for Registrar Website ---
const getRegistrarWebsite = (registrarName) => {
  if (!registrarName) return '#';

  const name = registrarName.toLowerCase().trim();

  // Map of common registrars to their actual websites
  const registrarMap = {
    'godaddy': 'https://www.godaddy.com',
    'namecheap': 'https://www.namecheap.com',
    'name.com': 'https://www.name.com',
    'google domains': 'https://domains.google',
    'squarespace': 'https://domains.squarespace.com',
    'cloudflare': 'https://www.cloudflare.com',
    'hover': 'https://www.hover.com',
    'enom': 'https://www.enom.com',
    'networksolutions': 'https://www.networksolutions.com',
    'network solutions': 'https://www.networksolutions.com',
    'tucows': 'https://www.tucows.com',
    'ionos': 'https://www.ionos.com',
    '1&1': 'https://www.ionos.com',
    'bluehost': 'https://www.bluehost.com',
    'hostgator': 'https://www.hostgator.com',
    'domain.com': 'https://www.domain.com',
    'dynadot': 'https://www.dynadot.com',
    'porkbun': 'https://porkbun.com',
    'gandi': 'https://www.gandi.net',
    'ovh': 'https://www.ovh.com',
    'register.com': 'https://www.register.com',
    'moniker': 'https://www.moniker.com',
    'namesilo': 'https://www.namesilo.com',
    'epik': 'https://www.epik.com',
    'spaceship': 'https://www.spaceship.com',
    'crazy domains': 'https://www.crazydomains.com',
    'crazydomains': 'https://www.crazydomains.com'
  };

  // Check for exact matches first
  for (const [key, url] of Object.entries(registrarMap)) {
    if (name.includes(key)) {
      return url;
    }
  }

  // Fallback: take first word and add .com
  const firstWord = registrarName.split(' ')[0].toLowerCase().replace(/[.,]+/g, '');
  return `https://${firstWord}.com`;
};

// --- Helper for Logo ---
const REGISTRAR_LOGO_MAP = {
  // GoDaddy variations
  'godaddy': '/images/registrars/Godaddy.png',
  'godaddycom': '/images/registrars/Godaddy.png',
  'godaddyllc': '/images/registrars/Godaddy.png',
  'godaddydomains': '/images/registrars/Godaddy.png',

  // Webhost Kenya (uses GoDaddy)
  'webhostkenya': '/images/registrars/webhost-kenya.jpg',

  // Namecheap variations
  'namecheap': '/images/registrars/Namecheap.png',
  'namecheapcom': '/images/registrars/Namecheap.png',

  // Cloudflare variations
  'cloudflare': '/images/registrars/Cloudflare Registrar.png',
  'cloudflareregistrar': '/images/registrars/Cloudflare Registrar.png',
  'cloudflareinc': '/images/registrars/Cloudflare Registrar.png',

  // Gandi variations
  'gandi': '/images/registrars/Gandi.net.png',
  'gandinet': '/images/registrars/Gandi.net.png',
  'gandisas': '/images/registrars/Gandi.net.png',

  // Name.com variations
  'namecom': '/images/registrars/Name.com',
  'namecominc': '/images/registrars/Name.com',

  // Hostinger variations
  'hostinger': '/images/registrars/hostinger.png',
  'hostingerinternationalsro': '/images/registrars/hostinger.png',
  'hostingerinternational': '/images/registrars/hostinger.png',

  // Network Solutions variations
  'networksolutions': '/images/registrars/network-solutions.jpg',
  'networksolutionsllc': '/images/registrars/network-solutions.jpg',

  // Wix variations
  'wix': '/images/registrars/wix.png',
  'wixcom': '/images/registrars/wix.png',
  'wixcomltd': '/images/registrars/wix.png',

  // Dimension Data variations
  'dimensiondata': '/images/registrars/dimension-data.png',
  'dimensiondataptyltd': '/images/registrars/dimension-data.png',
  'dimensiondatasolutionseastafrica': '/images/registrars/dimension-data.png',

  // Safaricom variations
  'safaricom': '/images/registrars/safaricom.jpg',
  'safaricomlimited': '/images/registrars/safaricom.jpg',
  'safaricomltd': '/images/registrars/safaricom.jpg'
};

const getRegistrarLogoUrl = (name) => {
  if (!name || name === "Unknown") return null;

  // Clean name: remove Inc, LLC, Ltd, etc.
  const cleanName = name.replace(/,? (Inc|LLC|Ltd|Corp|GmbH|B\.V\.|S\.A\.|S\.R\.L\.|Pvt|Public Limited Company|S\.L\.)\.?$/i, '')
    .replace(/[.,]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ''); // Remove all remaining spaces

  // Debug: log cleaned name to help identify registrars
  console.log(`Registrar: "${name}" → Cleaned: "${cleanName}"`);

  // Check if we have a local logo
  const localLogo = REGISTRAR_LOGO_MAP[cleanName];
  if (localLogo) {
    console.log(`✓ Using local logo for: ${cleanName}`);
    return localLogo;
  }

  console.log(`⚠ No local logo for: ${cleanName}, using fallback`);
  // Fallback to external logo service
  return `https://img.logo.dev/${cleanName}.com?token=pk_X-bjM4U5QeeTFlMqueWvHQ`;
};

function SimpleCard({ domain, onViewDetails, onDelete }) {
  const logoUrl = getRegistrarLogoUrl(domain.registrar);

  return (
    <div className="domain-card">
      <div className="card-header">
        <a
          href={`https://${domain.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="domain-name-link"
        >
          <h2 className="domain-name">{domain.name}</h2>
        </a>
        <div className="status-badge" style={domain.status === 'Expired' ? { backgroundColor: 'var(--danger-bg)' } : {}}>
          <div className="status-dot" style={domain.status === 'Expired' ? { backgroundColor: 'var(--danger-text)' } : {}}></div>
          <span className="status-text" style={domain.status === 'Expired' ? { color: 'var(--danger-text)' } : {}}>{domain.status}</span>
        </div>
        <button
          className="icon-btn delete-icon-btn"
          onClick={onDelete}
          aria-label="Delete domain"
          title="Delete domain"
          style={{ marginLeft: 'auto' }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="info-grid">
        <div className="info-row">
          <span className="info-label">Expiry Date</span>
          <span className="info-value">{domain.expires}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Creation Date</span>
          <span className="info-value">{domain.created}</span>
        </div>
      </div>



      {/* Conditionally render Registrar section */}
      {domain.registrar && (
        <div className="registrar-section">
          <p className="section-title">Registrar</p>
          <a
            href={getRegistrarWebsite(domain.registrar)}
            target="_blank"
            rel="noopener noreferrer"
            className="registrar-card"
          >
            <div className="registrar-info">
              <div className="logo-container">
                <img
                  src={logoUrl || "https://via.placeholder.com/50?text=Reg"}
                  alt={domain.registrar}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/50?text=Reg" }}
                />
              </div>
              <span className="registrar-name">{domain.registrar}</span>
            </div>
            <ExternalLink size={20} className="text-secondary" />
          </a>
        </div>
      )}

      <div className="registrar-section" style={{ borderTop: (domain.registrar && domain.registrar !== "Unknown") ? 'none' : '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button className="action-button" onClick={onViewDetails}>
            View Details
          </button>
      </div>
    </div>
  );
}

// Helper to render a contact section
function ContactSection({ title, icon: Icon, contact }) {
  if (!contact || Object.keys(contact).length === 0) return null;

  return (
    <div className="section-card">
      <div className="section-header">
        <Icon className="section-icon" size={20} />
        <h3 className="section-heading">{title}</h3>
      </div>
      <div className="detail-row">
        <span className="detail-label">Name:</span>
        <span className="detail-value">{contact.full_name || "N/A"}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Company:</span>
        <span className="detail-value">{contact.company_name || "N/A"}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Email:</span>
        <a href={`mailto:${contact.email_address}`} className="detail-value link-value">{contact.email_address || "N/A"}</a>
      </div>
      <div className="detail-row">
        <span className="detail-label">Phone:</span>
        <span className="detail-value">{contact.phone_number || "N/A"}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Location:</span>
        <span className="detail-value">
          {[contact.city_name, contact.state_name, contact.country_code].filter(Boolean).join(", ") || "N/A"}
        </span>
      </div>
    </div>
  );
}

function DetailedDashboard({ domain, onBack }) {
  const details = domain.fullDetails || {};
  const registrar = details.registrar || {};
  const registrant = details.registrant_contact || {};
  const adminContact = details.administrative_contact || {};
  const techContact = details.technical_contact || {};
  const nameServers = details.name_servers || ["a.iana-servers.net", "b.iana-servers.net"];
  const domainStatus = details.domain_status || ["clientTransferProhibited"];

  const registrarName = registrar.name || domain.registrar;
  const logoUrl = getRegistrarLogoUrl(registrarName);

  return (
    <div className="details-container">
      {/* Logo at the top */}
      <div className="details-logo-container">
        <img src="/images/logo-secondary.png" alt="Domain Central" className="details-logo" />
      </div>

      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Header Summary Card */}
      <div className="header-card">
        <div className="header-top">
          <div className="header-title">{domain.name}</div>
          {domain.status === 'Expired' ? (
            <span className="badge-expired">Expired</span>
          ) : (
            <span className="status-badge">
              <span className="status-text">{domain.status}</span>
            </span>
          )}
        </div>
        <div className="header-dates">
          <div className="date-block">
            <span className="date-label">Created:</span>
            <span className="date-value">{domain.created}</span>
          </div>
          <div className="date-block">
            <span className="date-label">Updated:</span>
            <span className="date-value">2023-08-14</span>
          </div>
          <div className="date-block">
            <span className="date-label">Expires:</span>
            <span className="date-value">{domain.expires}</span>
          </div>
        </div>
      </div>

      <div className="details-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Domain Registrar - Conditionally Render */}
        {registrarName && (
          <div className="section-card">
            <div className="section-header">
              <Building2 className="section-icon" size={20} />
              <h3 className="section-heading">Domain Registrar</h3>
            </div>
            <div className="detail-row" style={{ alignItems: 'center' }}>
              <span className="detail-label">Registrar:</span>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="logo-container" style={{ width: '32px', height: '32px' }}>
                  <img
                    src={logoUrl || "https://via.placeholder.com/50?text=Reg"}
                    alt={registrarName}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/50?text=Reg" }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <span>{registrarName}</span>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <a href="#" className="detail-value link-value">{registrar.email || `abusecomplaints@${registrarName.toLowerCase().replace(' ', '')}.com`}</a>
            </div>

            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{registrar.phone || "+1.2083895740"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">WHOIS Server:</span>
              <span className="detail-value">{details.whois_server || `whois.${domain.registrar.toLowerCase().replace(' ', '')}.com`}</span>
            </div>
          </div>
        )}

        {/* Contact Sections */}
        <ContactSection title="Registrant Contact" icon={User} contact={registrant} />
        <ContactSection title="Administrative Contact" icon={User} contact={adminContact} />
        <ContactSection title="Technical Contact" icon={Shield} contact={techContact} />

        {/* Name Servers */}
        <div className="section-card">
          <div className="section-header">
            <Network className="section-icon" size={20} />
            <h3 className="section-heading">Name Servers</h3>
          </div>
          <div className="server-list">
            {nameServers.map((ns, idx) => (
              <div key={idx} className="server-pill">{ns}</div>
            ))}
          </div>
        </div>



        {/* Status & Security */}
        <div className="section-card">
          <div className="section-header">
            <Lock className="section-icon" size={20} />
            <h3 className="section-heading">Status & Security</h3>
          </div>
          <div className="detail-row">
            <span className="detail-label">Domain Status:</span>
            <div className="status-tag">{domainStatus[0] || "Unknown"}</div>
          </div>
          <div className="detail-row">
            <span className="detail-label">DNSSEC:</span>
            <span className="detail-value">{details.dnssec || "unsigned"}</span>
          </div>
        </div>
        </div>

        {/* SSL Certificate */}
        <SSLCard domain={domain.name} />

        {/* PageSpeed Insights */}
        <PageSpeedCard domain={domain.name} />
      </div>

  );
}