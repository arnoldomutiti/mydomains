import React, { useState } from 'react';
import { User, Bell, Download, Moon, Sun } from 'lucide-react';

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

export default UserDropdown;
