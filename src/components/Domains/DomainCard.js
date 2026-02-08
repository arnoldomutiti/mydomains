import React from 'react';
import { ExternalLink } from 'lucide-react';
import getRegistrarLogoUrl from '../../utils/registrarLogo';

export default function DomainCard({ domain, onViewDetails }) {
  const logoUrl = getRegistrarLogoUrl(domain.registrar);

  return (
    <div className="domain-card">
      <div className="card-header">
        <h2 className="domain-name">{domain.name}</h2>
        <div
          className="status-badge"
          style={domain.status === 'Expired' ? { backgroundColor: 'var(--danger-bg)' } : {}}
        >
          <div
            className="status-dot"
            style={domain.status === 'Expired' ? { backgroundColor: 'var(--danger-text)' } : {}}
          ></div>
          <span
            className="status-text"
            style={domain.status === 'Expired' ? { color: 'var(--danger-text)' } : {}}
          >
            {domain.status}
          </span>
        </div>
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

      <div className="registrar-section">
        <p className="section-title">Registrar</p>
        <a
          href="#"
          className="registrar-card"
          onClick={(e) => e.preventDefault()}
        >
          <div className="registrar-info">
            <div className="logo-container">
              <img
                src={logoUrl || 'https://via.placeholder.com/50?text=Reg'}
                alt={domain.registrar}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/50?text=Reg';
                }}
              />
            </div>
            <span className="registrar-name">{domain.registrar}</span>
          </div>
          <ExternalLink size={20} className="text-secondary" />
        </a>

        <button className="action-button" onClick={onViewDetails}>
          View Details
        </button>
      </div>
    </div>
  );
}
