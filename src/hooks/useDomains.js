import { useState, useCallback } from 'react';
import { apiGet } from '../services/api';

export default function useDomains() {
  const [domains, setDomains] = useState([]);

  const fetchDomains = useCallback(async () => {
    try {
      const { ok, data } = await apiGet('/api/domains');
      if (ok) {
        setDomains(data);
      } else {
        console.error('Failed to fetch domains:', data);
      }
    } catch (err) {
      console.error('Failed to fetch domains', err);
    }
  }, []);

  const addDomain = useCallback((newDomain) => {
    setDomains((prev) => [...prev, newDomain]);
  }, []);

  const clearDomains = useCallback(() => {
    setDomains([]);
  }, []);

  return { domains, fetchDomains, addDomain, clearDomains };
}
