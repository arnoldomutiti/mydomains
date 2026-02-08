
import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, Moon, Sun, Plus, Filter } from 'lucide-react';
import './App.css';

// Config
import API_BASE_URL from './config';

// Data
import EXTERNAL_TOOLS from './data/externalTools';
import INITIAL_DOMAINS from './data/initialDomains';
import TOP_50_DOMAINS from './data/top50Domains';

// Components
import CustomModal from './components/CustomModal';
import NotificationDropdown from './components/NotificationDropdown';
import NotificationPreferences from './components/NotificationPreferences';
import ExportDropdown from './components/ExportDropdown';
import UserDropdown from './components/UserDropdown';
import AuthPage from './components/AuthPage';
import EmptyState from './components/EmptyState';
import AddDomainModal from './components/AddDomainModal';
import SimpleCard from './components/SimpleCard';
import DetailedDashboard from './components/DetailedDashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeDomain, setActiveDomain] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotificationPreferences, setShowNotificationPreferences] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [showMobileExport, setShowMobileExport] = useState(false);

  // Initialize from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      return savedTheme === 'dark';
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }

    return false;
  });

  const [domains, setDomains] = useState(INITIAL_DOMAINS);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    expiryRange: 'all',
    sortBy: 'none',
    sslExpiry: 'all'
  });
  const [sslDataCache, setSslDataCache] = useState({});

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const showModal = (title, message, type = 'info', onConfirm = null) => {
    setModal({ isOpen: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  };

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch domains on login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchDomains();
    }
  }, [isAuthenticated, currentUser]);

  // Fetch SSL data for all domains for filtering
  useEffect(() => {
    const fetchAllSSL = async () => {
      const sslResults = {};
      for (const domain of domains) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/ssl/${domain.name}`);
          const data = await res.json();
          if (res.ok) {
            sslResults[domain.name] = data;
          }
        } catch (err) {
          // Silently fail for SSL checks
        }
      }
      setSslDataCache(sslResults);
    };

    if (domains.length > 0) {
      fetchAllSSL();
    }
  }, [domains]);

  const fetchDomains = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/domains`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map(d => ({
          ...d,
          expires: d.expiry_date || d.expires || "N/A",
          created: d.created_date || d.created || "N/A"
        }));
        setDomains(mappedData);
      } else {
        console.error("Failed to fetch domains:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Failed to fetch domains", err);
    }
  };

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = (e) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setDarkMode(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleThemeChange);
      return () => mediaQuery.removeListener(handleThemeChange);
    }
  }, []);

  // Handle Login Logic
  const handleLoginObj = async (emailOrObj, password) => {
    if (typeof emailOrObj === 'object' && emailOrObj.token) {
      const { token, user } = emailOrObj;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setCurrentUser(user);
      return { success: true };
    }

    const email = emailOrObj;
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        return { success: true };
      } else {
        return { error: data.error || "Login failed" };
      }
    } catch (err) {
      return { error: "Failed to connect to server" };
    }
  };

  const handleRegisterObj = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        return { success: true };
      } else {
        return { error: data.error || "Registration failed" };
      }
    } catch (err) {
      return { error: "Failed to connect to server" };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setDomains([]);
  };

  const handleAddDomain = () => {
    setShowAddModal(true);
  };

  const handleDeleteDomain = async (domainId) => {
    showModal(
      'Confirm Delete',
      'Are you sure you want to delete this domain?',
      'confirm',
      async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/api/domains/${domainId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            setDomains(prev => prev.filter(d => d.id !== domainId));
            showModal('Success', 'Domain deleted successfully', 'success');
          } else {
            showModal('Error', 'Failed to delete domain', 'error');
          }
        } catch (err) {
          console.error('Error deleting domain:', err);
          showModal('Error', 'Error deleting domain', 'error');
        }
      }
    );
  };

  const handleImportDomains = async (importedDomains) => {
    const token = localStorage.getItem('token');
    let successCount = 0;
    let failCount = 0;

    for (const domainData of importedDomains) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/whois/${domainData.name}`);
        const data = await res.json();

        if (data.status !== 1 || data.domain_registered === 'no') {
          failCount++;
          continue;
        }

        const newDomain = {
          name: domainData.name,
          created_date: data.create_date || "N/A",
          expiry_date: data.expiry_date || "N/A",
          status: (data.domain_status && data.domain_status.length > 0) ? "Active" : "Unknown",
          registrar: (data.domain_registrar && data.domain_registrar.registrar_name) ? data.domain_registrar.registrar_name : domainData.registrar,
          fullDetails: data
        };

        const saveRes = await fetch(`${API_BASE_URL}/api/domains`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newDomain)
        });

        if (saveRes.ok) {
          const savedData = await saveRes.json();
          setDomains(prev => [...prev, { ...newDomain, id: savedData.id, created: newDomain.created_date, expires: newDomain.expiry_date }]);
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Failed to import ${domainData.name}:`, err);
        failCount++;
      }
    }

    showModal('Import Complete', `Successfully imported: ${successCount}\nFailed: ${failCount}`, successCount > 0 ? 'success' : 'error');
  };

  // Calculate notification count (excluding top 50 cached domains)
  const notificationCount = domains.reduce((count, domain) => {
    if (TOP_50_DOMAINS.includes(domain.name)) {
      return count;
    }

    const expiryDateStr = domain.expires || domain.expiry_date;
    if (expiryDateStr && expiryDateStr !== 'N/A') {
      const expiryDate = new Date(expiryDateStr);
      const today = new Date();
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (domain.status === 'Expired' || diffDays < 0 || diffDays <= 30) {
        count++;
      }
    }

    const ssl = sslDataCache[domain.name];
    if (ssl && ssl.valid) {
      const daysRemaining = ssl.daysRemaining;
      if (daysRemaining < 0 || daysRemaining <= 30) {
        count++;
      }
    }

    return count;
  }, 0);

  // Filter and sort domains
  const filteredDomains = (() => {
    let filtered = domains.filter(domain => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        domain.name?.toLowerCase().includes(query) ||
        domain.registrar?.toLowerCase().includes(query) ||
        domain.status?.toLowerCase().includes(query)
      );
    });

    if (filterOptions.expiryRange !== 'all') {
      filtered = filtered.filter(domain => {
        const expiryDateStr = domain.expires || domain.expiry_date;
        if (!expiryDateStr || expiryDateStr === 'N/A') return false;

        const expiryDate = new Date(expiryDateStr);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filterOptions.expiryRange) {
          case '30days':
            return diffDays >= 0 && diffDays <= 30;
          case '60days':
            return diffDays >= 0 && diffDays <= 60;
          case '90days':
            return diffDays >= 0 && diffDays <= 90;
          case 'expired':
            return diffDays < 0 || domain.status === 'Expired';
          default:
            return true;
        }
      });
    }

    if (filterOptions.sslExpiry !== 'all') {
      filtered = filtered.filter(domain => {
        const ssl = sslDataCache[domain.name];

        if (!ssl) return filterOptions.sslExpiry === 'all';

        const daysRemaining = ssl.daysRemaining;

        switch (filterOptions.sslExpiry) {
          case 'expiring':
            return daysRemaining >= 0 && daysRemaining <= 30;
          case 'valid':
            return daysRemaining > 30;
          case 'expired':
            return daysRemaining < 0;
          default:
            return true;
        }
      });
    }

    if (filterOptions.sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        switch (filterOptions.sortBy) {
          case 'registrar-asc':
            return (a.registrar || '').localeCompare(b.registrar || '');
          case 'registrar-desc':
            return (b.registrar || '').localeCompare(a.registrar || '');
          case 'expiry-asc': {
            const dateA = new Date(a.expires || a.expiry_date || 0);
            const dateB = new Date(b.expires || b.expiry_date || 0);
            return dateA - dateB;
          }
          case 'expiry-desc': {
            const dateA = new Date(a.expires || a.expiry_date || 0);
            const dateB = new Date(b.expires || b.expiry_date || 0);
            return dateB - dateA;
          }
          case 'ssl-expiry': {
            const sslA = sslDataCache[a.name];
            const sslB = sslDataCache[b.name];
            const daysA = sslA ? sslA.daysRemaining : 999999;
            const daysB = sslB ? sslB.daysRemaining : 999999;
            return daysA - daysB;
          }
          default:
            return 0;
        }
      });
    }

    return filtered;
  })();

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={handleLoginObj}
        onRegister={handleRegisterObj}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div className={`app-container ${activeDomain ? 'view-detailed' : 'view-simple'}`}>
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-brand" onClick={() => setActiveDomain(null)} style={{ cursor: 'pointer' }}>
          <img src="/images/domain-dashboard-primary-logo.png" alt="Domain Central" className="nav-logo" />
        </div>

        <div className="nav-right">
          {/* Quick Add Button */}
          {!activeDomain && (
            <button
              className="quick-add-btn"
              onClick={handleAddDomain}
              aria-label="Add new domain"
              title="Add new domain"
            >
              <Plus size={18} />
            </button>
          )}

          {/* Search Bar */}
          {!activeDomain && domains.length > 0 && (
            <div className="top-search-bar">
              <Search size={18} className="top-search-icon" />
              <input
                type="text"
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="top-search-input"
              />
              {searchQuery && (
                <button
                  className="top-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
          )}

          {/* Filter Button */}
          {!activeDomain && domains.length > 0 && (
            <div className="filter-container">
              <button
                className={`filter-btn ${(filterOptions.expiryRange !== 'all' || filterOptions.sortBy !== 'none' || filterOptions.sslExpiry !== 'all') ? 'filter-active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Filter domains"
                title="Filter and sort"
              >
                <Filter size={18} />
              </button>

              {showFilters && (
                <>
                  <div className="notification-overlay" onClick={() => setShowFilters(false)}></div>
                  <div className="filter-dropdown">
                    <div className="filter-section">
                      <label className="filter-label">Domain Expiry</label>
                      <select
                        className="filter-select"
                        value={filterOptions.expiryRange}
                        onChange={(e) => setFilterOptions({ ...filterOptions, expiryRange: e.target.value })}
                      >
                        <option value="all">All Domains</option>
                        <option value="30days">Expiring in 30 days</option>
                        <option value="60days">Expiring in 60 days</option>
                        <option value="90days">Expiring in 90 days</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    <div className="filter-section">
                      <label className="filter-label">SSL Certificate</label>
                      <select
                        className="filter-select"
                        value={filterOptions.sslExpiry}
                        onChange={(e) => setFilterOptions({ ...filterOptions, sslExpiry: e.target.value })}
                      >
                        <option value="all">All Certificates</option>
                        <option value="expiring">Expiring in 30 days</option>
                        <option value="valid">Valid (30+ days)</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    <div className="filter-section">
                      <label className="filter-label">Sort By</label>
                      <select
                        className="filter-select"
                        value={filterOptions.sortBy}
                        onChange={(e) => setFilterOptions({ ...filterOptions, sortBy: e.target.value })}
                      >
                        <option value="none">Default Order</option>
                        <option value="registrar-asc">Registrar (A-Z)</option>
                        <option value="registrar-desc">Registrar (Z-A)</option>
                        <option value="expiry-asc">Expiry Date (Soonest)</option>
                        <option value="expiry-desc">Expiry Date (Latest)</option>
                        <option value="ssl-expiry">SSL Expiry (Soonest)</option>
                      </select>
                    </div>

                    <div className="filter-actions">
                      <button
                        className="filter-reset-btn"
                        onClick={() => {
                          setFilterOptions({
                            expiryRange: 'all',
                            sortBy: 'none',
                            sslExpiry: 'all'
                          });
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <NotificationDropdown
            domains={domains}
            isOpen={showMobileNotifications}
            onToggle={() => setShowMobileNotifications(!showMobileNotifications)}
          />

          {!activeDomain && (
            <ExportDropdown
              domains={domains}
              onImport={handleImportDomains}
              showModal={showModal}
              isOpen={showMobileExport}
              onToggle={() => setShowMobileExport(!showMobileExport)}
            />
          )}

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <UserDropdown
            user={currentUser || {}}
            onLogout={handleLogout}
            onOpenSettings={() => setShowNotificationPreferences(true)}
            onOpenNotifications={() => setShowMobileNotifications(!showMobileNotifications)}
            onOpenExport={() => setShowMobileExport(!showMobileExport)}
            notificationCount={notificationCount}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        </div>
      </div>

      {activeDomain ? (
        <>
          <div className="content-area">
            <DetailedDashboard domain={activeDomain} onBack={() => setActiveDomain(null)} />
          </div>

          <div className="sidebar-area">
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
          </div>
        </>
      ) : (
        <>
          {domains.length === 0 ? (
            <EmptyState onAdd={handleAddDomain} />
          ) : filteredDomains.length === 0 ? (
            <div className="empty-search-state">
              <Search size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No domains found</h3>
              <p>No domains match your search "{searchQuery}"</p>
              <button className="btn-secondary" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="dashboard-grid">
              {filteredDomains.map(domain => (
                <SimpleCard
                  key={domain.id}
                  domain={domain}
                  onViewDetails={() => {
                    setActiveDomain(domain);
                    setShowAddModal(false);
                  }}
                  onDelete={() => handleDeleteDomain(domain.id)}
                />
              ))}
              <div className="add-domain-card" onClick={handleAddDomain}>
                <div className="add-domain-icon">
                  <Plus size={32} />
                </div>
                <span className="add-domain-text">Add New Domain</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Domain Modal */}
      <AddDomainModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        token={localStorage.getItem('token')}
        onAddDomain={(newDomain) => setDomains(prev => [...prev, newDomain])}
        showModal={showModal}
      />

      {/* Custom Modal Dialog */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
      />

      {/* Notification Preferences Modal */}
      <NotificationPreferences
        isOpen={showNotificationPreferences}
        onClose={() => setShowNotificationPreferences(false)}
        user={currentUser}
      />
    </div>
  );
}
