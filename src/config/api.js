export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  DOMAINS: '/api/domains',
  WHOIS: (domain) => `/api/whois/${domain}`,
  DELETE_DOMAIN: (id) => `/api/domains/${id}`
};
