import React from 'react';
import { LayoutDashboard, Plus } from 'lucide-react';

export const EmptyState = ({ onAdd }) => {
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
};
