import React from 'react';
import { ExternalLink } from 'lucide-react';
import { EXTERNAL_TOOLS } from '../config/constants';

export const ExternalTools = () => {
  return (
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
  );
};
