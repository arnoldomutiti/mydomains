import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { STORAGE_KEYS } from '../config/constants';

const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

export const domainService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOMAINS}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (domainData) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOMAINS}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(domainData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DELETE_DOMAIN(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getWhoisInfo: async (domain) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.WHOIS(domain)}`);
    return handleResponse(response);
  }
};
