import React, { useState, useEffect } from 'react';
import { ExternalLink, Moon, Sun, Plus } from 'lucide-react';
import './App.css';

import useAuth from './hooks/useAuth';
import useDomains from './hooks/useDomains';

import AuthPage from './components/Auth/AuthPage';
import UserDropdown from './components/shared/UserDropdown';
import EmptyState from './components/shared/EmptyState';
import DomainCard from './components/Domains/DomainCard';
import AddDomainModal from './components/Domains/AddDomainModal';
import DetailedDashboard from './components/Dashboard/DetailedDashboard';
import EXTERNAL_TOOLS from './constants/externalTools';

export default function App() {
  const { isAuthenticated, currentUser, login, register, logout } = useAuth();
  const { domains, fetchDomains, addDomain, clearDomains } = useDomains();

  const [activeDomain, setActiveDomain] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Fetch domains on login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchDomains();
    }
  }, [isAuthenticated, currentUser, fetchDomains]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    clearDomains();
  };

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={login}
        onRegister={register}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div className={`app-container ${activeDomain ? 'view-detailed' : 'view-simple'}`}>
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-brand-placeholder"></div>
        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <UserDropdown user={currentUser || {}} onLogout={handleLogout} />
        </div>
      </div>

      {activeDomain ? (
        <>
          <div className="content-area">
            <DetailedDashboard domain={activeDomain} onBack={() => setActiveDomain(null)} />
          </div>

          <div className="sidebar-area">
            <div className="section-card sticky-sidebar">
              <h3 className="section-heading" style={{ marginBottom: '1.5rem' }}>
                External Tools
              </h3>
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
          </div>
        </>
      ) : domains.length === 0 ? (
        <EmptyState onAdd={() => setShowAddModal(true)} />
      ) : (
        <div className="dashboard-grid">
          {domains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              onViewDetails={() => setActiveDomain(domain)}
            />
          ))}
          <div className="add-domain-card" onClick={() => setShowAddModal(true)}>
            <div className="add-domain-icon">
              <Plus size={32} />
            </div>
            <span className="add-domain-text">Add New Domain</span>
          </div>
        </div>
      )}

      <AddDomainModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddDomain={addDomain}
      />
    </div>
  );
}
