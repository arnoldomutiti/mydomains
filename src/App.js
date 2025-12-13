
import React, { useState, useEffect } from 'react';
import { ExternalLink, Building2, User, Shield, Lock, ArrowLeft, Network, Moon, Sun, Globe, Search, Database, Clock, Zap, FileSearch, Bug, Plus, AlertCircle, Trash2, LayoutDashboard } from 'lucide-react';
import './App.css';

// --- External Tools Data ---
const EXTERNAL_TOOLS = [
  {
    name: "SSL Labs Test",
    desc: "Analyzes the SSL configuration of a server and grades it",
    url: "https://www.ssllabs.com/ssltest/",
    icon: Lock
  },
  {
    name: "Virus Total",
    desc: "Checks a URL against multiple antivirus engines",
    url: "https://www.virustotal.com",
    icon: Bug
  },
  {
    name: "Shodan",
    desc: "Search engine for Internet-connected devices",
    url: "https://www.shodan.io",
    icon: Search
  },
  {
    name: "Page Speed Insights",
    desc: "Checks performance, accessibility and SEO on mobile + desktop",
    url: "https://pagespeed.web.dev/",
    icon: Zap
  },
  {
    name: "Web Check",
    desc: "View literally everything about a website",
    url: "https://web-check.xyz",
    icon: Globe
  },
  {
    name: "Archive",
    desc: "View previous versions of a site via the Internet Archive",
    url: "https://archive.org",
    icon: Clock
  },
  {
    name: "URLScan",
    desc: "Scans a URL and provides information about the page",
    url: "https://urlscan.io",
    icon: FileSearch
  },
  {
    name: "Sucuri SiteCheck",
    desc: "Checks a URL against blacklists and known threats",
    url: "https://sitecheck.sucuri.net",
    icon: Shield
  }
];

// --- Initial Mock Data ---
const INITIAL_DOMAINS = [
  {
    id: 1,
    name: "example.com",
    created: "1995-08-14",
    expires: "2024-08-13",
    status: "Active",
    registrar: "GoDaddy"
  },
  {
    id: 2,
    name: "mybusiness.net",
    created: "2010-03-21",
    expires: "2025-03-21",
    status: "Active",
    registrar: "Namecheap"
  },
  {
    id: 3,
    name: "startup.io",
    created: "2021-11-05",
    expires: "2024-11-05",
    status: "Active",
    registrar: "Gandi"
  },
  {
    id: 4,
    name: "portfolio.dev",
    created: "2023-01-15",
    expires: "2024-01-15",
    status: "Expired",
    registrar: "Google Domains"
  },
  {
    id: 5,
    name: "shop-online.store",
    created: "2022-06-30",
    expires: "2025-06-30",
    status: "Active",
    registrar: "GoDaddy"
  }
];

// --- User Profile Dropdown ---
function UserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="user-dropdown-container">
      <div
        className="user-profile"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          <User size={20} />
        </div>
        <div className="user-info">
          <span className="user-name">{user.name || "User"}</span>
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeDomain, setActiveDomain] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Initialize from localStorage or default to false
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [domains, setDomains] = useState(INITIAL_DOMAINS);

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

  const fetchDomains = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/domains', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDomains(data);
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

  // Handle Login Logic
  const handleLoginObj = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/login', {
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
      const res = await fetch('http://localhost:5000/api/register', {
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
    setDomains([]); // Clear domains on logout
  };

  const handleAddDomain = () => {
    setShowAddModal(true);
  };

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
          {/* ... Detailed View ... */}
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
        /* Empty State or Dashboard Grid */
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

      {/* Add Domain Modal */}
      <AddDomainModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        token={localStorage.getItem('token')}
        onAddDomain={(newDomain) => setDomains(prev => [...prev, newDomain])}
      />
    </div>
  );
}

