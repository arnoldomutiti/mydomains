import React from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { getRegistrarWebsite, getRegistrarLogoUrl } from '../utils/registrarUtils';

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

export default SimpleCard;
