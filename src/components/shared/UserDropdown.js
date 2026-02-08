import React, { useState } from 'react';
import { User } from 'lucide-react';

export default function UserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="user-dropdown-container">
      <div className="user-profile" onClick={() => setIsOpen(!isOpen)}>
        <div className="user-avatar">
          <User size={20} />
        </div>
        <div className="user-info">
          <span className="user-name">{user.name || 'User'}</span>
          <span className="user-role">Admin</span>
        </div>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item" onClick={onLogout}>
            Logout
          </div>
        </div>
      )}
    </div>
  );
}
