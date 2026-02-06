import React from 'react';

export const ContactSection = ({ title, icon: Icon, contact }) => {
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
        <a href={`mailto:${contact.email_address}`} className="detail-value link-value">
          {contact.email_address || "N/A"}
        </a>
      </div>
      <div className="detail-row">
        <span className="detail-label">Phone:</span>
        <span className="detail-value">{contact.phone_number || "N/A"}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Location:</span>
        <span className="detail-value">
          {[contact.city_name, contact.state_name, contact.country_code]
            .filter(Boolean)
            .join(", ") || "N/A"}
        </span>
      </div>
    </div>
  );
};
