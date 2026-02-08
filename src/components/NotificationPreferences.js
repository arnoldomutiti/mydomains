import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

function NotificationPreferences({ isOpen, onClose, user }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isOpen && user) {
      fetchPreferences();
    }
  }, [isOpen, user]);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
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
      const res = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
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
      const res = await fetch(`${API_BASE_URL}/api/notifications/test`, {
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
      const res = await fetch(`${API_BASE_URL}/api/notifications/test`, {
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

export default NotificationPreferences;
