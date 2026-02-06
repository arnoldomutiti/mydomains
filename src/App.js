import React, { useState } from 'react';
import { Moon, Sun, Plus } from 'lucide-react';
import './App.css';

import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useDomains } from './hooks/useDomains';

import {
  AuthPage,
  UserDropdown,
  EmptyState,
  SimpleCard,
  DetailedDashboard,
  AddDomainModal,
  ExternalTools
} from './components';

import { STORAGE_KEYS } from './config/constants';

export default function App() {
  const { isAuthenticated, currentUser, login, register, logout } = useAuth();
  const { darkMode, toggleTheme, setDarkMode } = useTheme();
  const { domains, addDomain, setDomains } = useDomains(isAuthenticated);

  const [activeDomain, setActiveDomain] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleLogout = () => {
    logout();
    setDomains([]);
  };

  const handleAddDomain = () => {
    setShowAddModal(true);
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
      <div className="top-nav">
        <div className="nav-brand-placeholder"></div>

        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
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
            <ExternalTools />
          </div>
        </>
      ) : (
        domains.length === 0 ? (
          <EmptyState onAdd={handleAddDomain} />
        ) : (
          <div className="dashboard-grid">
            {domains.map(domain => (
              <SimpleCard
                key={domain.id}
                domain={domain}
                onViewDetails={() => setActiveDomain(domain)}
              />
            ))}
            <div className="add-domain-card" onClick={handleAddDomain}>
              <div className="add-domain-icon">
                <Plus size={32} />
              </div>
              <span className="add-domain-text">Add New Domain</span>
            </div>
          </div>
        )
      )}

      <AddDomainModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        token={localStorage.getItem(STORAGE_KEYS.TOKEN)}
        onAddDomain={addDomain}
      />
    </div>
  );
}
