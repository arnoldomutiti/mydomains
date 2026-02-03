// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'      // Local development
  : 'http://102.212.246.160:5000'; // Production server

export default API_BASE_URL;
