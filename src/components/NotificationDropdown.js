import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../config';
import TOP_50_DOMAINS from '../data/top50Domains';

function NotificationDropdown({ domains, isOpen: externalIsOpen, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);

  const actualIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsOpen(!isOpen);
    }
  };
  const [sslData, setSslData] = useState({});

  useEffect(() => {
    const fetchAllSSL = async () => {
      const sslResults = {};
      for (const domain of domains) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/ssl/${domain.name}`);
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
    if (TOP_50_DOMAINS.includes(domain.name)) {
      return acc;
    }

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

export default NotificationDropdown;
