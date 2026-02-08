import React from 'react';
import { ArrowLeft, Building2, User, Shield, Lock, Network, Globe } from 'lucide-react';
import getRegistrarLogoUrl from '../../utils/registrarLogo';
import ContactSection from '../shared/ContactSection';

export default function DetailedDashboard({ domain, onBack }) {
  const details = domain.fullDetails || {};
  const registrar = details.registrar || {};
  const registrant = details.registrant_contact || {};
  const adminContact = details.administrative_contact || {};
  const techContact = details.technical_contact || {};
  const nameServers = details.name_servers || ['a.iana-servers.net', 'b.iana-servers.net'];
  const domainStatus = details.domain_status || ['clientTransferProhibited'];

  const registrarName = registrar.name || domain.registrar;
  const logoUrl = getRegistrarLogoUrl(registrarName);

  return (
    <div className="details-container">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

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
            <span className="date-value">{details.update_date || 'N/A'}</span>
          </div>
          <div className="date-block">
            <span className="date-label">Expires:</span>
            <span className="date-value">{domain.expires}</span>
          </div>
        </div>
      </div>

      <div
        className="details-grid-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="section-card">
          <div className="section-header">
            <Building2 className="section-icon" size={20} />
            <h3 className="section-heading">Domain Registrar</h3>
          </div>
          <div className="detail-row" style={{ alignItems: 'center' }}>
            <span className="detail-label">Registrar:</span>
            <div
              className="detail-value"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div className="logo-container" style={{ width: '32px', height: '32px' }}>
                <img
                  src={logoUrl || 'https://via.placeholder.com/50?text=Reg'}
                  alt={registrarName}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/50?text=Reg';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <span>{registrarName}</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <a href="#" className="detail-value link-value">
              {registrar.email || `abusecomplaints@${registrarName.toLowerCase().replace(' ', '')}.com`}
            </a>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{registrar.phone || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">WHOIS Server:</span>
            <span className="detail-value">
              {details.whois_server || `whois.${domain.registrar.toLowerCase().replace(' ', '')}.com`}
            </span>
          </div>
        </div>

        <ContactSection title="Registrant Contact" icon={User} contact={registrant} />
        <ContactSection title="Administrative Contact" icon={User} contact={adminContact} />
        <ContactSection title="Technical Contact" icon={Shield} contact={techContact} />

        <div className="section-card">
          <div className="section-header">
            <Network className="section-icon" size={20} />
            <h3 className="section-heading">Name Servers</h3>
          </div>
          <div className="server-list">
            {nameServers.map((ns, idx) => (
              <div key={idx} className="server-pill">
                {ns}
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <Globe className="section-icon" size={20} />
            <h3 className="section-heading">Subdomains</h3>
          </div>
          <div className="server-list">
            <div className="server-pill">www.{domain.name}</div>
            <div className="server-pill">mail.{domain.name}</div>
            <div className="server-pill">api.{domain.name}</div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <Lock className="section-icon" size={20} />
            <h3 className="section-heading">Status & Security</h3>
          </div>
          <div className="detail-row">
            <span className="detail-label">Domain Status:</span>
            <div className="status-tag">{domainStatus[0] || 'Unknown'}</div>
          </div>
          <div className="detail-row">
            <span className="detail-label">DNSSEC:</span>
            <span className="detail-value">{details.dnssec || 'unsigned'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