// --- Password Strength Component ---
function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength++;
    if (pass.length > 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  let strengthClass = 'strength-weak';
  let text = 'Weak';

  if (strength > 2) { strengthClass = 'strength-medium'; text = 'Medium'; }
  if (strength > 4) { strengthClass = 'strength-strong'; text = 'Strong'; }

  return (
    <div className="password-strength-container">
      <div className="strength-meter">
        <div className={`strength-bar ${strengthClass}`}></div>
      </div>
      <div className={`strength-text text-${strengthClass.split('-')[1]}`}>
        {text}
      </div>
    </div>
  );
}

// --- Auth Component ---
function AuthPage({ onLogin, onRegister, darkMode, setDarkMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); // For registration success

  // Reset state on toggle
  useEffect(() => {
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
    setShowConfetti(false);
  }, [isLogin]);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 chars";

    if (!isLogin && !formData.name) newErrors.name = "Name is required";

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400); // Reset shake
      return;
    }

    // Call parent handler
    if (isLogin) {
      const result = await onLogin(formData.email, formData.password);
      if (result && result.error) {
        setErrors({ form: result.error });
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
      }
    } else {
      const result = await onRegister(formData.name, formData.email, formData.password);
      if (result && result.error) {
         setErrors({ form: result.error });
         setIsShaking(true);
         setTimeout(() => setIsShaking(false), 400);
      } else if (result && result.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000); // Hide confetti after 2 seconds
      }
    }
  };

  return (
    <div className="auth-container">
      {showConfetti && <div className="confetti-effect">🎉 Account Created! 🎉</div>}
      <div className="theme-toggle-container">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className={`auth-card ${isShaking ? 'shake' : ''}`}>
        <div className="auth-header">
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Enter your credentials to access your domains' : 'Sign up to start managing your digital assets'}
          </p>
        </div>

        {errors.form && (
          <div className="error-message" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <AlertCircle size={14} /> {errors.form}
          </div>
        )}

        <div className="auth-form">
          <button className="social-btn" onClick={() => alert("Google Login not implemented yet")}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
             </svg>
            Continue with Google
          </button>

          <div className="divider">or</div>

          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                className={`auth-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <div className="error-message"><AlertCircle size={14} /> {errors.name}</div>}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className={`auth-input ${errors.email ? 'input-error' : ''}`}
              placeholder="name@company.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            {errors.email && <div className="error-message"><AlertCircle size={14} /> {errors.email}</div>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className={`auth-input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
             />
             {!isLogin && <PasswordStrengthMeter password={formData.password} />}
             {errors.password && <div className="error-message"><AlertCircle size={14} /> {errors.password}</div>}
          </div>

          <button className="primary-btn" onClick={handleSubmit}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div className="toggle-auth">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            className="toggle-link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Empty State Component ---
function EmptyState({ onAdd }) {
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
}

// --- Add Domain Modal (Refined) ---
function AddDomainModal({ isOpen, onClose, onAddDomain, token }) {
  // Start with one empty input
  const [inputs, setInputs] = useState(['']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const updateInput = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (index) => {
    if (inputs.length > 1) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const handleBulkAdd = async () => {
    // Filter valid domains
    const domains = inputs
      .map(d => d.trim())
      .filter(d => d.length > 0 && d.includes('.'));

    if (domains.length === 0) {
      alert("Please enter at least one valid domain.");
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    setProgress(0);

    let completed = 0;

    for (const domainName of domains) {
      setLogs(prev => [...prev, { name: domainName, status: 'Testing...', type: 'loading' }]);

      try {
        const res = await fetch(`http://localhost:5000/api/whois/${domainName}`);
        const data = await res.json();

        if (data.status !== 1 || data.domain_registered === 'no') {
           throw new Error(data.domain_registered === 'no' ? "Available (Not Registered)" : "Invalid/Fetch Error");
        }

        const newDomain = {
            name: domainName,
            created_date: data.create_date || "N/A", 
            expiry_date: data.expiry_date || "N/A",
            status: (data.domain_status && data.domain_status.length > 0) ? "Active" : "Unknown",
            registrar: (data.registrar && data.registrar.name) ? data.registrar.name : "Unknown",
            fullDetails: data
        };

        const saveRes = await fetch('http://localhost:5000/api/domains', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newDomain)
        });

        if (!saveRes.ok) throw new Error("Database Save Failed");
        const savedData = await saveRes.json();
        
        onAddDomain({ ...newDomain, id: savedData.id, created: newDomain.created_date, expires: newDomain.expiry_date });

        setLogs(prev => prev.map(l => l.name === domainName ? { name: domainName, status: 'Added successfully', type: 'success' } : l));

      } catch (err) {
        setLogs(prev => prev.map(l => l.name === domainName ? { name: domainName, status: err.message, type: 'error' } : l));
      }
      
      completed++;
      setProgress((completed / domains.length) * 100);
    }

    setIsProcessing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Domains</h3>
          <button className="close-btn" onClick={onClose}>
             <ArrowLeft size={20} />
          </button>
        </div>

        <div className="modal-body">
           {!isProcessing && logs.length === 0 ? (
             <>
               <div className="input-list">
                 {inputs.map((val, idx) => (
                   <div key={idx} className="input-row">
                     <input 
                       className="modal-input" 
                       placeholder="example.com"
                       value={val}
                       autoFocus={idx === inputs.length - 1} // Auto-focus new inputs
                       onChange={(e) => updateInput(idx, e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' && idx === inputs.length - 1) addInput();
                       }}
                     />
                     {inputs.length > 1 && (
                       <button className="icon-btn" onClick={() => removeInput(idx)}>
                         <Trash2 size={18} />
                       </button>
                     )}
                   </div>
                 ))}
               </div>
               
               {inputs.length < 5 && (
                 <button className="add-input-btn" onClick={addInput}>
                   <Plus size={16} /> Add Another Domain
                 </button>
               )}
               <p className="input-hint" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
                 Max 5 domains at a time
               </p>
             </>
           ) : (
               <div className="progress-section">
                   <div className="progress-container">
                       <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                   </div>
                   <div className="status-list">
                       {logs.map((log, idx) => (
                           <div key={idx} className="status-item">
                               <span style={{ fontWeight: 500 }}>{log.name}</span>
                               <span className={log.type === 'success' ? 'status-success' : log.type === 'error' ? 'status-error' : 'status-loading'}>
                                   {log.status}
                               </span>
                           </div>
                       ))}
                   </div>
               </div>
           )}
        </div>

        <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
           <button className="secondary-button" onClick={onClose} disabled={isProcessing}>Close</button>
           {!isProcessing && logs.length === 0 && (
               <button className="primary-btn" onClick={handleBulkAdd} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                   Add Domains
               </button>
           )}
           {!isProcessing && logs.length > 0 && (
               <button className="primary-btn" onClick={() => { setLogs([]); setInputs(['']); }} style={{ width: 'auto' }}>
                   Add More
               </button>
           )}
        </div>
      </div>
    </div>
  );
}

// --- Helper for Logo ---
const getRegistrarLogoUrl = (name) => {
  if (!name || name === "Unknown") return null;
  // Clean name: remove Inc, LLC, Ltd, etc.
  const cleanName = name.replace(/,? (Inc|LLC|Ltd|Corp|GmbH|B\.V\.|S\.A\.|S\.R\.L\.|Pvt|Public Limited Company)\.?$/i, '')
    .replace(/[.,]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ''); // Remove all remaining spaces

  return `https://img.logo.dev/${cleanName}.com?token=pk_X-bjM4U5QeeTFlMqueWvHQ`;
};

function SimpleCard({ domain, onViewDetails }) {
  const logoUrl = getRegistrarLogoUrl(domain.registrar);

  return (
    <div className="domain-card">
      <div className="card-header">
        <h2 className="domain-name">{domain.name}</h2>
        <div className="status-badge" style={domain.status === 'Expired' ? { backgroundColor: 'var(--danger-bg)' } : {}}>
          <div className="status-dot" style={domain.status === 'Expired' ? { backgroundColor: 'var(--danger-text)' } : {}}></div>
          <span className="status-text" style={domain.status === 'Expired' ? { color: 'var(--danger-text)' } : {}}>{domain.status}</span>
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
                src={logoUrl || "https://via.placeholder.com/50?text=Reg"}
                alt={domain.registrar}
                onError={(e) => { e.target.src = "https://via.placeholder.com/50?text=Reg" }}
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

// Helper to render a contact section
function ContactSection({ title, icon: Icon, contact }) {
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
        <a href={`mailto:${contact.email_address}`} className="detail-value link-value">{contact.email_address || "N/A"}</a>
      </div>
      <div className="detail-row">
        <span className="detail-label">Phone:</span>
        <span className="detail-value">{contact.phone_number || "N/A"}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Location:</span>
        <span className="detail-value">
          {[contact.city_name, contact.state_name, contact.country_code].filter(Boolean).join(", ") || "N/A"}
        </span>
      </div>
    </div>
  );
}

function DetailedDashboard({ domain, onBack }) {
  const details = domain.fullDetails || {};
  const registrar = details.registrar || {};
  const registrant = details.registrant_contact || {};
  const adminContact = details.administrative_contact || {};
  const techContact = details.technical_contact || {};
  const nameServers = details.name_servers || ["a.iana-servers.net", "b.iana-servers.net"];
  const domainStatus = details.domain_status || ["clientTransferProhibited"];

  const registrarName = registrar.name || domain.registrar;
  const logoUrl = getRegistrarLogoUrl(registrarName);

  return (
    <div className="details-container">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Header Summary Card */}
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
            <span className="date-value">2023-08-14</span>
          </div>
          <div className="date-block">
            <span className="date-label">Expires:</span>
            <span className="date-value">{domain.expires}</span>
          </div>
        </div>
      </div>

      <div className="details-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Domain Registrar */}
        <div className="section-card">
          <div className="section-header">
            <Building2 className="section-icon" size={20} />
            <h3 className="section-heading">Domain Registrar</h3>
          </div>
          <div className="detail-row" style={{ alignItems: 'center' }}>
            <span className="detail-label">Registrar:</span>
            <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="logo-container" style={{ width: '32px', height: '32px' }}>
                <img
                  src={logoUrl || "https://via.placeholder.com/50?text=Reg"}
                  alt={registrarName}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/50?text=Reg" }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <span>{registrarName}</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <a href="#" className="detail-value link-value">{registrar.email || `abusecomplaints@${registrarName.toLowerCase().replace(' ', '')}.com`}</a>
          </div>

          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{registrar.phone || "+1.2083895740"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">WHOIS Server:</span>
            <span className="detail-value">{details.whois_server || `whois.${domain.registrar.toLowerCase().replace(' ', '')}.com`}</span>
          </div>
        </div>

        {/* Contact Sections */}
        <ContactSection title="Registrant Contact" icon={User} contact={registrant} />
        <ContactSection title="Administrative Contact" icon={User} contact={adminContact} />
        <ContactSection title="Technical Contact" icon={Shield} contact={techContact} />

        {/* Name Servers */}
        <div className="section-card">
          <div className="section-header">
            <Network className="section-icon" size={20} />
            <h3 className="section-heading">Name Servers</h3>
          </div>
          <div className="server-list">
            {nameServers.map((ns, idx) => (
              <div key={idx} className="server-pill">{ns}</div>
            ))}
          </div>
        </div>

        {/* Subdomains */}
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

        {/* Status & Security */}
        <div className="section-card">
          <div className="section-header">
            <Lock className="section-icon" size={20} />
            <h3 className="section-heading">Status & Security</h3>
          </div>
          <div className="detail-row">
            <span className="detail-label">Domain Status:</span>
            <div className="status-tag">{domainStatus[0] || "Unknown"}</div>
          </div>
          <div className="detail-row">
            <span className="detail-label">DNSSEC:</span>
            <span className="detail-value">{details.dnssec || "unsigned"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}