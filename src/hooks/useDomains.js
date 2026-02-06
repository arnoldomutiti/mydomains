import { useState, useEffect } from 'react';
import { domainService } from '../services/api';

export const useDomains = (isAuthenticated) => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDomains = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await domainService.getAll();
      setDomains(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch domains", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [isAuthenticated]);

  const addDomain = (newDomain) => {
    setDomains(prev => [...prev, newDomain]);
  };

  const removeDomain = (id) => {
    setDomains(prev => prev.filter(domain => domain.id !== id));
  };

  return {
    domains,
    loading,
    error,
    fetchDomains,
    addDomain,
    removeDomain,
    setDomains
  };
};
